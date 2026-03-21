# Gig Worker AI Parametric Insurance Platform

This repository contains the AI/ML backend implementation for a Parametric Insurance platform tailored for Gig Economy workers (specifically Food Delivery partners like Zomato/Swiggy).

## The Problem
Gig workers lose income during extreme environmental disruptions (heavy rain, severe heat, floods). This system provides an automated safety net to protect their lost daily wages.

## Key Features Implemented

1. **Dynamic Risk Pricing Model (`models/risk_pricing.py`)** 
   - Uses **XGBoost Regressor**.
   - Calculates a risk-adjusted weekly premium based on historical disruption frequency, the partner's historical claim rate, and the 7-day weather forecast (Rain/Heat probability).
   - This ensures the premium matches the typical weekly payout cycle of gig workers.

2. **Intelligent Fraud Detection (`models/fraud_model.py`)**
   - Uses **Isolation Forest** (Unsupervised Anomaly Detection).
   - Validates claims by monitoring:
     - Distance from the actual disrupted zone (GPS spoofing detection).
     - Live weather severity at the time of claim.
     - App activity (time since the last delivery ping).
     - Recent claim frequency.

3. **Parametric Trigger Automation (`engine/parametric_engine.py`)**
   - Monitors live weather API feeds (mocked here).
   - Triggers automatically when a disruption threshold is crossed (e.g., Rain > 50mm, Temp > 40°C).
   - Automatically processes claims for affected drivers, validating them through the Fraud AI before initiating a payout for lost income.

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Generate Mock Data:**
   The project requires simulated historical data to train the models.
   ```bash
   python data/simulate_data.py
   ```
   This generates `risk_profiles.csv` and `claims_data.csv`.

3. **Train AI Models:**
   Train the Risk Assessment and Fraud Detection models.
   ```bash
   python models/risk_pricing.py
   python models/fraud_model.py
   ```
   The `.pkl` model files will be saved in the `models/` directory.

4. **Run the Simulation:**
   Run the end-to-end pipeline demonstrating policy pricing, parametric trigger, and intelligent claim approval/rejection.
   ```bash
   python main.py
   ```

## Note on Constraints
As requested, this model strictly excludes coverage for health, life, accidents, or vehicle repair. It is designed **solely for Income Protection** resulting from external uncontrollable weather disruptions. The system assesses limits computationally and prices policies on a Weekly cycle.
