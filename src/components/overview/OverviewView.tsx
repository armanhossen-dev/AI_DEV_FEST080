"use client";

import React from "react";
import { NavigationPage, Transaction, RiskLevel } from "@/types";
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
} from "lucide-react";

interface OverviewViewProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenTransactionDrawer: (txn: Transaction) => void;
  transactions: Transaction[];
  onOpenReport: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenTransactionDrawer,
  transactions,
  onOpenReport,
}) => {
  const kpiData = [
    {
      label: "Transactions Monitored",
      value: "1.28M",
      trend: "+8.4% today",
      isPositive: true,
      icon: <Activity size={18} className="text-emerald-700" />,
      bg: "bg-emerald-50",
    },
    {
      label: "High Risk Transactions",
      value: "1,284",
      trend: "↓ 12.6%",
      isPositive: true,
      icon: <ShieldAlert size={18} className="text-rose-600" />,
      bg: "bg-rose-50",
    },
    {
      label: "Prevented Loss",
      value: "৳18.7M",
      trend: "Estimated BDT",
      isPositive: null,
      icon: <ShieldCheck size={18} className="text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      label: "Active Investigations",
      value: "47",
      trend: "12 require attention",
      isPositive: false,
      icon: <Briefcase size={18} className="text-amber-600" />,
      bg: "bg-amber-50",
    },
    {
      label: "AI Detection Accuracy",
      value: "96.4%",
      trend: "Validation set v4.8",
      isPositive: true,
      icon: <Sparkles size={18} className="text-indigo-600" />,
      bg: "bg-indigo-50",
    },
  ];

  const recentAlerts = [
    {
      risk: "Critical" as RiskLevel,
      amount: "৳48,500",
      reason: "New device + unusual nocturnal location",
      score: 94,
      txnId: "TXN-8F42",
      time: "2 min ago",
      targetTxn: transactions.find((t) => t.id === "TXN-8F42") || transactions[0],
    },
    {
      risk: "High" as RiskLevel,
      amount: "৳32,000",
      reason: "Abnormal transaction velocity & USSD reset",
      score: 87,
      txnId: "TXN-92KD",
      time: "8 min ago",
      targetTxn: transactions.find((t) => t.id === "TXN-92KD") || transactions[1],
    },
    {
      risk: "High" as RiskLevel,
      amount: "৳76,200",
      reason: "Rapid layering & recipient network link",
      score: 89,
      txnId: "TXN-37LM",
      time: "14 min ago",
      targetTxn: transactions.find((t) => t.id === "TXN-37LM") || transactions[2],
    },
  ];

  const systemHealth = [
    { name: "AI Risk Engine (XGBoost)", status: "Operational", latency: "14ms" },
    { name: "Anomaly Detection (Isolation Forest)", status: "Operational", latency: "19ms" },
    { name: "Graph Intelligence (Mule Cluster)", status: "Operational", latency: "38ms" },
    { name: "Investigation Assistant (Gemini 1.5)", status: "Operational", latency: "210ms" },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">DIU CPC × UPAY AI HACKATHON 2026</div>
          <h1 className="page-title">Fraud Intelligence Overview</h1>
          <p className="page-subtitle">
            Real-time AI-powered monitoring of transaction risk, anomalies, and coordinated mule syndicates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onOpenReport} className="btn btn-secondary text-xs flex items-center gap-2">
            <FileDown size={15} />
            <span>Export Report</span>
          </button>
          <button
            onClick={() => onNavigate("transactions")}
            className="btn btn-primary text-xs flex items-center gap-2"
          >
            <span>Live Monitor</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {kpiData.map((kpi, index) => (
          <div key={index} className="card-base p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>{kpi.label}</span>
              <div className={`w-7 h-7 rounded-lg ${kpi.bg} flex items-center justify-center shrink-0`}>
                {kpi.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">
              {kpi.value}
            </div>
            <div className="text-[11px] mt-1 flex items-center gap-1 font-medium">
              {kpi.isPositive === true && (
                <span className="text-emerald-700 flex items-center gap-0.5">
                  <TrendingUp size={12} /> {kpi.trend}
                </span>
              )}
              {kpi.isPositive === false && (
                <span className="text-rose-600 flex items-center gap-0.5">
                  <TrendingDown size={12} /> {kpi.trend}
                </span>
              )}
              {kpi.isPositive === null && (
                <span className="text-gray-500">{kpi.trend}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Live Risk Activity and Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Live Risk Chart */}
        <div className="col-span-full lg:col-span-8 card-base p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Live Risk Activity</h2>
              <p className="text-xs text-gray-500">
                Transaction telemetry and anomaly spikes processed in real time
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-3 h-1 rounded-full bg-[#0e9f67]" />
                Normal
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-3 h-1 rounded-full bg-[#e8752e]" />
                Suspicious
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-[#dc3f4d]" />
                Critical Alerts
              </span>
            </div>
          </div>

          {/* SVG Multi-line Chart */}
          <div className="relative h-56 mt-4">
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-gray-400 font-mono">
              <span>60k</span>
              <span>40k</span>
              <span>20k</span>
              <span>0</span>
            </div>

            <div className="ml-8 h-full flex flex-col">
              <svg className="w-full flex-1 overflow-visible" viewBox="0 0 720 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="normalArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0e9f67" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#0e9f67" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                {[20, 65, 115, 160].map((y) => (
                  <line key={y} x1="0" x2="720" y1={y} y2={y} stroke="#edf2ef" strokeWidth="1" />
                ))}

                {/* Normal Volume Area Fill */}
                <path
                  d="M0 135 C45 125 75 90 120 100 S180 120 220 85 S290 70 340 95 S400 115 450 75 S510 45 560 65 S620 100 660 60 S700 50 720 30 L720 170 L0 170 Z"
                  fill="url(#normalArea)"
                />

                {/* Normal Volume Line */}
                <path
                  d="M0 135 C45 125 75 90 120 100 S180 120 220 85 S290 70 340 95 S400 115 450 75 S510 45 560 65 S620 100 660 60 S700 50 720 30"
                  fill="none"
                  stroke="#0e9f67"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Suspicious Line */}
                <path
                  d="M0 165 C60 160 90 150 140 155 S210 160 250 140 S320 155 365 145 S440 150 490 132 S570 150 630 130 S690 142 720 120"
                  fill="none"
                  stroke="#e8752e"
                  strokeWidth="1.8"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                />

                {/* Critical Dots */}
                {[
                  { x: 250, y: 140, label: "TXN-8F42" },
                  { x: 490, y: 132, label: "TXN-92KD" },
                  { x: 630, y: 130, label: "TXN-37LM" },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="5.5" fill="#dc3f4d" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={pt.x} cy={pt.y} r="10" fill="#dc3f4d" fillOpacity="0.2" className="animate-ping" />
                  </g>
                ))}
              </svg>

              {/* X Axis Time Labels */}
              <div className="flex justify-between text-[10px] text-gray-400 font-mono pt-2 border-t border-gray-100">
                <span>12:00 AM</span>
                <span>04:00 AM</span>
                <span>08:00 AM</span>
                <span>12:00 PM</span>
                <span>04:00 PM</span>
                <span>08:00 PM</span>
                <span className="text-emerald-700 font-bold">Now (Live)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Distribution Donut */}
        <div className="col-span-full lg:col-span-4 card-base p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Risk Distribution</h2>
            <p className="text-xs text-gray-500">MFS portfolio categorization (24h)</p>
          </div>

          <div className="flex items-center gap-6 py-2">
            {/* Donut Chart */}
            <div className="w-32 h-32 donut-conic shadow-xs shrink-0">
              <div className="donut-inner">
                <span className="text-lg font-bold text-gray-900 leading-tight">
                  1.28M
                </span>
                <span className="text-[10px] text-gray-500">Total Txns</span>
              </div>
            </div>

            {/* Breakdown Legend */}
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0e9f67]" />
                  Low Risk
                </span>
                <b className="font-semibold text-gray-900">82.4%</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#edbd3f]" />
                  Medium Risk
                </span>
                <b className="font-semibold text-gray-900">12.8%</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e8752e]" />
                  High Risk
                </span>
                <b className="font-semibold text-gray-900">3.7%</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#dc3f4d]" />
                  Critical
                </span>
                <b className="font-semibold text-gray-900">1.1%</b>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs text-emerald-900 font-medium">
            <span>Automated Quarantine Triggered:</span>
            <span className="font-bold">142 Wallets</span>
          </div>
        </div>
      </div>

      {/* Bottom 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
        {/* Col 1: Recent Critical Alerts */}
        <div className="col-span-full md:col-span-1 xl:col-span-5 card-base p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Recent Critical Alerts</h2>
            <button
              onClick={() => onNavigate("alerts")}
              className="text-xs text-[#087c50] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentAlerts.map((alert) => (
              <div key={alert.txnId} className="py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border-2 border-rose-200 text-rose-600 bg-rose-50 flex items-center justify-center font-bold text-xs shrink-0">
                  {alert.score}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${
                        alert.risk === "Critical" ? "badge-critical" : "badge-high"
                      }`}
                    >
                      {alert.risk}
                    </span>
                    <span className="text-xs font-bold text-gray-900">{alert.amount}</span>
                  </div>
                  <p className="text-xs text-gray-700 truncate mt-0.5">{alert.reason}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {alert.txnId} · {alert.time}
                  </p>
                </div>
                <button
                  onClick={() => onOpenTransactionDrawer(alert.targetTxn)}
                  className="btn btn-ghost text-xs shrink-0 px-2"
                >
                  Investigate
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: AI Insights */}
        <div className="col-span-full md:col-span-1 xl:col-span-4 card-base p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">AI Intelligence Insights</h2>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                <Sparkles size={11} /> SENTINEL AI
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {/* Insight 1 */}
              <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100/80">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Share2 size={15} />
                  </div>
                  <div className="text-xs text-gray-700">
                    <p className="leading-snug">
                      AI detected an emerging <b>mule-wallet cluster</b> involving{" "}
                      <b>17 accounts</b> and <b>43 transactions</b> totaling ৳2.8M.
                    </p>
                    <button
                      onClick={() => onNavigate("network")}
                      className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>View Fraud Network</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Insight 2 */}
              <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100/80">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Activity size={15} />
                  </div>
                  <div className="text-xs text-gray-700">
                    <p className="leading-snug">
                      Nocturnal high-value transfers (01:00 AM – 04:00 AM) increased{" "}
                      <b>23%</b> above normal baseline. 8 account takeover vectors identified.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-gray-400 border-t border-gray-100 flex items-center justify-between">
            <span>Model: Ensemble ML + Gemini RAG</span>
            <span className="text-emerald-600 font-semibold">Active</span>
          </div>
        </div>

        {/* Col 3: System Health */}
        <div className="col-span-full md:col-span-full xl:col-span-3 card-base p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">System Health</h2>
              <span className="badge badge-low flex items-center gap-1">
                <CheckCircle2 size={11} /> 100% UP
              </span>
            </div>

            <div className="divide-y divide-gray-100 mt-2">
              {systemHealth.map((item) => (
                <div key={item.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="text-gray-800 font-medium block truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-gray-400">Latency: {item.latency}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Last sync</span>
            <span className="font-semibold text-gray-600">8 seconds ago</span>
          </div>
        </div>
      </div>

      {/* Synthetic Data Disclaimer */}
      <div className="text-center text-[11px] text-gray-400 py-1">
        Synthetic demonstration data for DIU CPC × upay AI Hackathon 2026 · Privacy-by-design compliant (No real customer PII)
      </div>
    </div>
  );
};
