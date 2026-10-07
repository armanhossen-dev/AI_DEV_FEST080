import React, { useEffect, useState } from "react";
import { fetchAnalyticsData, AnalyticsData } from "@/services/analytics-service";
import { BarChart3, TrendingUp, ShieldCheck, Activity, ShieldAlert } from "lucide-react";

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchAnalyticsData();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Aggregating Risk Intelligence Analytics...</p>
      </div>
    );
  }

  const { metrics, riskDistribution, hourlyActivity, topRiskFactors, statusDistribution } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <span>Fraud & Trust Intelligence Analytics</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Deep behavioral metrics, factor frequencies, and capital preservation statistics.
        </p>
      </div>

      {/* Top Aggregates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0F172A]/90 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Prevented Financial Loss
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ৳{(metrics.estimatedPreventedLoss / 100000).toFixed(2)} Lakh
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Directly protected BDT</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A]/90 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Total Monitored Vol.
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.transactionsMonitored.toLocaleString()} Txns
          </div>
          <div className="text-[10px] text-slate-500 mt-1">High-throughput ingestion</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A]/90 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Critical Escalation Rate
          </span>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {((metrics.criticalAlerts / metrics.transactionsMonitored) * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Threshold: &gt;80 score</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A]/90 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Model False-Positive Rate
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {metrics.falsePositiveRate}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Calibrated baseline precision</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risk Factors Breakdown */}
        <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Most Prevalent Risk Factors Detected
          </h3>

          <div className="space-y-3">
            {topRiskFactors.map((f) => (
              <div key={f.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{f.name}</span>
                  <span className="text-amber-400 font-mono font-bold">
                    +{f.avgContribution} avg impact ({f.count} cases)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, f.count * 1.3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Velocity Pattern */}
        <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Hourly Transaction Volume & Flag Density
          </h3>

          <div className="grid grid-cols-6 gap-2 pt-4">
            {hourlyActivity.slice(0, 6).map((h) => (
              <div key={h.hour} className="text-center space-y-1.5">
                <div className="h-32 bg-slate-900 rounded-xl p-1 flex flex-col justify-end">
                  <div
                    className="w-full bg-amber-500/80 rounded-t-lg transition-all"
                    style={{ height: `${Math.min(100, (h.normalCount / 220) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-400">{h.hour}</div>
                <div className="text-[9px] text-rose-400 font-bold">{h.flagCount} flags</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
