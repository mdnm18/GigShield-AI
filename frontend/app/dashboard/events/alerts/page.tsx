"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CloudLightning, Shield } from "lucide-react";
import { cn } from "@/utils/cn";

interface AlertEvent {
  id: string; type: string; description: string; severity: string;
  city: string; createdAt: string; triggered: boolean;
  _count?: { claims: number };
}

export default function EventAlertsPage() {
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events?triggered=true")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setEvents(data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-danger" /> Active Alerts
        </h1>
        <p className="text-foreground/50 text-sm mt-1">All triggered parametric events that generated auto-claims.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-xl text-center border border-danger/20 bg-danger/5">
          <p className="text-3xl font-bold text-danger">{events.length}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Active Triggers</p>
        </div>
        <div className="glass-panel p-5 rounded-xl text-center border border-pink/20 bg-pink/5">
          <p className="text-3xl font-bold text-pink">
            {events.reduce((a, e) => a + (e._count?.claims || 0), 0)}
          </p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Auto-Claims Generated</p>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <>{[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</>
        ) : events.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <Shield className="w-10 h-10 text-success/30 mx-auto mb-3" />
            <h3 className="font-bold text-success/70">All Clear</h3>
            <p className="text-sm text-foreground/40 mt-1">No active parametric triggers.</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="glass-panel p-5 rounded-xl border border-danger/20 bg-danger/[0.03]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-danger/10 border border-danger/20">
                    <CloudLightning className="w-5 h-5 text-danger" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground/90">{event.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={cn("badge text-[8px]",
                        event.severity === "critical" ? "badge-danger" :
                        event.severity === "high" ? "badge-warning" : "badge-info"
                      )}>
                        {event.severity}
                      </span>
                      <span className="text-[10px] text-foreground/40">{event.city}</span>
                      <span className="text-[10px] text-foreground/40">{event.type}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {event._count && event._count.claims > 0 && (
                    <p className="text-xs text-pink font-bold">{event._count.claims} claims</p>
                  )}
                  <p className="text-[10px] text-foreground/30 mt-1">
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
