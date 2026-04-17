"use client";

import { useEffect, useState } from "react";
import { CloudLightning, CloudRain, Wind, Thermometer, AlertTriangle, RefreshCw, MapPin, Zap } from "lucide-react";
import { cn } from "@/utils/cn";

interface EventRecord {
  id: string;
  type: string;
  severity: string;
  city: string;
  triggered: boolean;
  description: string;
  rawData: string | null;
  thresholdValue: number | null;
  thresholdLimit: number | null;
  createdAt: string;
  _count?: { claims: number };
}

interface SensorData {
  weather: { condition: string; rainfall: number; temperature: number; city: string };
  aqi: { aqi: number; city: string };
  traffic: { density: string; city: string };
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [selectedCity, setSelectedCity] = useState("Metropolitian");

  const cities = ["Metropolitian", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"];

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (Array.isArray(data)) setEvents(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const scanEnvironment = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: selectedCity }),
      });
      const data = await res.json();
      if (data.sensorData) setSensorData(data.sensorData);
      await fetchEvents();
    } catch (e) { console.error(e); }
    setScanning(false);
  };

  const triggeredEvents = events.filter((e) => e.triggered);
  const recentEvents = events.slice(0, 20);

  const severityColor = (s: string) => {
    switch (s) {
      case "critical": return "text-danger border-danger/20 bg-danger/10";
      case "high": return "text-warning border-warning/20 bg-warning/10";
      case "moderate": return "text-accent border-accent/20 bg-accent/10";
      default: return "text-foreground/50 border-foreground/10 bg-foreground/5";
    }
  };

  return (
    <div className="space-y-6 stagger-children">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Monitor</h1>
          <p className="text-foreground/50 text-sm mt-1">
            Real-time environmental scanning & parametric trigger detection.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="glass-panel px-3 py-2 rounded-xl text-xs font-medium border border-[var(--panel-border)] bg-transparent text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {cities.map((c) => <option key={c} value={c} className="bg-[var(--background)]">{c}</option>)}
          </select>
          <button
            onClick={scanEnvironment}
            disabled={scanning}
            className={cn(
              "glass-panel px-4 py-2.5 rounded-xl text-primary font-semibold text-sm transition-all flex items-center gap-2 border border-primary/20 cursor-pointer",
              scanning ? "opacity-60" : "hover:glow-primary hover:border-primary/40"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", scanning && "animate-spin")} />
            {scanning ? "Scanning..." : "Scan Now"}
          </button>
        </div>
      </div>

      {/* Live Sensor Cards */}
      {sensorData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up">
          {/* Weather */}
          <div className="glass-panel p-5 rounded-2xl border border-[var(--panel-border)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-accent/15 rounded-xl border border-accent/20">
                <CloudRain className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold">Weather</p>
                <p className="text-lg font-bold">{sensorData.weather.condition}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 rounded-lg bg-foreground/5">
                <p className="text-foreground/40">Rainfall</p>
                <p className="font-bold text-foreground/80">{sensorData.weather.rainfall}mm</p>
              </div>
              <div className="p-2 rounded-lg bg-foreground/5">
                <p className="text-foreground/40">Temperature</p>
                <p className="font-bold text-foreground/80">{sensorData.weather.temperature}°C</p>
              </div>
            </div>
          </div>

          {/* AQI */}
          <div className="glass-panel p-5 rounded-2xl border border-[var(--panel-border)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-warning/15 rounded-xl border border-warning/20">
                <Wind className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold">Air Quality</p>
                <p className={cn("text-lg font-bold",
                  sensorData.aqi.aqi > 200 ? "text-danger" : sensorData.aqi.aqi > 100 ? "text-warning" : "text-success"
                )}>
                  AQI {sensorData.aqi.aqi}
                </p>
              </div>
            </div>
            <div className="w-full bg-foreground/10 rounded-full h-2 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700",
                  sensorData.aqi.aqi > 200 ? "bg-danger" : sensorData.aqi.aqi > 100 ? "bg-warning" : "bg-success"
                )}
                style={{ width: `${Math.min(sensorData.aqi.aqi / 5, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-foreground/40 mt-2">
              {sensorData.aqi.aqi > 200 ? "Hazardous — triggers active" : sensorData.aqi.aqi > 100 ? "Moderate — monitoring" : "Good — safe to operate"}
            </p>
          </div>

          {/* Traffic */}
          <div className="glass-panel p-5 rounded-2xl border border-[var(--panel-border)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-pink/15 rounded-xl border border-pink/20">
                <MapPin className="w-5 h-5 text-pink" />
              </div>
              <div>
                <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold">Traffic</p>
                <p className={cn("text-lg font-bold",
                  sensorData.traffic.density === "Jam" ? "text-danger" : sensorData.traffic.density === "High" ? "text-warning" : "text-foreground"
                )}>
                  {sensorData.traffic.density}
                </p>
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              {["Low", "Medium", "High", "Jam"].map((level) => (
                <div
                  key={level}
                  className={cn("h-2 flex-1 rounded-full transition-all",
                    level === sensorData.traffic.density ? (
                      level === "Jam" ? "bg-danger" : level === "High" ? "bg-warning" : level === "Medium" ? "bg-accent" : "bg-success"
                    ) : "bg-foreground/10"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl text-center">
          <p className="text-2xl font-bold">{events.length}</p>
          <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold mt-1">Total Events</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-danger">{triggeredEvents.length}</p>
          <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold mt-1">Triggers</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-warning">
            {triggeredEvents.filter((e) => e.severity === "critical" || e.severity === "high").length}
          </p>
          <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold mt-1">High Severity</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-success">
            {triggeredEvents.reduce((acc, e) => acc + (e._count?.claims || 0), 0)}
          </p>
          <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-bold mt-1">Auto-Claims</p>
        </div>
      </div>

      {/* Event Log */}
      <div className="glass-panel rounded-2xl border border-[var(--panel-border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--panel-border)] flex items-center gap-2">
          <Zap className="w-4 h-4 text-warning" />
          <h2 className="text-sm font-bold">Event Log</h2>
        </div>
        <div className="divide-y divide-[var(--panel-border)]">
          {loading ? (
            <div className="p-6 text-center">
              <div className="skeleton h-6 w-48 mx-auto" />
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="p-8 text-center text-foreground/40 flex flex-col items-center">
              <CloudLightning className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No events recorded yet.</p>
              <p className="text-xs mt-1">Click "Scan Now" to start monitoring.</p>
            </div>
          ) : (
            recentEvents.map((event) => (
              <div key={event.id} className="p-4 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-xl border", severityColor(event.severity))}>
                    {event.type === "weather" ? <CloudRain className="w-4 h-4" /> :
                     event.type === "aqi" ? <Wind className="w-4 h-4" /> :
                     <MapPin className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground/90">{event.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-foreground/40">{event.city}</span>
                      <span className={cn("badge text-[8px]", severityColor(event.severity))}>
                        {event.severity}
                      </span>
                      {event.triggered && (
                        <span className="badge badge-danger text-[8px]">TRIGGERED</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-foreground/40">
                    {new Date(event.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {event._count && event._count.claims > 0 && (
                    <p className="text-[10px] text-pink font-bold mt-1">{event._count.claims} claims</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
