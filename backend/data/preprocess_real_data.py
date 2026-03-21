import pandas as pd
import numpy as np
import os

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees).
    Returns distance in kilometers.
    """
    # Convert decimal degrees to radians 
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
    c = 2 * np.arcsin(np.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers
    return c * r

def clean_and_process_data(input_path, output_path, is_train=True):
    print(f"Reading data from {input_path}...")
    df = pd.read_csv(input_path)
    
    # 1. Strip whitespace from column names and string columns
    df.columns = df.columns.str.strip()
    for col in df.select_dtypes(['object']).columns:
        df[col] = df[col].astype(str).str.strip()
        
    # Replace 'NaN' string with actual numpy NaN
    df.replace('NaN', np.nan, inplace=True)
    
    # Drop rows with critical missing coordinates
    df.dropna(subset=['Restaurant_latitude', 'Restaurant_longitude', 'Delivery_location_latitude', 'Delivery_location_longitude'], inplace=True)

    print("Calculating Haversine distances...")
    # 2. Feature Engineering: Distance Calculation
    df['Delivery_Distance_km'] = haversine(
        df['Restaurant_latitude'].astype(float), 
        df['Restaurant_longitude'].astype(float),
        df['Delivery_location_latitude'].astype(float),
        df['Delivery_location_longitude'].astype(float)
    )
    
    # Filter out impossible coordinates/distances
    df = df[df['Delivery_Distance_km'] <= 50] # Reject deliveries > 50km
    
    # 3. Clean categorical text fields
    if 'Weatherconditions' in df.columns:
        df['Weatherconditions'] = df['Weatherconditions'].str.replace('conditions ', '', regex=False)
        
    # Cast necessary types
    df['Delivery_person_Age'] = pd.to_numeric(df['Delivery_person_Age'], errors='coerce')
    df['Delivery_person_Ratings'] = pd.to_numeric(df['Delivery_person_Ratings'], errors='coerce')
    df['multiple_deliveries'] = pd.to_numeric(df['multiple_deliveries'], errors='coerce')
    
    # 4. Target Variable Extraction (Only for train dataset)
    if is_train and 'Time_taken(min)' in df.columns:
        # Extract the integer minutes from "(min) 24"
        df['Time_taken_min'] = df['Time_taken(min)'].str.extract('(\d+)').astype(float)
        
        # Calculate derived target: Disrupted (1) if time taken is highly anomalous (> mean + 1 std)
        # This will be used to train our Risk/Pricing logic
        mean_time = df['Time_taken_min'].mean()
        std_time = df['Time_taken_min'].std()
        threshold = mean_time + std_time
        
        df['Is_Disrupted'] = np.where(df['Time_taken_min'] > threshold, 1, 0)
        
    # 5. Drop unnecessary columns that are redundant post-extraction (Keeping IDs for inference tracking)
    cols_to_drop = [
        'Order_Date', 'Time_Orderd', 'Time_Order_picked', 
        'Restaurant_latitude', 'Restaurant_longitude', 'Delivery_location_latitude', 'Delivery_location_longitude'
    ]
    if 'Time_taken(min)' in df.columns:
         cols_to_drop.append('Time_taken(min)')
         
    df.drop(columns=[c for c in cols_to_drop if c in df.columns], inplace=True)
    
    # Handle remaining NAs with median/mode to maintain dataset size for modeling
    for col in df.select_dtypes(include=np.number).columns:
        df[col].fillna(df[col].median(), inplace=True)
    for col in df.select_dtypes(include='object').columns:
        df[col].fillna(df[col].mode()[0], inplace=True)
        
    print(f"Data processing completed. Saving to {output_path}...")
    df.to_csv(output_path, index=False)
    print(f"Saved {len(df)} records.")
    return df

if __name__ == "__main__":
    base_dir = os.path.dirname(__file__)
    
    train_in = os.path.join(base_dir, "train.csv")
    train_out = os.path.join(base_dir, "processed_train.csv")
    if os.path.exists(train_in):
        clean_and_process_data(train_in, train_out, is_train=True)
        
    test_in = os.path.join(base_dir, "test.csv")
    test_out = os.path.join(base_dir, "processed_test.csv")
    if os.path.exists(test_in):
        clean_and_process_data(test_in, test_out, is_train=False)
