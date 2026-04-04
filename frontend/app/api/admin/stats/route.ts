import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

export async function GET() {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Aggregating Fraud Stats
    const totalClaims = await prisma.claim.count();
    const anomalousClaims = await prisma.claim.count({ where: { fraudScore: 1.0 } });
    
    // Aggregating Policy Risk Stats
    const policies = await prisma.policy.findMany({
      select: { riskScore: true, premium: true, coverageLimit: true }
    });

    const avgRiskScore = policies.length > 0 
      ? policies.reduce((acc: number, curr: any) => acc + (curr.riskScore || 0), 0) / policies.length 
      : 0;

    const totalPremium = policies.reduce((acc: number, curr: any) => acc + (curr.premium || 0), 0);

    return NextResponse.json({
      fraud: {
        totalClaims,
        anomalousClaims,
        normalClaims: totalClaims - anomalousClaims,
        anomalyPercentage: totalClaims > 0 ? (anomalousClaims / totalClaims) * 100 : 0
      },
      risk: {
        avgRiskScore,
        totalPremium,
        policyCount: policies.length
      },
      // Mocked data for chart visualization consistency if real data is sparse
      geographicRisk: [
        { city: "Mumbai", avgRisk: 0.25 },
        { city: "Delhi", avgRisk: 0.42 },
        { city: "Bangalore", avgRisk: 0.18 },
        { city: "Chennai", avgRisk: 0.31 }
      ]
    });
  } catch (error) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
