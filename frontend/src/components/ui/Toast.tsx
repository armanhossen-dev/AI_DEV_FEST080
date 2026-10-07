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
    <div className="toast animate-slideInRight select-none">
      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
        <Check size={12} strokeWidth={3} />
      </span>
      <span className="text-xs font-medium text-emerald-50">{message}</span>
      <button
        onClick={onClose}
        className="text-emerald-400 hover:text-white ml-2 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};
