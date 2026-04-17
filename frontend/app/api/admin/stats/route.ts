import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

export async function GET() {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ─── Fraud Stats ────────────────────────────────────────
    const totalClaims = await prisma.claim.count();
    const anomalousClaims = await prisma.claim.count({ where: { fraudScore: { gte: 0.5 } } });

    // ─── Policy / Risk Stats ────────────────────────────────
    const policies = await prisma.policy.findMany({
      select: { riskScore: true, weeklyPremium: true, coverageLimit: true, status: true }
    });

    const activePolicies = policies.filter(p => p.status === "active");
    const avgRiskScore = policies.length > 0
      ? policies.reduce((acc, curr) => acc + (curr.riskScore || 0), 0) / policies.length
      : 0;
    const totalPremium = policies.reduce((acc, curr) => acc + (curr.weeklyPremium || 0), 0);
    const totalCoverage = policies.reduce((acc, curr) => acc + (curr.coverageLimit || 0), 0);

    // ─── User Stats ─────────────────────────────────────────
    const totalWorkers = await prisma.user.count({ where: { role: "worker" } });

    // ─── Payment Stats ──────────────────────────────────────
    const payoutPayments = await prisma.payment.findMany({
      where: { type: "payout", status: "completed" },
      select: { amount: true },
    });
    const totalPayouts = payoutPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // ─── Event Stats ────────────────────────────────────────
    const totalEvents = await prisma.event.count();
    const triggeredEvents = await prisma.event.count({ where: { triggered: true } });

    // ─── Claims by Status ───────────────────────────────────
    const submittedClaims = await prisma.claim.count({ where: { status: "submitted" } });
    const approvedClaims = await prisma.claim.count({ where: { status: "approved" } });
    const paidClaims = await prisma.claim.count({ where: { status: "paid" } });
    const rejectedClaims = await prisma.claim.count({ where: { status: "rejected" } });

    return NextResponse.json({
      fraud: {
        totalClaims,
        anomalousClaims,
        normalClaims: totalClaims - anomalousClaims,
        anomalyPercentage: totalClaims > 0 ? (anomalousClaims / totalClaims) * 100 : 0,
      },
      risk: {
        avgRiskScore,
        totalPremium,
        totalCoverage,
        policyCount: policies.length,
        activePolicies: activePolicies.length,
      },
      users: {
        totalWorkers,
      },
      payments: {
        totalPayouts,
        payoutCount: payoutPayments.length,
      },
      events: {
        totalEvents,
        triggeredEvents,
        triggerRate: totalEvents > 0 ? (triggeredEvents / totalEvents) * 100 : 0,
      },
      claims: {
        submitted: submittedClaims,
        approved: approvedClaims,
        paid: paidClaims,
        rejected: rejectedClaims,
        total: totalClaims,
      },
      geographicRisk: [
        { city: "Mumbai", avgRisk: 0.25 },
        { city: "Delhi", avgRisk: 0.42 },
        { city: "Bangalore", avgRisk: 0.18 },
        { city: "Chennai", avgRisk: 0.31 },
      ],
    });
  } catch (error) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
