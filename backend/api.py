from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import pickle
import pandas as pd
import numpy as np

# Ensure models directory is accessible
sys.path.append(os.path.dirname(__file__))

from models.risk_pricing import predict_premium
from models.fraud_model import assess_claim_fraud

app = Flask(__name__)
CORS(app) # Enable CORS for all routes (important for Next.js to call this)

# Paths to models
BASE_DIR = os.path.dirname(__file__)
RISK_MODEL_PATH = os.path.join(BASE_DIR, "models", "risk_classifier_xgb.pkl")
FRAUD_MODEL_PATH = os.path.join(BASE_DIR, "models", "fraud_iso_forest_real.pkl")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "GigShield-AI ML API"})

@app.route('/api/predict-premium', methods=['POST'])
def get_premium():
    """
    Endpoint to predict premium and risk score.
    Expects a JSON body with driver profile data.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Ensure the expected fields are handled or have defaults
        # Profile expected by predict_premium:
        # 'Delivery_person_Age', 'Delivery_person_Ratings', 'Weatherconditions', etc.
        
        premium, prob = predict_premium(data, RISK_MODEL_PATH)
        
        return jsonify({
            "weekly_premium": premium,
            "risk_score": prob,
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/assess-fraud', methods=['POST'])
def check_fraud():
    """
    Endpoint to assess if a claim is potentially fraudulent.
    Expects claim features.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        is_fraudulent = assess_claim_fraud(data, FRAUD_MODEL_PATH)
        
        return jsonify({
            "is_fraudulent": is_fraudulent,
            "fraud_score": 1.0 if is_fraudulent else 0.0, # Normalizing: 1.0 for error/anomaly, 0.0 for normal
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Running on port 5000 by default
    app.run(host='0.0.0.0', port=5000, debug=True)
