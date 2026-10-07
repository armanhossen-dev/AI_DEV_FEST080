"use client";

import React, { useState } from "react";
import {
  FileText,
  X,
  Download,
  Copy,
  Printer,
  Check,
  ShieldCheck,
  Building,
} from "lucide-react";

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const reportText = `================================================================================
UPAY SENTINEL — FORMAL SUSPICIOUS ACTIVITY & FRAUD AUDIT DOSSIER (SAR)
DIU CPC × upay AI Hackathon 2026 | Track 01: Trust & Risk Intelligence
================================================================================

Case Reference     : SAR-2026-INV1042
Classification     : Coordinated Money-Mule Syndicate & Account Takeover (ATO)
Date & Time        : ${reportDate} · 02:18 AM UTC+6
Primary Suspect    : Customer Wallet U-1042 (Tanvir Ahmed)
Target Conduit     : Recipient U-8831 (Linked to Syndicate Cluster #17)
Disputed Volume    : ৳48,500 BDT (Cumulative Cluster Exposure: ৳2,840,000 BDT)
Calculated Risk    : 94 / 100 [CRITICAL RISK] · AI Model Confidence: 96%
Lead Analyst       : Arman Hossen (DIU Student Developer Team)

--------------------------------------------------------------------------------
1. WHAT HAPPENED? (Chronological Transaction Sequence)
--------------------------------------------------------------------------------
At 02:01 AM UTC+6, a previously unobserved mobile hardware fingerprint (DEV-8821,
Samsung S23) successfully authenticated into wallet U-1042 from an anomalous Mirpur
IP subnet.
- 02:05 AM: A small probing transaction of ৳1,500 was dispatched to verify credentials.
- 02:08 AM: A velocity burst of 3 rapid transfers was executed within 180 seconds.
- 02:13 AM: Primary critical transfer of ৳48,500 was initiated targeting wallet U-8831.
- 02:15 AM: Graph neural network matched recipient U-8831 as a layer-1 aggregator for
            organized money-mule syndicate Cluster #17 (17 wallets, 43 transactions).

--------------------------------------------------------------------------------
2. WHY IS IT RISKY? (Explainable AI / SHAP Multi-Vector Analysis)
--------------------------------------------------------------------------------
The transaction triggered five statistically independent anomaly flags:
- Amount Vector (92% SHAP Weight): Transfer amount is 4.8× above the customer's
  established 90-day baseline median (৳6,800).
- Hardware Vector (78% SHAP Weight): DEV-8821 is an unrecognized device with zero
  historical link to account U-1042.
- Temporal Vector (74% SHAP Weight): Transacted at 02:13 AM (historic user active window
  is strictly 10:00 AM – 09:00 PM).
- Recipient Vector (91% SHAP Weight): Recipient U-8831 acts as an intermediary node
  funneling aggregated balances into terminal liquidation wallet U-9288.
- Velocity Vector (84% SHAP Weight): 6 transfers across 8 minutes constitutes extreme
  deviation from customer's normal frequency (1 transfer per 48 hours).

--------------------------------------------------------------------------------
3. WHAT SHOULD UPAY DO NEXT? (Actionable Intervention & Regulatory Response)
--------------------------------------------------------------------------------
Immediate Containment Actions:
1. Place immediate automated administrative freeze on outgoing settlements from
   intermediary recipient wallet U-8831 and terminal node U-9288.
2. Trigger mandatory biometric step-up authentication challenge to the verified
   primary smartphone (DEV-2211) and registered SIM of customer U-1042.
3. Coordinate with Bangladesh Bank Financial Intelligence Unit (BFIU) for inter-wallet
   asset preservation.
4. Human Review Safeguard: Final permanent confiscation or legal referral strictly
   conditioned upon analyst confirmation within 15 minutes.

--------------------------------------------------------------------------------
AI MODEL GOVERNANCE & TELEMETRY
--------------------------------------------------------------------------------
Detection Architecture : Ensemble XGBoost Classifier + Isolation Forest + GraphSAGE
Model Precision        : 94.8%
Model Recall           : 96.1%
F1-Score / ROC-AUC     : 95.4% / 98.2%
Drift Metric (K-S test): 0.012 (Status: Optimal / No Drift Detected)
Explanation Engine     : TreeSHAP Feature Attributions + Google Gemini 1.5 Pro RAG
Data Privacy Assurance : 100% Synthetic Financial Dataset (No Real Customer PII Used)

Signed by:
Lead Fraud Analyst: Arman Hossen
Automated Intelligence Verified: upay Sentinel AI Engine
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    onNotify("Audit dossier copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `upay_Sentinel_SAR_INV1042_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify("Audit Report downloaded successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Official Compliance & Audit Dossier (SAR)
              </h2>
              <p className="text-xs text-gray-500">
                Formatted for Bangladesh Bank Regulatory Compliance & upay Executive Review
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Report Preview */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px] text-gray-800 whitespace-pre-wrap leading-relaxed select-text shadow-inner">
          {reportText}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between shrink-0 border-t border-gray-100 text-xs">
          <div className="text-gray-500 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Cryptographically sealed audit log #SEN-9921-2026</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-secondary text-xs flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={handleCopy}
              className="btn btn-secondary text-xs flex items-center gap-1.5"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Text"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="btn btn-primary text-xs flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Download Report (.txt)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
