"use client";

import { useEffect, useState } from "react";
import { CreditCard, ArrowDownRight, ArrowUpRight, Receipt } from "lucide-react";
import { cn } from "@/utils/cn";

type Payment = {
  id: string;
  amount: number;
  type: string;
  status: string;
  date: string;
  description: string | null;
  transactionRef: string | null;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setPayments(data); })
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = payments.filter((p) => p.type === "premium_debit").reduce((a, p) => a + p.amount, 0);
  const totalReceived = payments.filter((p) => p.type === "payout").reduce((a, p) => a + p.amount, 0);

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="text-foreground/50 text-sm mt-1">Review your premiums, payouts, and billing details.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-warning/20 bg-warning/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold">Premiums Paid</p>
            <p className="text-2xl font-bold mt-1">₹{totalPaid.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-warning/15 rounded-xl"><ArrowUpRight className="w-5 h-5 text-warning" /></div>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-success/20 bg-success/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold">Payouts Received</p>
            <p className="text-2xl font-bold mt-1">₹{totalReceived.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-success/15 rounded-xl"><ArrowDownRight className="w-5 h-5 text-success" /></div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="glass-panel rounded-2xl border border-[var(--panel-border)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="skeleton h-6 w-48 mx-auto" /></div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-foreground/40 flex flex-col items-center">
            <CreditCard className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No payment history available.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--panel-border)]">
            {payments.map((payment) => {
              const isPayout = payment.type === "payout";
              return (
                <div key={payment.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2.5 rounded-xl border",
                      isPayout ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
                    )}>
                      {isPayout ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground/90">{payment.description || (isPayout ? "Claim Payout" : "Premium Debit")}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-foreground/40">{new Date(payment.date).toLocaleString()}</span>
                        {payment.transactionRef && (
                          <span className="text-[10px] text-foreground/30 font-mono">{payment.transactionRef}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("font-bold text-lg", isPayout ? "text-success" : "text-foreground")}>
                      {isPayout ? "+" : "-"}₹{Math.abs(payment.amount).toFixed(2)}
                    </p>
                    <span className={cn("badge text-[8px] mt-1",
                      payment.status === "completed" ? "badge-success" : "badge-warning"
                    )}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
