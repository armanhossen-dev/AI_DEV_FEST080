import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchInvestigations } from "@/services/investigation-service";
import { InvestigationCase } from "@/types";
import { FileSearch, Clock, AlertTriangle, CheckCircle2, PauseCircle, Ban, ArrowRight } from "lucide-react";

export const InvestigationsPage: React.FC = () => {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const statusFilter = searchParams.get("status") || "all";

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchInvestigations(statusFilter);
        setCases(data);
      } catch (err) {
        console.error("Load investigations error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [statusFilter]);

  const setFilter = (val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val === "all") next.delete("status");
    else next.set("status", val);
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <FileSearch className="w-5 h-5 text-amber-400" />
            <span>Fraud Investigation Workspace</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Active fraud investigations queued by the Sentinel AI Decision Support Engine.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {["all", "open", "investigating", "resolved", "escalated"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                statusFilter === st
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading cases...</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="p-12 text-center bg-[#0F172A] rounded-2xl border border-slate-800 text-slate-400">
          <p className="text-sm font-semibold">No investigation cases found for this status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c) => {
            const isCrit = c.priority === "critical";

            return (
              <div
                key={c.id}
                onClick={() => navigate(`/investigations/${c.id}`)}
                className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900 cursor-pointer transition-all shadow-md flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      CASE-{c.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isCrit
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                      }`}
                    >
                      {c.priority} Priority
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {c.transaction?.transaction_reference || "TXN-ALERT"}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Amount:{" "}
                      <strong className="text-amber-400 font-mono">
                        ৳{Number(c.transaction?.amount || 0).toLocaleString()} BDT
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {c.investigator_notes || "Awaiting investigator review and counterparty audit."}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-[11px] font-medium text-slate-300">
                    {c.status}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
