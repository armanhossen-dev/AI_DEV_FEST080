"use client";

import React, { useState } from "react";
import { NavigationPage, NetworkNode, NetworkEdge } from "@/types";
import { networkNodes, networkEdges } from "@/lib/data";
import {
  Share2,
  Sparkles,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Briefcase,
  AlertTriangle,
  Layers,
  Smartphone,
  Store,
  User,
} from "lucide-react";

interface FraudNetworkViewProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenCase: (caseId: string) => void;
  onNotify: (msg: string) => void;
}

export const FraudNetworkView: React.FC<FraudNetworkViewProps> = ({
  onNavigate,
  onOpenCase,
  onNotify,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("U-1042");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterType, setFilterType] = useState<string>("all");

  const selectedNode = networkNodes.find((n) => n.id === selectedNodeId) || networkNodes[0];

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNodeId(node.id);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">GRAPH NEURAL NETWORK & TOPOLOGY ANALYSIS</div>
          <h1 className="page-title">Fraud Network Intelligence</h1>
          <p className="page-subtitle">
            Uncover coordinated money-mule rings, shared device rings, and rapid fund layering across accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-surface border border-line rounded-lg p-1 text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded font-medium ${
                filterType === "all" ? "bg-emerald-50 text-emerald-800" : "text-muted"
              }`}
            >
              All Nodes
            </button>
            <button
              onClick={() => setFilterType("mule")}
              className={`px-2.5 py-1 rounded font-medium ${
                filterType === "mule" ? "bg-rose-50 text-rose-700" : "text-muted"
              }`}
            >
              Mule Syndicate Only
            </button>
          </div>

          <button
            onClick={() => onNavigate("investigation")}
            className="btn btn-primary text-xs flex items-center gap-2"
          >
            <Briefcase size={14} />
            <span>Create Investigation</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas + Cluster Panel */}
      <div className="grid grid-cols-12 gap-4">
        {/* Network Canvas Card */}
        <div className="col-span-8 card-base network-card relative overflow-hidden flex flex-col justify-between">
          {/* Canvas Background with Grid Dots */}
          <div className="network-canvas absolute inset-0">
            {/* Toolbar Top Left */}
            <div className="network-toolbar">
              <div
                className="tool"
                onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </div>
              <div
                className="tool"
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </div>
              <div
                className="tool"
                onClick={() => setZoomLevel(1)}
                title="Reset View"
              >
                <Maximize2 size={14} />
              </div>
            </div>

            {/* Legend Top Right */}
            <div className="graph-legend shadow-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0e9f67]" /> Customer
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5d7d72]" /> Recipient
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5574b8]" /> Device
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#dc3f4d]" /> Suspicious Node
              </span>
            </div>

            {/* SVG Graph Drawing */}
            <svg
              viewBox="0 0 920 520"
              className="w-full h-full"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center", transition: "transform 0.2s ease" }}
            >
              {/* Edges / Connections */}
              <g className="edges">
                {networkEdges.map((edge, idx) => {
                  const sNode = networkNodes.find((n) => n.id === edge.source);
                  const tNode = networkNodes.find((n) => n.id === edge.target);
                  if (!sNode || !tNode) return null;

                  return (
                    <g key={idx}>
                      <line
                        x1={sNode.x}
                        y1={sNode.y}
                        x2={tNode.x}
                        y2={tNode.y}
                        className={edge.isHot ? "hot-edge" : undefined}
                      />
                      {edge.amount && (
                        <text
                          x={(sNode.x + tNode.x) / 2}
                          y={(sNode.y + tNode.y) / 2 - 5}
                          fill="#879b93"
                          fontSize="9"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          ৳{(edge.amount / 1000).toFixed(0)}k
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Cluster #17 Halo Outline */}
              <g className="cluster-halo">
                <ellipse cx="510" cy="255" rx="260" ry="200" />
              </g>

              {/* Cluster Label Badge */}
              <g className="cluster-label" transform="translate(470 420)">
                <rect width="130" height="26" rx="13" />
                <text x="65" y="17" textAnchor="middle">
                  Mule Cluster #17
                </text>
              </g>

              {/* Nodes */}
              {networkNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                let nodeClass = "graph-node";

                if (isSelected) nodeClass += " selected";
                else if (node.risk === "Critical") nodeClass += " danger";
                else if (node.risk === "High") nodeClass += " warn";
                else if (node.type === "device") nodeClass += " device";
                else if (node.type === "merchant") nodeClass += " merchant";

                return (
                  <g
                    key={node.id}
                    className={nodeClass}
                    transform={`translate(${node.x} ${node.y})`}
                    onClick={() => handleNodeClick(node)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle r={isSelected ? 28 : node.clusterId === 17 ? 24 : 20}>
                      <title>{node.label} - Risk: {node.risk}</title>
                    </circle>
                    <text textAnchor="middle" y="4">
                      {node.type === "device" ? "DEV" : node.type === "merchant" ? "M" : "U"}
                      <title>{node.label} - Risk: {node.risk}</title>
                    </text>
                    <text className="node-label" textAnchor="middle" y={isSelected ? 42 : 36}>
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Bottom Live Hint */}
            <div className="network-hint">
              <span className="pulse" />
              <span>Interactive Graph · Click any entity to inspect node telemetry</span>
            </div>
          </div>
        </div>

        {/* Right Side: Cluster Intelligence Panel */}
        <div className="col-span-4 card-base cluster-panel flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="cluster-head">
              <div className="cluster-icon">
                <Share2 size={20} />
              </div>
              <div>
                <div className="eyebrow">AI-DETECTED SYNDICATE</div>
                <h3 className="section-title text-base">Suspicious Cluster #17</h3>
              </div>
            </div>

            {/* Stats Metrics */}
            <div className="cluster-stats">
              <div className="p-3 bg-appBg rounded-lg">
                <b className="text-ink text-lg">17</b>
                <span className="text-[11px] text-subtle">Linked Wallets</span>
              </div>
              <div className="p-3 bg-appBg rounded-lg">
                <b className="text-ink text-lg">43</b>
                <span className="text-[11px] text-subtle">Transactions</span>
              </div>
              <div className="p-3 bg-appBg rounded-lg">
                <b className="text-ink text-lg">8</b>
                <span className="text-[11px] text-subtle">Shared Devices</span>
              </div>
              <div className="p-3 bg-appBg rounded-lg">
                <b className="text-ink text-lg">৳2.8M</b>
                <span className="text-[11px] text-subtle">Aggregate Volume</span>
              </div>
            </div>

            {/* AI Assessment Banner */}
            <div className="assessment">
              <Sparkles size={20} className="shrink-0 mt-0.5" />
              <div>
                <span>AI TOPOLOGICAL CLASSIFICATION</span>
                <b className="text-xs">High probability of coordinated money-mule activity.</b>
                <small>Confidence 93% · Topological density ratio 4.8</small>
              </div>
            </div>

            {/* Selected Node Details Card */}
            <div className="mt-4 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-950 pb-1.5 border-b border-emerald-100">
                <span>Selected Entity: {selectedNode.label}</span>
                <span className="badge badge-critical text-[9px]">{selectedNode.risk}</span>
              </div>
              <p className="text-xs text-ink mt-2">{selectedNode.details}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onNavigate("customers")}
                  className="btn btn-secondary text-xs flex items-center gap-1.5 py-1"
                >
                  <User size={13} />
                  <span>Customer 360</span>
                </button>
                <button
                  onClick={() => onNotify(`Created targeted alert for ${selectedNode.label}`)}
                  className="btn btn-ghost text-xs text-emerald-800"
                >
                  Tag Entity
                </button>
              </div>
            </div>

            {/* Top Indicators Checklist */}
            <div className="indicators mt-4">
              <h4 className="text-xs font-bold text-ink mb-2">Syndicate Key Indicators</h4>
              {[
                "Shared device DEV-8821 across victim & recipient accounts",
                "Rapid fund hopping (< 180 seconds between hops)",
                "Layering to terminal liquidation node U-9288",
                "Nocturnal burst transactions past 02:00 AM",
              ].map((indicator, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-ink py-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 font-bold text-[9px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{indicator}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={() => onNavigate("investigation")}
            className="btn btn-primary w-full text-xs mt-4 flex items-center justify-center gap-2"
          >
            <span>Create Case for Cluster #17</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Network Timeline Mini Card */}
      <div className="card-base timeline-mini p-4 flex items-center gap-6">
        <div className="w-52 shrink-0">
          <h4 className="text-xs font-bold text-ink">Network Hourly Velocity</h4>
          <span className="text-[11px] text-subtle">Transactions across cluster entities</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="timeline-bars h-12 flex items-end gap-1">
            {[28, 45, 33, 68, 42, 84, 55, 92, 70, 38, 48, 64, 51, 30, 25, 62, 79, 95, 88, 40].map(
              (h, i) => (
                <i
                  key={i}
                  style={{ height: `${h}%` }}
                  className={h > 80 ? "hot bg-rose-500" : "bg-[#8bd4b5]"}
                  title={`Hour ${i}: ${h} transactions`}
                />
              )
            )}
          </div>
          <div className="flex justify-between text-[10px] text-subtle font-mono pt-1">
            <span>12:00 AM</span>
            <span>06:00 AM</span>
            <span>12:00 PM</span>
            <span>06:00 PM</span>
            <span className="text-emerald-700 font-bold">Now</span>
          </div>
        </div>
      </div>
    </div>
  );
};
