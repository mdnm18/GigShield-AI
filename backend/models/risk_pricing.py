import pandas as pd
import numpy as np
import os
import pickle
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score

def train_risk_model(data_path, model_output_path):
    print("Loading processed real dataset for Risk Assessment...")
    df = pd.read_csv(data_path)
    
    # We want to predict 'Is_Disrupted' (1 if delayed beyond norms, 0 otherwise)
    # The probability of this event happening will price the premium.
    
    features = [
        'Delivery_person_Age', 'Delivery_person_Ratings',
        'Weatherconditions', 'Road_traffic_density', 'Vehicle_condition',
        'Type_of_order', 'Type_of_vehicle', 'multiple_deliveries', 'Festival', 'City',
        'Delivery_Distance_km'
    ]
    
    X = df[features]
    y = df['Is_Disrupted']
    
    # One-hot encode categorical features
    X = pd.get_dummies(X, drop_first=True)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # We use scale_pos_weight because disruptions (class 1) are a minority (~15% of data)
    ratio = float(np.sum(y == 0)) / np.sum(y == 1)
    
    print("Training XGBoost Classifier to predict Disruption Risk Probability...")
    model = XGBClassifier(
        n_estimators=100, 
        learning_rate=0.1, 
        max_depth=5, 
        scale_pos_weight=ratio,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    predictions = model.predict(X_test)
    prob_predictions = model.predict_proba(X_test)[:, 1]
    
    print("\n--- Model Performance (Disruption Prediction) ---")
    print("Accuracy:", accuracy_score(y_test, predictions))
    print("ROC-AUC Score:", roc_auc_score(y_test, prob_predictions))
    print("\nClassification Report:")
    print(classification_report(y_test, predictions))
    print("-------------------------\n")
    
    # Save Model
    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    with open(model_output_path, 'wb') as f:
        pickle.dump(model, f)
    
    # Save feature columns to ensure prediction aligns with training features
    with open(model_output_path + '_cols.pkl', 'wb') as f:
        pickle.dump(list(X.columns), f)
        
    print(f"Risk model saved successfully to {model_output_path}")

def predict_premium(profile_dict, model_path):
    """
    Function to predict premium based on context probability of disruption.
    """
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    with open(model_path + '_cols.pkl', 'rb') as f:
        model_cols = pickle.load(f)
        
    df = pd.DataFrame([profile_dict])
    df = pd.get_dummies(df, drop_first=True)
    
    # Ensure all columns from training are present
    for col in model_cols:
        if col not in df.columns:
            df[col] = 0
            
    # Reorder columns to match training Phase
    df = df[model_cols]
    
    # Get Probability of Disruption
    prob_disrupted = model.predict_proba(df)[0][1]
    
    # Business Logic:
    # Base Premium (1%) + Extran Premium linearly scaled by likelihood of disruption (Max 5% extra)
    base_rate = 0.01
    
    # Assuming average weekly earnings is passed in the context dict for sizing
    avg_earnings = profile_dict.get('avg_weekly_earnings', 2500)
    target_premium = (base_rate + (prob_disrupted * 0.05)) * avg_earnings
    
    return round(target_premium, 2), round(prob_disrupted, 4)

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(__file__))
    data_file = os.path.join(base_dir, "data", "processed_train.csv")
    out_model = os.path.join(base_dir, "models", "risk_classifier_xgb.pkl")
    
    if not os.path.exists(data_file):
        print(f"Data file not found at {data_file}. Please run preprocess_real_data.py first.")
    else:
        train_risk_model(data_file, out_model)
