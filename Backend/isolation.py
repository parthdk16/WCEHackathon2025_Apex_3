from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
from scipy.stats import zscore
from sklearn.metrics import precision_score, recall_score, f1_score

app = Flask(__name__)

# Load the pre-trained model
iso_forest = joblib.load("model/isolation_forest_model2.joblib")


def load_and_preprocess_data(file):
    df = pd.read_csv(file, encoding_errors='ignore')
    df.columns = df.columns.str.strip()
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df.dropna(subset=['date'], inplace=True)
    df.fillna(method='ffill', inplace=True)
    return df


def feature_engineering(df):
    df['rolling_mean'] = df['meantemp'].rolling(window=7).mean().fillna(df['meantemp'])
    df['z_score'] = zscore(df['meantemp'])
    return df


def detect_anomalies(df):
    df['iso_anomaly'] = iso_forest.fit_predict(df[['meantemp', 'humidity', 'wind_speed', 'meanpressure']])
    df['dbscan_anomaly'] = DBSCAN(eps=1, min_samples=5).fit_predict(df[['meantemp', 'humidity', 'wind_speed', 'meanpressure']])
    df['z_anomaly'] = (np.abs(df['z_score']) > 2).astype(int)

    df['is_anomaly'] = (df['iso_anomaly'] == -1) | (df['dbscan_anomaly'] == -1) | (df['z_anomaly'] == 1)
    
    return df


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    df = load_and_preprocess_data(file)
    df = feature_engineering(df)
    df = detect_anomalies(df)

    anomalies = df[df['is_anomaly']]
    
    return jsonify({
        "total_records": len(df),
        "anomalies_detected": len(anomalies),
        "anomaly_percentage": (len(anomalies) / len(df)) * 100,
        "anomalies": anomalies.to_dict(orient='records')
    })


@app.route('/fetch-results', methods=['GET'])
def fetch_results():
    try:
        df = pd.read_csv("detected_anomalies_weather.csv")
        return df.to_json(orient='records')
    except FileNotFoundError:
        return jsonify({"error": "No results found, please upload and process data first."}), 404


if __name__ == '__main__':
    app.run(debug=True)

# This API has two endpoints:
# 1. POST /upload — Upload CSV data, process it, and detect anomalies.
# 2. GET /fetch-results — Fetch saved anomaly results (if saved in a CSV).

# Save this as `app.py`, install Flask, and run: `python app.py`
# Then you can test with Postman or any HTTP client!

# Want me to add authentication or improve the model-handling logic? Let me know! 🚀
