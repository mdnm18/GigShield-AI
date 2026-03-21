import Link from "next/link";
import { ShieldAlert, Bot } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 -z-10 animate-pulse"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] -translate-y-1/2 -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-3xl w-full text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter">
            Gig<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Sure</span>
          </h1>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto font-medium">
            AI-powered, dynamic delivery insurance platform. Select your portal to proceed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Worker Portal Link */}
          <Link href="/login?role=worker" className="group glass-panel p-8 rounded-3xl border border-[var(--panel-border)] hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
               <Bot className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Worker App</h2>
            <p className="text-sm text-foreground/60">
              Live dashboard for delivery workers with dynamic premium tracking.
            </p>
          </Link>

          {/* Admin Portal Link */}
          <Link href="/login?role=admin" className="group glass-panel p-8 rounded-3xl border border-[var(--panel-border)] hover:border-pink-500/50 transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] relative overflow-hidden flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mb-6 border border-pink-500/20 group-hover:scale-110 transition-transform duration-300">
               <ShieldAlert className="w-8 h-8 text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Admin Ops</h2>
            <p className="text-sm text-foreground/60">
              System analytics, loss ratios, and fraud detection metrics.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
