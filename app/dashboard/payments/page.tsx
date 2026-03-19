"use client";

import { useEffect, useState } from "react";
import { CreditCard, ArrowDownRight, ArrowUpRight } from "lucide-react";

type Payment = {
  id: string;
  amount: number;
  status: string;
  date: string;
  description: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments")
      .then((res) => res.json())
      .then((data) => {
        setPayments(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Payments History</h1>
        <p className="text-foreground/60 text-sm mt-1">Review your premiums and transparent billing details.</p>
      </div>

      <div className="glass-panel rounded-2xl border border-[var(--panel-border)] overflow-hidden">
        {loading ? (
          <div className="p-8 animate-pulse text-center text-foreground/50">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-foreground/50 flex flex-col items-center">
            <CreditCard className="w-12 h-12 mb-4 opacity-30" />
            <p>No billing or payment history available.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--panel-border)]">
            {payments.map((payment) => (
              <div key={payment.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${payment.amount > 0 ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>
                    {payment.amount > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{payment.description || "Premium Auto-Debit"}</h4>
                    <span className="text-xs text-foreground/50">{new Date(payment.date).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${Math.abs(payment.amount).toFixed(2)}</p>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block ${payment.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
