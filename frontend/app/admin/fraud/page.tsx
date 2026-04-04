"use client";

import { useEffect, useState } from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { AlertTriangle, CheckCircle, Shield, ArrowRight, Zap } from "lucide-react";

interface FraudStats {
  totalClaims: number;
  anomalousClaims: number;
  normalClaims: number;
  anomalyPercentage: number;
}

export default function AdminFraudPage() {
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [highRiskClaims, setHighRiskClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch("/api/admin/stats");
        const statsData = await statsRes.json();
        setStats(statsData.fraud);

        const claimsRes = await fetch("/api/admin/claims");
        const claimsData = await claimsRes.json();
        const risky = claimsData.filter((c: any) => c.fraudScore > 0.5);
        setHighRiskClaims(risky);
      } catch (err) {
        console.error("Error fetching fraud data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !stats) {
    return <div className="flex items-center justify-center h-64 text-pink-500 font-bold animate-pulse">Analyzing System Integrity...</div>;
  }

  const chartData = [
    { name: "Anomalous", value: stats.anomalousClaims },
    { name: "Verified", value: stats.normalClaims },
  ];

  const COLORS = ["#ec4899", "#10b981"];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Fraud Intelligence</h1>
          <p className="text-foreground/60 text-sm mt-1">Real-time anomaly detection powered by Isolation Forest ML.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-xl">
           <Zap className="w-4 h-4 text-pink-500 fill-pink-500" />
           <span className="text-xs font-bold text-pink-500 tracking-tighter uppercase">AI Monitoring Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fraud Distribution Chart */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl border border-pink-500/20 bg-pink-500/5">
          <h3 className="text-sm font-bold text-foreground/80 mb-6 flex items-center gap-2">
            <Shield className="w-4 h-4 text-pink-500" /> System Integrity
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-black text-pink-500">{stats.anomalyPercentage.toFixed(1)}%</p>
            <p className="text-[10px] text-foreground/50 uppercase font-bold tracking-widest">Global Anomaly Rate</p>
          </div>
        </div>

        {/* High Risk Flags */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-[var(--panel-border)]">
          <h3 className="text-sm font-bold text-foreground/80 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-pink-500" /> Critical Review Queue
          </h3>
          
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {highRiskClaims.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-foreground/40 italic">
                <CheckCircle className="w-8 h-8 text-emerald-500/50 mb-2" />
                No critical anomalies detected in recent claims.
              </div>
            ) : (
              highRiskClaims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-4 rounded-2xl bg-foreground/5 border border-pink-500/10 hover:border-pink-500/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                       <AlertTriangle className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                       <p className="font-bold text-sm text-foreground">{claim.user.name}</p>
                       <p className="text-[10px] text-foreground/50 tracking-tighter uppercase font-medium">{claim.policy.type} - {claim.id.slice(0,8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-xs font-black text-pink-500">SCORE: {claim.fraudScore.toFixed(2)}</p>
                     <p className="text-[10px] text-foreground/40 italic">Manual Review Recommended</p>
                  </div>
                  <button className="ml-4 p-2 rounded-full hover:bg-pink-500/20 text-foreground/40 hover:text-pink-500 transition-all opacity-0 group-hover:opacity-100">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Feature Analysis Mockup */}
      <div className="glass-panel p-8 rounded-3xl border border-[var(--panel-border)]">
         <h3 className="text-sm font-bold text-foreground/80 mb-6 uppercase tracking-widest">Anomaly Signature Detection</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-foreground/5 border border-[var(--panel-border)]">
               <span className="text-[10px] font-bold text-foreground/50 uppercase flex items-center gap-1"><Zap className="w-3 h-3" /> Time Analysis</span>
               <p className="text-xl font-bold mt-1">Improbable Speed</p>
               <div className="w-full bg-foreground/10 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-pink-500 h-full w-[85%]"></div>
               </div>
            </div>
            <div className="p-4 rounded-2xl bg-foreground/5 border border-[var(--panel-border)]">
               <span className="text-[10px] font-bold text-foreground/50 uppercase flex items-center gap-1"><Zap className="w-3 h-3" /> Spatial Jump</span>
               <p className="text-xl font-bold mt-1">Geo-Inconsistency</p>
               <div className="w-full bg-foreground/10 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-pink-500 h-full w-[62%]"></div>
               </div>
            </div>
            <div className="p-4 rounded-2xl bg-foreground/5 border border-[var(--panel-border)]">
               <span className="text-[10px] font-bold text-foreground/50 uppercase flex items-center gap-1"><Zap className="w-3 h-3" /> Pattern Shift</span>
               <p className="text-xl font-bold mt-1">Device Switch</p>
               <div className="w-full bg-foreground/10 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-pink-500 h-full w-[41%]"></div>
               </div>
            </div>
            <div className="p-4 rounded-2xl bg-foreground/5 border border-[var(--panel-border)]">
               <span className="text-[10px] font-bold text-foreground/50 uppercase flex items-center gap-1"><Zap className="w-3 h-3" /> Identity Score</span>
               <p className="text-xl font-bold mt-1">Verification Meta</p>
               <div className="w-full bg-foreground/10 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[95%]"></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
