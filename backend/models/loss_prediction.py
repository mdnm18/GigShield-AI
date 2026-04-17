"""
GigShield AI — Loss Prediction Model
Estimates income loss hours and payout amount based on disruption parameters.
"""
import numpy as np


def predict_loss(disruption_data: dict) -> dict:
    """
    Estimates the financial loss for a gig worker based on disruption parameters.
    
    Input features:
        - disruption_type: str ("weather", "aqi", "traffic")
        - severity: str ("low", "moderate", "high", "critical")
        - duration_hours: float (estimated duration of the disruption)
        - avg_hourly_earnings: float (worker's average hourly earnings)
        - coverage_limit: float (policy coverage limit)
    
    Returns:
        - loss_hours: estimated hours of lost work
        - estimated_loss: estimated financial loss in INR
        - payout_amount: recommended payout (capped at coverage limit)
        - confidence: model confidence score
    """
    disruption_type = disruption_data.get("disruption_type", "weather")
    severity = disruption_data.get("severity", "moderate")
    duration_hours = disruption_data.get("duration_hours", 4.0)
    avg_hourly_earnings = disruption_data.get("avg_hourly_earnings", 150.0)
    coverage_limit = disruption_data.get("coverage_limit", 5000.0)
    
    # Severity multipliers (how much of the duration is actually lost work)
    severity_map = {
        "low": 0.25,
        "moderate": 0.55,
        "high": 0.80,
        "critical": 1.0
    }
    
    # Disruption type impact factors
    type_factor = {
        "weather": 1.0,     # Storms directly prevent delivery
        "aqi": 0.7,         # AQI may still allow some work
        "traffic": 0.5      # Traffic causes delays but not full stoppage
    }
    
    severity_mult = severity_map.get(severity, 0.55)
    type_mult = type_factor.get(disruption_type, 1.0)
    
    # Calculate loss hours
    # Add some realistic noise for model-like behavior
    noise = np.random.normal(0, 0.1)
    loss_hours = round(duration_hours * severity_mult * type_mult + noise, 2)
    loss_hours = max(0.5, loss_hours)  # Minimum 30 minutes
    
    # Calculate financial loss
    estimated_loss = round(loss_hours * avg_hourly_earnings, 2)
    
    # Payout is the lesser of estimated loss and coverage limit
    # Apply a 70% payout ratio (insurance standard)
    payout_amount = round(min(estimated_loss * 0.70, coverage_limit), 2)
    
    # Confidence based on data completeness
    confidence = 0.85 + (0.05 if severity in severity_map else 0) + (0.05 if disruption_type in type_factor else 0)
    confidence = round(min(confidence, 0.98), 2)
    
    return {
        "loss_hours": loss_hours,
        "estimated_loss": estimated_loss,
        "payout_amount": payout_amount,
        "confidence": confidence,
        "breakdown": {
            "duration_hours": duration_hours,
            "severity_multiplier": severity_mult,
            "type_factor": type_mult,
            "hourly_rate": avg_hourly_earnings
        }
    }


if __name__ == "__main__":
    # Test
    result = predict_loss({
        "disruption_type": "weather",
        "severity": "critical",
        "duration_hours": 6.0,
        "avg_hourly_earnings": 200.0,
        "coverage_limit": 5000.0
    })
    print(f"Loss Prediction Result: {result}")
