import os
import sys
import pandas as pd
import time

# Ensure models directory is accessible
sys.path.append(os.path.dirname(__file__))

from models.risk_pricing import predict_premium
from engine.parametric_engine import evaluate_trigger
from models.fraud_model import assess_claim_fraud
from agent_multimodal import MultimodalEvidenceAgent


class RiskUnderwritingAgent:
    def __init__(self, model_path):
        self.name = "Risk & Underwriting Agent"
        self.model_path = model_path
        
    def evaluate_driver(self, profile):
        print(f"\n[{self.name}] [EVAL] Analyzing Driver {profile['Delivery_person_ID']}...")
        print(f"[{self.name}] Context: City: {profile['City']}, Historical Weather: {profile['Weatherconditions']}, Ratings: {profile['Delivery_person_Ratings']}")
        
        premium, prob = predict_premium(profile, self.model_path)
        
        print(f"[{self.name}] [RESULT] Output -> Calculated Disruption Risk: {prob:.2%}")
        if prob > 0.5:
            reason = "High risk due to severe historical weather mapping and dense traffic profiles."
        else:
            reason = "Low risk. Normal operational parameters."
            
        print(f"[{self.name}] [APPROVED] Policy Issued. Weekly Premium set to: Rs. {premium:.2f}. Reason: {reason}")
        
        profile['weekly_premium'] = premium
        return profile


class ParametricMonitoringAgent:
    def __init__(self):
        self.name = "Parametric Monitor Agent"
        
    def scan_environment(self, test_data_row):
        print(f"\n[{self.name}] [SCAN] Scanning live feeds for Zone: {test_data_row['City']}...")
        time.sleep(1)
        
        triggered, reason = evaluate_trigger(test_data_row)
        
        if triggered:
            print(f"[{self.name}] [ALERT] Severe weather threshold breached ({reason})!")
            return True, reason
        else:
            print(f"[{self.name}] [OK] Environment stable. Weather: {reason}. No alerts.")
            return False, reason


class ClaimsFraudAgent:
    def __init__(self, model_path):
        self.name = "Claims & Fraud Investigation Agent"
        self.model_path = model_path
        
    def process_claim(self, claim_payload, trigger_reason):
        print(f"\n[{self.name}] [PROCESS] Claim initiated due to '{trigger_reason}'. Investigating payload for {claim_payload['Delivery_person_ID']}...")
        
        features = {
            'Delivery_person_Age': claim_payload['Delivery_person_Age'],
            'Delivery_person_Ratings': claim_payload['Delivery_person_Ratings'],
            'multiple_deliveries': claim_payload['multiple_deliveries'],
            'Delivery_Distance_km': claim_payload['Delivery_Distance_km']
        }
        
        if 'Time_taken_min' in claim_payload:
            features['Time_taken_min'] = claim_payload['Time_taken_min']
            
        time.sleep(1)
        is_fraudulent = assess_claim_fraud(features, self.model_path)
        
        if is_fraudulent:
             print(f"[{self.name}] [REJECTED] CLAIM REJECTED. Analysis: Anomaly detected by Isolation Forest. Target coordinates and delivery times do not align statistically.")
             return {"status": "Rejected", "reason": "Statistical Anomaly Detected (Possible GPS Spoof/Stalling)"}
             
        payout_amt = round(claim_payload.get('weekly_premium', 25) * 10, 2)
        print(f"[{self.name}] [APPROVE_PENDING] Tabular Data APPROVED. Variables fall within normal genuine ranges. Requires Visual Evidence Validation before Rs. {payout_amt} payout.")
        return {"status": "Approved_Pending_Evidence", "amount": payout_amt}


def run_agentic_workflow(data_path):
    print("="*70)
    print(" [START] Gig Worker Insurance Multi-Agent Orchestrator ")
    print("="*70)
    
    base_dir = os.path.dirname(__file__)
    risk_model_path = os.path.join(base_dir, "models", "risk_classifier_xgb.pkl")
    fraud_model_path = os.path.join(base_dir, "models", "fraud_iso_forest_real.pkl")
    
    # Initialize our AI Agents
    risk_agent = RiskUnderwritingAgent(risk_model_path)
    monitor_agent = ParametricMonitoringAgent()
    claims_agent = ClaimsFraudAgent(fraud_model_path)
    multimodal_agent = MultimodalEvidenceAgent()
    
    # Load dataset
    df = pd.read_csv(data_path)
    
    # We orchestrate an end-to-end simulation using two distinct sample states
    stormy_samples = df[df['Weatherconditions'] == 'Stormy']
    real_event_payload = stormy_samples.iloc[0].to_dict()
    real_event_payload['avg_weekly_earnings'] = 3000.00
    
    # ACT I: Risk Pricing
    print("\n--- PHASE 1: Policy Issuance ---")
    active_policy_driver = risk_agent.evaluate_driver(real_event_payload)
    
    time.sleep(1)
    
    # ACT II: Live Monitoring
    print("\n--- PHASE 2: Live Monitoring ---")
    is_triggered, weather_reason = monitor_agent.scan_environment(active_policy_driver)
    
    if not is_triggered:
        return
        
    time.sleep(1)
    
    # ACT III: Claims & Settlement
    print("\n--- PHASE 3: Automated Claims ---")
    
    # ---------------------------------------------------------
    # Scenario A: Genuine Driver hit by storm submitting valid picture
    # ---------------------------------------------------------
    print("\n[Scenario A - Genuine Driver with Valid Evidence]")
    
    # Create dummy image for Scenario A (Flooded Zone)
    valid_evidence_path = os.path.join(base_dir, "data", "evidence_flood_zone_34.jpg")
    with open(valid_evidence_path, "w") as f:
        f.write("mock_image_binary_flood")
        
    validation_res = claims_agent.process_claim(active_policy_driver, trigger_reason=weather_reason)
    
    # Handoff to Multimodal Agent if ML Fraud model approves the numbers
    if validation_res['status'] == 'Approved_Pending_Evidence':
        multimodal_res = multimodal_agent.analyze_evidence(valid_evidence_path, active_policy_driver)
        if multimodal_res['decision'] == 'APPROVE':
             print(f"[Claims & Fraud Investigation Agent] [PAYOUT] Visual Evidence VERIFIED by Vision LLM. Transferring Funds: Rs. {validation_res['amount']}.")
        else:
             print(f"[Claims & Fraud Investigation Agent] [REJECTED] Evidence Validation Failed. Reason: {multimodal_res['reasoning']}")
    
    time.sleep(2)
    
    # ---------------------------------------------------------
    # Scenario B: Fraudulent claim attempting to submit Medical bill 
    # (Checking if Multimodal LLM respects Golden Rules)
    # ---------------------------------------------------------
    print("\n[Scenario B - Driver Submitting Medical Bill Image]")
    
    # Create dummy image for Scenario B (Motorcycle Accident / Hospital)
    medical_evidence_path = os.path.join(base_dir, "data", "evidence_hospital_bill.jpg")
    with open(medical_evidence_path, "w") as f:
        f.write("mock_image_binary_hospital")
        
    # We will use exactly the same clean payload from Scenario A, so the statistical
    # fraud model approves it, forcing the system to rely purely on the Vision LLM to catch it.
    sneaky_payload = active_policy_driver.copy()
    sneaky_payload['Delivery_person_ID'] = "SNEAKY_ACTOR_99"
    
    validation_res_2 = claims_agent.process_claim(sneaky_payload, trigger_reason=weather_reason)
    if validation_res_2['status'] == 'Approved_Pending_Evidence':
        multimodal_res_2 = multimodal_agent.analyze_evidence(medical_evidence_path, sneaky_payload)
        if multimodal_res_2['decision'] == 'APPROVE':
             print(f"[Claims & Fraud Investigation Agent] [PAYOUT] Visual Evidence VERIFIED. Transferring Funds: Rs. {validation_res_2['amount']}.")
        else:
             print(f"[Claims & Fraud Investigation Agent] [REJECTED] Evidence Validation Failed. Vision AI Verdict: {multimodal_res_2['reasoning']}")
             
    # Cleanup evidence mocks
    if os.path.exists(valid_evidence_path): os.remove(valid_evidence_path)
    if os.path.exists(medical_evidence_path): os.remove(medical_evidence_path)
    
    print("\n" + "="*70)
    print(" Agentic Simulation Completed! ")
    print("="*70 + "\n")


if __name__ == "__main__":
    base_dir = os.path.dirname(__file__)
    data_file = os.path.join(base_dir, "data", "processed_test.csv")
    if not os.path.exists(data_file):
         print("Processed test data not found.")
    else:
        run_agentic_workflow(data_file)
