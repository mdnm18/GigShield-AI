"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, LogIn, ArrowLeft, Bot, ShieldAlert } from "lucide-react";
import { cn } from "@/utils/cn";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleQuery = searchParams.get("role") || "worker";
  
  const [role, setRole] = useState(roleQuery);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOTPStep, setIsOTPStep] = useState(false);
  const [otp, setOtp] = useState("");
  const successMessage = searchParams.get("success") === "registered" ? "Account created successfully! Please log in." : null;

  const isWorker = role === "worker";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);

      const { loginUser } = await import("@/app/actions/auth");
      const result = await loginUser(formData);

      if (result.error) {
        setError(result.error);
        setLoading(false);
      // } else if ('requiresOTP' in result && result.requiresOTP) {
      //   setIsOTPStep(true);
      //   setLoading(false);
      } else {
        router.push(result.role === "admin" ? "/admin" : "/dashboard");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("otp", otp);
      formData.append("role", role);

      const { verifyOTP } = await import("@/app/actions/auth");
      const result = await verifyOTP(formData);

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push((result as any).role === "admin" ? "/admin" : "/dashboard");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Backgrounds based on Role */}
      <div className={cn(
        "absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] -translate-y-1/2 -z-10 transition-colors duration-1000",
        isWorker ? "bg-primary/20" : "bg-pink-500/20"
      )}></div>
      <div className={cn(
        "absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] -translate-y-1/2 -z-10 transition-colors duration-1000 delay-150",
        isWorker ? "bg-accent/20" : "bg-purple-500/20"
      )}></div>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <Link href="/" className="inline-flex items-center text-sm text-foreground/50 hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Selector
        </Link>
        
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-[var(--panel-border)] shadow-2xl relative overflow-hidden">
          {/* Subtle gradient overlay top */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-1",
             isWorker ? "bg-gradient-to-r from-primary to-accent" : "bg-gradient-to-r from-pink-500 to-purple-500"
          )}></div>

          <div className="text-center mb-8">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border",
              isWorker ? "bg-primary/10 border-primary/30" : "bg-pink-500/10 border-pink-500/30"
            )}>
              {isWorker ? <Bot className="w-8 h-8 text-primary" /> : <ShieldAlert className="w-8 h-8 text-pink-500" />}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isOTPStep ? "Verify OTP" : "Welcome Back"}
            </h1>
            <p className="text-sm text-foreground/60 mt-1">
              {isOTPStep 
                ? "We've sent a 6-digit code to your email." 
                : `Sign in to your ${isWorker ? "worker" : "administrator"} account`}
            </p>
          </div>

          {!isOTPStep ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-foreground/[0.03] border border-[var(--panel-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Password</label>
                  <Link href="#" className={cn("text-xs font-medium hover:underline", isWorker ? "text-primary/80" : "text-pink-500/80")}>
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-foreground/[0.03] border border-[var(--panel-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl">
                  {error}
                </div>
              )}
              {successMessage && !error && (
                <div className="p-3 mb-4 text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-xl">
                  {successMessage}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className={cn(
                  "w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg mt-2",
                  loading ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5",
                  isWorker 
                    ? "bg-primary/90 hover:bg-primary text-white shadow-primary/20" 
                    : "bg-pink-500/90 hover:bg-pink-500 text-white shadow-pink-500/20"
                )}
              >
                <LogIn className="w-4 h-4" /> {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
             <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider ml-1">One-Time Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    required
                    maxLength={6}
                    className="w-full bg-foreground/[0.03] border border-[var(--panel-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground text-center tracking-widest font-mono text-lg"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className={cn(
                  "w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg mt-2",
                  loading ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5",
                  isWorker 
                    ? "bg-primary/90 hover:bg-primary text-white shadow-primary/20" 
                    : "bg-pink-500/90 hover:bg-pink-500 text-white shadow-pink-500/20"
                )}
              >
                <LogIn className="w-4 h-4" /> {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsOTPStep(false)}
                  className="text-xs text-foreground/50 hover:text-foreground/80 transition-colors"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-foreground/60">
            Don't have an account?{" "}
            <Link href={`/register?role=${role}`} className={cn("font-semibold hover:underline", isWorker ? "text-primary" : "text-pink-500")}>
              Register here
            </Link>
          </div>
        </div>
        
        {/* Toggle Switch to swap roles easily */}
        <div className="mt-8 flex justify-center">
           <button 
             onClick={() => setRole(isWorker ? "admin" : "worker")}
             className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
           >
             Switch to {isWorker ? "Admin Login" : "Worker Login"}
           </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
