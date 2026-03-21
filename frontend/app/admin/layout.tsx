import Link from "next/link";
import { LayoutDashboard, Users, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/utils/cn";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      <div className="w-64 glass-panel border-l-0 border-y-0 border-r border-[var(--panel-border)] p-4 flex flex-col">
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <ShieldAlert className="text-pink-500 w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-foreground">Admin<span className="text-pink-500">Ops</span></span>
        </div>
        
        <div className="space-y-2 flex-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-pink-500/10 text-pink-500 font-medium">
            <LayoutDashboard className="w-5 h-5 text-pink-500/90" />
            Analytics
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-all">
            <Users className="w-5 h-5" />
            Workers
          </Link>
          <Link href="/admin/claims" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-all">
            <AlertTriangle className="w-5 h-5" />
            Claims & Fraud
          </Link>
          <Link href="/admin/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-all">
            <Users className="w-5 h-5" />
            Profile
          </Link>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 glass-panel border-x-0 border-t-0 border-b border-[var(--panel-border)] sticky top-0 z-10 w-full mb-6">
          <h2 className="font-semibold text-foreground/80">System Analytics Dashboard</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-accent text-white flex items-center justify-center text-xs font-bold border border-[var(--panel-border)]">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-12 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
