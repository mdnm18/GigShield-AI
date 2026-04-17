"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Shield, CheckCircle, Clock, ArrowLeft, Activity, FileText } from "lucide-react";
import { cn } from "@/utils/cn";
import Link from "next/link";

interface PolicyDetail {
  id: string; policyType: string; weeklyPremium: number; coverageLimit: number;
  status: string; riskScore: number; startDate: string; endDate: string | null;
  _count?: { claims: number };
}

export default function PolicyDetailPage() {
  const params = useParams();
  const [policy, setPolicy] = useState<PolicyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/policies")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((p: PolicyDetail) => p.id === params.id);
          if (found) setPolicy(found);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="space-y-4"><div className="skeleton h-8 w-1/3" /><div className="skeleton h-64 rounded-2xl" /></div>;
  }

  if (!policy) {
    return (
      <div className="text-center py-20">
        <Shield className="w-12 h-12 text-foreground/15 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground/60">Policy Not Found</h2>
        <Link href="/dashboard/policies" className="text-primary text-sm mt-2 inline-block cursor-pointer">← Back to Policies</Link>
      </div>
    );
  }

  const daysActive = Math.round((Date.now() - new Date(policy.startDate).getTime()) / (86400000));

  return (
    <div className="max-w-3xl mx-auto space-y-6 stagger-children">
      <Link href="/dashboard/policies" className="inline-flex items-center text-xs text-foreground/40 hover:text-foreground transition-colors cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Policies
      </Link>

      <div className="glass-panel p-8 rounded-2xl border border-[var(--panel-border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/15 rounded-2xl border border-primary/20">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold">{policy.policyType.replace(/_/g, " ")}</p>
              <h1 className="text-3xl font-bold mt-1">₹{policy.weeklyPremium.toFixed(2)}<span className="text-sm font-normal text-foreground/40 ml-1">/week</span></h1>
            </div>
          </div>
          <span className={cn("badge", policy.status === "active" ? "badge-success" : "badge-warning")}>
            {policy.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[var(--panel-border)]">
          <div>
            <p className="text-[10px] text-foreground/40 uppercase font-bold">Coverage</p>
            <p className="text-lg font-bold mt-1">₹{policy.coverageLimit.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/40 uppercase font-bold">Risk Score</p>
            <p className={cn("text-lg font-bold mt-1", policy.riskScore > 0.5 ? "text-warning" : "text-success")}>
              {(policy.riskScore * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/40 uppercase font-bold">Active Since</p>
            <p className="text-sm font-medium mt-1">{new Date(policy.startDate).toLocaleDateString()}</p>
            <p className="text-[10px] text-foreground/30">{daysActive} days</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/40 uppercase font-bold">Claims Filed</p>
            <p className="text-lg font-bold mt-1">{policy._count?.claims || 0}</p>
          </div>
        </div>
      </div>

      {/* Coverage Details */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--panel-border)]">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-accent" /> Coverage Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-foreground/[0.02] border border-[var(--panel-border)]">
            <p className="text-[10px] uppercase font-bold text-foreground/40">Protection Type</p>
            <p className="font-medium mt-1 capitalize">{policy.policyType.replace(/_/g, " ")}</p>
          </div>
          <div className="p-4 rounded-xl bg-foreground/[0.02] border border-[var(--panel-border)]">
            <p className="text-[10px] uppercase font-bold text-foreground/40">Max Payout Per Event</p>
            <p className="font-medium mt-1">₹{(policy.coverageLimit * 0.7).toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-xl bg-foreground/[0.02] border border-[var(--panel-border)]">
            <p className="text-[10px] uppercase font-bold text-foreground/40">Renewal Date</p>
            <p className="font-medium mt-1">{policy.endDate ? new Date(policy.endDate).toLocaleDateString() : "Auto-renew"}</p>
          </div>
          <div className="p-4 rounded-xl bg-foreground/[0.02] border border-[var(--panel-border)]">
            <p className="text-[10px] uppercase font-bold text-foreground/40">Total Premiums Paid</p>
            <p className="font-medium mt-1">₹{(Math.ceil(daysActive / 7) * policy.weeklyPremium).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
