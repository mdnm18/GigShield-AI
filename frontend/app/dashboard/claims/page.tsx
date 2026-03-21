"use client";

import { useEffect, useState } from "react";
import { FileText, PlusCircle, AlertCircle, CheckCircle } from "lucide-react";

type Claim = {
  id: string;
  amountRequested: number;
  amountApproved: number | null;
  status: string;
  description: string;
  incidentDate: string;
};

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/claims")
      .then((res) => res.json())
      .then((data) => {
        setClaims(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Claims</h1>
          <p className="text-foreground/60 text-sm mt-1">Track your submitted insurance claims.</p>
        </div>
        <button className="glass-panel px-4 py-2 rounded-xl text-primary font-semibold text-sm hover:bg-primary/10 transition-all flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> File New Claim
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="glass-panel p-6 rounded-2xl animate-pulse h-24 blur-[1px]"></div>
        ) : claims.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <FileText className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground/80">No Claims Filed</h3>
            <p className="text-sm text-foreground/50 mt-2">You haven't submitted any incident claims yet.</p>
          </div>
        ) : (
          claims.map((claim) => (
            <div key={claim.id} className="glass-panel p-5 rounded-xl border border-[var(--panel-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-500/10 rounded-xl">
                  <FileText className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold text-lg">${claim.amountRequested.toFixed(2)} Requested</h3>
                  <p className="text-sm text-foreground/60">{claim.description || "No description provided"}</p>
                  <p className="text-xs text-foreground/40 mt-1">Incident Date: {new Date(claim.incidentDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                  claim.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 
                  claim.status === 'rejected' ? 'bg-red-500/20 text-red-500 border-red-500/20' : 
                  'bg-orange-500/20 text-orange-400 border-orange-500/20'
                }`}>
                  {claim.status.replace("_", " ").toUpperCase()}
                </span>
                {claim.amountApproved && (
                  <span className="text-sm text-green-400 flex items-center gap-1 font-semibold">
                    <CheckCircle className="w-3 h-3" /> Approved: ${claim.amountApproved.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
