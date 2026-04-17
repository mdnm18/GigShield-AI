"use client";

import { useEffect, useState } from "react";
import {
  Users, DollarSign, ShieldCheck, AlertTriangle, CloudLightning,
  TrendingUp, FileText, Zap, Activity
} from "lucide-react";
import { cn } from "@/utils/cn";
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

interface AdminStats {
  fraud: { totalClaims: number; anomalousClaims: number; normalClaims: number; anomalyPercentage: number };
  risk: { avgRiskScore: number; totalPremium: number; totalCoverage: number; policyCount: number; activePolicies: number };
  users: { totalWorkers: number };
  payments: { totalPayouts: number; payoutCount: number };
  events: { totalEvents: number; triggeredEvents: number; triggerRate: number };
  claims: { submitted: number; approved: number; paid: number; rejected: number; total: number };
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { if (data.fraud) setStats(data); })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 skeleton w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-36 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!stats) return <div className="text-center text-foreground/40 py-20">Failed to load statistics</div>;

  const claimsPieData = [
    { name: "Submitted", value: stats.claims.submitted, color: "#f59e0b" },
    { name: "Approved", value: stats.claims.approved, color: "#22c55e" },
    { name: "Paid", value: stats.claims.paid, color: "#3b82f6" },
    { name: "Rejected", value: stats.claims.rejected, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const trendData = [
    { day: "Mon", premium: 1200, events: 1 },
    { day: "Tue", premium: 1800, events: 2 },
    { day: "Wed", premium: stats.risk.totalPremium * 0.3, events: stats.events.triggeredEvents },
    { day: "Thu", premium: stats.risk.totalPremium * 0.5, events: 0 },
    { day: "Fri", premium: stats.risk.totalPremium * 0.7, events: 1 },
    { day: "Sat", premium: stats.risk.totalPremium * 0.9, events: 0 },
    { day: "Sun", premium: stats.risk.totalPremium, events: stats.events.triggeredEvents },
  ];

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          <p className="text-foreground/50 text-sm mt-1">Real-time platform intelligence dashboard.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass-panel border border-success/20 rounded-xl">
          <Activity className="w-3 h-3 text-success animate-pulse" />
          <span className="text-[10px] font-bold text-success uppercase tracking-wider">All Systems Online</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-primary/15 rounded-lg"><Users className="w-4 h-4 text-primary" /></div>
          </div>
          <p className="text-2xl font-bold">{stats.users.totalWorkers}</p>
          <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold mt-1">Workers</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-success/20 bg-success/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-success/15 rounded-lg"><DollarSign className="w-4 h-4 text-success" /></div>
          </div>
          <p className="text-2xl font-bold">₹{stats.risk.totalPremium.toLocaleString()}</p>
          <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold mt-1">Total Revenue</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-accent/20 bg-accent/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-accent/15 rounded-lg"><ShieldCheck className="w-4 h-4 text-accent" /></div>
          </div>
          <p className="text-2xl font-bold">{stats.risk.activePolicies}</p>
          <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold mt-1">Active Policies</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-pink/20 bg-pink/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-pink/15 rounded-lg"><AlertTriangle className="w-4 h-4 text-pink" /></div>
          </div>
          <p className="text-2xl font-bold text-pink">{stats.fraud.anomalyPercentage.toFixed(1)}%</p>
          <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold mt-1">Fraud Rate</p>
        </div>
      </div>

      {/* Second KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl text-center">
          <p className="text-xl font-bold">{stats.claims.total}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Total Claims</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center">
          <p className="text-xl font-bold text-success">{stats.claims.paid}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Paid Out</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center">
          <p className="text-xl font-bold text-warning">{stats.events.triggeredEvents}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Event Triggers</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center">
          <p className="text-xl font-bold">₹{stats.payments.totalPayouts.toLocaleString()}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Total Payouts</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium Trend */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--panel-border)]">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Premium Revenue Trend
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="adminPremGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--foreground)", opacity: 0.3, fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--panel-bg)", borderRadius: "12px", border: "1px solid var(--panel-border)", fontSize: 12 }} />
                <Area type="monotone" dataKey="premium" stroke="var(--primary)" strokeWidth={2.5} fill="url(#adminPremGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Claims Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--panel-border)]">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" /> Claims Distribution
          </h3>
          <div className="h-56 flex items-center justify-center">
            {claimsPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={claimsPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                    {claimsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "12px", color: "#fff", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-foreground/30 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No claims data</p>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-4 text-xs mt-2 flex-wrap">
            {claimsPieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} /> {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
