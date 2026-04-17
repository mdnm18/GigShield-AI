"use client";

import { useEffect, useState } from "react";
import { FileText, PlusCircle, CheckCircle, Clock, XCircle, DollarSign } from "lucide-react";
import { cn } from "@/utils/cn";
import Link from "next/link";

type Claim = {
  id: string;
  amountRequested: number;
  amountApproved: number | null;
  status: string;
  description: string;
  incidentDate: string;
  fraudScore: number;
  lossHours: number | null;
  createdAt: string;
};

const statusConfig: Record<string, { badge: string; icon: React.ComponentType<{className?: string}> }> = {
  submitted: { badge: "badge-warning", icon: Clock },
  under_review: { badge: "badge-info", icon: Clock },
  verified: { badge: "badge-info", icon: CheckCircle },
  approved: { badge: "badge-success", icon: CheckCircle },
  paid: { badge: "badge-success", icon: DollarSign },
  rejected: { badge: "badge-danger", icon: XCircle },
};

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/claims")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setClaims(data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Claims</h1>
          <p className="text-foreground/50 text-sm mt-1">Track your submitted insurance claims.</p>
        </div>
        <Link
          href="/dashboard/claims/new"
          className="glass-panel px-4 py-2 rounded-xl text-primary font-semibold text-sm hover:bg-primary/10 transition-all flex items-center gap-2 border border-primary/20 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> File New Claim
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <>{[1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</>
        ) : claims.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <FileText className="w-10 h-10 text-foreground/15 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground/70">No Claims Filed</h3>
            <p className="text-sm text-foreground/40 mt-1 mb-4">You haven't submitted any incident claims yet.</p>
            <Link href="/dashboard/claims/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors cursor-pointer">
              <PlusCircle className="w-4 h-4" /> File Your First Claim
            </Link>
          </div>
        ) : (
          claims.map((claim) => {
            const config = statusConfig[claim.status] || statusConfig.submitted;
            const StatusIcon = config.icon;
            return (
              <div key={claim.id} className="glass-panel p-5 rounded-xl border border-[var(--panel-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-pink/10 rounded-xl border border-pink/20">
                    <FileText className="w-5 h-5 text-pink" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold text-lg">₹{claim.amountRequested.toFixed(2)}</h3>
                    <p className="text-sm text-foreground/50 line-clamp-1">{claim.description || "No description"}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-foreground/30">
                        {new Date(claim.incidentDate).toLocaleDateString()}
                      </span>
                      {claim.lossHours && (
                        <span className="text-[10px] text-accent font-medium">
                          ~{claim.lossHours}h lost
                        </span>
                      )}
                      {claim.fraudScore > 0 && (
                        <span className={cn("text-[10px] font-medium",
                          claim.fraudScore > 0.5 ? "text-danger" : "text-success"
                        )}>
                          Fraud: {(claim.fraudScore * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn("badge", config.badge)}>
                    <StatusIcon className="w-3 h-3" />
                    {claim.status.replace("_", " ").toUpperCase()}
                  </span>
                  {claim.amountApproved && (
                    <span className="text-sm text-success flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3 h-3" /> ₹{claim.amountApproved.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
