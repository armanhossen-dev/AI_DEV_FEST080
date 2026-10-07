import React from "react";

interface AppTourProps {
  run: boolean;
  onFinish: () => void;
}

export const AppTour: React.FC<AppTourProps> = ({ run, onFinish }) => {
  if (!run) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-[#0F172A] border border-amber-500/40 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>Welcome to upay Sentinel 🛡️</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          AI Trust & Risk Intelligence Platform for Digital Financial Services. Sentinel detects account takeover vectors, mule syndicates, and abnormal volume spikes in real-time.
        </p>
        <button
          onClick={onFinish}
          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
        >
          Got it, Proceed to Command Center
        </button>
      </div>
    </div>
  );
};
