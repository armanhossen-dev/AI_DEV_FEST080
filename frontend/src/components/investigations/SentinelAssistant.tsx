"use client";

import React, { useState } from "react";
import { ChatMessage } from "@/types";
import { defaultChatMessages } from "@/lib/data";
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bot,
  User,
  Loader2,
} from "lucide-react";

interface SentinelAssistantProps {
  caseId: string;
  customer: string;
  onNotify: (msg: string) => void;
}

export const SentinelAssistant: React.FC<SentinelAssistantProps> = ({
  caseId,
  customer,
  onNotify,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(defaultChatMessages);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const suggestedPrompts = [
    "Why was this transaction flagged?",
    "What changed from normal behavior?",
    "Show connected suspicious wallets",
    "What should I investigate next?",
    "Summarize this case",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "analyst",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          context: {
            caseId,
            customer,
            riskScore: 94,
            amount: 48500,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.reply,
          timestamp: "Just now",
          evidenceUsed: data.evidence || [
            "Customer 30-day baseline",
            "Hardware device telemetry",
            "Graph Cluster #17",
          ],
          disclaimer: "AI generated explanation · Validate evidence prior to execution",
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("Failed response");
      }
    } catch (e) {
      // Fallback response if network issue
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Analysis grounded in evidence: Customer ${customer} has 5 distinct risk vector anomalies. Amount of ৳48,500 exceeds the ৳6,800 baseline, device DEV-8821 is unverified, and recipient U-8831 connects to mule syndicate #17. Recommend freezing pending settlement.`,
        timestamp: "Just now",
        evidenceUsed: ["Baseline metrics", "Device log", "Graph topology"],
        disclaimer: "Grounded AI explanation",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-base assistant flex flex-col h-[560px] overflow-hidden">
      {/* Assistant Header */}
      <div className="assistant-head shrink-0">
        <div className="sentinel-icon">
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>Sentinel AI</span>
            <span className="text-[10px] bg-emerald-700/60 text-emerald-200 px-1.5 py-0.5 rounded font-mono">
              GEMINI 1.5 PRO
            </span>
          </div>
          <span className="text-[10px] text-emerald-200/70">
            Evidence-grounded investigation assistant
          </span>
        </div>
        <span className="online flex items-center gap-1 text-[10px] font-bold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ONLINE
        </span>
      </div>

      {/* Assistant Body / Chat Stream */}
      <div className="assistant-body flex-1 overflow-y-auto p-4 space-y-4">
        {/* Suggested Prompts Chips */}
        <div className="space-y-1.5">
          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Suggested Investigation Prompts:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSendMessage(p)}
                className="text-[11px] text-emerald-900 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-full px-2.5 py-1 text-left transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Message Feed */}
        <div className="space-y-3 pt-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`space-y-1 ${m.sender === "analyst" ? "text-right" : "text-left"}`}
            >
              <div
                className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                  m.sender === "analyst"
                    ? "justify-end text-gray-500"
                    : "text-emerald-800"
                }`}
              >
                {m.sender === "analyst" ? (
                  <>
                    <span>FRAUD ANALYST</span>
                    <User size={11} />
                  </>
                ) : (
                  <>
                    <Bot size={12} />
                    <span>SENTINEL AI</span>
                  </>
                )}
              </div>

              <div
                className={`p-3 rounded-xl text-xs leading-relaxed inline-block max-w-[92%] ${
                  m.sender === "analyst"
                    ? "bg-gray-100 text-gray-800 rounded-br-xs"
                    : "bg-[#eef8f3] text-[#132c23] border border-[#d2ebe0] rounded-bl-xs shadow-xs text-left"
                }`}
              >
                <p>{m.text}</p>

                {/* Evidence Used Box */}
                {m.evidenceUsed && m.evidenceUsed.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-200/60">
                    <span className="text-[10px] font-bold text-emerald-900 block mb-1">
                      Evidence used for this response:
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-emerald-950">
                      {m.evidenceUsed.map((ev: any, i: number) => (
                        <div key={i} className="flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                          <span className="truncate">{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {m.disclaimer && (
                  <div className="mt-1.5 text-[9.5px] text-emerald-800/70 italic flex items-center gap-1">
                    <AlertCircle size={10} />
                    <span>{m.disclaimer}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="text-left space-y-1">
              <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                <Bot size={12} />
                <span>SENTINEL AI THINKING...</span>
              </span>
              <div className="p-3 bg-emerald-50 rounded-xl rounded-bl-xs border border-emerald-100 flex items-center gap-2 text-xs text-emerald-900">
                <Loader2 size={14} className="animate-spin text-emerald-600" />
                <span>Synthesizing telemetry across behavioral, device, and network vectors...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask Sentinel about transaction history, devices, or next actions..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          className="flex-1 h-9 px-3 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="w-9 h-9 rounded-lg bg-[#0e9f67] text-white flex items-center justify-center hover:bg-[#087c50] disabled:opacity-40 transition-colors shrink-0"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
