import os
import sys

# Ensure models directory is accessible
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from models.fraud_model import assess_claim_fraud

def evaluate_trigger(weather_data):
    """
    Evaluates weather APIs (mocks) against parametric thresholds based on our test dataset string labels.
    Triggers when weather is 'Stormy' or 'Sandstorms'
    """
    print(f"Monitoring Weather: {weather_data.get('Weatherconditions', 'Normal')} (Zone: {weather_data.get('City', 'Unknown')})")
    
    triggered = False
    
    # These severity labels come from the actual Zomato dataset
    if weather_data.get('Weatherconditions') in ['Stormy', 'Sandstorms']:
        triggered = True
        
    if triggered:
        print(f"[WARNING] PARAMETRIC TRIGGER ACTIVATED: Extreme {weather_data['Weatherconditions']} in {weather_data['City']}!")
        
    return triggered, weather_data.get('Weatherconditions', 'Normal')

def process_automated_claim(claim_payload, fraud_model_path):
    """
    In a real scenario, the system automatically fetches eligible drivers 
    and initiates claims for them. Here we process an incoming claim check.
    """
    print(f"\nProcessing Claim {claim_payload['claim_id']} for Partner {claim_payload['partner_id']}...")
    
    # 1. Run through Fraud Detection
    features = {
        'weather_severity_at_claim_time': claim_payload['weather_severity'],
        'distance_from_disrupted_zone_km': claim_payload['distance_km'],
        'claims_filed_last_30_days': claim_payload['claims_last_30_days'],
        'time_since_last_delivery_ping_min': claim_payload['time_since_last_ping_min']
    }
    
    is_fraudulent = assess_claim_fraud(features, fraud_model_path)
    
    if is_fraudulent:
        print(f"[REJECTED] CLAIM REJECTED: Anomaly detected by AI Fraud Model. (Possible GPS Spoofing or False Event)")
        return {"status": "Rejected", "reason": "Anomaly Detected"}
        
    # 2. Payout logic based on coverage
    print(f"[APPROVED] CLAIM APPROVED: No anomalies detected. Automated payout initiated.")
    payout_amt = round(claim_payload.get('sum_insured', 1000) * 0.3, 2) # Example: pays out 30% of weekly insured sum per day of disruption
    print(f"[PAYOUT] TRANSFERRING FUND: Rs. {payout_amt} to Partner {claim_payload['partner_id']}")
    
    return {"status": "Paid", "amount": payout_amt}

if __name__ == "__main__":
    pass
