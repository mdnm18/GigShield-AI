"use client";

import { useEffect, useState } from "react";
import { Bell, Info, AlertTriangle } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Alerts & Notifications</h1>
        <p className="text-foreground/60 text-sm mt-1">Important updates regarding your account and coverage.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="glass-panel p-6 rounded-xl animate-pulse text-foreground/50 border border-[var(--panel-border)]">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center justify-center">
            <Bell className="w-12 h-12 text-foreground/20 mb-4" />
            <p className="text-foreground/50 text-sm">You have no alerts at this time.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className={`glass-panel p-5 rounded-xl border flex gap-4 ${notif.read ? 'border-[var(--panel-border)] opacity-70' : 'border-primary/40 bg-primary/5'}`}>
              <div className="mt-1">
                {notif.title.toLowerCase().includes("risk") || notif.title.toLowerCase().includes("alert") 
                  ? <AlertTriangle className="w-5 h-5 text-accent" />
                  : <Info className="w-5 h-5 text-primary" />
                }
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-foreground text-sm">{notif.title}</h3>
                  <span className="text-[10px] text-foreground/40">{new Date(notif.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-foreground/70 mt-1">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
