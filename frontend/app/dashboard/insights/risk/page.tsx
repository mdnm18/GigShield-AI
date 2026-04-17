"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function RiskInsightsPage() {
  const [policies, setPolicies] = useState<Array<{ riskScore: number; weeklyPremium: number; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/policies")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPolicies(data); })
      .finally(() => setLoading(false));
  }, []);

  const avgRisk = policies.length > 0
    ? policies.reduce((a, p) => a + p.riskScore, 0) / policies.length
    : 0;

  const chartData = [
    { label: "Base", score: 0.15 },
    { label: "Profile", score: avgRisk * 0.6 },
    { label: "Weather", score: avgRisk * 0.9 },
    { label: "Current", score: avgRisk },
    { label: "Projected", score: avgRisk * 1.1 },
  ];

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-accent" /> Risk Analysis
        </h1>
        <p className="text-foreground/50 text-sm mt-1">AI-driven risk profile breakdown.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-6 rounded-2xl border border-accent/20 bg-accent/5 text-center">
          <p className="text-4xl font-bold">{(avgRisk * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-2">Overall Risk Score</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-primary/20 bg-primary/5 text-center">
          <p className="text-4xl font-bold">{policies.length}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-2">Scored Policies</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-[var(--panel-border)]">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" /> Risk Score Progression
        </h3>
        <div className="h-64">
          {loading ? (
            <div className="skeleton h-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--foreground)", opacity: 0.3, fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--panel-bg)", borderRadius: "12px", border: "1px solid var(--panel-border)", fontSize: 12 }} />
                <Area type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} fill="url(#riskGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
