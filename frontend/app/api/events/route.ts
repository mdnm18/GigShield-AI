import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || "http://localhost:5001";

// ─── Simulated real-time data sources ───────────────────────

function generateWeatherData(city: string) {
  const conditions = ["Sunny", "Cloudy", "Fog", "Stormy", "Sandstorms", "Windy"];
  const weights = [0.3, 0.25, 0.15, 0.15, 0.05, 0.1];
  const rand = Math.random();
  let cumulative = 0;
  let condition = "Sunny";
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) {
      condition = conditions[i];
      break;
    }
  }
  const rainfall = condition === "Stormy" ? 40 + Math.random() * 80 : condition === "Cloudy" ? Math.random() * 15 : 0;
  const temperature = 20 + Math.random() * 20;
  return { condition, rainfall: Math.round(rainfall * 10) / 10, temperature: Math.round(temperature * 10) / 10, city };
}

function generateAQIData(city: string) {
  const baseAQI: Record<string, number> = {
    "Mumbai": 120, "Delhi": 280, "Bangalore": 80, "Chennai": 100,
    "Hyderabad": 110, "Kolkata": 150, "Pune": 90, "Metropolitian": 130,
  };
  const base = baseAQI[city] || 100;
  const aqi = Math.round(base + (Math.random() - 0.5) * 100);
  return { aqi: Math.max(20, aqi), city };
}

function generateTrafficData(city: string) {
  const densities = ["Low", "Medium", "High", "Jam"];
  const weights = [0.3, 0.35, 0.2, 0.15];
  const rand = Math.random();
  let cumulative = 0;
  let density = "Low";
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) {
      density = densities[i];
      break;
    }
  }
  return { density, city };
}

// ─── GET: Fetch events ──────────────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const type = searchParams.get("type");
    const triggered = searchParams.get("triggered");

    const where: Record<string, unknown> = {};
    if (city) where.city = city;
    if (type) where.type = type;
    if (triggered !== null && triggered !== undefined) where.triggered = triggered === "true";

    const events = await prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        _count: { select: { claims: true } },
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Events GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ─── POST: Scan for events and create triggered ones ────────

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const city = body.city || "Metropolitian";

    // 1. Generate simulated sensor data
    const weather = generateWeatherData(city);
    const aqi = generateAQIData(city);
    const traffic = generateTrafficData(city);

    // 2. Call AI service for trigger evaluation
    let triggerResult = { triggered: false, triggers: [] as Array<{type: string; reason: string; severity: string}> };
    try {
      const res = await fetch(`${ML_BACKEND_URL}/ai/evaluate-trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Weatherconditions: weather.condition,
          City: city,
          aqi_value: aqi.aqi,
          rainfall_mm: weather.rainfall,
          traffic_density: traffic.density,
        }),
      });
      if (res.ok) {
        triggerResult = await res.json();
      }
    } catch (mlError) {
      // Fallback: local trigger evaluation
      if (weather.condition === "Stormy" || weather.condition === "Sandstorms") {
        triggerResult.triggered = true;
        triggerResult.triggers.push({ type: "weather", reason: `Extreme ${weather.condition}`, severity: "critical" });
      }
      if (aqi.aqi > 200) {
        triggerResult.triggered = true;
        triggerResult.triggers.push({ type: "aqi", reason: `AQI ${aqi.aqi} exceeds safe limit`, severity: "high" });
      }
      if (traffic.density === "Jam") {
        triggerResult.triggered = true;
        triggerResult.triggers.push({ type: "traffic", reason: `Traffic Jam detected`, severity: "moderate" });
      }
    }

    // 3. Create event records for each trigger
    const createdEvents = [];
    for (const trigger of triggerResult.triggers) {
      const eventType = trigger.type as "weather" | "aqi" | "traffic";
      const event = await prisma.event.create({
        data: {
          type: eventType,
          severity: trigger.severity as "low" | "moderate" | "high" | "critical",
          city,
          source: `${eventType}_api`,
          description: trigger.reason,
          rawData: JSON.stringify({ weather, aqi, traffic }),
          triggered: true,
          thresholdValue: eventType === "weather" ? weather.rainfall :
                          eventType === "aqi" ? aqi.aqi : undefined,
          thresholdLimit: eventType === "weather" ? 50 :
                          eventType === "aqi" ? 200 : undefined,
        },
      });
      createdEvents.push(event);

      // 4. Auto-generate claims for affected users with active policies
      if (triggerResult.triggered) {
        const affectedPolicies = await prisma.policy.findMany({
          where: { status: "active" },
          include: { user: true },
        });

        for (const policy of affectedPolicies) {
          // Check if a claim already exists for this event + user combo
          const existingClaim = await prisma.claim.findFirst({
            where: { eventId: event.id, userId: policy.userId },
          });
          if (existingClaim) continue;

          // Estimate loss via AI
          let lossData = { payout_amount: policy.coverageLimit * 0.3, loss_hours: 4 };
          try {
            const lossRes = await fetch(`${ML_BACKEND_URL}/ai/loss-prediction`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                disruption_type: eventType,
                severity: trigger.severity,
                duration_hours: trigger.severity === "critical" ? 8 : trigger.severity === "high" ? 6 : 4,
                avg_hourly_earnings: policy.weeklyPremium * 10,
                coverage_limit: policy.coverageLimit,
              }),
            });
            if (lossRes.ok) lossData = await lossRes.json();
          } catch {}

          // Create auto-claim
          const claim = await prisma.claim.create({
            data: {
              userId: policy.userId,
              policyId: policy.id,
              eventId: event.id,
              incidentDate: new Date(),
              description: `Auto-generated claim: ${trigger.reason} in ${city}`,
              amountRequested: lossData.payout_amount,
              lossHours: lossData.loss_hours,
              status: "submitted",
            },
          });

          // Create notification for the user
          await prisma.notification.create({
            data: {
              userId: policy.userId,
              type: "event_alert",
              title: `⚠ ${trigger.severity.toUpperCase()} Alert: ${trigger.reason}`,
              message: `A parametric trigger was detected in ${city}. An auto-claim for ₹${lossData.payout_amount.toFixed(2)} has been filed on your behalf. Claim ID: ${claim.id.slice(0, 8)}...`,
            },
          });
        }
      }
    }

    // Also create a non-triggered event for monitoring (if no triggers)
    if (!triggerResult.triggered) {
      const monitorEvent = await prisma.event.create({
        data: {
          type: "weather",
          severity: "low",
          city,
          source: "system_scan",
          description: `Routine scan: ${weather.condition}, AQI ${aqi.aqi}, Traffic ${traffic.density}`,
          rawData: JSON.stringify({ weather, aqi, traffic }),
          triggered: false,
        },
      });
      createdEvents.push(monitorEvent);
    }

    return NextResponse.json({
      triggered: triggerResult.triggered,
      events: createdEvents,
      sensorData: { weather, aqi, traffic },
    });
  } catch (error) {
    console.error("Events POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
