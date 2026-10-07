export * from "./types";
export * from "./behavioral-baseline";
export * from "./velocity-detector";
export * from "./ato-detector";
export * from "./mule-detector";
export * from "./scam-detector";
export * from "./rule-engine";
export * from "./network-analyzer";
export * from "./risk-scorer";
export * from "./evaluator";
export * from "./audit-logger";

import { evaluateRisk } from "./risk-scorer";
import { evaluateBenchmarkDataset } from "./evaluator";
import { auditLogger } from "./audit-logger";
import { globalVelocityTracker } from "./velocity-detector";
import { globalNetworkIntelligence } from "./network-analyzer";

export const riskEngine = {
  evaluateTransaction: evaluateRisk,
  evaluateBenchmark: evaluateBenchmarkDataset,
  auditLog: auditLogger,
  velocityTracker: globalVelocityTracker,
  networkIntelligence: globalNetworkIntelligence,
};
