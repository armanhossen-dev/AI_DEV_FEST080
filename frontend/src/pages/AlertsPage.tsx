import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTransactions } from "@/services/transaction-service";
import { DbTransaction, RiskAssessment } from "@/types";
import { BellRing, ShieldAlert, ArrowRight, Filter, Clock } from "lucide-react";

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<(DbTransaction & { assessment?: RiskAssessment })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium">("all");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchTransactions({
          limit: 50,
          sortBy: "risk",
          riskLevel: filter === "all" ? undefined : filter,
        });
        setAlerts(res.transactions.filter((t) => (t.assessment?.final_risk_score || 0) >= 30));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <BellRing className="w-5 h-5 text-amber-400" />
            <span>Risk Alert Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Prioritized operational alerts requiring supervisory fraud mitigation and review.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {(["all", "critical", "high", "medium"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                filter === lvl
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading risk alerts...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center bg-[#0F172A] rounded-2xl border border-slate-800 text-slate-400">
          <p className="text-sm font-semibold">No alerts currently flagged under this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const score = alert.assessment?.final_risk_score || 50;
            const level = alert.assessment?.risk_level || "medium";
            const isCrit = level === "critical";

            return (
              <div
                key={alert.id}
                onClick={() => navigate(`/transactions/${alert.id}`)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCrit
                    ? "bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60"
                    : "bg-[#0F172A]/90 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold font-mono text-sm shrink-0 ${
                      isCrit
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                    }`}
                  >
                    {score}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">
                        {alert.transaction_reference}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          isCrit ? "bg-rose-500/20 text-rose-300" : "bg-orange-500/20 text-orange-300"
                        }`}
                      >
                        {level}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {alert.transaction_type.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      {alert.assessment?.explanation_summary || "Telemetry deviation observed across multiple vectors."}
                    </p>

                    <div className="text-[11px] text-slate-400">
                      From: <strong className="text-slate-200">{alert.sender_name}</strong> → To:{" "}
                      <strong className="text-slate-200">{alert.receiver_name}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between">
                  <div className="text-base font-bold font-mono text-amber-400">
                    ৳{Number(alert.amount).toLocaleString()} BDT
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
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
