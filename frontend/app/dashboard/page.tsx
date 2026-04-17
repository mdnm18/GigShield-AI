"use client";

import {
  ShieldCheck,
  CloudLightning,
  Activity,
  DollarSign,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  FileText,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/actions/auth";
import Link from "next/link";

interface DashboardData {
  user: { name: string; role: string } | null;
  policies: Array<{ id: string; weeklyPremium: number; status: string; riskScore: number; coverageLimit: number }>;
  claims: Array<{ id: string; status: string; amountRequested: number; createdAt: string }>;
  notifications: Array<{ id: string; title: string; message: string; read: boolean; createdAt: string; type: string }>;
  events: Array<{ id: string; type: string; severity: string; city: string; triggered: boolean; description: string; createdAt: string }>;
}

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData>({
    user: null, policies: [], claims: [], notifications: [], events: [],
  });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userRes, policiesRes, claimsRes, notifsRes, eventsRes] = await Promise.all([
          getCurrentUser(),
          fetch("/api/policies").then((r) => r.json()).catch(() => []),
          fetch("/api/claims").then((r) => r.json()).catch(() => []),
          fetch("/api/notifications").then((r) => r.json()).catch(() => []),
          fetch("/api/events?triggered=true").then((r) => r.json()).catch(() => []),
        ]);
        setData({
          user: userRes ? { name: userRes.name, role: userRes.role } : null,
          policies: Array.isArray(policiesRes) ? policiesRes : [],
          claims: Array.isArray(claimsRes) ? claimsRes : [],
          notifications: Array.isArray(notifsRes) ? notifsRes : [],
          events: Array.isArray(eventsRes) ? eventsRes : [],
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const triggerScan = async () => {
    setScanning(true);
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: "Metropolitian" }),
      });
      // Refresh data
      const [claimsRes, eventsRes, notifsRes] = await Promise.all([
        fetch("/api/claims").then((r) => r.json()).catch(() => []),
        fetch("/api/events?triggered=true").then((r) => r.json()).catch(() => []),
        fetch("/api/notifications").then((r) => r.json()).catch(() => []),
      ]);
      setData((prev) => ({
        ...prev,
        claims: Array.isArray(claimsRes) ? claimsRes : prev.claims,
        events: Array.isArray(eventsRes) ? eventsRes : prev.events,
        notifications: Array.isArray(notifsRes) ? notifsRes : prev.notifications,
      }));
    } catch (e) { console.error(e); }
    setScanning(false);
  };

  const activePolicy = data.policies.find((p) => p.status === "active");
  const pendingClaims = data.claims.filter((c) => c.status === "submitted" || c.status === "under_review").length;
  const approvedClaims = data.claims.filter((c) => c.status === "approved" || c.status === "paid").length;
  const unreadNotifs = data.notifications.filter((n) => !n.read).length;
  const recentEvents = data.events.slice(0, 5);

  // Mock chart data derived from real claims
  const chartData = [
    { day: "Mon", risk: 2, claims: data.claims.length > 0 ? 1 : 0 },
    { day: "Tue", risk: 3, claims: 0 },
    { day: "Wed", risk: 1, claims: 0 },
    { day: "Thu", risk: activePolicy ? Math.round(activePolicy.riskScore * 10) : 4, claims: pendingClaims },
    { day: "Fri", risk: 2, claims: 0 },
    { day: "Sat", risk: data.events.length > 0 ? 5 : 3, claims: approvedClaims },
    { day: "Sun", risk: recentEvents.length > 0 ? 6 : 2, claims: 0 },
  ];

  if (loading) {
    return (
      <div className="space-y-6 stagger-children">
        <div className="h-12 skeleton w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 skeleton rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 skeleton rounded-2xl" />
          <div className="h-80 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-children">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
            {data.user?.name ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-pink">, {data.user.name}</span>
            ) : ""}
          </h1>
          <p className="text-foreground/50 text-sm mt-1">
            Real-time risk & policy overview.
          </p>
        </div>
        <button
          onClick={triggerScan}
          disabled={scanning}
          className={cn(
            "glass-panel px-4 py-2.5 rounded-xl text-primary font-semibold text-sm transition-all flex items-center gap-2 group border border-primary/20 cursor-pointer",
            scanning ? "opacity-60" : "hover:glow-primary hover:border-primary/40"
          )}
        >
          <Zap className={cn("w-4 h-4 text-warning", scanning && "animate-spin")} />
          {scanning ? "Scanning..." : "Scan Environment"}
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Policy */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/15 rounded-xl border border-primary/20">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <span className={cn("badge", activePolicy ? "badge-success" : "badge-neutral")}>
              {activePolicy ? "ACTIVE" : "NO POLICY"}
            </span>
          </div>
          <h3 className="text-foreground/50 text-xs font-medium uppercase tracking-wider">Weekly Premium</h3>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              ₹{activePolicy ? activePolicy.weeklyPremium.toFixed(2) : "0.00"}
            </span>
            <span className="text-xs text-foreground/40">/ week</span>
          </div>
          {activePolicy ? (
            <div className="mt-4 pt-3 border-t border-[var(--panel-border)] flex items-center gap-2">
              <Activity className="w-3 h-3 text-success" />
              <span className="text-xs text-success">
                Coverage: ₹{activePolicy.coverageLimit.toLocaleString()}
              </span>
            </div>
          ) : (
            <Link
              href="/dashboard/policies"
              className="mt-4 block text-center py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Get Insured
            </Link>
          )}
        </div>

        {/* Environmental Risk */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-accent/15 rounded-xl border border-accent/20">
              <CloudLightning className="w-5 h-5 text-accent" />
            </div>
            <span className={cn("badge", recentEvents.length > 0 ? "badge-warning" : "badge-success")}>
              {recentEvents.length > 0 ? "TRIGGERS ACTIVE" : "STABLE"}
            </span>
          </div>
          <h3 className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
            Environment Status
          </h3>
          <div className="mt-1.5">
            <span className="text-lg font-bold text-foreground block">
              {recentEvents.length > 0 ? recentEvents[0].description.slice(0, 35) : "No active disruptions"}
            </span>
            <p className="text-xs text-foreground/40 mt-1">
              {data.events.length} events recorded
            </p>
          </div>
        </div>

        {/* Claims Status */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-pink/15 rounded-xl border border-pink/20">
              <DollarSign className="w-5 h-5 text-pink" />
            </div>
            <span className={cn("badge", pendingClaims > 0 ? "badge-warning" : "badge-neutral")}>
              {pendingClaims > 0 ? `${pendingClaims} PENDING` : "NO CLAIMS"}
            </span>
          </div>
          <h3 className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
            Claims Overview
          </h3>
          <div className="mt-1.5 flex items-baseline gap-3">
            <div>
              <span className="text-2xl font-bold text-foreground">{data.claims.length}</span>
              <span className="text-xs text-foreground/40 ml-1">total</span>
            </div>
            {approvedClaims > 0 && (
              <div className="text-success text-xs font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {approvedClaims} approved
              </div>
            )}
          </div>
          <Link
            href="/dashboard/claims"
            className="mt-4 block text-center py-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            View Claims
          </Link>
        </div>
      </div>

      {/* Bottom Section: Chart & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Scoring Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-[var(--panel-border)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> AI Risk Scoring
              </h2>
              <p className="text-xs text-foreground/40 mt-1">
                Dynamic risk assessment for your coverage area.
              </p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--foreground)", opacity: 0.3, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--panel-bg)",
                    borderRadius: "12px",
                    border: "1px solid var(--panel-border)",
                    backdropFilter: "blur(10px)",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRisk)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Events */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h2 className="text-base font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" /> Recent Events
          </h2>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[280px]">
            {recentEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-foreground/30 text-xs">
                <CloudLightning className="w-8 h-8 mb-2 opacity-40" />
                <p>No triggered events yet.</p>
                <p className="mt-1">Click "Scan Environment" to check.</p>
              </div>
            ) : (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-xl border border-[var(--panel-border)] bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors"
                >
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className={cn("font-bold uppercase tracking-wider",
                      event.severity === "critical" ? "text-danger" :
                      event.severity === "high" ? "text-warning" : "text-accent"
                    )}>
                      {event.type} — {event.severity}
                    </span>
                    <span className="text-foreground/30">
                      {new Date(event.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-foreground/80 line-clamp-2">
                    {event.description}
                  </p>
                </div>
              ))
            )}
          </div>

          <Link
            href="/dashboard/events"
            className="mt-4 w-full p-2 flex items-center justify-center gap-2 text-xs font-semibold text-foreground/50 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors cursor-pointer"
          >
            View All Events <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Unread Notifications Banner */}
      {unreadNotifs > 0 && (
        <Link href="/dashboard/notifications" className="block glass-panel p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-foreground/80">
                You have {unreadNotifs} unread notification{unreadNotifs > 1 ? "s" : ""}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>
        </Link>
      )}
    </div>
  );
}
