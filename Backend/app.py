from flask import Flask, request, jsonify
import pandas as pd
import pickle
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

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
