"use client";

import { useEffect, useState } from "react";
import { User as UserIcon, LogOut, Settings, Award } from "lucide-react";
import { getCurrentUser, logoutUser } from "@/app/actions/auth";

export default function ProfilePage() {
  const [user, setUser] = useState<{name: string, role: string, email: string} | null>(null);

  useEffect(() => {
    getCurrentUser().then((res) => {
      if (res) setUser({ name: res.name, role: res.role, email: res.email });
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground text-center sm:text-left">Coverage Profile</h1>
        <p className="text-foreground/60 text-sm mt-1 text-center sm:text-left">Manage your personal details and account settings.</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-[var(--panel-border)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-left">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent p-1">
            <div className="w-full h-full bg-[var(--panel-bg)] rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-foreground/50" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{user?.name || "Loading..."}</h2>
            <p className="text-foreground/50 text-sm">{user?.email}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-semibold">
              <Award className="w-3.5 h-3.5" /> High Trust Score
            </div>
          </div>
        </div>

        <div className="mt-10 mb-8 pt-8 border-t border-[var(--panel-border)] grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-1 text-center sm:text-left">
            <label className="text-xs text-foreground/50 uppercase tracking-widest font-semibold">Role</label>
            <p className="font-medium capitalize text-foreground/90">{user?.role || "Gig Worker"}</p>
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <label className="text-xs text-foreground/50 uppercase tracking-widest font-semibold">Verification</label>
            <p className="font-medium text-green-400 flex items-center justify-center sm:justify-start gap-1">
               Identity Verified
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <button className="flex-1 py-3 px-4 glass-panel border border-[var(--panel-border)] rounded-xl text-sm font-semibold hover:bg-foreground/5 transition-colors flex items-center justify-center gap-2">
            <Settings className="w-4 h-4 text-foreground/60" /> Account Settings
          </button>
          <button 
            onClick={() => logoutUser()} 
            className="flex-1 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
