"use client";

import React, { useState } from "react";
import { Transaction, TransactionType } from "@/types";
import {
  Zap,
  X,
  ShieldAlert,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Share2,
} from "lucide-react";

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectTransaction: (txn: Partial<Transaction>) => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  onInjectTransaction,
}) => {
  const [customAmount, setCustomAmount] = useState<number>(45000);
  const [customType, setCustomType] = useState<TransactionType>("Wallet Transfer");
  const [customDevice, setCustomDevice] = useState<string>("DEV-8821");
  const [isNewDevice, setIsNewDevice] = useState<boolean>(true);
  const [customLocation, setCustomLocation] = useState<string>("Dhaka");
  const [customRecipient, setCustomRecipient] = useState<string>("U-8831");
  const [customTime, setCustomTime] = useState<string>("02:45 AM");

  if (!isOpen) return null;

  const handleScenario = (scenario: "mule" | "ato" | "velocity" | "normal") => {
    if (scenario === "mule") {
      onInjectTransaction({
        customer: "U-1042",
        recipient: "U-8831",
        amount: 48500,
        type: "Wallet Transfer",
        device: "DEV-8821",
        isNewDevice: true,
        location: "Dhaka",
        isNewLocation: false,
        time: "02:13 AM",
        flags: [
          "Amount 4.8× above normal baseline",
          "Unrecognized hardware device DEV-8821",
          "Target wallet U-8831 linked to mule syndicate #17",
          "Off-hours nocturnal execution (02:13 AM)",
        ],
      });
    } else if (scenario === "ato") {
      onInjectTransaction({
        customer: "U-2214",
        recipient: "U-9210",
        amount: 32000,
        type: "Cash Out",
        device: "DEV-9932",
        isNewDevice: true,
        location: "Chattogram",
        isNewLocation: true,
        time: "03:15 AM",
        flags: [
          "USSD credential reset preceding transaction",
          "Geographic jump: Dhaka to Chattogram in 40 min",
          "Immediate full-balance cash-out attempt",
        ],
      });
    } else if (scenario === "velocity") {
      onInjectTransaction({
        customer: "U-8821",
        recipient: "U-4412",
        amount: 18500,
        type: "Wallet Transfer",
        device: "DEV-8821",
        isNewDevice: false,
        location: "Dhaka",
        isNewLocation: false,
        time: "01:22 AM",
        flags: [
          "Micro-structuring velocity: 6 transfers in 180 seconds",
          "Recipient linked to mule cluster #17",
        ],
      });
    } else if (scenario === "normal") {
      onInjectTransaction({
        customer: "U-2910",
        recipient: "M-291",
        amount: 2450,
        type: "Merchant Pay",
        device: "DEV-2211",
        isNewDevice: false,
        location: "Dhaka",
        isNewLocation: false,
        time: "02:30 PM",
        flags: ["Within regular daytime spending pattern", "Verified merchant terminal"],
      });
    }
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInjectTransaction({
      customer: "U-CUSTOM",
      recipient: customRecipient,
      amount: Number(customAmount),
      type: customType,
      device: customDevice,
      isNewDevice,
      location: customLocation,
      isNewLocation: false,
      time: customTime,
      flags: [
        isNewDevice ? `New hardware ${customDevice} detected` : "Known device verified",
        Number(customAmount) > 25000 ? "High value transaction" : "Normal value",
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-brand-surface rounded-lg max-w-2xl w-full p-5 shadow-modal border border-brand-border space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-brand-elevated text-upay-gold flex items-center justify-center border border-brand-border">
              <Zap size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-brand-text uppercase tracking-wide">
                Risk Scenario Testing Laboratory
              </h2>
              <p className="text-[11px] text-brand-muted mt-0.5">
                Inject verified synthetic fraud vectors to test deterministic rules, neural scoring, and graph clustering.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-brand-muted hover:bg-brand-elevated hover:text-brand-text transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* 4 Pre-built Quick Attack Scenarios */}
        <div>
          <h3 className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider font-mono mb-2">
            STANDARDIZED TEST SCENARIOS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Scenario 1: Coordinated Mule Syndicate */}
            <div
              onClick={() => handleScenario("mule")}
              className="p-3 rounded border border-brand-border bg-brand-elevated hover:border-risk-critical/40 cursor-pointer transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-critical text-[9px]">CRITICAL SYNDICATE</span>
                <Play size={12} className="text-rose-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <b className="text-xs font-bold text-brand-text block mt-1">
                Mule Network Surge (Cluster #17)
              </b>
              <p className="text-[11px] text-brand-muted leading-snug">
                ৳48,500 transfer to U-8831 with unverified device DEV-8821 at 02:13 AM.
              </p>
            </div>

            {/* Scenario 2: Account Takeover */}
            <div
              onClick={() => handleScenario("ato")}
              className="p-3 rounded border border-brand-border bg-brand-elevated hover:border-risk-critical/40 cursor-pointer transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-high text-[9px]">HIGH RISK ATO</span>
                <Play size={12} className="text-orange-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <b className="text-xs font-bold text-brand-text block mt-1">
                Account Takeover &amp; Cash-Out
              </b>
              <p className="text-[11px] text-brand-muted leading-snug">
                USSD reset followed by instant ৳32,000 cash-out in Chattogram.
              </p>
            </div>

            {/* Scenario 3: Micro-structuring Velocity */}
            <div
              onClick={() => handleScenario("velocity")}
              className="p-3 rounded border border-brand-border bg-brand-elevated hover:border-risk-medium/40 cursor-pointer transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-medium text-[9px]">BURST VELOCITY</span>
                <Play size={12} className="text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <b className="text-xs font-bold text-brand-text block mt-1">
                Structuring &amp; Smurfing Burst
              </b>
              <p className="text-[11px] text-brand-muted leading-snug">
                6 back-to-back fund transfers under threshold within 180 seconds.
              </p>
            </div>

            {/* Scenario 4: Legitimate Baseline */}
            <div
              onClick={() => handleScenario("normal")}
              className="p-3 rounded border border-brand-border bg-brand-elevated hover:border-risk-low/40 cursor-pointer transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-low text-[9px]">SAFE BASELINE</span>
                <Play size={12} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <b className="text-xs font-bold text-brand-text block mt-1">
                Legitimate Merchant Grocery Pay
              </b>
              <p className="text-[11px] text-brand-muted leading-snug">
                ৳2,450 to verified supermarket M-291 at 02:30 PM on known device.
              </p>
            </div>
          </div>
        </div>

        {/* Custom Transaction Form */}
        <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-brand-border space-y-2.5">
          <h3 className="text-[10px] font-bold text-brand-subtle uppercase tracking-wider font-mono">
            CUSTOM TRANSACTION PARAMETER INJECTION
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div>
              <label className="text-brand-muted font-medium block mb-1 text-[11px]">Amount (BDT ৳)</label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-full h-8 px-2 bg-brand-elevated border border-brand-border rounded outline-none font-mono text-brand-text focus:border-upay-gold"
              />
            </div>

            <div>
              <label className="text-brand-muted font-medium block mb-1 text-[11px]">Channel / Type</label>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as TransactionType)}
                className="w-full h-8 px-2 bg-brand-elevated border border-brand-border rounded outline-none text-brand-text"
              >
                <option value="Wallet Transfer">Wallet Transfer</option>
                <option value="Cash Out">Cash Out</option>
                <option value="Merchant Pay">Merchant Pay</option>
                <option value="Add Money">Add Money</option>
              </select>
            </div>

            <div>
              <label className="text-brand-muted font-medium block mb-1 text-[11px]">Execution Time</label>
              <input
                type="text"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="e.g. 02:45 AM"
                className="w-full h-8 px-2 bg-brand-elevated border border-brand-border rounded outline-none font-mono text-brand-text"
              />
            </div>

            <div>
              <label className="text-brand-muted font-medium block mb-1 text-[11px]">Target Recipient</label>
              <input
                type="text"
                value={customRecipient}
                onChange={(e) => setCustomRecipient(e.target.value)}
                className="w-full h-8 px-2 bg-brand-elevated border border-brand-border rounded outline-none font-mono text-brand-text"
              />
            </div>

            <div>
              <label className="text-brand-muted font-medium block mb-1 text-[11px]">Hardware Device</label>
              <input
                type="text"
                value={customDevice}
                onChange={(e) => setCustomDevice(e.target.value)}
                className="w-full h-8 px-2 bg-brand-elevated border border-brand-border rounded outline-none font-mono text-brand-text"
              />
            </div>

            <div className="flex items-center pt-5 gap-2">
              <input
                type="checkbox"
                id="isNew"
                checked={isNewDevice}
                onChange={(e) => setIsNewDevice(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-brand-border bg-brand-elevated text-upay-gold focus:ring-0"
              />
              <label htmlFor="isNew" className="text-xs text-brand-muted cursor-pointer select-none">
                New/Unpaired Hardware
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-brand-border">
            <button type="button" onClick={onClose} className="btn btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs flex items-center gap-1.5">
              <Zap size={13} />
              <span>Score &amp; Inject into Pipeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
