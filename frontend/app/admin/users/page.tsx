"use client";

import { useEffect, useState } from "react";
import { Users as UsersIcon, Shield } from "lucide-react";

type Worker = {
  id: string;
  name: string;
  email: string;
  _count: { claims: number };
  policies: { id: string; status: string; riskScore: number; weeklyPremium: number }[];
};

export default function AdminUsersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setWorkers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Worker Network Directory</h1>
        <p className="text-foreground/60 text-sm mt-1">Manage and audit onboarded gig workers and their insurance statuses.</p>
      </div>

      <div className="glass-panel overflow-hidden border border-[var(--panel-border)] rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-foreground/[0.02] border-b border-[var(--panel-border)] text-foreground/70 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Worker Profile</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Active Policy Premium</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Risk Score</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Filed Claims</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--panel-border)]">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-foreground/50 animate-pulse">Loading workers...</td></tr>
              ) : workers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-foreground/50">No workers found in the network.</td></tr>
              ) : (
                workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-foreground/[0.02] transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-pink-500/30">
                        <UsersIcon className="w-4 h-4 text-pink-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{worker.name}</div>
                        <div className="text-xs text-foreground/50">{worker.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {worker.policies.length > 0 ? (
                        <div className="flex flex-col">
                           <span className="font-bold text-lg">${worker.policies[0].weeklyPremium.toFixed(2)}<span className="text-xs font-normal text-foreground/50">/wk</span></span>
                           <span className={`text-[10px] w-min mt-1 px-2 py-0.5 rounded-full font-bold uppercase border ${worker.policies[0].status === 'active' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-orange-500/30 text-orange-400 bg-orange-500/10'}`}>
                              {worker.policies[0].status}
                           </span>
                        </div>
                      ) : (
                        <span className="text-foreground/40 text-xs italic flex items-center gap-1"><Shield className="w-3 h-3"/> Uninsured</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {worker.policies.length > 0 ? (
                        <span className={`font-bold ${worker.policies[0].riskScore > 3 ? 'text-red-400' : 'text-green-400'}`}>
                          {worker.policies[0].riskScore.toFixed(1)} / 5.0
                        </span>
                      ) : (
                        <span className="text-foreground/30">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {worker._count.claims > 0 ? (
                        <span className="px-3 py-1 bg-pink-500/10 text-pink-500 font-bold rounded-full text-xs">
                           {worker._count.claims} Claims
                        </span>
                      ) : (
                        <span className="text-foreground/40 text-xs">None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
