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
        policy: { select: { riskScore: true } }
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
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json(updatedClaim);
  } catch (error) {
    console.error("Admin Claims PATCH API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
