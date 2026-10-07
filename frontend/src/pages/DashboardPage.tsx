import React, { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { fetchAnalyticsData, AnalyticsData } from "@/services/analytics-service";
import { fetchTransactions } from "@/services/transaction-service";
import { DbTransaction, RiskAssessment } from "@/types";
import { DEMO_SCENARIOS } from "@/services/demo-data-service";
import { createLiveTransaction } from "@/services/transaction-service";
import {
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  Ban,
  DollarSign,
  Activity,
  ArrowRight,
  Zap,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentSuspicious, setRecentSuspicious] = useState<
    (DbTransaction & { assessment?: RiskAssessment })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useOutletContext<{ showToast: (msg: string) => void }>();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [stats, txnsRes] = await Promise.all([
          fetchAnalyticsData(),
          fetchTransactions({ limit: 8, sortBy: "risk" }),
        ]);
        setAnalytics(stats);
        setRecentSuspicious(txnsRes.transactions);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleQuickScenarioRun = async (scenario: typeof DEMO_SCENARIOS[0]) => {
    try {
      const created = await createLiveTransaction(scenario.transaction);
      showToast(`Injected "${scenario.title}" — Redirecting to detailed investigation...`);
      navigate(`/transactions/${created.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Loading Sentinel Fraud Command Center...</p>
        </div>
      </div>
    );
  }

  const { metrics, riskDistribution } = analytics;

  return (
    <div className="space-y-6">
      {/* Top Banner: Quick Scenario Launcher for Judges */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0F172A] to-[#1E293B]/70 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Live Demo Scenarios
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
                One-Click Multi-Stage Evaluation
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Test end-to-end telemetry ingestion, explainability factors, and human investigator action workflow:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {DEMO_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleQuickScenarioRun(scenario)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  scenario.expectedRiskLevel === "critical"
                    ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
                    : scenario.expectedRiskLevel === "high"
                    ? "bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border-orange-500/30"
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}
              >
                <span>{scenario.title}</span>
                <span className="text-[10px] opacity-75 font-mono">({scenario.expectedRiskLevel})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top KPI Cards (Enterprise Command Center) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Monitored */}
        <div className="p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Monitored</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.transactionsMonitored.toLocaleString()}
          </div>
          <div className="text-[10px] text-cyan-400 mt-1 font-medium">Live Telemetry Ingest</div>
        </div>

        {/* High Risk */}
        <div className="p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">High Risk</span>
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-300">
            {metrics.highRiskTransactions}
          </div>
          <div className="text-[10px] text-orange-400 mt-1 font-medium">Requires Step-Up Verification</div>
        </div>

        {/* Critical Alerts */}
        <div className="p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Critical Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {metrics.criticalAlerts}
          </div>
          <div className="text-[10px] text-rose-400 mt-1 font-medium">Immediate Hold Recommended</div>
        </div>

        {/* Under Investigation */}
        <div className="p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Investigating</span>
            <FileCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {metrics.underInvestigation}
          </div>
          <div className="text-[10px] text-amber-400 mt-1 font-medium">Assigned to Analysts</div>
        </div>

        {/* Blocked */}
        <div className="p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Blocked Txns</span>
            <Ban className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {metrics.blockedTransactions}
          </div>
          <div className="text-[10px] text-purple-400 mt-1 font-medium">Disbursements Halted</div>
        </div>

        {/* Prevented Loss */}
        <div className="p-4 rounded-2xl bg-[#0F172A]/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Prevented Loss</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            ৳{(metrics.estimatedPreventedLoss / 100000).toFixed(1)}L
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-medium">
            BDT Capital Protected
          </div>
        </div>
      </div>

      {/* Main Grid: Live Risk Stream + Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Suspicious Transactions Feed (2 cols) */}
        <div className="lg:col-span-2 bg-[#0F172A]/90 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Suspicious Risk Stream
              </h3>
            </div>
            <Link
              to="/transactions"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>View All 1,000+ Transactions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60 overflow-x-auto">
            {recentSuspicious.map((txn) => {
              const score = txn.assessment?.final_risk_score ?? 50;
              const level = txn.assessment?.risk_level ?? "medium";

              return (
                <div
                  key={txn.id}
                  onClick={() => navigate(`/transactions/${txn.id}`)}
                  className="p-3.5 sm:p-4 hover:bg-slate-800/50 cursor-pointer transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                        level === "critical"
                          ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          : level === "high"
                          ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {score}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {txn.transaction_reference}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            level === "critical"
                              ? "bg-rose-500/20 text-rose-300"
                              : level === "high"
                              ? "bg-orange-500/20 text-orange-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {level}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {txn.transaction_type.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        <span className="text-slate-300">{txn.sender_name}</span> ({txn.sender_phone_masked}) →{" "}
                        <span className="text-slate-300">{txn.receiver_name}</span> ({txn.receiver_phone_masked})
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold font-mono text-white">
                      ৳{Number(txn.amount).toLocaleString()}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                          txn.transaction_status === "held"
                            ? "bg-amber-500/20 text-amber-300"
                            : txn.transaction_status === "blocked"
                            ? "bg-purple-500/20 text-purple-300"
                            : txn.transaction_status === "under_review"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {txn.transaction_status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Risk Distribution & Decision Principles */}
        <div className="space-y-6">
          {/* Risk Level Distribution */}
          <div className="bg-[#0F172A]/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
              Risk Level Classification
            </h3>

            <div className="space-y-3">
              {riskDistribution.map((item) => (
                <div key={item.level} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.level} Risk
                    </span>
                    <span className="text-slate-400 font-mono">
                      {item.count} txns ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, item.percentage)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Decision Authority Principle */}
          <div className="bg-gradient-to-br from-[#0F172A] to-amber-950/20 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Core Operational Principle</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sentinel AI acts exclusively as a <strong>decision-support and risk-prioritization system</strong>.
            </p>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="text-slate-200 font-semibold">Human Authority Retention:</div>
              <div>• AI highlights evidence and calculates composite risk.</div>
              <div>• Authorized human investigators execute final Hold / Block / Release actions.</div>
              <div>• Full cryptographic audit log preserved for regulatory reporting.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
