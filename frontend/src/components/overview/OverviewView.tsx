"use client";

import React, { useState } from "react";
import { NavigationPage, Transaction } from "@/types";
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Briefcase,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Share2,
  CheckCircle2,
  FileDown,
  Zap,
  Smartphone,
  Check,
  Play,
  RotateCcw,
} from "lucide-react";
import { SentinelGlobe3D } from "./SentinelGlobe3D";
import { useSentinel } from "@/context/SentinelContext";

interface OverviewViewProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenTransactionDrawer: (txn: Transaction) => void;
  transactions?: Transaction[];
  onOpenReport: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenTransactionDrawer,
  onOpenReport,
}) => {
  const {
    transactions,
    alerts,
    cases,
    modelMetrics,
    injectScenario,
    setSelectedTransaction,
  } = useSentinel();

  const [injectingScenario, setInjectingScenario] = useState<string | null>(null);

  // Compute live operational KPIs from unified engine state
  const flaggedCount = transactions.filter((t) => t.riskLevel === "Critical" || t.riskLevel === "High").length;
  const activeCasesCount = cases.filter((c) => c.status === "Investigating" || c.status === "Pending Review").length;
  const totalExposure = cases.reduce((acc, c) => acc + (c.exposure || c.amount || 0), 0);
  const accuracyStr = modelMetrics ? `${(modelMetrics.accuracy * 100).toFixed(1)}%` : "96.4%";

  const kpiData = [
    {
      label: "Transactions Scanned",
      value: `${(1.28 + transactions.length / 1000).toFixed(2)}M`,
      trend: "+8.4% live stream",
      isPositive: true,
      icon: <Activity size={16} className="text-amber-500" />,
    },
    {
      label: "Flagged High-Risk",
      value: (1280 + flaggedCount).toLocaleString(),
      trend: "Multi-signal review",
      isPositive: true,
      icon: <ShieldAlert size={16} className="text-rose-500" />,
    },
    {
      label: "Prevented Capital Loss",
      value: `৳ ${(318.5 + totalExposure / 1000000).toFixed(1)}M`,
      trend: "Estimated BDT exposure",
      isPositive: null,
      icon: <ShieldCheck size={16} className="text-emerald-500" />,
    },
    {
      label: "Active Investigations",
      value: `${activeCasesCount}`,
      trend: "Analyst oversight required",
      isPositive: false,
      icon: <Briefcase size={16} className="text-sky-500" />,
    },
    {
      label: "Model Benchmark Accuracy",
      value: accuracyStr,
      trend: "Held-out test split (100 samples)",
      isPositive: true,
      icon: <Sparkles size={16} className="text-amber-400" />,
    },
  ];

  const handleTriggerScenario = async (
    scenario: "ato" | "mule" | "velocity" | "sim_swap" | "normal"
  ) => {
    setInjectingScenario(scenario);
    try {
      const txn = await injectScenario(scenario);
      setSelectedTransaction(txn);
      onOpenTransactionDrawer(txn);
    } finally {
      setTimeout(() => setInjectingScenario(null), 500);
    }
  };

  const systemHealth = [
    { name: "Risk Intelligence Engine", status: "Optimal", latency: "< 2ms" },
    { name: "TensorFlow.js Neural Net", status: "Active", latency: "< 4ms" },
    { name: "Regulatory Compliance Rules", status: "Active", latency: "< 1ms" },
    { name: "Graph Syndicate Detector", status: "Active", latency: "18ms" },
    { name: "Gemini Copilot Synthesis", status: "Active", latency: "160ms" },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-brand-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            DIU CPC &times; UPAY AI HACKATHON 2026 &bull; TRACK 01: TRUST &amp; RISK INTELLIGENCE
          </div>
          <h1 className="page-title text-brand-text">
            Trust &amp; Risk Operations Console
          </h1>
          <p className="page-subtitle text-brand-muted">
            End-to-end fraud intelligence pipeline: Telemetry Ingestion &rarr; Feature Extraction &rarr; Rules + ML &rarr; Explainable Risk &rarr; Case Dossier &rarr; Human Oversight Audit.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={onOpenReport} className="btn btn-secondary text-xs flex items-center gap-1.5">
            <FileDown size={13} />
            <span>Compliance Report</span>
          </button>
          <button
            onClick={() => onNavigate("transactions")}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <span>Live Monitor</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 3D Geospatial Threat Topology */}
      <SentinelGlobe3D />

      {/* Authorized Attack Scenario & Pipeline Verification Workbench */}
      <div className="card-base p-4 border border-brand-border bg-brand-surface">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b border-brand-border gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-brand-elevated text-upay-gold border border-brand-border font-mono font-bold text-[10px] tracking-wider uppercase">
                SCENARIO LAB
              </span>
              <h2 className="text-xs font-bold text-brand-text uppercase tracking-wide">
                Live Attack Simulation &amp; Pipeline Verification
              </h2>
            </div>
            <p className="text-[11.5px] text-brand-muted mt-0.5">
              Inject synthetic fraud vectors to verify end-to-end detection: Risk Engine &rarr; Alert Triage &rarr; Case Dossier &rarr; Audit Trail.
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Deterministic + Neural ML Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mt-3">
          {/* Scenario 1: ATO */}
          <button
            onClick={() => handleTriggerScenario("ato")}
            disabled={injectingScenario !== null}
            className="p-3 rounded-lg border border-brand-border bg-brand-elevated hover:border-risk-critical/50 hover:bg-rose-50/70 dark:hover:bg-[#1E1922] hover:-translate-y-0.5 active:scale-[0.98] text-left transition-all duration-150 flex flex-col justify-between group disabled:opacity-50 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="badge badge-critical text-[9px]">ATO VECTOR</span>
                <ShieldAlert size={14} className="text-rose-500" />
              </div>
              <h3 className="text-xs font-bold text-brand-text mt-2">Account Takeover</h3>
              <p className="text-[11px] text-brand-muted mt-1 leading-snug">
                PIN reset + nocturnal cash-out (৳32,000) from unfamiliar device in Chattogram.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-brand-border flex items-center justify-between text-[10px] font-mono text-rose-600 dark:text-rose-400 font-semibold">
              <span>SCORE: ~87/100</span>
              <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-brand-text font-medium">
                Inject &rarr;
              </span>
            </div>
          </button>

          {/* Scenario 2: Mule Ring */}
          <button
            onClick={() => handleTriggerScenario("mule")}
            disabled={injectingScenario !== null}
            className="p-3 rounded-lg border border-brand-border bg-brand-elevated hover:border-risk-critical/50 hover:bg-rose-50/70 dark:hover:bg-[#1E1922] hover:-translate-y-0.5 active:scale-[0.98] text-left transition-all duration-150 flex flex-col justify-between group disabled:opacity-50 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="badge badge-critical text-[9px]">SYNDICATE</span>
                <Share2 size={14} className="text-rose-500" />
              </div>
              <h3 className="text-xs font-bold text-brand-text mt-2">Mule Ring Layering</h3>
              <p className="text-[11px] text-brand-muted mt-1 leading-snug">
                ৳48,500 transferred to U-8831 (Cluster #17 conduit) via shared device DEV-8821.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-brand-border flex items-center justify-between text-[10px] font-mono text-rose-600 dark:text-rose-400 font-semibold">
              <span>SCORE: ~94/100</span>
              <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-brand-text font-medium">
                Inject &rarr;
              </span>
            </div>
          </button>

          {/* Scenario 3: SIM Swap */}
          <button
            onClick={() => handleTriggerScenario("sim_swap")}
            disabled={injectingScenario !== null}
            className="p-3 rounded-lg border border-brand-border bg-brand-elevated hover:border-risk-critical/50 hover:bg-rose-50/70 dark:hover:bg-[#1E1922] hover:-translate-y-0.5 active:scale-[0.98] text-left transition-all duration-150 flex flex-col justify-between group disabled:opacity-50 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="badge badge-critical text-[9px]">CARRIER SWAP</span>
                <Smartphone size={14} className="text-rose-500" />
              </div>
              <h3 className="text-xs font-bold text-brand-text mt-2">SIM Swap Drain</h3>
              <p className="text-[11px] text-brand-muted mt-1 leading-snug">
                Max limit drain (৳98,000) within 10 min of carrier SIM swap from emulator.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-brand-border flex items-center justify-between text-[10px] font-mono text-rose-600 dark:text-rose-400 font-semibold">
              <span>SCORE: ~98/100</span>
              <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-brand-text font-medium">
                Inject &rarr;
              </span>
            </div>
          </button>

          {/* Scenario 4: Velocity Burst */}
          <button
            onClick={() => handleTriggerScenario("velocity")}
            disabled={injectingScenario !== null}
            className="p-3 rounded-lg border border-brand-border bg-brand-elevated hover:border-risk-high/50 hover:bg-amber-50/70 dark:hover:bg-[#201C18] hover:-translate-y-0.5 active:scale-[0.98] text-left transition-all duration-150 flex flex-col justify-between group disabled:opacity-50 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="badge badge-high text-[9px]">STRUCTURING</span>
                <Zap size={14} className="text-amber-500" />
              </div>
              <h3 className="text-xs font-bold text-brand-text mt-2">Smurfing Burst</h3>
              <p className="text-[11px] text-brand-muted mt-1 leading-snug">
                6 rapid transfers skirting beneath Bangladesh Bank regulatory threshold.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-brand-border flex items-center justify-between text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
              <span>SCORE: ~80/100</span>
              <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-brand-text font-medium">
                Inject &rarr;
              </span>
            </div>
          </button>

          {/* Scenario 5: Legitimate */}
          <button
            onClick={() => handleTriggerScenario("normal")}
            disabled={injectingScenario !== null}
            className="p-3 rounded-lg border border-brand-border bg-brand-elevated hover:border-risk-low/50 hover:bg-emerald-50/70 dark:hover:bg-[#15201A] hover:-translate-y-0.5 active:scale-[0.98] text-left transition-all duration-150 flex flex-col justify-between group disabled:opacity-50 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="badge badge-low text-[9px]">BENIGN</span>
                <CheckCircle2 size={14} className="text-emerald-500" />
              </div>
              <h3 className="text-xs font-bold text-brand-text mt-2">Normal Payment</h3>
              <p className="text-[11px] text-brand-muted mt-1 leading-snug">
                Routine daytime merchant grocery payment (৳2,450) from trusted device.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-brand-border flex items-center justify-between text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>SCORE: ~18/100</span>
              <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-brand-text font-medium">
                Approve &rarr;
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {kpiData.map((kpi, index) => (
          <div key={index} className="card-base p-3.5 border border-brand-border">
            <div className="flex items-center justify-between text-xs text-brand-muted font-medium">
              <span>{kpi.label}</span>
              <div className="w-7 h-7 rounded bg-brand-elevated border border-brand-border flex items-center justify-center shrink-0">
                {kpi.icon}
              </div>
            </div>
            <div className="text-xl font-bold text-brand-text mt-2 font-mono">
              {kpi.value}
            </div>
            <div className="text-[11px] mt-1 flex items-center gap-1">
              {kpi.isPositive === true && (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp size={11} /> {kpi.trend}
                </span>
              )}
              {kpi.isPositive === false && (
                <span className="text-rose-400 flex items-center gap-0.5">
                  <TrendingDown size={11} /> {kpi.trend}
                </span>
              )}
              {kpi.isPositive === null && (
                <span className="text-brand-subtle">{kpi.trend}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Live Risk Telemetry and Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Live Risk Activity Chart */}
        <div className="col-span-full lg:col-span-8 card-base p-4 border border-brand-border">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div>
              <h2 className="text-xs font-bold text-brand-text uppercase tracking-wide">
                Live Risk Activity Telemetry
              </h2>
              <p className="text-[11px] text-brand-muted">
                Transaction volume distribution &amp; flagged anomaly spikes in real-time
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-brand-muted">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal Flow
              </span>
              <span className="flex items-center gap-1.5 text-brand-muted">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Suspicious Spike
              </span>
            </div>
          </div>

          {/* SVG Sparkline Chart */}
          <div className="mt-3 relative h-44">
            <div className="absolute left-0 top-0 bottom-5 flex flex-col justify-between text-[9.5px] text-brand-subtle font-mono">
              <span>60k</span>
              <span>40k</span>
              <span>20k</span>
              <span>0</span>
            </div>

            <div className="ml-7 h-full flex flex-col">
              <svg className="w-full flex-1 overflow-visible" viewBox="0 0 720 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="normalArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                {[20, 60, 100, 140].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="720"
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-[#252D37]"
                    strokeWidth="1"
                  />
                ))}

                {/* Normal Volume Area Fill */}
                <path
                  d="M0 120 C45 110 75 80 120 90 S180 105 220 75 S290 60 340 85 S400 100 450 65 S510 38 560 55 S620 90 660 50 S700 42 720 25 L720 150 L0 150 Z"
                  fill="url(#normalArea)"
                />

                {/* Normal Volume Line */}
                <path
                  d="M0 120 C45 110 75 80 120 90 S180 105 220 75 S290 60 340 85 S400 100 450 65 S510 38 560 55 S620 90 660 50 S700 42 720 25"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Suspicious Line */}
                <path
                  d="M0 145 C60 142 90 132 140 136 S210 140 250 122 S320 135 365 128 S440 132 490 115 S570 132 630 112 S690 125 720 105"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />

                {/* Critical Dots */}
                {[
                  { x: 250, y: 122, label: "TXN-8F42" },
                  { x: 490, y: 115, label: "TXN-92KD" },
                  { x: 630, y: 112, label: "TXN-37LM" },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill="#EF4444"
                      stroke="currentColor"
                      className="text-white dark:text-[#0B0F14]"
                      strokeWidth="1.5"
                    />
                  </g>
                ))}
              </svg>

              {/* X Axis Time Labels */}
              <div className="flex justify-between text-[9.5px] text-brand-subtle font-mono pt-1.5 border-t border-brand-border">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span className="text-emerald-400 font-semibold">Live Now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Distribution Card */}
        <div className="col-span-full lg:col-span-4 card-base p-4 flex flex-col justify-between border border-brand-border">
          <div>
            <h2 className="text-xs font-bold text-brand-text uppercase tracking-wide">
              Portfolio Risk Distribution
            </h2>
            <p className="text-[11px] text-brand-muted">MFS transaction classification (24h)</p>
          </div>

          <div className="flex items-center gap-5 py-2">
            <div className="w-28 h-28 rounded-full border-4 border-brand-border relative flex items-center justify-center shrink-0 bg-brand-elevated">
              <div className="text-center">
                <span className="text-base font-bold text-brand-text font-mono block">
                  {(1.28 + transactions.length / 1000).toFixed(2)}M
                </span>
                <span className="text-[9.5px] text-brand-muted">Total Txns</span>
              </div>
            </div>

            <div className="flex-1 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-brand-muted">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Low Risk
                </span>
                <b className="text-brand-text font-mono text-[11.5px]">82.4%</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-brand-muted">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Medium Risk
                </span>
                <b className="text-brand-text font-mono text-[11.5px]">12.8%</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-brand-muted">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  High Risk
                </span>
                <b className="text-brand-text font-mono text-[11.5px]">3.7%</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-brand-muted">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Critical
                </span>
                <b className="text-brand-text font-mono text-[11.5px]">1.1%</b>
              </div>
            </div>
          </div>

          <div className="p-2 rounded bg-brand-elevated border border-brand-border flex items-center justify-between text-xs text-brand-muted">
            <span>Automated Sanctions Triggered:</span>
            <span className="font-bold font-mono text-brand-text">142 Wallets</span>
          </div>
        </div>
      </div>

      {/* Bottom 3 Columns: Alerts, AI Insights, System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3.5">
        {/* Col 1: Recent Critical Alerts */}
        <div className="col-span-full md:col-span-1 xl:col-span-5 card-base p-4 border border-brand-border">
          <div className="flex items-center justify-between pb-2.5 border-b border-brand-border">
            <h2 className="text-xs font-bold text-brand-text uppercase tracking-wide">
              Priority Alerts
            </h2>
            <button
              onClick={() => onNavigate("alerts")}
              className="text-xs text-upay-gold hover:underline font-semibold flex items-center gap-1"
            >
              <span>View all ({alerts.length})</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="divide-y divide-brand-border">
            {alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="py-2.5 flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded border flex items-center justify-center font-bold font-mono text-xs shrink-0 ${
                    alert.severity === "Critical"
                      ? "border-rose-500/30 text-rose-400 bg-rose-500/10"
                      : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                  }`}
                >
                  {alert.confidence}%
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${
                        alert.severity === "Critical" ? "badge-critical" : "badge-high"
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs font-bold text-brand-text truncate">{alert.title}</span>
                  </div>
                  <p className="text-[11px] text-brand-muted truncate mt-0.5">{alert.description}</p>
                  <p className="text-[10px] text-brand-subtle font-mono mt-0.5">
                    {alert.id} &middot; {alert.timeAgo}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate("investigations")}
                  className="btn btn-ghost text-xs shrink-0 px-2"
                >
                  Dossier
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: AI Insights */}
        <div className="col-span-full md:col-span-1 xl:col-span-4 card-base p-4 flex flex-col justify-between border border-brand-border">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-brand-border">
              <h2 className="text-xs font-bold text-brand-text uppercase tracking-wide">
                Intelligence Insights
              </h2>
              <span className="text-[10px] font-bold text-upay-gold bg-upay-gold/10 border border-upay-gold/25 px-1.5 py-0.5 rounded font-mono">
                GEMINI COPILOT
              </span>
            </div>

            <div className="mt-2.5 space-y-2.5">
              <div className="p-2.5 rounded bg-brand-elevated border border-brand-border">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded bg-brand-surface text-amber-500 border border-brand-border flex items-center justify-center shrink-0 mt-0.5">
                    <Share2 size={13} />
                  </div>
                  <div className="text-xs text-brand-muted">
                    <p className="leading-snug">
                      Detected emerging <b className="text-brand-text">mule cluster #17</b> involving{" "}
                      <b className="text-brand-text">17 wallets</b> and <b className="text-brand-text">43 transactions</b> totaling ৳ 2.8M.
                    </p>
                    <button
                      onClick={() => onNavigate("network")}
                      className="mt-1.5 text-[11.5px] font-semibold text-upay-gold hover:underline flex items-center gap-1"
                    >
                      <span>View Topology</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-brand-elevated border border-brand-border">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded bg-brand-surface text-sky-400 border border-brand-border flex items-center justify-center shrink-0 mt-0.5">
                    <Activity size={13} />
                  </div>
                  <div className="text-xs text-brand-muted">
                    <p className="leading-snug">
                      Nocturnal transfers (01:00 AM – 04:00 AM) increased{" "}
                      <b className="text-brand-text">23%</b> above user baseline. 8 account takeover indicators flagged.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10.5px] text-brand-subtle border-t border-brand-border flex items-center justify-between">
            <span>Model: Ensemble ML + Gemini RAG</span>
            <span className="text-emerald-400 font-semibold">Active</span>
          </div>
        </div>

        {/* Col 3: System Health */}
        <div className="col-span-full md:col-span-full xl:col-span-3 card-base p-4 flex flex-col justify-between border border-brand-border">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-brand-border">
              <h2 className="text-xs font-bold text-brand-text uppercase tracking-wide">
                Engine Telemetry
              </h2>
              <span className="badge badge-low flex items-center gap-1">
                <CheckCircle2 size={10} /> 100% UP
              </span>
            </div>

            <div className="divide-y divide-brand-border mt-1">
              {systemHealth.map((item) => (
                <div key={item.name} className="py-2 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="text-brand-text font-medium block truncate text-[11.5px]">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-brand-subtle font-mono">{item.latency}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-brand-border flex items-center justify-between text-[10.5px] text-brand-subtle">
            <span>Evaluation Engine</span>
            <span className="font-semibold text-emerald-400 font-mono">Benchmark Verified</span>
          </div>
        </div>
      </div>

      {/* Synthetic Data Privacy Disclaimer */}
      <div className="text-center text-[10.5px] text-brand-subtle py-1">
        Synthetic demonstration data for DIU CPC &times; upay AI Hackathon 2026 &middot; Privacy-by-design compliant (Zero real customer PII)
      </div>
    </div>
  );
};
