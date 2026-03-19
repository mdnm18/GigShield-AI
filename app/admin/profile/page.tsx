"use client";

import { useEffect, useState } from "react";
import { LogOut, Settings, ShieldAlert, KeyRound } from "lucide-react";
import { getCurrentUser, logoutUser } from "@/app/actions/auth";

export default function AdminProfilePage() {
  const [user, setUser] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    getCurrentUser().then((res) => {
      if (res && res.role === "admin") {
        setUser({ name: res.name, email: res.email });
      }
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground text-center sm:text-left">Administrator Profile</h1>
        <p className="text-foreground/60 text-sm mt-1 text-center sm:text-left">Manage your system access and security credentials.</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-[var(--panel-border)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-left">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-accent p-1">
            <div className="w-full h-full bg-[var(--panel-bg)] rounded-full flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-pink-500/70" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{user?.name || "Loading Admin..."}</h2>
            <p className="text-foreground/50 text-sm">{user?.email}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 text-pink-500 border border-pink-500/20 rounded-full text-xs font-semibold">
              <KeyRound className="w-3.5 h-3.5" /> Superuser Access
            </div>
          </div>
        </div>

        <div className="mt-10 mb-8 pt-8 border-t border-[var(--panel-border)] grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-1 text-center sm:text-left">
            <label className="text-xs text-foreground/50 uppercase tracking-widest font-semibold">Role Level</label>
            <p className="font-medium capitalize text-foreground/90 text-pink-500 font-bold">Administrator</p>
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <label className="text-xs text-foreground/50 uppercase tracking-widest font-semibold">System Clearances</label>
            <p className="font-medium text-green-400 flex items-center justify-center sm:justify-start gap-1">
               Full Privilege
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <button className="flex-1 py-3 px-4 glass-panel border border-[var(--panel-border)] rounded-xl text-sm font-semibold hover:bg-foreground/5 transition-colors flex items-center justify-center gap-2">
            <Settings className="w-4 h-4 text-foreground/60" /> Security Settings
          </button>
          <button 
            onClick={() => logoutUser()} 
            className="flex-1 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Terminate Session
          </button>
        </div>
      </div>
    </div>
  );
}
