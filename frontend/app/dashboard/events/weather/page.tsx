"use client";

import { useEffect, useState } from "react";
import { CloudRain, Thermometer, Droplets, Wind, RefreshCw } from "lucide-react";
import { cn } from "@/utils/cn";

interface WeatherEvent {
  id: string; description: string; severity: string; city: string;
  thresholdValue: number | null; createdAt: string; triggered: boolean;
  rawData: string | null;
}

export default function WeatherEventsPage() {
  const [events, setEvents] = useState<WeatherEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events?type=weather")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setEvents(data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <CloudRain className="w-7 h-7 text-accent" /> Weather Events
        </h1>
        <p className="text-foreground/50 text-sm mt-1">Storm, rainfall, and extreme weather monitoring.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl text-center border border-accent/20 bg-accent/5">
          <p className="text-2xl font-bold">{events.length}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Total Events</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center border border-danger/20 bg-danger/5">
          <p className="text-2xl font-bold text-danger">{events.filter(e => e.triggered).length}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Triggers</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center border border-warning/20 bg-warning/5">
          <p className="text-2xl font-bold text-warning">{events.filter(e => e.severity === "critical" || e.severity === "high").length}</p>
          <p className="text-[10px] text-foreground/40 uppercase font-bold mt-1">Severe</p>
        </div>
      </div>

      {/* Event List */}
      <div className="glass-panel rounded-2xl border border-[var(--panel-border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--panel-border)] flex items-center gap-2">
          <Droplets className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-bold">Weather Event Log</h2>
        </div>
        <div className="divide-y divide-[var(--panel-border)]">
          {loading ? (
            <div className="p-6"><div className="skeleton h-6 w-48 mx-auto" /></div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-foreground/40">
              <CloudRain className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No weather events recorded. Run a scan from the Events hub.</p>
            </div>
          ) : (
            events.map((event) => {
              let parsed: Record<string, unknown> | null = null;
              try { if (event.rawData) parsed = JSON.parse(event.rawData); } catch {}
              const weather = parsed?.weather as { condition?: string; rainfall?: number; temperature?: number } | undefined;

              return (
                <div key={event.id} className="p-4 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-xl border",
                      event.severity === "critical" ? "text-danger border-danger/20 bg-danger/10" :
                      event.severity === "high" ? "text-warning border-warning/20 bg-warning/10" :
                      "text-accent border-accent/20 bg-accent/10"
                    )}>
                      <CloudRain className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground/90">{event.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-foreground/40">{event.city}</span>
                        {weather?.rainfall !== undefined && (
                          <span className="text-[10px] text-accent flex items-center gap-1">
                            <Droplets className="w-2.5 h-2.5" /> {weather.rainfall}mm
                          </span>
                        )}
                        {weather?.temperature !== undefined && (
                          <span className="text-[10px] text-foreground/40 flex items-center gap-1">
                            <Thermometer className="w-2.5 h-2.5" /> {weather.temperature}°C
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn("badge text-[8px]",
                      event.triggered ? "badge-danger" : "badge-neutral"
                    )}>
                      {event.triggered ? "TRIGGERED" : "MONITORING"}
                    </span>
                    <p className="text-[10px] text-foreground/30 mt-1">
                      {new Date(event.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
