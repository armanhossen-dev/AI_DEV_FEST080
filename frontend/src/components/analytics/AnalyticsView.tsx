"use client";

import React from "react";
import { NavigationPage } from "@/types";
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Activity,
  FileDown,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface AnalyticsViewProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenReport: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  onNavigate,
  onOpenReport,
}) => {
  const analyticsKpis = [
    {
      title: "Detection Rate",
      value: "96.4%",
      change: "+1.8% vs baseline",
      positive: true,
      icon: <ShieldCheck size={18} className="text-emerald-700" />,
      bg: "bg-emerald-50",
    },
    {
      title: "False Positive Rate",
      value: "3.2%",
      change: "−0.6% vs baseline",
      positive: true,
      icon: <Activity size={18} className="text-emerald-700" />,
      bg: "bg-emerald-50",
    },
    {
      title: "Avg Investigation Time",
      value: "18m 42s",
      change: "−12.4% faster with AI",
      positive: true,
      icon: <Clock size={18} className="text-indigo-600" />,
      bg: "bg-indigo-50",
    },
    {
      title: "Estimated Prevented Loss",
      value: "৳184.2M",
      change: "+22.1% recovered BDT",
      positive: true,
      icon: <DollarSign size={18} className="text-emerald-700" />,
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">EXECUTIVE INTELLIGENCE & MODEL MONITORING</div>
          <h1 className="page-title">Fraud Analytics & Metrics</h1>
          <p className="page-subtitle">
            Longitudinal fraud trends, ML model validation benchmarks, and operational ROI for upay executives.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReport}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <FileDown size={14} />
            <span>Generate Executive PDF / SAR</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3.5">
        {analyticsKpis.map((kpi, i) => (
          <div key={i} className="card-base p-4.5">
            <div className="flex items-center justify-between text-xs text-subtle font-medium">
              <span>{kpi.title}</span>
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center shrink-0`}>
                {kpi.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-ink mt-2 tracking-tight">
              {kpi.value}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              <span>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Card 1: Fraud by Transaction Type */}
        <div className="col-span-6 card-base p-5">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div>
              <h2 className="text-sm font-bold text-ink">Fraud by Transaction Type</h2>
              <p className="text-xs text-subtle">Frequency of high-risk vector attempts</p>
            </div>
            <span className="text-[11px] text-subtle font-mono">Last 30 Days</span>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            {[
              { type: "Wallet Transfer (P2P)", pct: 78, barClass: "bg-rose-500" },
              { type: "Cash Out (Agent Points)", pct: 61, barClass: "bg-amber-500" },
              { type: "Merchant Payment", pct: 38, barClass: "bg-yellow-500" },
              { type: "Add Money (Bank to Wallet)", pct: 24, barClass: "bg-emerald-500" },
              { type: "Mobile Recharge", pct: 12, barClass: "bg-teal-500" },
            ].map((item) => (
              <div
                key={item.type}
                onClick={() => onNavigate("transactions")}
                className="space-y-1 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-ink font-medium group-hover:text-emerald-800 transition-colors">
                    {item.type}
                  </span>
                  <b className="font-mono text-ink">{item.pct}%</b>
                </div>
                <div className="h-2 w-full bg-appBg rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.barClass}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Investigation Outcomes */}
        <div className="col-span-6 card-base p-5">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div>
              <h2 className="text-sm font-bold text-ink">Investigation Case Outcomes</h2>
              <p className="text-xs text-subtle">Resolution distribution across 1,248 cases</p>
            </div>
            <span className="text-[11px] text-subtle font-mono">1,248 Total Cases</span>
          </div>

          <div className="flex items-center gap-6 mt-4 py-2">
            {/* Outcome Donut */}
            <div className="w-32 h-32 rounded-full conic-gradient-custom relative shrink-0 shadow-xs flex items-center justify-center bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-500 p-2">
              <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center text-center shadow-inner">
                <b className="text-sm font-bold text-ink leading-tight">1,248</b>
                <span className="text-[9.5px] text-subtle">Resolved</span>
              </div>
            </div>

            {/* Outcome Breakdown List */}
            <div className="flex-1 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-ink">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Confirmed Fraud (Funds Blocked)
                </span>
                <b className="font-mono text-ink">42% (524)</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-ink">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  False Positive (Model tuned)
                </span>
                <b className="font-mono text-ink">28% (350)</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-ink">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Customer Verified (Biometric Pass)
                </span>
                <b className="font-mono text-ink">19% (237)</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-ink">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  Pending Additional Evidence
                </span>
                <b className="font-mono text-ink">11% (137)</b>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Model Performance Metrics */}
        <div className="col-span-12 card-base p-5">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div>
              <h2 className="text-sm font-bold text-ink">
                Machine Learning Model Performance & Telemetry
              </h2>
              <p className="text-xs text-subtle">
                Cross-validated evaluation benchmarks on held-out test split (120,000 synthetic records)
              </p>
            </div>
            <span className="badge badge-low flex items-center gap-1">
              <CheckCircle2 size={11} /> MODEL HEALTHY · v4.8.2
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            {[
              { metric: "Precision", score: "94.8%", sub: "Minimizes false customer friction", width: "94.8%" },
              { metric: "Recall", score: "96.1%", sub: "Catches 96 out of 100 actual fraud attempts", width: "96.1%" },
              { metric: "F1 Score", score: "95.4%", sub: "Harmonic mean of precision & recall", width: "95.4%" },
              { metric: "ROC-AUC", score: "98.2%", sub: "High separation between normal and fraud", width: "98.2%" },
            ].map((m) => (
              <div key={m.metric} className="p-3.5 bg-appBg rounded-xl border border-line space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-subtle font-semibold">{m.metric}</span>
                  <b className="text-ink text-sm font-bold font-mono">{m.score}</b>
                </div>
                <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-[#0e9f67] rounded-full" style={{ width: m.width }} />
                </div>
                <span className="text-[10px] text-subtle block">{m.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Real-time AI Model Monitoring & Drift */}
        <div className="col-span-12 card-base p-5">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Sparkles size={15} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">
                  Real-time AI Model Drift & Service Monitoring
                </h3>
                <p className="text-xs text-subtle">
                  Continuous distribution Kolmogorov-Smirnov test against reference baselines
                </p>
              </div>
            </div>
            <span className="text-xs text-subtle font-mono">Telemetry interval: 10s</span>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4 divide-x divide-line">
            {[
              { service: "Real-time Risk Engine", model: "XGBoost Classifier", drift: "0.012 (No drift)", status: "Optimal" },
              { service: "Anomaly Detection", model: "Isolation Forest + Autoencoder", drift: "0.018 (Stable)", status: "Optimal" },
              { service: "Graph Intelligence", model: "GraphSAGE Neural Network", drift: "0.009 (No drift)", status: "Optimal" },
              { service: "Investigation Copilot", model: "Google Gemini 1.5 Pro", drift: "Grounding verified", status: "Optimal" },
            ].map((s, idx) => (
              <div key={s.service} className={`text-xs space-y-1 ${idx > 0 ? "pl-4" : ""}`}>
                <b className="text-ink block">{s.service}</b>
                <span className="text-[11px] text-subtle block font-mono">{s.model}</span>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-subtle">Drift score:</span>
                  <span className="text-emerald-700 font-semibold font-mono text-[11px]">{s.drift}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
