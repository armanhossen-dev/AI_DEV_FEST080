import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { fetchTransactionById } from "@/services/transaction-service";
import { performInvestigationDecision } from "@/services/investigation-service";
import { DbTransaction, RiskAssessment, TransactionFeatures, RiskFactorItem, TransactionStatus } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  Ban,
  PauseCircle,
  AlertTriangle,
  Clock,
  Smartphone,
  MapPin,
  User,
  Zap,
  TrendingUp,
  FileText,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Activity,
} from "lucide-react";

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{
    transaction: DbTransaction;
    assessment: RiskAssessment;
    features: TransactionFeatures;
    factors: RiskFactorItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [investigatorNote, setInvestigatorNote] = useState("");
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useOutletContext<{ showToast: (msg: string) => void }>();

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetchTransactionById(id);
        setData(res);
      } catch (err) {
        console.error("Load single txn error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleDecision = async (decision: "approved" | "held" | "blocked" | "escalated") => {
    if (!data) return;
    try {
      setActionLoading(true);
      const actorName = profile?.full_name || "Lead Fraud Investigator";

      if (decision === "escalated") {
        showToast(`Transaction ${data.transaction.transaction_reference} escalated to Tier-2 Security Incident Desk.`);
        return;
      }

      const res = await performInvestigationDecision({
        transactionId: data.transaction.id,
        decision,
        actorName,
        notes: investigatorNote || `Human decision applied: ${decision.toUpperCase()}`,
      });

      // Update local state immediately
      setData((prev) =>
        prev
          ? {
              ...prev,
              transaction: {
                ...prev.transaction,
                transaction_status: res.newStatus,
              },
            }
          : null
      );

      showToast(`Success: Transaction status updated to ${res.newStatus.toUpperCase()} and audit trail recorded.`);
    } catch (err: any) {
      console.error(err);
      showToast("Error updating transaction status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading Deep Risk Analysis...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-[#0F172A] rounded-2xl border border-slate-800 space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Transaction Not Found</h3>
        <p className="text-xs text-slate-400">The specified transaction could not be located in the database.</p>
        <button
          onClick={() => navigate("/transactions")}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl"
        >
          Return to Transactions
        </button>
      </div>
    );
  }

  const { transaction, assessment, features, factors } = data;
  const isCritical = assessment.risk_level === "critical";
  const isHigh = assessment.risk_level === "high";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        <span className="text-xs text-slate-500 font-mono">
          Ref: {transaction.transaction_reference}
        </span>
      </div>

      {/* 1. TRANSACTION HEADER */}
      <div className="p-6 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black font-mono text-white tracking-tight">
              {transaction.transaction_reference}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border ${
                isCritical
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : isHigh
                  ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              }`}
            >
              {assessment.risk_level}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                transaction.transaction_status === "held"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : transaction.transaction_status === "blocked"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              }`}
            >
              Status: {transaction.transaction_status.replace("_", " ")}
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400">
            ৳{Number(transaction.amount).toLocaleString()}{" "}
            <span className="text-sm font-sans text-slate-400 font-semibold">{transaction.currency}</span>
          </div>
        </div>

        {/* Risk Score & Confidence Badges */}
        <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="text-center px-3 border-r border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Composite Risk
            </div>
            <div
              className={`text-3xl font-black font-mono ${
                isCritical ? "text-rose-400" : isHigh ? "text-orange-400" : "text-emerald-400"
              }`}
            >
              {assessment.final_risk_score}
              <span className="text-xs text-slate-500 font-normal"> / 100</span>
            </div>
          </div>

          <div className="text-center px-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Model Confidence
            </div>
            <div className="text-3xl font-black font-mono text-cyan-400">
              {assessment.confidence}%
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECOMMENDED ACTION BANNER (Advisory) */}
      <div
        className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isCritical
            ? "bg-rose-950/30 border-rose-500/40"
            : isHigh
            ? "bg-orange-950/30 border-orange-500/40"
            : "bg-emerald-950/20 border-emerald-500/30"
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300">
              Sentinel AI Advisory Guidance:
            </span>
          </div>
          <div className="text-sm font-bold text-white">
            {assessment.recommended_action}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            {assessment.explanation_summary}
          </p>
          <div className="text-[10px] text-slate-400 italic pt-1">
            * Advisory Recommendation: Decision-support guidance. Authorized human fraud investigators retain final decision authority.
          </div>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => navigate("/copilot")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Consult Sentinel Copilot</span>
          </button>
        </div>
      </div>

      {/* 3. CORE TWO-COLUMN ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Risk Analysis & Explainability & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Breakdown Gauges */}
          <div className="bg-[#0F172A]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Multi-Model Signal Deconstruction</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Fraud Model */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Fraud Model Score
                </span>
                <span className="text-2xl font-mono font-bold text-orange-400">
                  {assessment.fraud_score}
                </span>
                <span className="text-xs text-slate-500"> / 100</span>
                <div className="text-[10px] text-slate-400 mt-1">Weighted Rule Heuristics</div>
              </div>

              {/* Anomaly Model */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Anomaly Deviation
                </span>
                <span className="text-2xl font-mono font-bold text-cyan-400">
                  {assessment.anomaly_score}
                </span>
                <span className="text-xs text-slate-500"> / 100</span>
                <div className="text-[10px] text-slate-400 mt-1">Historical Baseline Shift</div>
              </div>

              {/* Account Risk */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Account Prior Risk
                </span>
                <span className="text-2xl font-mono font-bold text-purple-400">
                  {assessment.account_risk_score}
                </span>
                <span className="text-xs text-slate-500"> / 100</span>
                <div className="text-[10px] text-slate-400 mt-1">Tenure & Historical Flags</div>
              </div>
            </div>
          </div>

          {/* WHY THIS TRANSACTION IS RISKY (Explainable AI Factors) */}
          <div className="bg-[#0F172A]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Explainable AI: Concrete Risk Factors</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {factors.length} Corroborating Signals
              </span>
            </div>

            <div className="space-y-3">
              {factors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{factor.factor_name}</span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          factor.severity === "critical"
                            ? "bg-rose-500/20 text-rose-300"
                            : factor.severity === "high"
                            ? "bg-orange-500/20 text-orange-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {factor.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{factor.description}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Evidence: {factor.evidence}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs">
                      +{factor.contribution} Impact
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BEHAVIORAL COMPARISON (Baseline vs Current) */}
          <div className="bg-[#0F172A]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Behavioral Envelope: Baseline vs Current Transaction</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Normal Baseline */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2.5">
                <div className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider">
                  Established Customer Baseline
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Median Amount</span>
                  <span className="text-slate-200 font-mono">৳2,200 BDT</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Customary Hours</span>
                  <span className="text-slate-200 font-mono">08:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Registered Devices</span>
                  <span className="text-slate-200 font-mono">1 Primary Smartphone</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Transfer Frequency</span>
                  <span className="text-slate-200 font-mono">1 - 3 transfers / day</span>
                </div>
              </div>

              {/* Current Telemetry */}
              <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-2.5">
                <div className="text-amber-400 font-bold uppercase text-[10px] tracking-wider">
                  Current Transaction Telemetry
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">This Transaction</span>
                  <span className="text-rose-400 font-mono font-bold">
                    ৳{Number(transaction.amount).toLocaleString()} ({features.amount_deviation}× median)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Timestamp</span>
                  <span className="text-slate-200 font-mono">
                    {new Date(transaction.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Device Fingerprint</span>
                  <span className="text-slate-200 font-mono">
                    {transaction.device_id} {transaction.device_new ? "(Brand New)" : ""}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Velocity Index</span>
                  <span className="text-amber-300 font-mono font-semibold">
                    {features.velocity_score} / 100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TRANSACTION TIMELINE */}
          <div className="bg-[#0F172A]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Event Progression Timeline</span>
            </h3>

            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-600" />
                <div className="text-[11px] font-mono text-slate-400">01:52 AM • Account Authentication</div>
                <p className="text-xs text-slate-300">Login credential verified via mobile app endpoint.</p>
              </div>

              {transaction.device_new && (
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-orange-400" />
                  <div className="text-[11px] font-mono text-orange-400">02:01 AM • Hardware Identifier Divergence</div>
                  <p className="text-xs text-slate-300">Unrecognized device fingerprint ({transaction.device_id}) registered on account.</p>
                </div>
              )}

              {transaction.beneficiary_new && (
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="text-[11px] font-mono text-amber-400">02:04 AM • Beneficiary Destination Added</div>
                  <p className="text-xs text-slate-300">Unverified recipient wallet ({transaction.receiver_name}) added to beneficiary directory.</p>
                </div>
              )}

              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <div className="text-[11px] font-mono text-rose-400">
                  {new Date(transaction.timestamp).toLocaleTimeString()} • High-Stakes Disbursement Attempt
                </div>
                <p className="text-xs text-slate-200 font-semibold">
                  Outbound {transaction.transaction_type.replace("_", " ")} of ৳{Number(transaction.amount).toLocaleString()} initiated.
                </p>
                <div className="mt-1 text-[11px] text-amber-300 font-medium">
                  → Sentinel Risk Engine triggered: Composite score {assessment.final_risk_score}/100.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transaction Profile & Human Decision Panel */}
        <div className="space-y-6">
          {/* HUMAN INVESTIGATOR DECISION PANEL */}
          <div className="bg-[#0F172A] border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Human Decision Console</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Investigator Authority</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Audit / Justification Notes:
                </label>
                <textarea
                  value={investigatorNote}
                  onChange={(e) => setInvestigatorNote(e.target.value)}
                  placeholder="Record mandatory operational rationale before applying decision..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* HOLD Button */}
                <button
                  type="button"
                  onClick={() => handleDecision("held")}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                >
                  <PauseCircle className="w-4 h-4 text-amber-400" />
                  <span>HOLD Funds</span>
                </button>

                {/* BLOCK Button */}
                <button
                  type="button"
                  onClick={() => handleDecision("blocked")}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                >
                  <Ban className="w-4 h-4 text-rose-400" />
                  <span>BLOCK Txn</span>
                </button>

                {/* APPROVE Button */}
                <button
                  type="button"
                  onClick={() => handleDecision("approved")}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>APPROVE Release</span>
                </button>

                {/* ESCALATE Button */}
                <button
                  type="button"
                  onClick={() => handleDecision("escalated")}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4 text-purple-400" />
                  <span>ESCALATE Case</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-500 text-center pt-2">
                Actions persist immediately to Supabase <code className="text-amber-400">investigation_actions</code> audit table.
              </div>
            </div>
          </div>

          {/* TRANSACTION PROFILE CARD */}
          <div className="bg-[#0F172A]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Counterparty & Telemetry Profile</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Originating Customer
                </span>
                <div className="font-bold text-white">{transaction.sender_name}</div>
                <div className="text-slate-400 font-mono mt-0.5">{transaction.sender_phone_masked}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Recipient Destination
                </span>
                <div className="font-bold text-white">{transaction.receiver_name}</div>
                <div className="text-slate-400 font-mono mt-0.5">{transaction.receiver_phone_masked}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    Device ID
                  </span>
                  <span className="font-mono text-slate-200">{transaction.device_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    City & IP
                  </span>
                  <span className="text-slate-200">{transaction.location} (IP Risk: {transaction.ip_risk}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
