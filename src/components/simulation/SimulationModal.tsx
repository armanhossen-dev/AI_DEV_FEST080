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
        isNewDevice ? `New device ${customDevice} detected` : "Known device verified",
        Number(customAmount) > 25000 ? "High value transaction" : "Normal value",
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0e9f67] to-[#087c50] text-white flex items-center justify-center shadow-xs">
              <Zap size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Live Attack & Anomaly Simulator
              </h2>
              <p className="text-xs text-gray-500">
                Inject synthetic fraud vectors to demonstrate real-time AI scoring, graph matching & triage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* 4 Pre-built Quick Attack Scenarios */}
        <div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
            1-Click Scenario Injectors
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Scenario 1: Coordinated Mule Syndicate */}
            <div
              onClick={() => handleScenario("mule")}
              className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-50 cursor-pointer transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-critical text-[9px]">CRITICAL SYNDICATE</span>
                <Play size={13} className="text-rose-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <b className="text-xs font-bold text-gray-900 block">
                Mule Network Surge (Cluster #17)
              </b>
              <p className="text-[11px] text-gray-600 leading-tight">
                ৳48,500 transfer to U-8831 with unverified device DEV-8821 at 02:13 AM.
              </p>
            </div>

            {/* Scenario 2: Account Takeover */}
            <div
              onClick={() => handleScenario("ato")}
              className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-50 cursor-pointer transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-high text-[9px]">HIGH RISK ATO</span>
                <Play size={13} className="text-amber-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <b className="text-xs font-bold text-gray-900 block">
                Account Takeover & Cash-out
              </b>
              <p className="text-[11px] text-gray-600 leading-tight">
                USSD reset followed by instant ৳32,000 cash-out in Chattogram.
              </p>
            </div>

            {/* Scenario 3: Micro-structuring Velocity */}
            <div
              onClick={() => handleScenario("velocity")}
              className="p-3.5 rounded-xl border border-yellow-200 bg-yellow-50/60 hover:bg-yellow-50 cursor-pointer transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-medium text-[9px]">BURST VELOCITY</span>
                <Play size={13} className="text-yellow-700 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <b className="text-xs font-bold text-gray-900 block">
                Rapid Layering Velocity Burst
              </b>
              <p className="text-[11px] text-gray-600 leading-tight">
                6 back-to-back fund transfers under threshold within 180 seconds.
              </p>
            </div>

            {/* Scenario 4: Legitimate Baseline */}
            <div
              onClick={() => handleScenario("normal")}
              className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 cursor-pointer transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-low text-[9px]">SAFE BASELINE</span>
                <Play size={13} className="text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <b className="text-xs font-bold text-gray-900 block">
                Legitimate Merchant Grocery Pay
              </b>
              <p className="text-[11px] text-gray-600 leading-tight">
                ৳2,450 to verified supermarket M-291 at 02:30 PM on known device.
              </p>
            </div>
          </div>
        </div>

        {/* Custom Transaction Form */}
        <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-gray-100 space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Custom Parameter Injection
          </h3>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-gray-500 font-medium block mb-1">Amount (BDT ৳)</label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-full h-8 px-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-gray-500 font-medium block mb-1">Transaction Type</label>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as TransactionType)}
                className="w-full h-8 px-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
              >
                <option value="Wallet Transfer">Wallet Transfer</option>
                <option value="Cash Out">Cash Out</option>
                <option value="Merchant Pay">Merchant Pay</option>
                <option value="Add Money">Add Money</option>
              </select>
            </div>

            <div>
              <label className="text-gray-500 font-medium block mb-1">Execution Time</label>
              <input
                type="text"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="e.g. 02:45 AM"
                className="w-full h-8 px-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-gray-500 font-medium block mb-1">Target Recipient</label>
              <input
                type="text"
                value={customRecipient}
                onChange={(e) => setCustomRecipient(e.target.value)}
                className="w-full h-8 px-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-gray-500 font-medium block mb-1">Device ID</label>
              <input
                type="text"
                value={customDevice}
                onChange={(e) => setCustomDevice(e.target.value)}
                className="w-full h-8 px-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none font-mono"
              />
            </div>

            <div className="flex items-center pt-5 gap-2">
              <input
                type="checkbox"
                id="isNew"
                checked={isNewDevice}
                onChange={(e) => setIsNewDevice(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="isNew" className="text-xs text-gray-700 cursor-pointer">
                New/Unrecognized Device
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs flex items-center gap-1.5">
              <Zap size={14} />
              <span>Score & Inject Live</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
