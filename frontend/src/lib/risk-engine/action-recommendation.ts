import { RiskLevel } from "@/types";

export interface RecommendationOutput {
  actionCode: "ALLOW" | "MONITOR" | "VERIFY" | "HOLD";
  title: string;
  rationale: string;
  advisoryDisclaimer: string;
}

export function recommendAction(riskLevel: RiskLevel, riskScore: number): RecommendationOutput {
  const disclaimer =
    "Advisory Recommendation: This decision-support guidance is calculated deterministically by Sentinel AI. Final authority remains strictly with authorized human fraud investigators.";

  switch (riskLevel) {
    case "critical":
      return {
        actionCode: "HOLD",
        title: "HOLD — Temporarily hold transaction and escalate for investigation",
        rationale: `Extreme composite risk score (${riskScore}/100) indicates acute compromise probability. Automated temporary disbursement hold recommended pending manual investigator validation.`,
        advisoryDisclaimer: disclaimer,
      };
    case "high":
      return {
        actionCode: "VERIFY",
        title: "VERIFY — Require additional verification and analyst review",
        rationale: `Substantial risk signals (${riskScore}/100). Step-up authentication (out-of-band biometric or OTP verification) and queueing for Tier-2 analyst review advised.`,
        advisoryDisclaimer: disclaimer,
      };
    case "medium":
      return {
        actionCode: "MONITOR",
        title: "MONITOR — Additional behavioral monitoring recommended",
        rationale: `Moderate behavioral deviation (${riskScore}/100). Allow transaction execution while logging contextual telemetry into heightened 24-hour observation bucket.`,
        advisoryDisclaimer: disclaimer,
      };
    case "low":
    default:
      return {
        actionCode: "ALLOW",
        title: "ALLOW — Continue normal monitoring",
        rationale: `Low composite risk (${riskScore}/100). Transaction falls comfortably within recognized user behavioral envelope. Approve and proceed without intervention.`,
        advisoryDisclaimer: disclaimer,
      };
  }
}
