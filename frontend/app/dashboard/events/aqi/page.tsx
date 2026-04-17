"use client";

import { useEffect, useState } from "react";
import { Wind, AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";

interface AQIEvent {
  id: string; description: string; severity: string; city: string;
  thresholdValue: number | null; thresholdLimit: number | null;
  createdAt: string; triggered: boolean;
}

export default function AQIEventsPage() {
  const [events, setEvents] = useState<AQIEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events?type=aqi")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setEvents(data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Wind className="w-7 h-7 text-warning" /> Air Quality Events
        </h1>
        <p className="text-foreground/50 text-sm mt-1">AQI threshold breaches and air quality monitoring.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl text-center border border-warning/20 bg-warning/5">
          <p className="text-2xl font-bold">{events.length}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">AQI Events</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center border border-danger/20 bg-danger/5">
          <p className="text-2xl font-bold text-danger">{events.filter(e => e.triggered).length}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Breaches</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center">
          <p className="text-2xl font-bold">200</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Threshold</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-[var(--panel-border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--panel-border)] flex items-center gap-2">
          <Wind className="w-4 h-4 text-warning" />
          <h2 className="text-sm font-bold">AQI Event Log</h2>
        </div>
        <div className="divide-y divide-[var(--panel-border)]">
          {loading ? (
            <div className="p-6"><div className="skeleton h-6 w-48 mx-auto" /></div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-foreground/40">
              <Wind className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No AQI events recorded. Run a scan from the Events hub.</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="p-4 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-xl border",
                    event.triggered ? "text-danger border-danger/20 bg-danger/10" : "text-warning border-warning/20 bg-warning/10"
                  )}>
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground/90">{event.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-foreground/40">{event.city}</span>
                      {event.thresholdValue && (
                        <span className={cn("text-[10px] font-medium", event.thresholdValue > 200 ? "text-danger" : "text-warning")}>
                          AQI: {event.thresholdValue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn("badge text-[8px]", event.triggered ? "badge-danger" : "badge-neutral")}>
                    {event.triggered ? "BREACH" : "MONITORING"}
                  </span>
                  <p className="text-[10px] text-foreground/30 mt-1">
                    {new Date(event.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
