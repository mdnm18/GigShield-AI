"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, AlertTriangle, ShieldAlert, Activity, LogOut, CloudLightning } from "lucide-react";
import { cn } from "@/utils/cn";
import { logoutUser } from "@/app/actions/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItem = (href: string, label: string, Icon: React.ComponentType<{className?: string}>, exact = false) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href) && (exact || href !== "/admin" || pathname === "/admin");
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer",
          isActive
            ? "bg-pink/10 text-pink font-semibold glow-pink"
            : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
        )}
      >
        <Icon className={cn("w-[18px] h-[18px]", isActive ? "text-pink" : "text-foreground/40")} />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 glass-panel border-l-0 border-y-0 border-r border-[var(--panel-border)] p-4 flex-col">
        <div className="flex items-center gap-3 px-3 mb-8 mt-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink to-accent flex items-center justify-center shadow-lg">
            <ShieldAlert className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Admin<span className="text-pink">Ops</span>
          </span>
        </div>

        <div className="space-y-1 flex-1">
          <p className="px-3 text-[10px] font-bold text-foreground/30 uppercase tracking-[0.15em] mb-2">Overview</p>
          {navItem("/admin", "System Overview", LayoutDashboard, true)}
          {navItem("/admin/users", "Workers", Users)}
          {navItem("/admin/claims", "Claims Review", AlertTriangle)}

          <div className="h-px bg-foreground/5 my-4 mx-2" />

          <p className="px-3 text-[10px] font-bold text-foreground/30 uppercase tracking-[0.15em] mb-2">ML Intelligence</p>
          {navItem("/admin/fraud", "Fraud Engine", ShieldAlert)}
          {navItem("/admin/analytics", "Risk Analytics", Activity)}
        </div>

        {/* Logout */}
        <button
          onClick={() => logoutUser()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/50 hover:text-danger hover:bg-danger/10 transition-all cursor-pointer mt-auto"
        >
          <LogOut className="w-[18px] h-[18px]" /> Sign Out
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 glass-panel border-x-0 border-t-0 border-b border-[var(--panel-border)] sticky top-0 z-10 w-full mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink/10 border border-pink/20">
              <CloudLightning className="w-3 h-3 text-pink animate-pulse" />
              <span className="text-[10px] font-bold text-pink uppercase tracking-wider">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink to-accent text-white flex items-center justify-center text-xs font-bold shadow-sm">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-12 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
