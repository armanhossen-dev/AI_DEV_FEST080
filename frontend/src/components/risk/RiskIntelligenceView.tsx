"use client";

import React, { useState } from "react";
import { NavigationPage, RiskFactor } from "@/types";
import { riskFactorsTXN8F42 } from "@/lib/data";
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

  const reasoningItems = [
    {
      title: "Behavioral anomaly",
      description: "Transfer volume of ৳48,500 is 4.8× higher than customer U-1042's 30-day median.",
      score: 92,
      evidence: "30-day baseline: ৳6,800 · Maximum prior single transfer: ৳15,000",
    },
    {
      title: "Device anomaly",
      description: "Originating device DEV-8821 has zero historical pairing with customer U-1042.",
      score: 78,
      evidence: "Hardware fingerprint: Samsung S23 · Registered 12 minutes prior to transaction",
    },
    {
      title: "Recipient anomaly",
      description: "Recipient wallet U-8831 has confirmed topological ties to 4 flagged mule wallets.",
      score: 91,
      evidence: "Inbound smurfing hub: Aggregated ৳380,000 from 9 unique accounts today",
    },
    {
      title: "Velocity anomaly",
      description: "Six consecutive outgoing fund transfers executed within an 8-minute window.",
      score: 84,
      evidence: "Rate limit threshold: Normal frequency is 1 transfer per 48 hours",
    },
    {
      title: "Network relationship",
      description: "Target wallet is exactly one hop from organized money-mule syndicate Cluster #17.",
      score: 88,
      evidence: "Direct flow into liquidation wallet U-9288 scheduled in 14 minutes",
    },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">DEEP EXPLAINABILITY & SHAP ATTRIBUTION</div>
          <h1 className="page-title">Risk Intelligence Engine</h1>
          <p className="page-subtitle">
            Explainable AI (XAI) breakdown and feature contribution analysis for transaction {selectedTxnId}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTxnId}
            onChange={(e) => setSelectedTxnId(e.target.value)}
            className="field text-xs outline-none cursor-pointer"
          >
            <option value="TXN-8F42">TXN-8F42 (৳48,500 - Critical 94)</option>
            <option value="TXN-92KD">TXN-92KD (৳32,000 - High 87)</option>
            <option value="TXN-37LM">TXN-37LM (৳76,200 - High 89)</option>
          </select>
        </div>
      </div>

      {/* Top Gauge + Factor Bars */}
      <div className="grid grid-cols-12 gap-4">
        {/* Risk Gauge Card */}
        <div className="col-span-4 card-base p-6 flex flex-col items-center justify-between text-center">
          <div>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
              Calculated Risk Score
            </span>
            <span className="text-[11px] text-gray-400">
              Ensemble XGBoost + Graph ML
            </span>
          </div>

          {/* Semi-circle Gauge SVG */}
          <div className="relative w-56 h-32 my-3">
            <svg viewBox="0 0 220 125" className="w-full h-full">
              {/* Gauge Background Arc */}
              <path
                d="M 20 110 A 90 90 0 0 1 200 110"
                fill="none"
                stroke="#fee2e2"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Gauge Active Value Arc (94% full) */}
              <path
                d="M 20 110 A 90 90 0 0 1 200 110"
                fill="none"
                stroke="#dc3f4d"
                strokeWidth="16"
                strokeDasharray="283"
                strokeDashoffset="18"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
              <span className="text-5xl font-extrabold text-rose-600 leading-none">
                94
              </span>
              <span className="text-xs text-gray-400 font-semibold mt-1">
                / 100 CRITICAL
              </span>
            </div>
          </div>

          <div className="space-y-2 w-full">
            <span className="badge badge-critical text-xs px-3 py-1">
              CRITICAL RISK
            </span>
            <div className="text-xs text-gray-600 flex items-center justify-center gap-1.5 pt-1">
              <Sparkles size={14} className="text-emerald-600" />
              <span>
                AI Confidence: <b className="text-gray-900 font-bold">96%</b>
              </span>
            </div>
          </div>
        </div>

        {/* Risk Factor Analysis (Attribution Bars) */}
        <div className="col-span-8 card-base p-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Risk Factor Analysis (Feature Attribution)
              </h2>
              <p className="text-xs text-gray-500">
                Mathematical contribution of individual behavioral vectors to the overall score
              </p>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              Algorithm: TreeSHAP v2.4
            </span>
          </div>

          <div className="mt-4 space-y-3.5">
            {riskFactorsTXN8F42.map((factor) => (
              <div key={factor.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{factor.name}</span>
                    <span className="text-[11px] text-gray-400">({factor.description})</span>
                  </div>
                  <b
                    className={`font-mono text-xs ${
                      factor.score >= 85
                        ? "text-rose-600"
                        : factor.score >= 70
                        ? "text-amber-600"
                        : "text-emerald-700"
                    }`}
                  >
                    {factor.score}%
                  </b>
                </div>

                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      factor.score >= 85
                        ? "bg-rose-500"
                        : factor.score >= 70
                        ? "bg-amber-500"
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
      <div className="grid grid-cols-12 gap-4">
        {/* Left: AI Reasoning List */}
        <div className="col-span-8 card-base p-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                AI Reasoning: Why is this transaction risky?
              </h2>
              <p className="text-xs text-gray-500">
                Structured evidentiary signals mapped directly to the fraud taxonomy
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-md font-semibold">
              <Sparkles size={13} />
              <span>EVIDENCE-GROUNDED</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100 mt-2">
            {reasoningItems.map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-md bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <b className="text-gray-900 text-xs block">{item.title}</b>
                  <p className="text-gray-600 mt-0.5">{item.description}</p>
                  <p className="text-[11px] text-emerald-800/80 font-mono mt-1 bg-emerald-50/60 p-1.5 rounded inline-block">
                    ↳ Evidence: {item.evidence}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0">
                  {item.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recommended Action Card */}
        <div className="col-span-4 card-base p-6 flex flex-col justify-between">
          <div>
            <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-xs">
              <AlertOctagon size={24} />
            </div>

            <div className="eyebrow text-rose-600">ACTION REQUIRED</div>
            <h3 className="text-lg font-bold text-gray-900 mt-1">
              Escalate for Analyst Review
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mt-2">
              Multiple high-confidence signals indicate coordinated fraud and money-mule activity.
              Verify customer ownership via biometric challenge before releasing held funds.
            </p>

            <div className="mt-5 space-y-2">
              <button
                onClick={() => onNavigate("investigation")}
                className="btn btn-primary w-full text-xs flex items-center justify-center gap-2"
              >
                <span>Open Full Investigation Case</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => onNavigate("network")}
                className="btn btn-secondary w-full text-xs flex items-center justify-center gap-2"
              >
                <Share2 size={14} />
                <span>View Linked Fraud Network</span>
              </button>

              <button
                onClick={() => onNavigate("customers")}
                className="btn btn-secondary w-full text-xs flex items-center justify-center gap-2"
              >
                <UserCheck size={14} />
                <span>View Customer Profile (U-1042)</span>
              </button>

              <button
                onClick={() => onNotify("Transaction marked as False Positive. Feedback logged to model training queue.")}
                className="btn btn-ghost w-full text-xs text-gray-500 hover:text-gray-800"
              >
                Mark as False Positive
              </button>
            </div>
          </div>

          {/* Compliance Disclaimer */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200/80 flex items-start gap-2.5 text-[11px] text-gray-500 leading-tight mt-6">
            <HelpCircle size={15} className="text-gray-400 shrink-0 mt-0.5" />
            <span>
              AI recommendations support analyst decisions. Consequential financial decisions
              strictly require human oversight per MFS regulatory guidelines.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
