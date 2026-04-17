"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import {
  LayoutDashboard,
  Shield,
  FileText,
  CreditCard,
  User,
  Bell,
  Activity,
  CloudLightning,
  Brain,
} from "lucide-react";

const mainNav = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Policies", href: "/dashboard/policies", icon: Shield },
  { name: "Claims", href: "/dashboard/claims", icon: FileText },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
];

const monitorNav = [
  { name: "Events", href: "/dashboard/events", icon: CloudLightning },
  { name: "AI Insights", href: "/dashboard/insights", icon: Brain },
];

const accountNav = [
  { name: "Alerts", href: "/dashboard/notifications", icon: Bell },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  const renderNavItem = (item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> }) => {
    const isActive =
      pathname === item.href ||
      (pathname !== "/dashboard" &&
        pathname.startsWith(item.href) &&
        item.href !== "/dashboard");
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer",
          isActive
            ? "bg-primary/10 text-primary font-semibold shadow-sm shadow-primary/5 glow-primary"
            : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
        )}
      >
        <item.icon
          className={cn(
            "w-[18px] h-[18px]",
            isActive ? "text-primary" : "text-foreground/40"
          )}
        />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="hidden md:flex flex-col w-64 h-full glass-panel border-l-0 border-y-0 border-r border-[var(--panel-border)] p-4">
      {/* Brand */}
      <div className="flex items-center gap-3 px-3 mb-8 mt-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
          <Activity className="text-white w-5 h-5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">
          Gig<span className="text-primary">Shield</span>
        </span>
      </div>

      {/* Main Navigation */}
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold text-foreground/30 uppercase tracking-[0.15em] mb-2">
          Dashboard
        </p>
        {mainNav.map(renderNavItem)}
      </div>

      {/* Monitor Navigation */}
      <div className="space-y-1 mt-6">
        <p className="px-3 text-[10px] font-bold text-foreground/30 uppercase tracking-[0.15em] mb-2">
          Monitoring
        </p>
        {monitorNav.map(renderNavItem)}
      </div>

      {/* Account Navigation */}
      <div className="space-y-1 mt-6">
        <p className="px-3 text-[10px] font-bold text-foreground/30 uppercase tracking-[0.15em] mb-2">
          Account
        </p>
        {accountNav.map(renderNavItem)}
      </div>

      {/* Bottom Card */}
      <div className="mt-auto pt-6">
        <div className="glass-panel p-4 rounded-xl text-xs space-y-3 relative overflow-hidden group border border-primary/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <p className="font-semibold text-foreground/80 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Coverage Active
            </p>
            <div className="flex justify-between text-foreground/50 mt-2">
              <span>Next debit:</span>
              <span className="font-medium text-foreground/70">3 Days</span>
            </div>
            <div className="w-full bg-foreground/10 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full w-[60%] transition-all duration-1000" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
