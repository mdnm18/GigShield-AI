import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = await prisma.claim.findMany({
      where: { userId: user.id },
      include: { policy: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(claims);
  } catch (error) {
    console.error("Claims API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { policyId, amountRequested, description, incidentDate } = body;

    const newClaim = await prisma.claim.create({
      data: {
        userId: user.id,
        policyId,
        amountRequested: parseFloat(amountRequested),
        description,
        incidentDate: new Date(incidentDate),
        status: "submitted",
        fraudScore: 0.0, // Default to neutral
      },
      include: { policy: true },
    });

    // --- ML TRIGGER: Run Fraud Assessment ---
    try {
      const mlUrl = process.env.ML_BACKEND_URL || 'http://localhost:5001';
      const fraudCheckResponse = await fetch(`${mlUrl}/api/assess-fraud`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          claimId: newClaim.id,
          // Sending some mock features for now, in a real case we'd fetch them from the user profile
          Delivery_Distance_km: 10.0,
          Time_taken_min: 120.0
        }),
      });

      if (fraudCheckResponse.ok) {
        const { fraud_score } = await fraudCheckResponse.json();
        // Update with real score from ML model
        await prisma.claim.update({
          where: { id: newClaim.id },
          data: { fraudScore: parseFloat(fraud_score) }
        });
      }
    } catch (mlError) {
      console.warn("Fraud API Trigger Failed, using default score.", mlError);
    }
    // ----------------------------------------

    return NextResponse.json(newClaim, { status: 201 });
  } catch (error) {
    console.error("Claims POST API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
