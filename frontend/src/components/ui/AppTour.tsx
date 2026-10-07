"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { STATUS, Step } from "react-joyride";

const Joyride = dynamic(() => import("react-joyride").then((mod) => mod.Joyride), { ssr: false });

interface AppTourProps {
  run: boolean;
  onFinish: () => void;
}

export const AppTour: React.FC<AppTourProps> = ({ run, onFinish }) => {
  const [steps] = useState<Step[]>([
    {
      target: "body",
      content: (
        <div>
          <h3 className="font-semibold text-sm text-brand-text mb-1">Welcome to upay Sentinel 🛡️</h3>
          <p className="text-xs text-brand-muted leading-relaxed">
            Enterprise Trust & Risk Intelligence platform detecting mobile financial fraud in real time. 
            Let&apos;s tour the primary operational surfaces.
          </p>
        </div>
      ),
      placement: "center",
    },
    {
      target: ".nav-overview",
      content: (
        <div>
          <h3 className="font-semibold text-sm text-brand-text mb-1">Executive Overview Console</h3>
          <p className="text-xs text-brand-muted leading-relaxed">High-level operational health, alert distribution, 24h risk velocity, and authorized test scenario triggers.</p>
        </div>
      ),
      placement: "right",
    },
    {
      target: ".nav-transactions",
      content: (
        <div>
          <h3 className="font-semibold text-sm text-brand-text mb-1">Transaction Stream Monitor</h3>
          <p className="text-xs text-brand-muted leading-relaxed">Inspect live transactions scored under 2ms by our 12-factor hybrid risk engine.</p>
        </div>
      ),
      placement: "right",
    },
    {
      target: ".btn-simulate",
      content: (
        <div>
          <h3 className="font-semibold text-sm text-brand-text mb-1">Risk Scenario Testing Lab</h3>
          <p className="text-xs text-brand-muted leading-relaxed">Inject synthetic attack vectors (Account Takeover, Velocity Burst, Mule Structuring) to evaluate engine response live.</p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".nav-network",
      content: (
        <div>
          <h3 className="font-semibold text-sm text-brand-text mb-1">Fraud Network Intelligence</h3>
          <p className="text-xs text-brand-muted leading-relaxed">Interactive topological graph revealing syndicate syndication, device fingerprint sharing, and mule hub clusters.</p>
        </div>
      ),
      placement: "right",
    },
    {
      target: ".nav-investigations",
      content: (
        <div>
          <h3 className="font-semibold text-sm text-brand-text mb-1">AI Analyst Workstation</h3>
          <p className="text-xs text-brand-muted leading-relaxed">Review prioritized case dossiers, examine TreeSHAP attributions, and collaborate with the Gemini Risk Copilot.</p>
        </div>
      ),
      placement: "right",
    },
  ]);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      onEvent={handleJoyrideCallback}
      options={{
        primaryColor: '#10B981',
        zIndex: 10000,
        showProgress: true,
        buttons: ['back', 'close', 'primary', 'skip'],
      }}
      styles={{
        overlay: {
          backgroundColor: 'rgba(11, 15, 20, 0.75)',
        },
        tooltip: {
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#11161D',
          color: '#F4F7FA',
          border: '1px solid #252D37',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
        },
        tooltipContent: {
          padding: '0 0 12px 0',
        },
        buttonPrimary: {
          backgroundColor: '#10B981',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 600,
          padding: '6px 12px',
          color: '#0B0F14',
        },
        buttonBack: {
          color: '#9AA6B2',
          fontSize: '11px',
          fontWeight: 500,
          marginRight: '8px',
        },
        buttonSkip: {
          color: '#627282',
          fontSize: '11px',
        },
        buttonClose: {
          color: '#9AA6B2',
        },
      }}
    />
  );
};
