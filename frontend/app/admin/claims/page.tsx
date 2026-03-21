"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

type AdminClaim = {
  id: string;
  user: { name: string; email: string };
  policy: { riskScore: number };
  amountRequested: number;
  amountApproved: number | null;
  status: string;
  description: string;
  fraudScore: number;
  createdAt: string;
};

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<AdminClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchClaims = () => {
    fetch("/api/admin/claims")
      .then((res) => res.json())
      .then((data) => {
        setClaims(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const updateClaim = async (id: string, status: string, amountRequested: number) => {
    setProcessingId(id);
    await fetch("/api/admin/claims", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        claimId: id, 
        status, 
        amountApproved: status === 'approved' ? amountRequested : null 
      }),
    });
    fetchClaims();
    setProcessingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Claims & Fraud Ops</h1>
        <p className="text-foreground/60 text-sm mt-1">Review, approve, and detect fraudulent insurance claims.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="glass-panel p-8 rounded-2xl animate-pulse text-center text-foreground/50">Loading claims...</div>
        ) : claims.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center">
            <AlertTriangle className="w-12 h-12 text-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold text-foreground/80">No Active Claims</h3>
          </div>
        ) : (
          claims.map((claim) => (
             <div key={claim.id} className="glass-panel p-6 rounded-xl border border-[var(--panel-border)] flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
               {/* Left Section (worker details) */}
               <div className="flex-1 space-y-4">
                 <div className="flex flex-col md:flex-row md:items-center gap-4">
                   <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20">
                     <AlertTriangle className="w-6 h-6 text-pink-500" />
                   </div>
                   <div>
                     <h3 className="text-foreground font-semibold text-xl">${claim.amountRequested.toFixed(2)} Claim Request</h3>
                     <p className="text-sm text-foreground/60"><span className="font-semibold text-foreground/80">{claim.user.name}</span> ({claim.user.email})</p>
                   </div>
                 </div>
                 <div className="bg-foreground/[0.02] p-4 rounded-lg border border-[var(--panel-border)] text-sm">
                   <p className="text-foreground font-medium mb-1">Incident Description:</p>
                   <p className="text-foreground/70 italic text-sm">{claim.description || "No description provided."}</p>
                   <p className="text-xs text-foreground/40 mt-3 pt-3 border-t border-[var(--panel-border)]">Filed: {new Date(claim.createdAt).toLocaleString()}</p>
                 </div>
               </div>
               
               {/* Right Section (actions & fraud) */}
               <div className="w-full md:w-64 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-[var(--panel-border)] pt-4 md:pt-0 md:pl-6 justify-between">
                 <div>
                    <h4 className="text-xs uppercase tracking-widest font-bold text-foreground/50 mb-2">Claim Status</h4>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold border block w-fit text-center ${
                      claim.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 
                      claim.status === 'rejected' ? 'bg-red-500/20 text-red-500 border-red-500/20' : 
                      'bg-yellow-500/20 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {claim.status.replace("_", " ").toUpperCase()}
                    </span>
                    
                    <div className="mt-4 p-3 bg-foreground/5 rounded-lg">
                      <p className="text-[10px] uppercase font-bold text-foreground/50 text-center">AI Fraud Analysis</p>
                      <div className="mt-2 text-center text-sm font-bold flex flex-col items-center">
                        <span className={claim.fraudScore > 0.5 ? 'text-red-400' : 'text-green-400'}>
                          Risk Score: {claim.fraudScore.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-normal text-foreground/50 mt-1">Worker Risk Hash: {claim.policy.riskScore.toFixed(1)}</span>
                      </div>
                    </div>
                 </div>

                 {claim.status !== 'approved' && claim.status !== 'rejected' && (
                   <div className="grid grid-cols-2 gap-2 mt-auto">
                     <button 
                        onClick={() => updateClaim(claim.id, 'approved', claim.amountRequested)}
                        disabled={processingId === claim.id}
                        className="py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-green-500/20 transition-all hover:scale-[1.02]"
                      >
                       <CheckCircle className="w-4 h-4" /> Approve
                     </button>
                     <button 
                        onClick={() => updateClaim(claim.id, 'rejected', 0)}
                        disabled={processingId === claim.id}
                        className="py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-red-500/20 transition-all hover:scale-[1.02]"
                      >
                       <XCircle className="w-4 h-4" /> Reject
                     </button>
                   </div>
                 )}
               </div>
             </div>
          ))
        )}
      </div>
    </div>
  );
}
