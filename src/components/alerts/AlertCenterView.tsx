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
import { SpotlightCard } from "@/components/ui/SpotlightCard";

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
  const { alerts, markAlertAsRead, language } = useSentinel();
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");

  const filteredAlerts = alerts.filter(
    (a) => selectedSeverity === "All" || a.severity === selectedSeverity
  );

  const handleDismiss = (id: string) => {
    markAlertAsRead(id);
    onNotify(language === "bn" ? `অ্যালার্ট ${id} বাতিল করা হয়েছে` : `Alert ${id} acknowledged and dismissed.`);
  };

  const handleMarkAsRead = (id: string) => {
    markAlertAsRead(id);
    onNotify(language === "bn" ? `অ্যালার্ট ${id} পঠিত হিসেবে চিহ্নিত` : `Alert ${id} marked as read.`);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {language === "bn"
              ? "রিয়েল-টাইম সিগন্যাল ট্রিয়াজ • এসওসি অপারেশনস"
              : "REAL-TIME SIGNAL TRIAGE • SOC OPERATIONS"}
          </div>
          <h1 className="page-title text-slate-900">
            {language === "bn" ? "অ্যালার্ট ট্রিয়াজ সেন্টার" : "Alert Triage Center"}
          </h1>
          <p className="page-subtitle text-slate-500">
            {language === "bn"
              ? "রিস্ক ইঞ্জিন থেকে প্রাপ্ত ঝুঁকিপূর্ণ লেনদেনের সিগন্যাল পর্যবেক্ষণ, পর্যালোচনা ও পদক্ষেপ গ্রহণ করুন।"
              : "Triage, acknowledge, and escalate multi-signal fraud alerts emitted by the streaming risk engine."}
          </p>
        </div>
        <div className="live-label">
          <span className="pulse bg-rose-500" />
          <span className="text-slate-900 font-mono">
            {alerts.filter((a) => a.unread).length}{" "}
            {language === "bn" ? "টি অপঠিত গুরুতর অ্যালার্ট" : "UNREAD CRITICAL ALERTS"}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        {["All", "Critical", "High", "Medium"].map((sev) => {
          const label = language === "bn"
            ? (sev === "All" ? "সকল অ্যালার্ট" : sev === "Critical" ? "মারাত্মক" : sev === "High" ? "উচ্চ ঝুঁকি" : "মধ্যম")
            : `${sev} Priority`;
          return (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`btn text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                selectedSeverity === sev
                  ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Alert Cards List & Alert Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left: Alert Feed */}
        <div className="lg:col-span-8 space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="card-base p-8 text-center text-slate-400 border border-slate-200 bg-white">
              {language === "bn"
                ? "নির্বাচিত ফিল্টারে কোন অ্যালার্ট পাওয়া যায়নি।"
                : "No alerts match the selected priority filter."}
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <SpotlightCard
                key={alert.id}
                color="purple"
                glowSize="small"
                lightsEdges={true}
                lag="short"
                className={`card-base p-3.5 flex items-center gap-3.5 transition-all border border-slate-200 bg-white rounded-xl shadow-subtle hover-lift animate-fadeUp ${
                  alert.unread ? "border-l-4 border-l-rose-500" : ""
                }`}
              >
                {/* Icon Badge */}
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                    alert.severity === "Critical"
                      ? "bg-rose-50 text-rose-600 border-rose-200"
                      : alert.severity === "High"
                      ? "bg-amber-50 text-amber-600 border-amber-200"
                      : "bg-amber-50 text-amber-600 border-amber-200"
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
                    <span className="text-[10.5px] text-slate-400 font-mono">
                      {alert.timeAgo}
                    </span>
                    {alert.unread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {alert.title}
                  </h3>
                  <p className="text-[11.5px] text-slate-500 mt-0.5 truncate">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                    <span>{alert.id}</span>
                    <span>&bull;</span>
                    <span>AI Confidence: {alert.confidence}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="btn btn-ghost text-xs text-slate-500 hover:text-slate-800 px-2"
                  >
                    {language === "bn" ? "খারিজ" : "Dismiss"}
                  </button>
                  <button
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="btn btn-secondary text-xs px-2"
                    title={language === "bn" ? "পঠিত হিসেবে চিহ্নিত করুন" : "Mark as Read"}
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={() => onNavigate("investigation")}
                    className="btn btn-primary text-xs flex items-center gap-1 px-2.5"
                  >
                    <span>{language === "bn" ? "তদন্ত" : "Dossier"}</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </SpotlightCard>
            ))
          )}
        </div>

        {/* Right: Alert Summary */}
        <SpotlightCard
          color="purple"
          glowSize="medium"
          lightsEdges={true}
          lag="short"
          className="lg:col-span-4 p-4 flex flex-col justify-between space-y-4 border border-slate-200 bg-white rounded-xl shadow-subtle h-fit"
        >
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-200">
              {language === "bn" ? "২৪ ঘণ্টার সারসংক্ষেপ" : "24h Triage Rollup"}
            </h3>

            <div className="text-center py-3.5 border-b border-slate-200">
              <span className="text-3xl font-bold text-slate-900 block font-mono">
                284
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {language === "bn" ? "আজকের মোট শনাক্তকৃত সিগন্যাল" : "Total Signals Detected Today"}
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {[
                { label: language === "bn" ? "মারাত্মক ঝুঁকি" : "Critical Priority", count: 12, pct: "4.2%", badge: "badge-critical" },
                { label: language === "bn" ? "উচ্চ ঝুঁকি" : "High Risk", count: 38, pct: "13.4%", badge: "badge-high" },
                { label: language === "bn" ? "মধ্যম সতর্কতা" : "Medium Warning", count: 96, pct: "33.8%", badge: "badge-medium" },
                { label: language === "bn" ? "তথ্যমূলক" : "Low Informational", count: 138, pct: "48.6%", badge: "badge-low" },
              ].map((row) => (
                <div key={row.label} className="py-2 flex items-center justify-between">
                  <span className={`badge ${row.badge} text-[9.5px]`}>
                    {row.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <b className="text-slate-900 font-mono text-xs">{row.count}</b>
                    <span className="text-slate-400 text-[10.5px] font-mono">({row.pct})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>{language === "bn" ? "গড় শনাক্তকরণ সময় (MTTD):" : "Mean Time to Detect (MTTD):"}</span>
              <b className="font-mono text-slate-900">1.2 sec</b>
            </div>
            <div className="flex justify-between">
              <span>{language === "bn" ? "বিশ্লেষক পর্যালোচনার সময়:" : "Analyst Triage Latency:"}</span>
              <b className="font-mono text-slate-900">4m 12s</b>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
};
