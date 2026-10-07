"use client";

import React, { useState } from "react";
import { AlertItem, NavigationPage, RiskLevel } from "@/types";
import { useSentinel } from "@/context/SentinelContext";
import {
  Bell,
  Search,
  Share2,
  ShieldAlert,
  Activity,
  Smartphone,
  Check,
  Eye,
  ArrowRight,
  Filter,
} from "lucide-react";

interface AlertCenterViewProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenCase: (caseId: string) => void;
  onNotify: (msg: string) => void;
}

export const AlertCenterView: React.FC<AlertCenterViewProps> = ({
  onNavigate,
  onOpenCase,
  onNotify,
}) => {
  const { alerts, markAlertAsRead } = useSentinel();
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");

  const filteredAlerts = alerts.filter(
    (a) => selectedSeverity === "All" || a.severity === selectedSeverity
  );

  const handleDismiss = (id: string) => {
    markAlertAsRead(id);
    onNotify(`Alert ${id} acknowledged and dismissed.`);
  };

  const handleMarkAsRead = (id: string) => {
    markAlertAsRead(id);
    onNotify(`Alert ${id} marked as read.`);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-brand-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            REAL-TIME SIGNAL TRIAGE &bull; SOC OPERATIONS
          </div>
          <h1 className="page-title text-brand-text">Alert Triage Center</h1>
          <p className="page-subtitle text-brand-muted">
            Triage, acknowledge, and escalate multi-signal fraud alerts emitted by the streaming risk engine.
          </p>
        </div>
        <div className="live-label">
          <span className="pulse bg-rose-500" />
          <span className="text-brand-text font-mono">
            {alerts.filter((a) => a.unread).length} UNREAD CRITICAL ALERTS
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        {["All", "Critical", "High", "Medium"].map((sev) => (
          <button
            key={sev}
            onClick={() => setSelectedSeverity(sev)}
            className={`btn text-xs px-3 py-1 ${
              selectedSeverity === sev
                ? "btn-primary font-bold"
                : "btn-secondary text-brand-muted"
            }`}
          >
            {sev} Priority
          </button>
        ))}
      </div>

      {/* Alert Cards List & Alert Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left: Alert Feed */}
        <div className="lg:col-span-8 space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="card-base p-8 text-center text-brand-subtle border border-brand-border bg-brand-surface">
              No alerts match the selected priority filter.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`card-base p-3.5 flex items-center gap-3.5 transition-all border border-brand-border bg-brand-surface ${
                  alert.unread ? "border-l-3 border-l-rose-500" : ""
                }`}
              >
                {/* Icon Badge */}
                <div
                  className={`w-9 h-9 rounded border flex items-center justify-center shrink-0 ${
                    alert.severity === "Critical"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
                      : alert.severity === "High"
                      ? "bg-orange-500/10 text-orange-400 border-orange-500/25"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                  }`}
                >
                  {alert.iconType === "network" ? (
                    <Share2 size={16} />
                  ) : alert.iconType === "shield" ? (
                    <ShieldAlert size={16} />
                  ) : alert.iconType === "activity" ? (
                    <Activity size={16} />
                  ) : (
                    <Smartphone size={16} />
                  )}
                </div>

                {/* Copy */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`badge ${
                        alert.severity === "Critical"
                          ? "badge-critical"
                          : alert.severity === "High"
                          ? "badge-high"
                          : "badge-medium"
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10.5px] text-brand-subtle font-mono">
                      {alert.timeAgo}
                    </span>
                    {alert.unread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-brand-text truncate">
                    {alert.title}
                  </h3>
                  <p className="text-[11.5px] text-brand-muted mt-0.5 truncate">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-brand-subtle font-mono">
                    <span>{alert.id}</span>
                    <span>&bull;</span>
                    <span>AI Confidence: {alert.confidence}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="btn btn-ghost text-xs text-brand-subtle hover:text-brand-text px-2"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="btn btn-secondary text-xs px-2"
                    title="Mark as Read"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={() => onNavigate("investigation")}
                    className="btn btn-primary text-xs flex items-center gap-1 px-2.5"
                  >
                    <span>Dossier</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Alert Summary */}
        <div className="lg:col-span-4 card-base p-4 flex flex-col justify-between space-y-4 border border-brand-border bg-brand-surface h-fit">
          <div>
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wide pb-2 border-b border-brand-border">
              24h Triage Rollup
            </h3>

            <div className="text-center py-3.5 border-b border-brand-border">
              <span className="text-3xl font-bold text-brand-text block font-mono">
                284
              </span>
              <span className="text-[11px] text-brand-muted mt-0.5 block">
                Total Signals Detected Today
              </span>
            </div>

            <div className="divide-y divide-brand-border text-xs">
              {[
                { label: "Critical Priority", count: 12, pct: "4.2%", badge: "badge-critical" },
                { label: "High Risk", count: 38, pct: "13.4%", badge: "badge-high" },
                { label: "Medium Warning", count: 96, pct: "33.8%", badge: "badge-medium" },
                { label: "Low Informational", count: 138, pct: "48.6%", badge: "badge-low" },
              ].map((row) => (
                <div key={row.label} className="py-2 flex items-center justify-between">
                  <span className={`badge ${row.badge} text-[9.5px]`}>
                    {row.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <b className="text-brand-text font-mono text-xs">{row.count}</b>
                    <span className="text-brand-subtle text-[10.5px] font-mono">({row.pct})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-brand-elevated rounded border border-brand-border text-xs text-brand-muted space-y-1">
            <div className="flex justify-between">
              <span>Mean Time to Detect (MTTD):</span>
              <b className="font-mono text-brand-text">1.2 sec</b>
            </div>
            <div className="flex justify-between">
              <span>Analyst Triage Latency:</span>
              <b className="font-mono text-brand-text">4m 12s</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
