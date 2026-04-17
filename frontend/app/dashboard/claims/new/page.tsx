"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowLeft, Send, AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";
import Link from "next/link";

interface PolicyOption {
  id: string;
  policyType: string;
  weeklyPremium: number;
  coverageLimit: number;
  status: string;
}

export default function NewClaimPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<PolicyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    policyId: "",
    amountRequested: "",
    description: "",
    incidentDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetch("/api/policies")
      .then((r) => r.json())
      .then((data) => {
        const active = Array.isArray(data) ? data.filter((p: PolicyOption) => p.status === "active") : [];
        setPolicies(active);
        if (active.length > 0) setForm((f) => ({ ...f, policyId: active[0].id }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to submit claim");
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/claims"), 2000);
    } catch (err) {
      setError("Failed to submit claim. Please try again.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="space-y-4"><div className="h-10 skeleton w-1/3" /><div className="h-64 skeleton rounded-2xl" /></div>;
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="glass-panel p-10 rounded-3xl text-center max-w-md animate-fade-in-up">
          <div className="w-16 h-16 bg-success/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-success/20">
            <FileText className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Claim Submitted</h2>
          <p className="text-sm text-foreground/50">Your claim is being reviewed by our AI fraud detection system. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 stagger-children">
      <Link href="/dashboard/claims" className="inline-flex items-center text-xs text-foreground/40 hover:text-foreground transition-colors cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Claims
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">File New Claim</h1>
        <p className="text-foreground/50 text-sm mt-1">Submit an incident claim against your active policy.</p>
      </div>

      {policies.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center">
          <AlertTriangle className="w-10 h-10 text-warning mx-auto mb-3 opacity-60" />
          <h3 className="font-bold text-lg">No Active Policies</h3>
          <p className="text-sm text-foreground/50 mt-1 mb-4">You need an active policy before filing a claim.</p>
          <Link href="/dashboard/policies" className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors cursor-pointer">
            Get a Policy
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl border border-[var(--panel-border)] space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Policy</label>
            <select
              value={form.policyId}
              onChange={(e) => setForm((f) => ({ ...f, policyId: e.target.value }))}
              required
              className="w-full bg-foreground/[0.03] border border-[var(--panel-border)] rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground cursor-pointer"
            >
              {policies.map((p) => (
                <option key={p.id} value={p.id} className="bg-[var(--background)]">
                  {p.policyType} — ₹{p.weeklyPremium.toFixed(2)}/wk (Coverage: ₹{p.coverageLimit})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Amount Requested (₹)</label>
            <input
              type="number"
              value={form.amountRequested}
              onChange={(e) => setForm((f) => ({ ...f, amountRequested: e.target.value }))}
              placeholder="1000"
              required
              min="1"
              className="w-full bg-foreground/[0.03] border border-[var(--panel-border)] rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Incident Date</label>
            <input
              type="date"
              value={form.incidentDate}
              onChange={(e) => setForm((f) => ({ ...f, incidentDate: e.target.value }))}
              required
              className="w-full bg-foreground/[0.03] border border-[var(--panel-border)] rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the incident that caused disruption to your work..."
              required
              rows={4}
              className="w-full bg-foreground/[0.03] border border-[var(--panel-border)] rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground resize-none"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-primary/90 hover:bg-primary text-white shadow-lg shadow-primary/20 cursor-pointer",
              submitting && "opacity-60 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit Claim"}
          </button>
        </form>
      )}
    </div>
  );
}
