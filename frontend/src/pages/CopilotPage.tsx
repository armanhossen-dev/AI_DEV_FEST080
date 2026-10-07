import React, { useState } from "react";
import { askSentinelCopilot, generateDailyRiskBriefing, CopilotResponse } from "@/services/copilot-service";
import {
  Sparkles,
  Send,
  ShieldAlert,
  ArrowRight,
  Bot,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";

export const CopilotPage: React.FC = () => {
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      role: "user" | "copilot";
      text?: string;
      copilotData?: CopilotResponse;
      briefingData?: any;
    }>
  >([
    {
      id: "msg-welcome",
      role: "copilot",
      text: "Hello, Investigator. I am Sentinel Copilot. I analyze transaction telemetry, corroborate behavioral profiles, and extract explainable evidence to assist your investigation. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    "Why is TXN-CRIT-ATO-8821 critical?",
    "Show today's highest-risk fraud patterns",
    "Find transfers above ৳30,000 with new beneficiaries",
    "Compare midnight transactions against customer baseline",
    "Which investigations should I prioritize first?",
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim() || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", text: q }]);
    setInput("");
    setIsLoading(true);

    try {
      // Check if reference mentioned
      const txnMatch = q.match(/TXN-[A-Za-z0-9_-]+/i);
      const transactionRef = txnMatch ? txnMatch[0] : undefined;

      const response = await askSentinelCopilot({
        question: q,
        transactionId: transactionRef ? undefined : undefined,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `copilot-${Date.now()}`,
          role: "copilot",
          copilotData: response,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `copilot-err-${Date.now()}`,
          role: "copilot",
          text: "Sentinel Copilot temporarily unavailable. Core risk detection and investigation tools remain fully operational.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBriefing = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const briefing = await generateDailyRiskBriefing();
      setMessages((prev) => [
        ...prev,
        {
          id: `briefing-${Date.now()}`,
          role: "copilot",
          briefingData: briefing,
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Sentinel Copilot — AI Investigation Assistant</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Decision-support intelligence powered by retrieved database telemetry.
          </p>
        </div>

        <button
          onClick={handleGenerateBriefing}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs transition-colors shadow-sm self-start sm:self-auto disabled:opacity-50"
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Generate Daily Risk Briefing</span>
        </button>
      </div>

      {/* Suggested Questions Bar */}
      <div className="p-3.5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Quick Natural Language Prompts
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((sq) => (
            <button
              key={sq}
              onClick={() => handleSend(sq)}
              className="text-left px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-amber-300 text-xs transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="space-y-4">
        {messages.map((m) => {
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end gap-3">
                <div className="max-w-xl p-3.5 rounded-2xl bg-amber-500 text-slate-950 text-xs font-semibold shadow-md">
                  {m.text}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                  <User className="w-4 h-4" />
                </div>
              </div>
            );
          }

          // Plain text message
          if (m.text) {
            return (
              <div key={m.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 text-slate-950 shadow-md shadow-amber-500/10">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-2xl p-4 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
                  <p>{m.text}</p>
                </div>
              </div>
            );
          }

          // Daily Briefing Card
          if (m.briefingData) {
            const b = m.briefingData;
            return (
              <div key={m.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 text-slate-950 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-3xl p-5 rounded-2xl bg-gradient-to-br from-[#0F172A] to-slate-900 border border-amber-500/40 shadow-xl space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="font-bold text-amber-400 text-sm">{b.title}</span>
                    <span className="text-[10px] text-slate-400">Generated Live from Supabase</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">Critical Alerts</span>
                      <span className="text-xl font-bold font-mono text-rose-400">{b.criticalAlerts}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">High Risk Alerts</span>
                      <span className="text-xl font-bold font-mono text-orange-400">{b.highRiskAlerts}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">Protected Capital</span>
                      <span className="text-xl font-bold font-mono text-emerald-400">{b.preventedLoss}</span>
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed">{b.summary}</p>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-amber-300">Priority Actions:</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {b.priorityActions.map((pa: string, i: number) => (
                        <li key={i}>{pa}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          }

          // Structured Copilot Response
          if (m.copilotData) {
            const data = m.copilotData;
            return (
              <div key={m.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 text-slate-950 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>

                <div className="max-w-3xl p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4 text-xs">
                  {/* Activity Trace */}
                  {data.activity_trace && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400 pb-2 border-b border-slate-800">
                      <span className="text-amber-400 font-bold">Sentinel Agent Trace:</span>
                      {data.activity_trace.map((tr, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <span>{tr}</span>
                          {idx < (data.activity_trace?.length || 0) - 1 && <span className="text-slate-600">→</span>}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Header with Risk Level */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white leading-relaxed">{data.summary}</span>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        data.risk_level === "critical"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : data.risk_level === "high"
                          ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {data.risk_level} ({data.risk_score}/100)
                    </span>
                  </div>

                  {/* Key Findings */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block">Key Findings:</span>
                    <div className="space-y-1">
                      {data.key_findings.map((kf, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-300">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{kf}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block">Corroborating Evidence:</span>
                    <div className="space-y-1">
                      {data.evidence.map((ev, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-400 font-mono text-[11px]">
                          <span className="text-cyan-400">↳</span>
                          <span>{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-amber-300 block">
                      Sentinel Advisory Recommendation:
                    </span>
                    <ul className="space-y-1 text-slate-200">
                      {data.recommended_actions.map((act, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800/80">
                    * Decision-Support Guidance: Authorized human investigators retain final decision authority.
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 text-slate-950 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              <span>Sentinel Copilot analyzing telemetry and retrieving evidence...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="sticky bottom-6 p-2 rounded-2xl bg-[#0F172A]/95 border border-slate-750 shadow-2xl flex items-center gap-2 backdrop-blur-md"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Sentinel Copilot (e.g., Why is TXN-CRIT-ATO-8821 critical?)..."
          className="flex-1 px-4 py-2.5 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all font-bold disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
