"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from "recharts";
import { Activity, MapPin, TrendingUp, DollarSign, CloudLightning } from "lucide-react";

interface RiskStats {
  avgRiskScore: number;
  totalPremium: number;
  policyCount: number;
}

interface GeographicRisk {
  city: string;
  avgRisk: number;
}

export default function AdminAnalyticsPage() {
  const [riskStats, setRiskStats] = useState<RiskStats | null>(null);
  const [geoRisk, setGeoRisk] = useState<GeographicRisk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch("/api/admin/stats");
        const statsData = await statsRes.json();
        setRiskStats(statsData.risk);
        setGeoRisk(statsData.geographicRisk);
      } catch (err) {
        console.error("Error fetching analytics data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !riskStats) {
    return <div className="flex items-center justify-center h-64 text-primary font-bold animate-pulse">Aggregating Risk Intelligence...</div>;
  }

  // Mocking trend data for visual richness
  const trendData = [
    { name: "Mon", premium: 4200, risk: 0.22 },
    { name: "Tue", premium: 4800, risk: 0.28 },
    { name: "Wed", premium: 5100, risk: 0.35 },
    { name: "Thu", premium: 6400, risk: 0.45 }, // Stormy Day Mock
    { name: "Fri", premium: 5800, risk: 0.31 },
    { name: "Sat", premium: 7200, risk: 0.48 },
    { name: "Sun", premium: 6100, risk: 0.29 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">System Analytics</h1>
          <p className="text-foreground/60 text-sm mt-1">Holistic risk monitoring and premium surge trends.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass-panel border-accent/20 rounded-xl text-accent font-bold text-xs uppercase tracking-tighter">
           <Activity className="w-3 h-3 animate-pulse" /> Live Analysis
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-primary/20 bg-primary/5">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <DollarSign className="w-5 h-5" />
             </div>
             <span className="text-[10px] uppercase font-black text-primary tracking-widest">+12.4%</span>
          </div>
          <p className="text-2xl font-black text-foreground">${riskStats.totalPremium.toLocaleString()}</p>
          <p className="text-[10px] text-foreground/50 uppercase font-medium tracking-tighter">Current Portfolio Revenue</p>
        </div>
        
        <div className="glass-panel p-6 rounded-3xl border border-accent/20 bg-accent/5">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 rounded-xl bg-accent/10 text-accent">
                <TrendingUp className="w-5 h-5" />
             </div>
             <span className="text-[10px] uppercase font-black text-accent tracking-widest">Optimized</span>
          </div>
          <p className="text-2xl font-black text-foreground">{(riskStats.avgRiskScore * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-foreground/50 uppercase font-medium tracking-tighter">Avg Network Risk Probability</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-pink-500/20 bg-pink-500/5">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
                <CloudLightning className="w-5 h-5" />
             </div>
             <span className="text-[10px] uppercase font-black text-pink-500 tracking-widest">High Confidence</span>
          </div>
          <p className="text-2xl font-black text-foreground">{riskStats.policyCount}</p>
          <p className="text-[10px] text-foreground/50 uppercase font-medium tracking-tighter">Active Coverage Entities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Geographic Risk Profile */}
        <div className="glass-panel p-8 rounded-3xl border border-[var(--panel-border)]">
          <h3 className="text-sm font-bold text-foreground/80 mb-8 flex items-center gap-2 uppercase tracking-widest">
            <MapPin className="w-4 h-4 text-accent" /> Regional Risk Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geoRisk}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="city" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} />
                <Tooltip 
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                   contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="avgRisk" fill="var(--accent)" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Premium vs Risk Trends */}
        <div className="glass-panel p-8 rounded-3xl border border-[var(--panel-border)]">
          <h3 className="text-sm font-bold text-foreground/80 mb-8 flex items-center gap-2 uppercase tracking-widest">
            <Activity className="w-4 h-4 text-primary" /> Premium Surge Analytics
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="premium" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPremium)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Premium Revenue</span>
             <span className="flex items-center gap-1 italic">(Environment Correlated)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
