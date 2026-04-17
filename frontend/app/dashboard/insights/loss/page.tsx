"use client";

import { useEffect, useState } from "react";
import { BarChart3, Clock, DollarSign } from "lucide-react";
import { cn } from "@/utils/cn";

interface ClaimLoss {
  id: string; amountRequested: number; amountApproved: number | null;
  lossHours: number | null; status: string; description: string;
}

export default function LossInsightsPage() {
  const [claims, setClaims] = useState<ClaimLoss[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/claims")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setClaims(data); })
      .finally(() => setLoading(false));
  }, []);

  const totalLossHours = claims.reduce((a, c) => a + (c.lossHours || 0), 0);
  const totalRequested = claims.reduce((a, c) => a + c.amountRequested, 0);
  const totalApproved = claims.reduce((a, c) => a + (c.amountApproved || 0), 0);

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-primary" /> Loss Analysis
        </h1>
        <p className="text-foreground/50 text-sm mt-1">AI-estimated income loss from disruption events.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl text-center border border-warning/20 bg-warning/5">
          <Clock className="w-5 h-5 text-warning mx-auto mb-2" />
          <p className="text-2xl font-bold">{totalLossHours.toFixed(1)}h</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Total Lost Hours</p>
        </div>
        <div className="glass-panel p-5 rounded-xl text-center border border-danger/20 bg-danger/5">
          <DollarSign className="w-5 h-5 text-danger mx-auto mb-2" />
          <p className="text-2xl font-bold">₹{totalRequested.toFixed(0)}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Claimed</p>
        </div>
        <div className="glass-panel p-5 rounded-xl text-center border border-success/20 bg-success/5">
          <DollarSign className="w-5 h-5 text-success mx-auto mb-2" />
          <p className="text-2xl font-bold text-success">₹{totalApproved.toFixed(0)}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Recovered</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-[var(--panel-border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--panel-border)] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold">Loss Breakdown by Claim</h2>
        </div>
        <div className="divide-y divide-[var(--panel-border)]">
          {loading ? (
            <div className="p-6"><div className="skeleton h-6 w-48 mx-auto" /></div>
          ) : claims.length === 0 ? (
            <div className="p-8 text-center text-foreground/40">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No loss data yet.</p>
            </div>
          ) : (
            claims.map((claim) => (
              <div key={claim.id} className="p-4 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors">
                <div>
                  <p className="text-sm font-semibold">{claim.description?.slice(0, 50) || "Claim"}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {claim.lossHours && (
                      <span className="text-[10px] text-warning font-medium flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {claim.lossHours}h lost
                      </span>
                    )}
                    <span className={cn("badge text-[8px]",
                      claim.status === "paid" ? "badge-success" :
                      claim.status === "approved" ? "badge-info" : "badge-warning"
                    )}>
                      {claim.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹{claim.amountRequested.toFixed(2)}</p>
                  {claim.amountApproved && (
                    <p className="text-[10px] text-success font-medium">
                      Recovered: ₹{claim.amountApproved.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
