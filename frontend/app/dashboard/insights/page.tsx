"use client";

import { useEffect, useState } from "react";
import { Brain, TrendingUp, ShieldAlert, BarChart3, Activity, Zap } from "lucide-react";
import { cn } from "@/utils/cn";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface InsightsData {
  riskScore: number;
  fraudRate: number;
  avgPremium: number;
  totalClaims: number;
  approvedClaims: number;
  paidClaims: number;
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const [policiesRes, claimsRes] = await Promise.all([
          fetch("/api/policies").then((r) => r.json()).catch(() => []),
          fetch("/api/claims").then((r) => r.json()).catch(() => []),
        ]);
        const policies = Array.isArray(policiesRes) ? policiesRes : [];
        const claims = Array.isArray(claimsRes) ? claimsRes : [];

        const avgRisk = policies.length > 0
          ? policies.reduce((a: number, p: { riskScore: number }) => a + p.riskScore, 0) / policies.length
          : 0;
        const avgPrem = policies.length > 0
          ? policies.reduce((a: number, p: { weeklyPremium: number }) => a + p.weeklyPremium, 0) / policies.length
          : 0;
        const fraudClaims = claims.filter((c: { fraudScore: number }) => c.fraudScore > 0.5).length;

        setData({
          riskScore: avgRisk,
          fraudRate: claims.length > 0 ? (fraudClaims / claims.length) * 100 : 0,
          avgPremium: avgPrem,
          totalClaims: claims.length,
          approvedClaims: claims.filter((c: { status: string }) => c.status === "approved" || c.status === "paid").length,
          paidClaims: claims.filter((c: { status: string }) => c.status === "paid").length,
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 skeleton w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const riskTrendData = [
    { day: "Mon", score: 0.22 }, { day: "Tue", score: 0.28 },
    { day: "Wed", score: 0.35 }, { day: "Thu", score: data?.riskScore || 0.45 },
    { day: "Fri", score: 0.31 }, { day: "Sat", score: 0.48 }, { day: "Sun", score: 0.29 },
  ];

  const claimsPieData = [
    { name: "Approved", value: data?.approvedClaims || 0 },
    { name: "Pending", value: (data?.totalClaims || 0) - (data?.approvedClaims || 0) },
  ];
  const COLORS = ["#22c55e", "#f59e0b"];

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Brain className="w-7 h-7 text-accent" /> AI Insights
        </h1>
        <p className="text-foreground/50 text-sm mt-1">
          Machine learning analysis of your risk profile, claims, and coverage performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-accent/20 bg-accent/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-accent/15 rounded-xl"><TrendingUp className="w-5 h-5 text-accent" /></div>
            <span className="text-[10px] uppercase font-bold text-accent tracking-wider">Risk Profile</span>
          </div>
          <p className="text-3xl font-bold">{((data?.riskScore || 0) * 100).toFixed(1)}%</p>
          <p className="text-xs text-foreground/40 mt-1">Average disruption probability</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-primary/15 rounded-xl"><BarChart3 className="w-5 h-5 text-primary" /></div>
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Avg Premium</span>
          </div>
          <p className="text-3xl font-bold">₹{(data?.avgPremium || 0).toFixed(2)}</p>
          <p className="text-xs text-foreground/40 mt-1">AI-optimized weekly rate</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-pink/20 bg-pink/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-pink/15 rounded-xl"><ShieldAlert className="w-5 h-5 text-pink" /></div>
            <span className="text-[10px] uppercase font-bold text-pink tracking-wider">Fraud Exposure</span>
          </div>
          <p className="text-3xl font-bold">{(data?.fraudRate || 0).toFixed(1)}%</p>
          <p className="text-xs text-foreground/40 mt-1">Anomaly detection rate</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-[var(--panel-border)]">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" /> Risk Score Trend
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--foreground)", opacity: 0.3, fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--panel-bg)", borderRadius: "12px", border: "1px solid var(--panel-border)", fontSize: 12 }} />
                <Area type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} fill="url(#riskGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-[var(--panel-border)]">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-success" /> Claims Resolution
          </h3>
          <div className="h-56 flex items-center justify-center">
            {data && data.totalClaims > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={claimsPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                    {claimsPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "12px", color: "#fff", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-foreground/30 text-xs">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No claims data yet</p>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-6 text-xs mt-2">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Approved ({data?.approvedClaims || 0})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> Pending ({(data?.totalClaims || 0) - (data?.approvedClaims || 0)})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
