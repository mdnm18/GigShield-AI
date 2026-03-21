"use client";

import { ShieldCheck, CloudLightning, Activity, DollarSign, ArrowRight, Zap, Target } from "lucide-react";
import { cn } from "@/utils/cn";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/actions/auth";

const performanceData = [
  { day: "Mon", trips: 12, risk: 2 },
  { day: "Tue", trips: 19, risk: 3 },
  { day: "Wed", trips: 15, risk: 1 },
  { day: "Thu", trips: 22, risk: 4 },
  { day: "Fri", trips: 28, risk: 2 },
  { day: "Sat", trips: 35, risk: 5 },
  { day: "Sun", trips: 42, risk: 6 },
];

export default function DashboardOverview() {
  const [user, setUser] = useState<{name: string, role: string} | null>(null);

  useEffect(() => {
    getCurrentUser().then((res) => {
      if (res) setUser({ name: res.name, role: res.role });
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-pink-500 bg-clip-text text-transparent">
            Welcome back{user?.name ? `, ${user.name}` : ''}.
          </h1>
          <p className="text-foreground/60 text-sm mt-1">Here's your real-time risk & policy overview.</p>
        </div>
        <button className="glass-panel px-4 py-2 rounded-xl text-primary font-semibold text-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2 group border-primary/30">
          <Zap fill="currentColor" className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
          Activate Shift Mode
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Policy */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/20 rounded-xl border border-primary/20">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-md font-bold border border-green-500/20">
              ACTIVE
            </span>
          </div>
          <h3 className="text-foreground/60 text-sm font-medium">Current Weekly Premium</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-foreground">$14.50</span>
            <span className="text-xs text-foreground/50">/ week</span>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--panel-border)] flex items-center justify-between">
             <span className="text-xs text-green-400 flex items-center gap-1">
               <Activity className="w-3 h-3" /> Safe driver discount applied
             </span>
          </div>
        </div>

        {/* Environmental Risk */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-accent/20 rounded-xl border border-accent/20">
               <CloudLightning className="w-6 h-6 text-accent" />
            </div>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-md font-bold border border-orange-500/20 animate-pulse">
              MODERATE RISK
            </span>
          </div>
          <h3 className="text-foreground/60 text-sm font-medium">Live Area Weather & Traffic</h3>
          <div className="mt-2">
            <span className="text-lg font-bold text-foreground block">Heavy Rain & Congestion</span>
            <p className="text-xs text-foreground/50 mt-1">Premium rate +$0.50/hr surge active</p>
          </div>
        </div>

        {/* Claim Status */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-pink-500/20 rounded-xl border border-pink-500/20">
               <DollarSign className="w-6 h-6 text-pink-500" />
            </div>
            <span className="text-xs bg-foreground/5 text-foreground/60 px-2 py-1 rounded-md font-bold border border-[var(--panel-border)]">
              NO CLAIMS
            </span>
          </div>
          <h3 className="text-foreground/60 text-sm font-medium">Instant Payout Available</h3>
          <div className="mt-2 mb-4">
            <span className="text-2xl font-bold text-foreground">$5,000.00</span>
            <span className="text-xs text-foreground/50 block">Instant Medical Coverage</span>
          </div>
          <button className="w-full py-2 bg-[var(--panel-bg)] hover:bg-foreground/5 border border-[var(--panel-border)] rounded-lg text-xs font-semibold hover:shadow-md transition-all">
            File New Claim
          </button>
        </div>
      </div>

      {/* Bottom Section: Chart & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ML Risk Scoring Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-[var(--panel-border)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> AI Risk Scoring Model
              </h2>
              <p className="text-xs text-foreground/50 mt-1">Dynamic premium calculations based on trip risk.</p>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'var(--foreground)', opacity: 0.5, fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--panel-border)', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Area type="monotone" dataKey="risk" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Recent Integration Events (Gateway) */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h2 className="text-lg font-bold mb-4">Event Integrations</h2>
          
          <div className="space-y-4 flex-1">
            <div className="p-3 rounded-xl border border-[var(--panel-border)] bg-foreground/[0.02]">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-primary">Location API</span>
                <span className="text-foreground/40">1m ago</span>
              </div>
              <p className="text-sm font-medium">GPS Coordinates Verified</p>
              <p className="text-xs text-green-500 mt-1">No spoofing detected (Fraud Engine)</p>
            </div>

            <div className="p-3 rounded-xl border border-[var(--panel-border)] bg-foreground/[0.02]">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-accent">Weather API</span>
                <span className="text-foreground/40">10m ago</span>
              </div>
              <p className="text-sm font-medium">Rain Event Logged</p>
              <p className="text-xs text-orange-400 mt-1">Risk factor escalated</p>
            </div>

            <div className="p-3 rounded-xl border border-[var(--panel-border)] bg-foreground/[0.02]">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-pink-500">Gig Platform API</span>
                <span className="text-foreground/40">1h ago</span>
              </div>
              <p className="text-sm font-medium">Weekly Miles Synced</p>
              <p className="text-xs text-foreground/50 mt-1">+45 miles recorded</p>
            </div>
          </div>
          
          <button className="mt-4 w-full p-2 flex items-center justify-center gap-2 text-xs font-semibold text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors">
            View API Gateway Logs <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
