import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

export async function GET() {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workers = await prisma.user.findMany({
      where: { role: "worker" },
      include: {
        policies: {
          select: { id: true, status: true, riskScore: true, weeklyPremium: true }
        },
        _count: {
          select: { claims: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(workers);
  } catch (error) {
    console.error("Admin Users API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
