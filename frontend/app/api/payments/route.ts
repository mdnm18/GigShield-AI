import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      include: {
        claim: { select: { id: true, status: true, description: true } },
        policy: { select: { id: true, policyType: true } },
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Payments API Error:", error);
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
    const { claimId, amount, type = "payout", description } = body;

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        claimId,
        amount: parseFloat(amount),
        type,
        status: "completed",
        description: description || `Payment for claim ${claimId?.slice(0, 8) || "manual"}`,
        transactionRef: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Payments POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
