"use client";

import React from "react";
import { Check, X, Info } from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="toast animate-slideInRight select-none border border-brand-border bg-brand-elevated text-brand-text shadow-modal">
      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
        <Check size={12} strokeWidth={2.5} />
      </span>
      <span className="text-xs font-medium text-brand-text">{message}</span>
      <button
        onClick={onClose}
        className="text-brand-muted hover:text-brand-text ml-2 transition-colors p-0.5"
      >
        <X size={13} />
      </button>
    </div>
  );
};
