import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

export async function GET() {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = await prisma.claim.findMany({
      include: {
        user: { select: { name: true, email: true } },
        policy: { select: { riskScore: true, policyType: true, coverageLimit: true } },
        event: { select: { type: true, severity: true, description: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(claims);
  } catch (error) {
    console.error("Admin Claims GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { claimId, status, amountApproved } = body;

    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        status,
        amountApproved: amountApproved ? parseFloat(amountApproved) : null,
      },
      include: {
        user: { select: { name: true, email: true, id: true } },
        policy: { select: { id: true, coverageLimit: true } },
      },
    });

    // On approval → auto-create payout and notification
    if (status === "approved" && amountApproved) {
      const payoutAmount = parseFloat(amountApproved);

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          userId: updatedClaim.userId,
          policyId: updatedClaim.policyId,
          claimId: updatedClaim.id,
          amount: payoutAmount,
          type: "payout",
          status: "completed",
          description: `Payout for claim ${updatedClaim.id.slice(0, 8)}`,
          transactionRef: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        },
      });

      // Update claim to paid
      await prisma.claim.update({
        where: { id: claimId },
        data: { status: "paid" },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: updatedClaim.userId,
          type: "payment_confirmation",
          title: "Claim Approved & Paid",
          message: `Your claim ${updatedClaim.id.slice(0, 8)} has been approved. ₹${payoutAmount.toFixed(2)} has been transferred to your account. Transaction: ${payment.transactionRef}`,
        },
      });
    }

    // On rejection → notify
    if (status === "rejected") {
      await prisma.notification.create({
        data: {
          userId: updatedClaim.userId,
          type: "claim_update",
          title: "Claim Rejected",
          message: `Your claim ${updatedClaim.id.slice(0, 8)} has been reviewed and rejected. Please contact support if you believe this is an error.`,
        },
      });
    }

    return NextResponse.json(updatedClaim);
  } catch (error) {
    console.error("Admin Claims PATCH API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
