import os
import sys
import time
import pandas as pd

# Ensure models directory is accessible
sys.path.append(os.path.dirname(__file__))

from models.risk_pricing import predict_premium
from models.fraud_model import assess_claim_fraud

def evaluate_trigger(weather_data):
    """
    Evaluates weather APIs (mocks) against parametric thresholds based on our test dataset string labels.
    Triggers when weather is 'Stormy' or 'Sandstorms'
    """
    print(f"Monitoring Weather: {weather_data['Weatherconditions']} (Zone: {weather_data['City']})")
    
    triggered = False
    
    # These severity labels come from the actual Zomato dataset
    if weather_data['Weatherconditions'] in ['Stormy', 'Sandstorms']:
        triggered = True
        
    if triggered:
        print(f"[WARNING] PARAMETRIC TRIGGER ACTIVATED: Extreme {weather_data['Weatherconditions']} in {weather_data['City']}!")
        
    return triggered, weather_data['Weatherconditions']

def process_automated_claim(claim_payload, fraud_model_path):
    """
    In a real scenario, the system automatically fetches eligible drivers 
    and initiates claims for them. Here we process an incoming claim check.
    """
    print(f"\nProcessing Claim for Delivery Person {claim_payload['Delivery_person_ID']}...")
    
    # 1. Run through Fraud Detection
    features = {
        'Delivery_person_Age': claim_payload['Delivery_person_Age'],
        'Delivery_person_Ratings': claim_payload['Delivery_person_Ratings'],
        'multiple_deliveries': claim_payload['multiple_deliveries'],
        'Delivery_Distance_km': claim_payload['Delivery_Distance_km']
    }
    
    # If the real time_taken is available (simulated payload provides it), model uses it
    if 'Time_taken_min' in claim_payload:
        features['Time_taken_min'] = claim_payload['Time_taken_min']
    
    is_fraudulent = assess_claim_fraud(features, fraud_model_path)
    
    if is_fraudulent:
        print(f"[REJECTED] CLAIM REJECTED: Anomaly detected by AI Fraud Model. (Outlier dimensions).")
        return {"status": "Rejected", "reason": "Anomaly Detected"}
        
    # 2. Payout logic based on coverage
    print(f"[APPROVED] CLAIM APPROVED: No anomalies detected. Automated payout initiated.")
    # Standard payout logic from the premium
    payout_amt = round(claim_payload.get('weekly_premium', 25) * 10, 2) # Payout is a multiple of their premium
    print(f"[PAYOUT] TRANSFERRING FUND: Rs. {payout_amt} to Partner {claim_payload['Delivery_person_ID']}")
    
    return {"status": "Paid", "amount": payout_amt}

def run_simulation(data_path):
    print("="*60)
    print(" [START] Gig Worker AI Parametric Insurance (Real Data Model) ")
    print("="*60)
    
    base_dir = os.path.dirname(__file__)
    risk_model_path = os.path.join(base_dir, "models", "risk_classifier_xgb.pkl")
    fraud_model_path = os.path.join(base_dir, "models", "fraud_iso_forest_real.pkl")
    
    if not os.path.exists(risk_model_path) or not os.path.exists(fraud_model_path):
        print("Models not found! Please run the training scripts first.")
        return
        
    # Read a sample from the real test dataset
    print(f"Loading real deliveries from simulated live API feed (test.csv)...")
    df = pd.read_csv(data_path)
    
    # We pick two samples: one that represents a genuine disruption, and one that is an anomaly.
    
    # Pick a "Stormy" sample to trigger the parametric logic
    stormy_samples = df[df['Weatherconditions'] == 'Stormy']
    trigger_sample = stormy_samples.iloc[0].to_dict()
    
    print("\n[STEP 1] Policy Onboarding & Dynamic Pricing")
    # Base weekly expectation
    trigger_sample['avg_weekly_earnings'] = 3000.00 
    
    print(f"Driver ID: {trigger_sample['Delivery_person_ID']}")
    print(f"City: {trigger_sample['City']}")
    print(f"Weather Context: {trigger_sample['Weatherconditions']}")
    
    time.sleep(1)
    
    # Calculate premium using Risk AI (XGBClassifier)
    premium, prob = predict_premium(trigger_sample, risk_model_path)
    print(f"AI Risk Assessment: Probability of Disruption: {prob:.2%}")
    print(f"[SUCCESS] Calculated Weekly Premium: Rs. {premium:.2f}")
    trigger_sample['weekly_premium'] = premium
    
    print("\n" + "-"*60)
    print("[STEP 2] Parametric Trigger Monitoring (Real Data Feed)")
    
    time.sleep(1)
    triggered, reason = evaluate_trigger(trigger_sample)
    
    if not triggered:
        print("No disruption event. Normal operations.")
        return
        
    print("\n" + "-"*60)
    print("[STEP 3] Intelligent Auto-Claim Processing")
    print(f"System identifies Partner {trigger_sample['Delivery_person_ID']} active during disruption.")
    time.sleep(1)
    
    print("\n--- Processing Claim Test Case 1 (Expected: Approved) ---")
    # This is an actual true sample from the test set
    process_automated_claim(trigger_sample, fraud_model_path)
    
    time.sleep(2)
    print("\n--- Processing Claim Test Case 2 (Expected: Rejected / Fraud) ---")
    
    # We construct a forged anomalous claim: A sunny day, zero traffic, microscopic distance, but 2 hours taken!
    fraud_sample = {
        'Delivery_person_ID': 'FAKE_ID_001',
        'Delivery_person_Age': 60,
        'Delivery_person_Ratings': 1.0,
        'multiple_deliveries': 3,
        'Delivery_Distance_km': 0.1, # 100 meters
        'Time_taken_min': 200 # But took 3.5 hours! Highly anomalous
    }
    
    process_automated_claim(fraud_sample, fraud_model_path)
    
    print("\n" + "="*60)
    print(" Real Data Simulation Completed Successfully!")
    print("="*60 + "\n")

if __name__ == "__main__":
    base_dir = os.path.dirname(__file__)
    data_file = os.path.join(base_dir, "data", "processed_test.csv")
    if not os.path.exists(data_file):
         print("Processed test data not found. Run preprocess_real_data.py.")
    else:
        run_simulation(data_file)
