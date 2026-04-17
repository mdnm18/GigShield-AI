"use client";

import { Bell, Search, UserCircle, MapPin, LogOut, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/app/actions/auth";

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    getCurrentUser().then((res) => {
      if (res) setUser({ name: res.name, role: res.role });
    });
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 glass-panel border-x-0 border-t-0 border-b border-[var(--panel-border)] sticky top-0 z-10 w-full mb-6 relative">
      {/* Left: Zone indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
          <Wifi className="w-3 h-3 text-success animate-pulse" />
          <span className="text-[10px] font-bold text-success uppercase tracking-wider hidden sm:inline-block">
            Live
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="text-accent/80 w-3.5 h-3.5" />
          <span className="text-xs font-medium text-foreground/50 hidden sm:inline-block">
            Active Zone
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 text-foreground/70">
        {/* Search */}
        <div className="relative glass-panel rounded-xl hidden sm:flex items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/30 transition-all">
          <Search className="w-3.5 h-3.5 text-foreground/30 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-xs w-36 text-foreground placeholder:text-foreground/30"
          />
        </div>

        {/* Notifications Bell */}
        <button className="relative p-2 rounded-xl hover:bg-foreground/5 transition-colors group cursor-pointer">
          <Bell className="w-[18px] h-[18px] group-hover:text-primary transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-[var(--background)] animate-pulse" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-foreground/10 mx-1 hidden sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-2.5 hover:bg-foreground/5 p-1.5 pr-3 rounded-xl transition-colors cursor-pointer glass-panel border border-[var(--panel-border)]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex flex-col items-start leading-none hidden sm:flex">
            <span className="text-xs font-semibold text-foreground/90">
              {user?.name || "Loading..."}
            </span>
            <span className="text-[10px] text-foreground/40 capitalize">
              {user?.role || "..."}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => logoutUser()}
          title="Sign out"
          className="p-2 rounded-xl hover:bg-danger/10 hover:text-danger transition-colors group cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px] text-foreground/40 group-hover:text-danger transition-colors" />
        </button>
      </div>
    </header>
  );
}
