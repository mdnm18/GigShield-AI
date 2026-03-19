"use client";

import { Bell, Search, UserCircle, MapPin, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/app/actions/auth";

export default function Navbar() {
  const [user, setUser] = useState<{name: string, role: string} | null>(null);

  useEffect(() => {
    getCurrentUser().then((res) => {
      if (res) setUser({ name: res.name, role: res.role });
    });
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 glass-panel border-x-0 border-t-0 border-b border-[var(--panel-border)] sticky top-0 z-10 w-full mb-6 relative">
      <div className="flex items-center gap-2">
        <MapPin className="text-accent/80 w-4 h-4" />
        <span className="text-xs font-medium text-foreground/70 uppercase tracking-widest hidden sm:inline-block shadow-[var(--primary)] text-shadow-sm">
          Active Zone: Downtown
        </span>
      </div>

      <div className="flex items-center gap-4 text-foreground/70">
        <div className="relative glass-panel rounded-full hidden sm:flex items-center px-4 py-1.5 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
          <Search className="w-4 h-4 text-foreground/40 mr-2" />
          <input 
            type="text" 
            placeholder="Search policies..." 
            className="bg-transparent border-none outline-none text-sm w-48 text-foreground placeholder:text-foreground/40"
          />
        </div>

        <button className="relative p-2 rounded-full hover:bg-foreground/5 transition-colors group">
          <Bell className="w-5 h-5 group-hover:text-primary transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[var(--background)] animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        </button>
        
        <div className="w-px h-6 bg-foreground/10 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-2 hover:bg-foreground/5 p-1 pr-3 rounded-full transition-colors border border-transparent shadow shadow-[var(--panel-border)] glass-panel">
          <UserCircle className="w-8 h-8 text-primary shadow-[0_0_12px_rgba(59,130,246,0.3)] rounded-full" />
          <div className="flex flex-col items-start leading-none hidden sm:flex">
            <span className="text-sm font-semibold text-foreground/90">{user?.name || "Loading..."}</span>
            <span className="text-[10px] text-foreground/50 capitalize">{user?.role || "..."}</span>
          </div>
        </div>

        <button 
          onClick={() => logoutUser()}
          title="Log out"
          className="p-2 ml-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors group"
        >
          <LogOut className="w-5 h-5 text-foreground/50 group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    </header>
  );
}
