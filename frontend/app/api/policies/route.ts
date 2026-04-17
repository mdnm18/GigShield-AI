import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || "http://localhost:5001";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const policies = await prisma.policy.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { claims: true } },
      },
    });

    return NextResponse.json(policies);
  } catch (error) {
    console.error("Policies API Error:", error);
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
    const {
      policyType = "parametric_weather",
      coverageLimit = 5000,
      city = "Metropolitian",
      weatherCondition = "Sunny",
    } = body;

    // Call AI for risk scoring and premium calculation
    let premium = 25.0;
    let riskScore = 0.5;

    try {
      const res = await fetch(`${ML_BACKEND_URL}/ai/risk-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          City: city,
          Weatherconditions: weatherCondition,
          avg_weekly_earnings: coverageLimit / 4,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        premium = data.weekly_premium;
        riskScore = data.risk_score;
      }
    } catch (mlError) {
      console.warn("ML service unavailable, using default premium.", mlError);
    }

    // Create the policy
    const policy = await prisma.policy.create({
      data: {
        userId: user.id,
        policyType,
        weeklyPremium: premium,
        coverageLimit: parseFloat(String(coverageLimit)),
        riskScore,
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    // Create initial premium payment record
    await prisma.payment.create({
      data: {
        userId: user.id,
        policyId: policy.id,
        amount: premium,
        type: "premium_debit",
        status: "completed",
        description: `Initial premium for policy ${policy.id.slice(0, 8)}`,
        transactionRef: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      },
    });

    // Save risk score
    await prisma.riskScore.create({
      data: {
        userId: user.id,
        score: riskScore,
        factors: JSON.stringify({ city, weatherCondition, policyType }),
        weatherRisk: riskScore * 0.6,
        trafficRisk: riskScore * 0.25,
        aqiRisk: riskScore * 0.15,
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "info",
        title: "Policy Activated",
        message: `Your ${policyType} policy is now active. Weekly premium: ₹${premium.toFixed(2)}. Coverage: ₹${coverageLimit}. AI Risk Score: ${(riskScore * 100).toFixed(1)}%.`,
      },
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error("Policy POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
