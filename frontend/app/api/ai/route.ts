import { NextResponse } from 'next/server';

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://localhost:5000';

const DEFAULT_PROFILE = {
  'Delivery_person_Age': 30,
  'Delivery_person_Ratings': 4.5,
  'Weatherconditions': 'Sunny',
  'Road_traffic_density': 'Low',
  'Vehicle_condition': 1,
  'Type_of_order': 'Snack',
  'Type_of_vehicle': 'motorcycle',
  'multiple_deliveries': 1,
  'Festival': 'No',
  'City': 'Metropolitian',
  'Delivery_Distance_km': 5.2,
  'avg_weekly_earnings': 3000.00
};

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Merge user data with defaults to ensure ML model gets required features
    const profile = { ...DEFAULT_PROFILE, ...data };

    const response = await fetch(`${ML_BACKEND_URL}/api/predict-premium`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('ML Backend Error:', errorText);
        return NextResponse.json({ error: 'Failed to reach ML backend' }, { status: 500 });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  // Simple health check call
  try {
    const response = await fetch(`${ML_BACKEND_URL}/health`);
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ status: 'offline', backend: ML_BACKEND_URL });
  }
}
