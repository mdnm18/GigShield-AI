"use client";

import { useEffect, useState } from "react";
import { Shield, CheckCircle, Clock, Plus, Zap, X } from "lucide-react";
import { cn } from "@/utils/cn";

type Policy = {
  id: string;
  policyType: string;
  weeklyPremium: number;
  coverageLimit: number;
  status: string;
  riskScore: number;
  startDate: string;
  endDate: string | null;
  _count?: { claims: number };
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState<{ weekly_premium: number; risk_score: number; risk_tier: string } | null>(null);

  const [createForm, setCreateForm] = useState({
    policyType: "parametric_weather",
    coverageLimit: "5000",
    city: "Metropolitian",
  });

  const fetchPolicies = () => {
    fetch("/api/policies")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setPolicies(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPolicies(); }, []);

  const getMLQuote = async () => {
    setQuoteLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Weatherconditions: "Stormy",
          City: createForm.city,
          avg_weekly_earnings: parseFloat(createForm.coverageLimit) / 4,
        }),
      });
      const data = await res.json();
      setQuoteResult({ ...data, risk_tier: data.risk_tier || "moderate" });
    } catch (e) { console.error(e); }
    setQuoteLoading(false);
  };

  const createPolicy = async () => {
    setCreating(true);
    try {
      await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      setShowCreate(false);
      setQuoteResult(null);
      fetchPolicies();
    } catch (e) { console.error(e); }
    setCreating(false);
  };

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Policies</h1>
          <p className="text-foreground/50 text-sm mt-1">View and manage your active policy coverages.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={getMLQuote}
            disabled={quoteLoading}
            className="glass-panel px-4 py-2 rounded-xl text-accent font-semibold text-sm hover:bg-accent/10 transition-all flex items-center gap-2 border border-accent/20 cursor-pointer"
          >
            <Zap className={cn("w-4 h-4", quoteLoading && "animate-spin")} />
            {quoteLoading ? "Calibrating..." : "AI Quote"}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="glass-panel px-4 py-2 rounded-xl text-primary font-semibold text-sm hover:bg-primary/10 transition-all flex items-center gap-2 border border-primary/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Policy
          </button>
        </div>
      </div>

      {/* AI Quote Result */}
      {quoteResult && (
        <div className="glass-panel p-6 rounded-2xl border border-accent/30 bg-accent/5 animate-fade-in-up">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-accent font-bold flex items-center gap-2">
                <Zap className="w-4 h-4" /> AI-Optimized Quote
              </h3>
              <p className="text-xs text-foreground/50 mt-1">Based on risk profile analysis (Stormy scenario)</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-foreground">₹{quoteResult.weekly_premium.toFixed(2)}</span>
              <p className="text-[10px] text-accent font-bold uppercase">
                Risk: {(quoteResult.risk_score * 100).toFixed(1)}% — {quoteResult.risk_tier}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Policy Modal */}
      {showCreate && (
        <div className="glass-panel p-6 rounded-2xl border border-primary/30 bg-primary/5 animate-fade-in-up">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg">Create New Policy</h3>
            <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-foreground/10 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Type</label>
              <select
                value={createForm.policyType}
                onChange={(e) => setCreateForm((f) => ({ ...f, policyType: e.target.value }))}
                className="w-full bg-foreground/[0.03] border border-[var(--panel-border)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground cursor-pointer"
              >
                <option value="parametric_weather" className="bg-[var(--background)]">Weather Protection</option>
                <option value="parametric_aqi" className="bg-[var(--background)]">AQI Protection</option>
                <option value="parametric_traffic" className="bg-[var(--background)]">Traffic Protection</option>
                <option value="parametric_all" className="bg-[var(--background)]">Full Coverage</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Coverage (₹)</label>
              <input
                type="number"
                value={createForm.coverageLimit}
                onChange={(e) => setCreateForm((f) => ({ ...f, coverageLimit: e.target.value }))}
                className="w-full bg-foreground/[0.03] border border-[var(--panel-border)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/50 uppercase tracking-wider">City</label>
              <select
                value={createForm.city}
                onChange={(e) => setCreateForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full bg-foreground/[0.03] border border-[var(--panel-border)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground cursor-pointer"
              >
                {["Metropolitian", "Mumbai", "Delhi", "Bangalore", "Chennai"].map((c) => (
                  <option key={c} value={c} className="bg-[var(--background)]">{c}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={createPolicy}
            disabled={creating}
            className={cn(
              "w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-primary/90 hover:bg-primary text-white cursor-pointer",
              creating && "opacity-60 cursor-not-allowed"
            )}
          >
            {creating ? "Creating..." : "Activate Policy"}
          </button>
        </div>
      )}

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <>
            <div className="skeleton h-48 rounded-2xl" />
            <div className="skeleton h-48 rounded-2xl" />
          </>
        ) : policies.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center col-span-full">
            <Shield className="w-10 h-10 text-foreground/15 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground/70">No Active Policies</h3>
            <p className="text-sm text-foreground/40 mt-1">Click "New Policy" to get started with AI-powered coverage.</p>
          </div>
        ) : (
          policies.map((policy) => (
            <div key={policy.id} className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-primary/20 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/15 rounded-xl border border-primary/20">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className={cn("badge", policy.status === "active" ? "badge-success" : "badge-warning")}>
                  {policy.status.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold mb-1">{policy.policyType.replace(/_/g, " ")}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">₹{policy.weeklyPremium.toFixed(2)}</span>
                <span className="text-xs text-foreground/40">/ week</span>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--panel-border)] space-y-2">
                <span className="text-xs text-foreground/50 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Start: {new Date(policy.startDate).toLocaleDateString()}
                </span>
                <span className="text-xs text-success flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" /> Risk Score: {(policy.riskScore * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-foreground/50 flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Coverage: ₹{policy.coverageLimit.toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
