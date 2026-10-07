"use client";

import React, { useState } from "react";
import { NavigationPage, RiskFactor } from "@/types";
import { riskFactorsTXN8F42 } from "@/lib/data";
import { CyberDefenseShield3D } from "./CyberDefenseShield3D";
import {
  ShieldAlert,
  Sparkles,
  ArrowRight,
  HelpCircle,
  AlertOctagon,
  CheckCircle2,
  FileCheck,
  Share2,
  UserCheck,
} from "lucide-react";

interface RiskIntelligenceViewProps {
  onNavigate: (page: NavigationPage) => void;
  onNotify: (msg: string) => void;
}

export const RiskIntelligenceView: React.FC<RiskIntelligenceViewProps> = ({
  onNavigate,
  onNotify,
}) => {
  const [selectedTxnId, setSelectedTxnId] = useState("TXN-8F42");
  const currentScore = selectedTxnId === "TXN-8F42" ? 94 : selectedTxnId === "TXN-92KD" ? 87 : 89;
  const currentThreat = currentScore >= 90 ? "Critical" : "High";

  const reasoningItems = [
    {
      title: "Behavioral amount anomaly",
      description: "Transfer volume of ৳48,500 is 4.8× higher than customer U-1042's 30-day median.",
      score: 92,
      evidence: "30-day baseline: ৳6,800 · Maximum prior single transfer: ৳15,000",
    },
    {
      title: "Hardware device pairing mismatch",
      description: "Originating device DEV-8821 has zero historical pairing with customer U-1042.",
      score: 78,
      evidence: "Hardware fingerprint: Samsung S23 · Registered 12 minutes prior to transaction",
    },
    {
      title: "Beneficiary risk accumulation",
      description: "Recipient wallet U-8831 has confirmed topological ties to 4 flagged mule wallets.",
      score: 91,
      evidence: "Inbound smurfing hub: Aggregated ৳380,000 from 9 unique accounts today",
    },
    {
      title: "Rapid velocity burst",
      description: "Six consecutive outgoing fund transfers executed within an 8-minute window.",
      score: 84,
      evidence: "Rate limit threshold: Normal frequency is 1 transfer per 48 hours",
    },
    {
      title: "Topological syndicate proximity",
      description: "Target wallet is exactly one hop from organized money-mule syndicate Cluster #17.",
      score: 88,
      evidence: "Direct flow into liquidation wallet U-9288 scheduled in 14 minutes",
    },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-brand-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            DEEP EXPLAINABILITY &bull; TREE-SHAP FEATURE ATTRIBUTION
          </div>
          <h1 className="page-title text-brand-text">Risk Intelligence Engine</h1>
          <p className="page-subtitle text-brand-muted">
            Explainable AI (XAI) feature contribution breakdown and signal attribution for transaction {selectedTxnId}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTxnId}
            onChange={(e) => setSelectedTxnId(e.target.value)}
            className="field text-xs outline-none cursor-pointer font-mono"
          >
            <option value="TXN-8F42">TXN-8F42 (৳48,500 - Critical 94)</option>
            <option value="TXN-92KD">TXN-92KD (৳32,000 - High 87)</option>
            <option value="TXN-37LM">TXN-37LM (৳76,200 - High 89)</option>
          </select>
        </div>
      </div>

      {/* Top Gauge + Factor Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Risk Gauge Card */}
        <div className="lg:col-span-4 card-base p-5 flex flex-col items-center justify-between text-center border border-brand-border bg-brand-surface">
          <div>
            <span className="text-xs text-brand-subtle font-semibold uppercase tracking-wider block font-mono">
              Calculated Risk Score
            </span>
            <span className="text-[11px] text-brand-muted">
              Ensemble XGBoost + Graph ML
            </span>
          </div>

          {/* Semi-circle Gauge SVG */}
          <div className="relative w-52 h-28 my-2">
            <svg viewBox="0 0 220 125" className="w-full h-full">
              {/* Gauge Background Arc */}
              <path
                d="M 20 110 A 90 90 0 0 1 200 110"
                fill="none"
                stroke="#252D37"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Gauge Active Value Arc */}
              <path
                d="M 20 110 A 90 90 0 0 1 200 110"
                fill="none"
                stroke="#EF4444"
                strokeWidth="14"
                strokeDasharray="283"
                strokeDashoffset="18"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
              <span className="text-4xl font-extrabold text-rose-400 leading-none font-mono">
                {currentScore}
              </span>
              <span className="text-[11px] text-brand-subtle font-semibold mt-1 font-mono">
                / 100 {currentThreat.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-2 w-full">
            <span className="badge badge-critical text-xs px-3 py-0.5">
              {currentThreat.toUpperCase()} RISK PRIORITY
            </span>
            <div className="text-xs text-brand-muted flex items-center justify-center gap-1.5 pt-1">
              <Sparkles size={13} className="text-upay-gold" />
              <span>
                AI Confidence: <b className="text-brand-text font-bold font-mono">96%</b>
              </span>
            </div>
          </div>
        </div>

        {/* Risk Factor Analysis (Feature Attribution Bars) */}
        <div className="lg:col-span-8 card-base p-5 border border-brand-border bg-brand-surface">
          <div className="flex items-center justify-between pb-2.5 border-b border-brand-border">
            <div>
              <h2 className="text-xs font-bold text-brand-text uppercase tracking-wide">
                Feature Contribution Analysis (SHAP Attribution)
              </h2>
              <p className="text-[11px] text-brand-muted">
                Mathematical contribution of individual behavioral vectors to the risk score
              </p>
            </div>
            <span className="text-[10px] text-brand-subtle font-mono">
              Algorithm: TreeSHAP v2.4
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {riskFactorsTXN8F42.map((factor) => (
              <div key={factor.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-brand-text">{factor.name}</span>
                    <span className="text-[11px] text-brand-subtle">({factor.description})</span>
                  </div>
                  <b
                    className={`font-mono text-xs ${
                      factor.score >= 85
                        ? "text-rose-400"
                        : factor.score >= 70
                        ? "text-orange-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {factor.score}%
                  </b>
                </div>

                <div className="h-1.5 w-full bg-brand-elevated rounded-full overflow-hidden border border-brand-border">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      factor.score >= 85
                        ? "bg-rose-500"
                        : factor.score >= 70
                        ? "bg-orange-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Reasoning and Recommended Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left: AI Reasoning List */}
        <div className="lg:col-span-8 card-base p-5 border border-brand-border bg-brand-surface">
          <div className="flex items-center justify-between pb-2.5 border-b border-brand-border">
            <div>
              <h2 className="text-xs font-bold text-brand-text uppercase tracking-wide">
                Signal Attribution: Why is this transaction risky?
              </h2>
              <p className="text-[11px] text-brand-muted">
                Structured evidentiary signals mapped directly to the financial crime taxonomy
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-upay-gold bg-brand-elevated border border-brand-border px-2 py-0.5 rounded font-mono font-semibold">
              <Sparkles size={12} />
              <span>EVIDENCE-GROUNDED</span>
            </div>
          </div>

          <div className="divide-y divide-brand-border mt-1">
            {reasoningItems.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-brand-elevated border border-brand-border text-brand-text font-bold text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <b className="text-brand-text text-xs block">{item.title}</b>
                  <p className="text-brand-muted text-[11.5px] mt-0.5">{item.description}</p>
                  <p className="text-[10px] text-brand-subtle font-mono mt-1 bg-brand-elevated border border-brand-border p-1 rounded inline-block">
                    ↳ Evidence: {item.evidence}
                  </p>
                </div>
                <div className="w-7 h-7 rounded border border-rose-500/25 bg-rose-500/10 text-rose-400 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                  {item.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recommended Action Card */}
        <div className="lg:col-span-4 card-base p-5 flex flex-col justify-between border border-brand-border bg-brand-surface">
          <div>
            <div className="w-9 h-9 rounded bg-brand-elevated border border-brand-border text-rose-400 flex items-center justify-center mb-3">
              <AlertOctagon size={20} />
            </div>

            <div className="eyebrow text-rose-400">ACTION REQUIRED</div>
            <h3 className="text-sm font-bold text-brand-text mt-1">
              Escalate for Analyst Sanction
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed mt-1.5">
              Multiple high-confidence signals indicate coordinated fraud and money-mule activity.
              Verify customer ownership via biometric step-up before releasing held funds.
            </p>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => onNavigate("investigation")}
                className="btn btn-primary w-full text-xs flex items-center justify-center gap-1.5"
              >
                <span>Open Full Investigation Case</span>
                <ArrowRight size={13} />
              </button>

              <button
                onClick={() => onNavigate("network")}
                className="btn btn-secondary w-full text-xs flex items-center justify-center gap-1.5"
              >
                <Share2 size={13} />
                <span>View Fraud Network Topology</span>
              </button>

              <button
                onClick={() => onNavigate("customers")}
                className="btn btn-secondary w-full text-xs flex items-center justify-center gap-1.5"
              >
                <UserCheck size={13} />
                <span>Customer Profile (U-1042)</span>
              </button>

              <button
                onClick={() => onNotify("Transaction marked as False Positive. Feedback logged to model training queue.")}
                className="btn btn-ghost w-full text-xs text-brand-subtle hover:text-brand-text"
              >
                Mark as False Positive
              </button>
            </div>
          </div>

          {/* Compliance Disclaimer */}
          <div className="p-2.5 bg-brand-elevated rounded border border-brand-border flex items-start gap-2 text-[10.5px] text-brand-subtle leading-tight mt-4">
            <HelpCircle size={14} className="shrink-0 mt-0.5" />
            <span>
              AI recommendations augment analyst decisions. Consequential financial freezes
              strictly require human authorization per Bangladesh Bank regulations.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
