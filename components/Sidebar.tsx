"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { LayoutDashboard, Shield, FileText, CreditCard, User, Bell, Map, Activity } from "lucide-react";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Policies", href: "/dashboard/policies", icon: Shield },
  { name: "Claims", href: "/dashboard/claims", icon: FileText },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Alerts", href: "/dashboard/notifications", icon: Bell },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 h-full glass-panel border-l-0 border-y-0 border-r border-[var(--panel-border)] p-4">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <Activity className="text-primary w-8 h-8" />
        <span className="text-xl font-bold tracking-tight text-foreground">GigSure</span>
      </div>
      
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Worker Portal
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname !== "/dashboard" && pathname.startsWith(item.href) && item.href !== "/dashboard");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary font-medium shadow-sm shadow-primary/5" 
                  : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary/90" : "text-foreground/50")} />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="mt-auto pt-6">
        <div className="glass-panel p-4 rounded-xl text-xs space-y-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="font-semibold text-foreground/90">Premium Status</p>
          <div className="flex justify-between text-foreground/70">
            <span>Next debit in:</span>
            <span className="font-medium">3 Days</span>
          </div>
          <div className="w-full bg-foreground/10 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full w-[60%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
