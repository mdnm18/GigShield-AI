"""
GigShield AI — FastAPI ML Service
Provides AI endpoints for risk scoring, fraud detection, loss prediction, and parametric trigger evaluation.
"""
import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

# Ensure models directory is accessible
sys.path.append(os.path.dirname(__file__))

from models.risk_pricing import predict_premium
from models.fraud_model import assess_claim_fraud
from models.loss_prediction import predict_loss
from engine.parametric_engine import evaluate_trigger

app = FastAPI(
    title="GigShield AI — ML Service",
    description="AI-powered risk scoring, fraud detection, and loss prediction for parametric gig worker insurance.",
    version="2.0.0"
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Model Paths ────────────────────────────────────────────

BASE_DIR = os.path.dirname(__file__)
RISK_MODEL_PATH = os.path.join(BASE_DIR, "models", "risk_classifier_xgb.pkl")
FRAUD_MODEL_PATH = os.path.join(BASE_DIR, "models", "fraud_iso_forest_real.pkl")


# ─── Request/Response Schemas ────────────────────────────────

class RiskScoreRequest(BaseModel):
    Delivery_person_Age: int = 30
    Delivery_person_Ratings: float = 4.5
    Weatherconditions: str = "Sunny"
    Road_traffic_density: str = "Low"
    Vehicle_condition: int = 1
    Type_of_order: str = "Snack"
    Type_of_vehicle: str = "motorcycle"
    multiple_deliveries: int = 1
    Festival: str = "No"
    City: str = "Metropolitian"
    Delivery_Distance_km: float = 5.2
    avg_weekly_earnings: float = 3000.0


class FraudCheckRequest(BaseModel):
    Delivery_person_Age: int = 30
    Delivery_person_Ratings: float = 4.2
    multiple_deliveries: float = 2.0
    Delivery_Distance_km: float = 10.0
    Time_taken_min: Optional[float] = 150.0
    claimId: Optional[str] = None


class LossPredictionRequest(BaseModel):
    disruption_type: str = "weather"
    severity: str = "moderate"
    duration_hours: float = 4.0
    avg_hourly_earnings: float = 150.0
    coverage_limit: float = 5000.0


class TriggerEvalRequest(BaseModel):
    Weatherconditions: str = "Sunny"
    City: str = "Metropolitian"
    aqi_value: Optional[float] = None
    rainfall_mm: Optional[float] = None
    traffic_density: Optional[str] = None


# ─── Endpoints ───────────────────────────────────────────────

@app.get("/health")
async def health_check():
    models_loaded = os.path.exists(RISK_MODEL_PATH) and os.path.exists(FRAUD_MODEL_PATH)
    return {
        "status": "healthy",
        "service": "GigShield-AI ML API",
        "version": "2.0.0",
        "models_loaded": models_loaded
    }


@app.post("/ai/risk-score")
async def get_risk_score(data: RiskScoreRequest):
    """Calculate risk score and recommended premium for a driver profile."""
    try:
        profile = data.model_dump()
        premium, prob = predict_premium(profile, RISK_MODEL_PATH)
        
        # Risk tier classification
        if prob > 0.7:
            risk_tier = "critical"
        elif prob > 0.5:
            risk_tier = "high"
        elif prob > 0.3:
            risk_tier = "moderate"
        else:
            risk_tier = "low"
        
        return {
            "weekly_premium": premium,
            "risk_score": prob,
            "risk_tier": risk_tier,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Keep backward compatibility with existing frontend proxy
@app.post("/api/predict-premium")
async def predict_premium_legacy(data: RiskScoreRequest):
    """Legacy endpoint — proxies to /ai/risk-score."""
    return await get_risk_score(data)


@app.post("/ai/fraud-check")
async def check_fraud(data: FraudCheckRequest):
    """Assess if a claim is potentially fraudulent using Isolation Forest."""
    try:
        features = data.model_dump(exclude={"claimId"})
        is_fraudulent = assess_claim_fraud(features, FRAUD_MODEL_PATH)
        
        # Generate a normalized fraud score (0.0 = clean, 1.0 = anomalous)
        fraud_score = 1.0 if is_fraudulent else 0.0
        
        return {
            "is_fraudulent": is_fraudulent,
            "fraud_score": fraud_score,
            "verdict": "ANOMALY_DETECTED" if is_fraudulent else "CLEAN",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Keep backward compatibility
@app.post("/api/assess-fraud")
async def assess_fraud_legacy(data: FraudCheckRequest):
    """Legacy endpoint — proxies to /ai/fraud-check."""
    return await check_fraud(data)


@app.post("/ai/loss-prediction")
async def get_loss_prediction(data: LossPredictionRequest):
    """Estimate income loss and recommended payout for a disruption event."""
    try:
        result = predict_loss(data.model_dump())
        return {
            **result,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/evaluate-trigger")
async def evaluate_parametric_trigger(data: TriggerEvalRequest):
    """Evaluate if environmental conditions breach parametric thresholds."""
    try:
        weather_data = data.model_dump()
        triggered, reason = evaluate_trigger(weather_data)
        
        # Extended trigger evaluation for AQI and traffic
        aqi_triggered = False
        traffic_triggered = False
        
        if data.aqi_value and data.aqi_value > 200:
            aqi_triggered = True
            
        if data.rainfall_mm and data.rainfall_mm > 50:
            triggered = True
            reason = f"Heavy Rainfall ({data.rainfall_mm}mm)"
            
        if data.traffic_density and data.traffic_density in ["Jam", "High"]:
            traffic_triggered = True
        
        any_triggered = triggered or aqi_triggered or traffic_triggered
        
        triggers = []
        if triggered:
            triggers.append({"type": "weather", "reason": reason, "severity": "critical" if weather_data["Weatherconditions"] in ["Stormy", "Sandstorms"] else "moderate"})
        if aqi_triggered:
            triggers.append({"type": "aqi", "reason": f"AQI Index {data.aqi_value} exceeds safe limit", "severity": "high"})
        if traffic_triggered:
            triggers.append({"type": "traffic", "reason": f"Traffic density: {data.traffic_density}", "severity": "moderate"})
        
        return {
            "triggered": any_triggered,
            "triggers": triggers,
            "weather_condition": weather_data["Weatherconditions"],
            "city": weather_data["City"],
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Run ─────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5001, reload=True)
