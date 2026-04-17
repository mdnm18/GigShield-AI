"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";

interface ClaimData {
  id: string; amountRequested: number; fraudScore: number;
  status: string; description: string; createdAt: string;
}

export default function FraudInsightsPage() {
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/claims")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setClaims(data); })
      .finally(() => setLoading(false));
  }, []);

  const flagged = claims.filter((c) => c.fraudScore > 0.5);
  const clean = claims.filter((c) => c.fraudScore <= 0.5);

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-pink" /> Fraud Analysis
        </h1>
        <p className="text-foreground/50 text-sm mt-1">AI fraud scoring on your submitted claims.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl text-center">
          <p className="text-2xl font-bold">{claims.length}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Total Claims</p>
        </div>
        <div className="glass-panel p-5 rounded-xl text-center border border-success/20 bg-success/5">
          <p className="text-2xl font-bold text-success">{clean.length}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Clean</p>
        </div>
        <div className="glass-panel p-5 rounded-xl text-center border border-danger/20 bg-danger/5">
          <p className="text-2xl font-bold text-danger">{flagged.length}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Flagged</p>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <>{[1, 2].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</>
        ) : claims.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center text-foreground/40">
            <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No claims to analyze yet.</p>
          </div>
        ) : (
          claims.map((claim) => (
            <div key={claim.id} className={cn(
              "glass-panel p-4 rounded-xl border flex items-center justify-between",
              claim.fraudScore > 0.5 ? "border-danger/20 bg-danger/[0.03]" : "border-[var(--panel-border)]"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-xl border",
                  claim.fraudScore > 0.5 ? "bg-danger/10 border-danger/20 text-danger" : "bg-success/10 border-success/20 text-success"
                )}>
                  {claim.fraudScore > 0.5 ? <AlertTriangle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">₹{claim.amountRequested.toFixed(2)}</p>
                  <p className="text-[10px] text-foreground/40">{claim.description?.slice(0, 60) || "No description"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("text-sm font-bold",
                  claim.fraudScore > 0.5 ? "text-danger" : "text-success"
                )}>
                  {(claim.fraudScore * 100).toFixed(0)}%
                </p>
                <span className={cn("badge text-[8px]",
                  claim.fraudScore > 0.5 ? "badge-danger" : "badge-success"
                )}>
                  {claim.fraudScore > 0.5 ? "FLAGGED" : "CLEAN"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
