"use client";

import { useEffect, useState } from "react";
import { Bell, Info, AlertTriangle, Check, DollarSign, CloudLightning, CheckCheck } from "lucide-react";
import { cn } from "@/utils/cn";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const typeIcons: Record<string, React.ComponentType<{className?: string}>> = {
  event_alert: CloudLightning,
  claim_update: AlertTriangle,
  payment_confirmation: DollarSign,
  info: Info,
};

const typeBadge: Record<string, string> = {
  event_alert: "badge-warning",
  claim_update: "badge-info",
  payment_confirmation: "badge-success",
  info: "badge-neutral",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setNotifications(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts & Notifications</h1>
          <p className="text-foreground/50 text-sm mt-1">
            Important updates regarding your account and coverage.
            {unreadCount > 0 && <span className="text-primary font-semibold ml-2">{unreadCount} unread</span>}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="glass-panel px-4 py-2 rounded-xl text-success font-semibold text-sm hover:bg-success/10 transition-all flex items-center gap-2 border border-success/20 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          <>{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</>
        ) : notifications.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center">
            <Bell className="w-10 h-10 text-foreground/15 mb-3" />
            <p className="text-foreground/40 text-sm">You have no alerts at this time.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Info;
            const badgeClass = typeBadge[notif.type] || "badge-neutral";
            return (
              <div
                key={notif.id}
                className={cn(
                  "glass-panel p-4 rounded-xl border flex gap-4 transition-all",
                  notif.read
                    ? "border-[var(--panel-border)] opacity-60"
                    : "border-primary/30 bg-primary/[0.03]"
                )}
              >
                <div className="mt-0.5">
                  <div className={cn("p-2 rounded-lg border", badgeClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-foreground/90 text-sm">{notif.title}</h3>
                    <span className="text-[10px] text-foreground/30 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/60 mt-1 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn("badge text-[8px]", badgeClass)}>{notif.type.replace("_", " ")}</span>
                    {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
