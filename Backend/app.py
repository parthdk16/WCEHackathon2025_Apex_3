from flask import Flask, request, jsonify
import pandas as pd
import pickle
from flask_cors import CORS
import joblib
import numpy as np
import time
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
from scipy.stats import zscore
import requests

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/getResults', methods=['GET'])
def get_results():
    result = {
        "data": [
            {"feature": "V1", "value": -1.23, "isAnomaly": True},
            {"feature": "V2", "value": 0.45, "isAnomaly": False},
        ],
        "analysis": {
            "total_records": 1000,
            "normal_transactions": 950,
            "anomalies_detected": 50,
            "precision": 0.85,
            "recall": 0.78,
            "f1_score": 0.81,
            "recommendations": [
                "Monitor feature V1 for sudden spikes.",
                "Set stricter thresholds for feature V3.",
            ]
        }
    }
    return jsonify(result)

model = joblib.load("Models/isolation_forest_weather.joblib")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from the request
        data = request.get_json()

        # Convert input data to numpy array
        features = np.array(data["features"]).reshape(1, -1)

        # Make prediction (returns -1 for anomaly, 1 for normal)
        prediction = model.predict(features)

        # Return result
        return jsonify({"prediction": int(prediction[0])})

    except Exception as e:
        return jsonify({"error": str(e)})
    
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # Limit file size to 16MB

@app.route("/api/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"message": "No selected file"}), 400

    # Generate a timestamp correctly
    timestamp = int(time.time())  # Get current timestamp
    filename = f"{timestamp}-{secure_filename(file.filename)}"  # Secure filename

    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)  # Save file

    data, error = process_csv(file_path)
    if error:
        return jsonify({"message": error}), 400
    
    for row in data:
        temp=row["meantemp"],
        humidity=row["humidity"],
        wind_speed=row["wind_speed"],
        pressure=row["meanpressure"]
        weather_db.insert_data(
            temp,
            humidity,
            wind_speed,
            pressure
        )
        print(temp, humidity, wind_speed, pressure)

    # df = load_and_preprocess_data(data)

    # # Step 2: Perform feature engineering
    # df = feature_engineering(df)

    # # Step 3: Detect anomalies
    # df = detect_anomalies(df)

    return jsonify({
        "message": "File uploaded and processed successfully",
        "data": data,
    })

@app.route("/detect-anomalies", methods=["POST"])
def detect_anomalies_api():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "Empty file name"}), 400

        df = pd.read_csv(file)
        
        # Check if necessary columns are present
        required_columns = {"meantemp", "humidity", "wind_speed", "meanpressure"}
        if not required_columns.issubset(set(df.columns)):
            return jsonify({"error": "Missing required columns in CSV"}), 400

        # Predict anomalies (-1 for anomaly, 1 for normal)
        predictions = iso_forest.predict(df[["meantemp", "humidity", "wind_speed", "meanpressure"]])
        df["anomaly"] = predictions

        # Prepare results
        results = df.to_dict(orient="records")
        anomalies = df[df["anomaly"] == -1].to_dict(orient="records")

        return jsonify({
            "total_samples": len(df),
            "anomalies_detected": len(anomalies),
            "detection_results": results
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_anomalies(data):
    df = load_and_preprocess_data(data)

    # Step 2: Perform feature engineering
    df = feature_engineering(df)

    # Step 3: Detect anomalies
    df = detect_anomalies(df)

    return jsonify({
        "message": "Data processed and anomalies detected",
        "data": df.to_dict(orient="records"),
    })

def process_csv(file_path):
    """Reads and processes the uploaded CSV file."""
    df = pd.read_csv(file_path)

    # Ensure required columns exist
    required_columns = ["recorded_at", "meantemp", "humidity", "wind_speed", "meanpressure"]
    if not all(col in df.columns for col in required_columns):
        return None, "Missing required columns in CSV"

    # Reorder columns
    df = df[required_columns]

    # Convert DataFrame to JSON
    data_json = df.to_dict(orient="records")
    return data_json, None

iso_forest = joblib.load("Models/isolation.joblib")

def load_and_preprocess_data(data):
    df = pd.DataFrame(data)
    print(data.head())
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
    
    # Consolidate anomalies
    df['is_anomaly'] = (df['iso_anomaly'] == -1) | (df['dbscan_anomaly'] == -1) | (df['z_anomaly'] == 1)
    return df

@app.route('/fetch-api-data', methods=['POST'])
def fetch_data_from_api():
    try:
        # Extract API URL and Key from the request
        data = request.get_json()
        api_url = data.get('api_url')
        api_key = data.get('api_key')

        # Check if both API URL and Key are provided
        if not api_url or not api_key:
            return jsonify({"error": "API URL and API Key are required"}), 400

        # Prepare headers with the API Key
        headers = {
            'Authorization': f'Bearer {api_key}'  # Assuming Bearer token is required
        }

        # Make a GET request to the API
        response = requests.get(api_url, headers=headers)

        # Check if the response is successful (200 OK)
        if response.status_code == 200:
            return jsonify({
                "message": "Data fetched successfully",
                "data": response.json()  # Assuming the response is in JSON format
            })
        else:
            return jsonify({"error": f"Failed to fetch data. Status code: {response.status_code}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Let me know if you want to add more features or improve anything! 🚀
from database.crud import WeatherCRUD

# Initialize
weather_db = WeatherCRUD()

# Insert sample data
weather_db.insert_data(
    temp=25.6,
    humidity=45.2,
    wind_speed=12.3,
    pressure=1013.2
)

# Get recent entries
print("Recent weather data:")
for record in weather_db.get_recent():
    print(record)

print("Update")
# Update example
weather_db.update_data(1, temp=26.0)

print("Delete")
# Cleanup old data
weather_db.delete_old_data(30)

# Load the trained Isolation Forest model
# MODEL_PATH = "model/isolation_finalcredit.pkl"
# with open(MODEL_PATH, "rb") as model_file:
#     model = pickle.load(model_file)


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the Anomaly Detection API!"})


@app.route("/detect", methods=["POST"])
def detect_anomalies():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "Empty file name"}), 400

        df = pd.read_csv(file)
        
        # Check if necessary columns are present
        required_columns = set(df.columns)
        if not required_columns:
            return jsonify({"error": "Invalid or empty CSV file"}), 400

        # Predict anomalies (-1 for anomaly, 1 for normal)
        predictions = model.predict(df)
        df["anomaly"] = predictions

        # Prepare results
        results = df.to_dict(orient="records")
        anomalies = df[df["anomaly"] == -1].to_dict(orient="records")

        return jsonify({
            "total_samples": len(df),
            "anomalies_detected": len(anomalies),
            "detection_results": results
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


# API Endpoints:
# 1. GET / - Basic welcome message
# 2. POST /detect - Upload a CSV, detect anomalies, and return results
