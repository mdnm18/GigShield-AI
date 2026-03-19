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
      },
      include: { policy: true },
    });

    return NextResponse.json(newClaim, { status: 201 });
  } catch (error) {
    console.error("Claims POST API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
