"use client";

import { Activity, ShieldCheck, TriangleAlert, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from "recharts";

const lossRatioData = [
  { month: "Jan", ratio: 65, target: 70 },
  { month: "Feb", ratio: 68, target: 70 },
  { month: "Mar", ratio: 74, target: 70 },
  { month: "Apr", ratio: 71, target: 70 },
  { month: "May", ratio: 69, target: 70 },
  { month: "Jun", ratio: 75, target: 70 },
];

const claimsData = [
  { area: "Downtown", claims: 400, fraud: 24 },
  { area: "Northside", claims: 300, fraud: 15 },
  { area: "West End", claims: 200, fraud: 8 },
  { area: "East Side", claims: 278, fraud: 39 },
];

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Performance & Underwriting</h1>
        <p className="text-foreground/60 text-sm mt-1">Live metrics from User DB, Policy DB, and Claims DB.</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-[var(--panel-border)] flex items-center justify-between">
          <div>
             <span className="text-xs font-semibold text-foreground/50 uppercase">Total Worker Coverage</span>
             <h3 className="text-2xl font-black mt-1">84,592</h3>
             <span className="text-xs text-green-500 font-medium">+12% WoW</span>
          </div>
          <ShieldCheck className="w-8 h-8 text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
        </div>

        <div className="glass-panel p-5 rounded-xl border border-[var(--panel-border)] flex items-center justify-between">
          <div>
             <span className="text-xs font-semibold text-foreground/50 uppercase">Loss Ratio</span>
             <h3 className="text-2xl font-black mt-1">71.4%</h3>
             <span className="text-xs text-orange-400 font-medium">1.4% above target</span>
          </div>
          <Activity className="w-8 h-8 text-orange-400" />
        </div>

        <div className="glass-panel p-5 rounded-xl border border-[var(--panel-border)] flex items-center justify-between">
          <div>
             <span className="text-xs font-semibold text-foreground/50 uppercase">Total Prem. Volume</span>
             <h3 className="text-2xl font-black mt-1">$1.2M</h3>
             <span className="text-xs text-green-500 font-medium">+5% MoM</span>
          </div>
          <DollarSign className="w-8 h-8 text-green-500 focus-within:shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
        </div>

        <div className="glass-panel p-5 rounded-xl border border-[var(--panel-border)] flex items-center justify-between">
          <div>
             <span className="text-xs font-semibold text-foreground/50 uppercase">Detected Fraud</span>
             <h3 className="text-2xl font-black mt-1">4.2%</h3>
             <span className="text-xs text-pink-500 font-medium">GPS Spoofing + Fake Claims</span>
          </div>
          <TriangleAlert className="w-8 h-8 text-pink-500 animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.3)]" />
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loss Ratio Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--panel-border)]">
          <h2 className="text-lg font-bold mb-4">Historical Loss Ratio (MoM)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lossRatioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--foreground)', opacity: 0.5}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--panel-border)', backdropFilter: 'blur(10px)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="ratio" name="Actual %" stroke="var(--primary)" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="target" name="Target %" stroke="var(--pink-500)" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Claims vs Fraud by Zone */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--panel-border)]">
          <h2 className="text-lg font-bold mb-4">Claims Analytics & Fraud</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={claimsData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false} />
                <XAxis dataKey="area" axisLine={false} tickLine={false} tick={{fill: 'var(--foreground)', opacity: 0.5}} />
                <Tooltip 
                  cursor={{ fill: 'var(--panel-bg)', opacity: 0.5 }}
                  contentStyle={{ backgroundColor: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--panel-border)', backdropFilter: 'blur(10px)' }}
                />
                <Legend />
                <Bar dataKey="claims" stackId="a" fill="var(--accent)" name="Valid Claims" radius={[0, 0, 4, 4]} />
                <Bar dataKey="fraud" stackId="a" fill="var(--pink-500)" name="Fraud Detected" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
