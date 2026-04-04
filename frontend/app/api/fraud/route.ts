import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://localhost:5000';

const DEFAULT_CLAIM_FEATURES = {
  'Delivery_person_Age': 30,
  'Delivery_person_Ratings': 4.2,
  'multiple_deliveries': 2.0,
  'Delivery_Distance_km': 10.0,
  'Time_taken_min': 150.0  // Anomaly if high for short distance
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { claimId, ...userFeatures } = body;

    // Merge features with defaults for ML consistency
    const features = { ...DEFAULT_CLAIM_FEATURES, ...userFeatures };

    const mlResponse = await fetch(`${ML_BACKEND_URL}/api/assess-fraud`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(features),
    });

    if (!mlResponse.ok) {
        return NextResponse.json({ error: "ML Service Unavailable" }, { status: 500 });
    }

    const { is_fraudulent, fraud_score } = await mlResponse.json();

    // Update the claim record with the fraud score if ID is provided
    if (claimId) {
        await prisma.claim.update({
            where: { id: claimId },
            data: { fraudScore: fraud_score }
        });
    }

    return NextResponse.json({ is_fraudulent, fraud_score });
  } catch (error) {
    console.error("Fraud Check Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
