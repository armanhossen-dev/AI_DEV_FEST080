import React, { useState } from "react";
import { DEMO_SCENARIOS } from "@/services/demo-data-service";
import { createLiveTransaction } from "@/services/transaction-service";
import { evaluateTransaction } from "@/lib/risk-engine";
import { ShieldAlert, Zap, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ScenarioRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ScenarioRunnerModal: React.FC<ScenarioRunnerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState(DEMO_SCENARIOS[2].id); // Default to Account Takeover
  const [isExecuting, setIsExecuting] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const currentScenario = DEMO_SCENARIOS.find((s) => s.id === selectedScenarioId) || DEMO_SCENARIOS[0];

  const handleRunScenario = async () => {
    try {
      setIsExecuting(true);
      // Run through live risk engine and save to database
      const txn = await createLiveTransaction(currentScenario.transaction);
      onSuccess(`Scenario Injected: ${currentScenario.title} evaluated and logged into database!`);
      onClose();
      // Directly navigate to transaction detail to inspect the complete explainable workflow
      navigate(`/transactions/${txn.id}`);
    } catch (err: any) {
      console.error("Scenario execution error:", err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Live Attack & Scenario Simulator
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Judge Demo Mode
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Inject deterministic synthetic transaction vectors through the real multi-stage Risk Engine.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Live Scenario
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_SCENARIOS.map((s) => {
              const isSelected = s.id === selectedScenarioId;
              const evalRes = evaluateTransaction(s.transaction, s.baseline);
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedScenarioId(s.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200 truncate">{s.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        s.expectedRiskLevel === "critical"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : s.expectedRiskLevel === "high"
                          ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {s.expectedRiskLevel} ({evalRes.final_risk_score}/100)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Active Scenario Preview Card */}
          <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 font-medium">Telemetry Preview</span>
              <span className="text-amber-400 font-mono font-semibold">
                ৳{currentScenario.transaction.amount.toLocaleString()} BDT
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Sender</span>
                <span className="text-slate-300 font-medium">{currentScenario.transaction.sender_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Recipient</span>
                <span className="text-slate-300 font-medium">{currentScenario.transaction.receiver_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Device</span>
                <span className="text-slate-300 font-mono font-medium">
                  {currentScenario.transaction.device_id}{" "}
                  {currentScenario.transaction.device_new ? "(New)" : ""}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Location</span>
                <span className="text-slate-300 font-medium">{currentScenario.transaction.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Passes through complete Feature Analysis → Fusion Engine</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRunScenario}
              disabled={isExecuting}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isExecuting ? (
                <span>Simulating...</span>
              ) : (
                <>
                  <span>Inject & Investigate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
