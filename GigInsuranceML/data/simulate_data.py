import pandas as pd
import numpy as np
import os

def generate_risk_data(num_records=1000):
    """
    Simulates delivery partner weekly risk profiles to train the pricing model.
    """
    np.random.seed(42)
    partner_ids = [f"P{str(i).zfill(4)}" for i in range(1, num_records + 1)]
    zones = np.random.choice(["Zone_A", "Zone_B", "Zone_C", "Zone_D"], num_records)
    avg_earnings = np.random.normal(2500, 500, num_records).round(2)
    
    # Historical risk factors
    historical_claim_rate = np.random.uniform(0.01, 0.15, num_records)
    historical_disruption_frequency = np.random.uniform(0.05, 0.3, num_records)
    
    # Weekly forecast (simulating current week APIs)
    forecast_rain_prob = np.random.uniform(0.0, 1.0, num_records)
    forecast_heat_prob = np.random.uniform(0.0, 1.0, num_records)
    
    # Underlying "true risk score" equation. 
    # High risk = high probability of rain/heat + high historical claims
    true_risk_score = (
        (forecast_rain_prob * 0.4) + 
        (forecast_heat_prob * 0.3) + 
        (historical_disruption_frequency * 0.2) + 
        (historical_claim_rate * 0.1)
    )
    
    # Target Premium Calculation: Base rate (1%) + risk-adjusted rate (up to 5% total)
    # The premium protects their expected total average earnings for the week.
    target_premium = (0.01 + (true_risk_score * 0.04)) * avg_earnings
    target_premium = target_premium.round(2)
    
    df = pd.DataFrame({
        "partner_id": partner_ids,
        "zone": zones,
        "avg_weekly_earnings": avg_earnings,
        "historical_claim_rate": historical_claim_rate,
        "forecast_rain_prob": forecast_rain_prob,
        "forecast_heat_prob": forecast_heat_prob,
        "historical_disruption_frequency": historical_disruption_frequency,
        "target_premium": target_premium
    })
    return df

def generate_claims_data(num_claims=2000):
    """
    Simulates historical claims data to train the Fraud Detection model (Anomaly Detection).
    """
    np.random.seed(42)
    claim_ids = [f"C{str(i).zfill(5)}" for i in range(1, num_claims + 1)]
    partner_ids = [f"P{str(np.random.randint(1, 1001)).zfill(4)}" for _ in range(num_claims)]
    
    # 15% of claims in our mock dataset are fraudulent
    is_fraud = np.random.choice([0, 1], num_claims, p=[0.85, 0.15])
    
    weather_severity = []
    distance_km = []
    claims_30_days = []
    ping_min = []
    
    for f in is_fraud:
        if f == 0: # Genuine Claim
            weather_severity.append(np.random.uniform(0.6, 1.0))   # High severity (e.g. lots of rain)
            distance_km.append(np.random.exponential(scale=2))     # Close to disruption epicenter
            claims_30_days.append(np.random.poisson(lam=0.5))      # Few recent claims
            ping_min.append(np.random.exponential(scale=10))       # App was recently active
        else: # Fraudulent Claim
            weather_severity.append(np.random.uniform(0.0, 0.4))   # Low real weather severity
            distance_km.append(np.random.uniform(10, 50))          # Far from disruption! (GPS Spoofing)
            claims_30_days.append(np.random.poisson(lam=4))        # Frequent claimer
            ping_min.append(np.random.uniform(60, 300))            # App was inactive for hours
            
    df = pd.DataFrame({
        "claim_id": claim_ids,
        "partner_id": partner_ids,
        "weather_severity_at_claim_time": np.round(weather_severity, 2),
        "distance_from_disrupted_zone_km": np.round(distance_km, 2),
        "claims_filed_last_30_days": claims_30_days,
        "time_since_last_delivery_ping_min": np.round(ping_min, 1),
        "is_fraud": is_fraud
    })
    return df

if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(__file__))
    os.makedirs(output_dir, exist_ok=True)
    
    print("Generating risk profiles dataset...")
    risk_df = generate_risk_data(1000)
    risk_csv_path = os.path.join(output_dir, "risk_profiles.csv")
    risk_df.to_csv(risk_csv_path, index=False)
    print(f"Saved {len(risk_df)} records to {risk_csv_path}")
    
    print("Generating historic claims dataset...")
    claims_df = generate_claims_data(2000)
    claims_csv_path = os.path.join(output_dir, "claims_data.csv")
    claims_df.to_csv(claims_csv_path, index=False)
    print(f"Saved {len(claims_df)} records to {claims_csv_path}")
