"use client";

import React, { useState } from "react";
import { AlertItem, NavigationPage, RiskLevel } from "@/types";
import { alertsList } from "@/lib/data";
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
  const [alerts, setAlerts] = useState<AlertItem[]>(alertsList);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");

  const filteredAlerts = alerts.filter(
    (a) => selectedSeverity === "All" || a.severity === selectedSeverity
  );

  const handleDismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    onNotify(`Alert ${id} dismissed.`);
  };

  const handleMarkAsRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, unread: false } : a))
    );
    onNotify(`Alert ${id} marked as read.`);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">INTELLIGENT ALERT TRIAGE</div>
          <h1 className="page-title">Alert Center</h1>
          <p className="page-subtitle">
            Review, prioritize and triage real-time AI-detected fraud signals across the MFS network.
          </p>
        </div>
        <div className="live-label">
          <span className="pulse" />
          <span>
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
                ? "btn-primary"
                : "btn-secondary text-gray-700"
            }`}
          >
            {sev} Severity
          </button>
        ))}
      </div>

      {/* Alert Cards List & Alert Summary Sidebar */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: Alert Feed */}
        <div className="col-span-8 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="card-base p-8 text-center text-gray-400">
              No alerts match the selected filter.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`card-base p-4 flex items-center gap-4 transition-all hover:border-gray-300 ${
                  alert.unread ? "bg-white border-l-4 border-l-rose-500" : "bg-gray-50/50"
                }`}
              >
                {/* Icon Badge */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.severity === "Critical"
                      ? "bg-rose-100 text-rose-600"
                      : alert.severity === "High"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {alert.iconType === "network" ? (
                    <Share2 size={20} />
                  ) : alert.iconType === "shield" ? (
                    <ShieldAlert size={20} />
                  ) : alert.iconType === "activity" ? (
                    <Activity size={20} />
                  ) : (
                    <Smartphone size={20} />
                  )}
                </div>

                {/* Copy */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
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
                    <span className="text-[11px] text-gray-400 font-mono">
                      {alert.timeAgo}
                    </span>
                    {alert.unread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 truncate">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 font-mono">
                    <span>{alert.id}</span>
                    <span>·</span>
                    <span>AI Confidence {alert.confidence}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="btn btn-ghost text-xs text-gray-400 hover:text-gray-700 px-2"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="btn btn-secondary text-xs px-2.5"
                    title="Mark as Read"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    onClick={() => onNavigate("investigation")}
                    className="btn btn-primary text-xs flex items-center gap-1 px-3"
                  >
                    <span>Investigate</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Alert Summary */}
        <div className="col-span-4 card-base p-5 flex flex-col justify-between h-fit space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              Today&apos;s Triage Summary
            </h3>

            <div className="text-center py-4 border-b border-gray-100">
              <span className="text-4xl font-extrabold text-gray-900 block leading-none">
                284
              </span>
              <span className="text-xs text-gray-400 mt-1 block">
                Total Signals Detected Today
              </span>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              {[
                { label: "Critical Priority", count: 12, pct: "4.2%", badge: "badge-critical" },
                { label: "High Risk", count: 38, pct: "13.4%", badge: "badge-high" },
                { label: "Medium Warning", count: 96, pct: "33.8%", badge: "badge-medium" },
                { label: "Low Informational", count: 138, pct: "48.6%", badge: "badge-low" },
              ].map((row) => (
                <div key={row.label} className="py-2.5 flex items-center justify-between">
                  <span className={`badge ${row.badge} text-[10px]`}>
                    {row.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <b className="text-gray-900 font-bold">{row.count}</b>
                    <span className="text-gray-400 text-[11px] font-mono">({row.pct})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-xs text-emerald-900 space-y-1">
            <div className="flex justify-between">
              <span>Avg. Mean Time to Detect (MTTD):</span>
              <b className="font-mono">1.2 sec</b>
            </div>
            <div className="flex justify-between">
              <span>Avg. Analyst Response Time:</span>
              <b className="font-mono">4m 12s</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
