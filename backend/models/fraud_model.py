import pandas as pd
import numpy as np
import os
import pickle
from sklearn.ensemble import IsolationForest

def train_fraud_model(data_path, model_output_path):
    print("Loading processed real dataset for Fraud/Anomaly Detection...")
    df = pd.read_csv(data_path)
    
    # We define anomalies as statistical outliers in combinations of time spent,
    # distance covered, driver age, ratings, and number of multiple deliveries.
    # In legitimate data, small distances shouldn't take excessively long if weather/traffic is normal.
    
    features = [
        'Delivery_person_Age', 'Delivery_person_Ratings',
        'multiple_deliveries', 'Delivery_Distance_km'
    ]
    
    # We want to use the actual time taken to identify anomalous claims
    # (e.g. Someone claiming a 90 min delay for 1km on a sunny day)
    if 'Time_taken_min' in df.columns:
        features.append('Time_taken_min')
        
    X = df[features].copy()
    
    # Handling any remaining NaNs
    X.fillna(X.median(), inplace=True)
    
    print("Training Isolation Forest Anomaly Detection (Real Data)...")
    # Using 5% contamination rate for genuine outliers in real datasets
    model = IsolationForest(
        n_estimators=100, 
        max_samples='auto', 
        contamination=0.05,
        random_state=42
    )
    
    model.fit(X)
    
    # Save Model
    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    with open(model_output_path, 'wb') as f:
        pickle.dump(model, f)
        
    with open(model_output_path + '_cols.pkl', 'wb') as f:
        pickle.dump(features, f)
        
    print(f"Fraud Detection model saved successfully to {model_output_path}")

def assess_claim_fraud(claim_features, model_path):
    """
    Returns True if anomalous (likely fraud/outlying event), False if normal.
    """
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    with open(model_path + '_cols.pkl', 'rb') as f:
        cols = pickle.load(f)
        
    df = pd.DataFrame([claim_features])
    
    # Ensure all columns from training are present
    for col in cols:
        if col not in df.columns:
            # If the column wasn't in the input dict, fill with 0 or a sensible default
            df[col] = 0
            
    df = df[cols]
    
    pred = model.predict(df)[0]
    return True if pred == -1 else False

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(__file__))
    data_file = os.path.join(base_dir, "data", "processed_train.csv")
    out_model = os.path.join(base_dir, "models", "fraud_iso_forest_real.pkl")
    
    if not os.path.exists(data_file):
        print(f"Data file not found at {data_file}. Please run preprocess_real_data.py first.")
    else:
        train_fraud_model(data_file, out_model)
