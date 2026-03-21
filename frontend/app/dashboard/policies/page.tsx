"use client";

import { useEffect, useState } from "react";
import { Shield, CheckCircle, Clock } from "lucide-react";

type Policy = {
  id: string;
  weeklyPremium: number;
  status: string;
  riskScore: number;
  startDate: string;
  endDate: string | null;
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/policies")
      .then((res) => res.json())
      .then((data) => {
        setPolicies(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Policies</h1>
        <p className="text-foreground/60 text-sm mt-1">View and manage your active policy coverages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="glass-panel p-6 rounded-2xl animate-pulse h-48 blur-[2px]"></div>
        ) : policies.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center col-span-full">
            <Shield className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground/80">No Active Policies</h3>
            <p className="text-sm text-foreground/50 mt-2">You don't have any insurance policies yet.</p>
          </div>
        ) : (
          policies.map((policy) => (
            <div key={policy.id} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/20 rounded-xl border border-primary/20">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-md font-bold border ${policy.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-orange-500/20 text-orange-400 border-orange-500/20'}`}>
                  {policy.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-foreground/60 text-sm font-medium">Policy ID: {policy.id.substring(0, 8)}...</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black text-foreground">${policy.weeklyPremium.toFixed(2)}</span>
                <span className="text-xs text-foreground/50">/ week</span>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--panel-border)] flex flex-col gap-2">
                 <span className="text-xs text-foreground/60 flex items-center gap-2">
                   <Clock className="w-3 h-3" /> Start Date: {new Date(policy.startDate).toLocaleDateString()}
                 </span>
                 <span className="text-xs text-green-400 flex items-center gap-2">
                   <CheckCircle className="w-3 h-3" /> AI Risk Score: {policy.riskScore}
                 </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
