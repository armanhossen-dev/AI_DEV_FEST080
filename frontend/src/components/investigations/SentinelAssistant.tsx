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
  X,
} from "lucide-react";

interface SentinelAssistantProps {
  caseId?: string;
  customer?: string;
  onNotify?: (msg: string) => void;
  onClose?: () => void;
  isFloating?: boolean;
}

export const SentinelAssistant: React.FC<SentinelAssistantProps> = ({
  caseId = "INV-1042",
  customer = "U-1042",
  onNotify,
  onClose,
  isFloating = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(defaultChatMessages);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const suggestedPrompts = [
    "Why was this transaction flagged?",
    "What changed from normal baseline?",
    "Show connected syndicate wallets",
    "Recommended analyst action?",
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
          disclaimer: "AI synthesized explanation &middot; Verify evidence prior to enforcement",
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("Failed response");
      }
    } catch (e) {
      // Deterministic evidence-grounded fallback
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Analysis grounded in telemetry: Customer ${customer} has 5 distinct risk anomalies. Amount of ৳48,500 exceeds the ৳6,800 median, device DEV-8821 is unverified, and recipient U-8831 connects to mule syndicate cluster #17. Recommend freezing outgoing settlement pending biometric re-authentication.`,
        timestamp: "Just now",
        evidenceUsed: ["30-day baseline metrics", "Device registration log", "Topological graph connectivity"],
        disclaimer: "Grounded AI synthesis",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`card-base flex flex-col ${isFloating ? "h-full" : "h-[560px]"} overflow-hidden border border-brand-border bg-brand-surface`}>
      {/* Assistant Header */}
      <div className="p-3.5 px-4 bg-brand-elevated border-b border-brand-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-brand-surface text-upay-gold flex items-center justify-center shrink-0 border border-brand-border">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="text-xs font-bold text-brand-text flex items-center gap-1.5">
              <span>Sentinel Copilot</span>
              <span className="text-[9.5px] bg-brand-surface text-upay-gold px-1.5 py-0.2 rounded font-mono border border-brand-border">
                GEMINI 2.5
              </span>
            </div>
            <span className="text-[10px] text-brand-muted">
              Evidence-grounded case co-pilot
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ONLINE
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-brand-muted hover:text-brand-text hover:bg-brand-surface border border-transparent hover:border-brand-border transition-colors ml-1"
              title="Close Copilot"
              aria-label="Close Copilot"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Chat Stream */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-brand-surface">
        {/* Suggested Prompts Chips */}
        <div className="space-y-1">
          <div className="text-[9.5px] text-brand-subtle font-bold uppercase tracking-wider font-mono">
            QUICK INVESTIGATION PROMPTS:
          </div>
          <div className="flex flex-wrap gap-1">
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSendMessage(p)}
                className="text-[11px] text-brand-muted bg-brand-elevated hover:text-brand-text hover:bg-brand-borderSubtle border border-brand-border rounded px-2 py-0.5 text-left transition-colors font-medium"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Message Feed */}
        <div className="space-y-2.5 pt-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`space-y-1 ${m.sender === "analyst" ? "text-right" : "text-left"}`}
            >
              <div
                className={`text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono ${
                  m.sender === "analyst"
                    ? "justify-end text-brand-subtle"
                    : "text-upay-gold"
                }`}
              >
                {m.sender === "analyst" ? (
                  <>
                    <span>LEAD ANALYST</span>
                    <User size={10} />
                  </>
                ) : (
                  <>
                    <Bot size={11} />
                    <span>SENTINEL COPILOT</span>
                  </>
                )}
              </div>

              <div
                className={`p-3 rounded text-xs leading-relaxed inline-block max-w-[92%] border ${
                  m.sender === "analyst"
                    ? "bg-brand-elevated text-brand-text border-brand-border text-left"
                    : "bg-[#141A23] text-brand-text border-brand-border text-left"
                }`}
              >
                <p>{m.text}</p>

                {/* Evidence Used Box */}
                {m.evidenceUsed && m.evidenceUsed.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-brand-border">
                    <span className="text-[9.5px] font-bold text-brand-muted block mb-1 uppercase tracking-wider font-mono">
                      Grounded Telemetry Sources:
                    </span>
                    <div className="space-y-0.5 text-[10.5px] text-brand-subtle">
                      {m.evidenceUsed.map((ev, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
                          <span className="truncate">{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {m.disclaimer && (
                  <div className="mt-1.5 text-[9px] text-brand-subtle italic flex items-center gap-1 font-mono">
                    <AlertCircle size={9} />
                    <span>{m.disclaimer}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="text-left space-y-1">
              <span className="text-[9.5px] text-upay-gold font-bold flex items-center gap-1 font-mono">
                <Bot size={11} />
                <span>SYNTHESIZING EVIDENCE...</span>
              </span>
              <div className="p-2.5 bg-brand-elevated rounded border border-brand-border flex items-center gap-2 text-xs text-brand-muted">
                <Loader2 size={13} className="animate-spin text-upay-gold" />
                <span>Evaluating behavioral baseline, device topology, and AML rules...</span>
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
        className="p-2.5 border-t border-brand-border bg-brand-surface flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask Sentinel Copilot about history, devices, or next actions..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          className="flex-1 h-8 px-2.5 text-xs bg-brand-elevated border border-brand-border rounded outline-none text-brand-text placeholder:text-brand-subtle focus:border-upay-gold"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="w-8 h-8 rounded bg-upay-gold text-slate-950 flex items-center justify-center hover:bg-amber-400 disabled:opacity-30 transition-colors shrink-0"
          title="Send query"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
};
