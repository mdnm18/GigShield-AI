"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileText, CheckCircle, Clock, XCircle, DollarSign, ArrowLeft, Shield, Brain } from "lucide-react";
import { cn } from "@/utils/cn";
import Link from "next/link";

interface ClaimDetail {
  id: string; amountRequested: number; amountApproved: number | null;
  status: string; description: string; incidentDate: string;
  fraudScore: number; lossHours: number | null; aiNotes: string | null;
  createdAt: string;
  policy?: { id: string; policyType: string; weeklyPremium: number; coverageLimit: number };
  event?: { id: string; type: string; severity: string; description: string };
}

export default function ClaimDetailPage() {
  const params = useParams();
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/claims")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((c: ClaimDetail) => c.id === params.id);
          if (found) setClaim(found);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="space-y-4"><div className="skeleton h-8 w-1/3" /><div className="skeleton h-64 rounded-2xl" /></div>;
  }

  if (!claim) {
    return (
      <div className="text-center py-20">
        <FileText className="w-12 h-12 text-foreground/15 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground/60">Claim Not Found</h2>
        <Link href="/dashboard/claims" className="text-primary text-sm mt-2 inline-block cursor-pointer">← Back to Claims</Link>
      </div>
    );
  }

  const statusConfig: Record<string, { color: string; icon: React.ComponentType<{className?: string}> }> = {
    submitted: { color: "text-warning", icon: Clock },
    under_review: { color: "text-primary", icon: Clock },
    verified: { color: "text-primary", icon: CheckCircle },
    approved: { color: "text-success", icon: CheckCircle },
    paid: { color: "text-success", icon: DollarSign },
    rejected: { color: "text-danger", icon: XCircle },
  };
  const config = statusConfig[claim.status] || statusConfig.submitted;
  const StatusIcon = config.icon;

  return (
    <div className="max-w-3xl mx-auto space-y-6 stagger-children">
      <Link href="/dashboard/claims" className="inline-flex items-center text-xs text-foreground/40 hover:text-foreground transition-colors cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Claims
      </Link>

      <div className="glass-panel p-8 rounded-2xl border border-[var(--panel-border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-[10px] text-foreground/40 font-mono mb-1">CLAIM-{claim.id.slice(0, 8).toUpperCase()}</p>
            <h1 className="text-3xl font-bold">₹{claim.amountRequested.toFixed(2)}</h1>
            <p className="text-sm text-foreground/50 mt-1">{claim.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={cn("badge", claim.status === "paid" || claim.status === "approved" ? "badge-success" : claim.status === "rejected" ? "badge-danger" : "badge-warning")}>
              <StatusIcon className="w-3 h-3" /> {claim.status.replace("_", " ").toUpperCase()}
            </span>
            {claim.amountApproved && (
              <span className="text-sm text-success font-bold">₹{claim.amountApproved.toFixed(2)} approved</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[var(--panel-border)]">
          <div>
            <p className="text-[10px] text-foreground/40 uppercase font-bold">Incident Date</p>
            <p className="text-sm font-medium mt-1">{new Date(claim.incidentDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/40 uppercase font-bold">Filed Date</p>
            <p className="text-sm font-medium mt-1">{new Date(claim.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/40 uppercase font-bold">Loss Hours</p>
            <p className="text-sm font-medium mt-1">{claim.lossHours ? `${claim.lossHours}h` : "N/A"}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/40 uppercase font-bold">AI Fraud Score</p>
            <p className={cn("text-sm font-bold mt-1", claim.fraudScore > 0.5 ? "text-danger" : "text-success")}>
              {(claim.fraudScore * 100).toFixed(0)}% — {claim.fraudScore > 0.5 ? "Flagged" : "Clean"}
            </p>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="glass-panel p-6 rounded-2xl border border-accent/20 bg-accent/[0.03]">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-accent" /> AI Analysis
        </h3>
        <div className="space-y-2 text-sm text-foreground/70">
          <p>• Fraud Score: {(claim.fraudScore * 100).toFixed(1)}% — {claim.fraudScore > 0.5 ? "Anomalous patterns detected by Isolation Forest model" : "No anomalies detected"}</p>
          {claim.lossHours && <p>• Estimated {claim.lossHours} hours of work disruption</p>}
          <p>• Claim filed {Math.round((Date.now() - new Date(claim.createdAt).getTime()) / 3600000)}h ago</p>
          {claim.aiNotes && <p>• {claim.aiNotes}</p>}
        </div>
      </div>
    </div>
  );
}
