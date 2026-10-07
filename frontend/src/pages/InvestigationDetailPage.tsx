import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import {
  fetchInvestigationById,
  performInvestigationDecision,
  addInvestigationNote,
} from "@/services/investigation-service";
import { InvestigationCase } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import {
  ArrowLeft,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Ban,
  PauseCircle,
  AlertTriangle,
  FileText,
  User,
  ShieldCheck,
  Send,
  History,
  Sparkles,
} from "lucide-react";

export const InvestigationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<InvestigationCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteInput, setNoteInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useOutletContext<{ showToast: (msg: string) => void }>();

  const loadCase = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetchInvestigationById(id);
      setCaseData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [id]);

  const handleDecision = async (decision: "approved" | "held" | "blocked" | "escalated") => {
    if (!caseData || !caseData.transaction) return;
    try {
      setIsSubmitting(true);
      const actorName = profile?.full_name || "Lead Investigator";

      if (decision === "escalated") {
        showToast("Case successfully escalated to Tier-2 incident commanders.");
        return;
      }

      await performInvestigationDecision({
        investigationId: caseData.id,
        transactionId: caseData.transaction_id || caseData.id,
        decision,
        actorName,
        notes: noteInput || `Decision applied: ${decision.toUpperCase()}`,
      });

      showToast(`Decision executed: Case marked ${decision.toUpperCase()}`);
      await loadCase();
    } catch (err) {
      console.error(err);
      showToast("Error updating case status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim() || !caseData) return;
    try {
      setIsSubmitting(true);
      const actorName = profile?.full_name || "Investigator";
      await addInvestigationNote(caseData.id, noteInput.trim(), actorName);
      setNoteInput("");
      showToast("Note appended to official case record.");
      await loadCase();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading Investigation Workspace...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-8 text-center bg-[#0F172A] rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Investigation Case Not Found</h3>
        <button
          onClick={() => navigate("/investigations")}
          className="px-4 py-2 bg-slate-800 text-xs text-white rounded-xl"
        >
          Return to Cases
        </button>
      </div>
    );
  }

  const txn = caseData.transaction;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/investigations")}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Workspace</span>
        </button>

        <span className="text-xs font-mono text-slate-400">
          Case ID: {caseData.id}
        </span>
      </div>

      {/* Case Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">
              Investigation: {txn?.transaction_reference || "TXN-ALERT"}
            </h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
              {caseData.priority} Priority
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Status: {caseData.status}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Created: {new Date(caseData.created_at || Date.now()).toLocaleString()} • Assigned Investigator:{" "}
            <strong className="text-slate-200">{profile?.full_name || "Lead Investigator"}</strong>
          </p>
        </div>

        <div className="text-right flex flex-col items-end gap-2">
          <div>
            <div className="text-xs text-slate-400 uppercase font-medium">Disbursement Value</div>
            <div className="text-2xl font-bold font-mono text-amber-400">
              ৳{Number(txn?.amount || 0).toLocaleString()} BDT
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/copilot")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Consult Copilot</span>
          </button>
        </div>
      </div>

      {/* 3-Column Analyst Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Case Information & Counterparties */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Case Meta & Telemetry
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Sender Origin</span>
                <span className="font-bold text-slate-200">{txn?.sender_name}</span>
                <div className="text-slate-400 font-mono text-[11px]">{txn?.sender_phone_masked}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Recipient Destination</span>
                <span className="font-bold text-slate-200">{txn?.receiver_name}</span>
                <div className="text-slate-400 font-mono text-[11px]">{txn?.receiver_phone_masked}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hardware ID:</span>
                  <span className="font-mono text-slate-200">{txn?.device_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-200">{txn?.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IP Risk Index:</span>
                  <span className="text-rose-400 font-mono font-bold">{txn?.ip_risk}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Investigator Notes & Live Discussion Log */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-4 flex flex-col h-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Investigator Case Notes</span>
            </h3>

            {/* Existing Notes Display */}
            <div className="flex-1 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed min-h-[140px] whitespace-pre-wrap overflow-y-auto">
              {caseData.investigator_notes || "No notes logged yet. Add initial assessment below."}
            </div>

            {/* Note Input Form */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Log observation, corroborating proof, or call log..."
                rows={2}
                className="w-full p-2.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 resize-none"
              />
              <button
                type="submit"
                disabled={isSubmitting || !noteInput.trim()}
                className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Append Note to Case Audit</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Decision Console & Audit History */}
        <div className="space-y-4">
          {/* Action Console */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-amber-500/30 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Apply Human Decision</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleDecision("held")}
                disabled={isSubmitting}
                className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold"
              >
                HOLD Funds
              </button>
              <button
                onClick={() => handleDecision("blocked")}
                disabled={isSubmitting}
                className="py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold"
              >
                BLOCK Txn
              </button>
              <button
                onClick={() => handleDecision("approved")}
                disabled={isSubmitting}
                className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold"
              >
                APPROVE
              </button>
              <button
                onClick={() => handleDecision("escalated")}
                disabled={isSubmitting}
                className="py-2.5 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold"
              >
                ESCALATE
              </button>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Immutable Action Audit Log</span>
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
              {caseData.actions && caseData.actions.length > 0 ? (
                caseData.actions.map((act) => (
                  <div key={act.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-200 capitalize">
                        {act.action_type.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(act.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      By: <strong className="text-amber-400">{act.actor_name}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-xs py-2">No actions recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
