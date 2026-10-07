import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchTransactions, GetTransactionsResult } from "@/services/transaction-service";
import { DbTransaction, RiskAssessment, RiskLevel } from "@/types";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Layers, AlertCircle } from "lucide-react";

export const TransactionsPage: React.FC = () => {
  const [data, setData] = useState<GetTransactionsResult>({ transactions: [], totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const search = searchParams.get("search") || "";
  const riskLevel = (searchParams.get("risk") as RiskLevel | "all") || "all";
  const status = searchParams.get("status") || "all";
  const sortBy = (searchParams.get("sort") as "recent" | "risk" | "amount") || "recent";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 20;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchTransactions({
          page,
          limit,
          search,
          riskLevel,
          status,
          sortBy,
        });
        setData(res);
      } catch (err) {
        console.error("Transactions load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page, search, riskLevel, status, sortBy]);

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val === "all" || !val) {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    next.set("page", "1"); // reset to page 1 on filter change
    setSearchParams(next);
  };

  const totalPages = Math.max(1, Math.ceil(data.totalCount / limit));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Transaction Monitoring Feed</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time surveillance stream showing all 1,000+ digital wallet transactions backed by Supabase PostgreSQL.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          Total Records: <strong className="text-amber-400">{data.totalCount.toLocaleString()}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A]/90 border border-slate-800/80 shadow-md space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam("search", e.target.value)}
              placeholder="Search reference, sender, city..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={riskLevel}
              onChange={(e) => updateParam("risk", e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
            >
              <option value="all">Risk Level: All</option>
              <option value="critical">Critical (80-100)</option>
              <option value="high">High (60-79)</option>
              <option value="medium">Medium (30-59)</option>
              <option value="low">Low (0-29)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => updateParam("status", e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
            >
              <option value="all">Status: All</option>
              <option value="completed">Completed</option>
              <option value="under_review">Under Review</option>
              <option value="held">Held (Action Required)</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="risk">Sort: Highest Risk Score</option>
              <option value="amount">Sort: Highest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-[#0F172A]/90 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading transactions from Supabase...</p>
          </div>
        ) : data.transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-500" />
            <p className="text-sm font-semibold">No transactions match your current filters.</p>
            <button
              onClick={() => setSearchParams(new URLSearchParams())}
              className="text-xs text-amber-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Ref & Type</th>
                  <th className="py-3.5 px-4">Sender & Receiver</th>
                  <th className="py-3.5 px-4">Amount (BDT)</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Hardware & Geo</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.transactions.map((t) => {
                  const score = t.assessment?.final_risk_score ?? 10;
                  const level = t.assessment?.risk_level ?? "low";

                  return (
                    <tr
                      key={t.id}
                      onClick={() => navigate(`/transactions/${t.id}`)}
                      className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-200">{t.transaction_reference}</div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {t.transaction_type.replace("_", " ")}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-medium">
                          {t.sender_name} <span className="text-slate-400 text-[10px]">({t.sender_phone_masked})</span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          → {t.receiver_name} <span className="text-slate-500 text-[10px]">({t.receiver_phone_masked})</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-white">
                        ৳{Number(t.amount).toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] ${
                              level === "critical"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                : level === "high"
                                ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                                : level === "medium"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            }`}
                          >
                            {score}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider ${
                              level === "critical"
                                ? "text-rose-400"
                                : level === "high"
                                ? "text-orange-400"
                                : level === "medium"
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {level}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-300 font-medium flex items-center gap-1.5">
                          <span>{t.location}</span>
                          {t.device_new && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">
                              NEW DEV
                            </span>
                          )}
                          {t.beneficiary_new && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                              NEW BEN
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                          {t.device_id}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                            t.transaction_status === "held"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : t.transaction_status === "blocked"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : t.transaction_status === "under_review"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {t.transaction_status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right text-slate-400 text-[11px] font-mono whitespace-nowrap">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        <div className="text-[9px] text-slate-500">
                          {new Date(t.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <strong className="text-slate-200">{page}</strong> of{" "}
            <strong className="text-slate-200">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateParam("page", String(Math.max(1, page - 1)))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-750 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateParam("page", String(Math.min(totalPages, page + 1)))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-750 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
