"use client";

import React, { useState } from "react";
import { NavigationPage, NetworkNode, NetworkEdge } from "@/types";
import { useSentinel } from "@/context/SentinelContext";
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
  Box,
} from "lucide-react";
import { FraudNetwork3D } from "./FraudNetwork3D";

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
  const { networkNodes, networkEdges } = useSentinel();
  const [selectedNodeId, setSelectedNodeId] = useState<string>("U-1042");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");

  const selectedNode = networkNodes.find((n) => n.id === selectedNodeId) || networkNodes[0];

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNodeId(node.id);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-brand-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            GRAPH NEURAL NETWORK &bull; TOPOLOGY &amp; SYNDICATE DISCOVERY
          </div>
          <h1 className="page-title text-brand-text">Fraud Network Intelligence</h1>
          <p className="page-subtitle text-brand-muted">
            Identify coordinated money-mule networks, device-sharing clusters, and multi-hop fund layering in 3D spatial space.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* 2D vs 3D View Switcher */}
          <div className="flex items-center bg-brand-surface border border-brand-border rounded p-0.5 text-xs">
            <button
              onClick={() => setViewMode("3d")}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "3d"
                  ? "bg-upay-gold text-slate-950 font-bold"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              <Sparkles size={12} />
              <span>3D Topology</span>
            </button>
            <button
              onClick={() => setViewMode("2d")}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "2d"
                  ? "bg-brand-elevated text-brand-text border border-brand-border"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              <Layers size={12} />
              <span>2D Matrix</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-brand-surface border border-brand-border rounded p-0.5 text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                filterType === "all" ? "bg-brand-elevated text-brand-text font-bold" : "text-brand-muted"
              }`}
            >
              All Entities
            </button>
            <button
              onClick={() => setFilterType("mule")}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                filterType === "mule" ? "bg-rose-500/15 text-rose-400 font-bold border border-rose-500/30" : "text-brand-muted"
              }`}
            >
              Mule Ring Only
            </button>
            <button
              onClick={() => setFilterType("device")}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                filterType === "device" ? "bg-sky-500/15 text-sky-400 font-bold border border-sky-500/30" : "text-brand-muted"
              }`}
            >
              Device Rings
            </button>
          </div>

          <button
            onClick={() => onNavigate("investigations")}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <Briefcase size={13} />
            <span>Open Case</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas + Cluster Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Network Canvas Card */}
        <div className="lg:col-span-8 card-base min-h-[520px] relative overflow-hidden flex flex-col justify-between border border-brand-border bg-brand-surface">
          {viewMode === "3d" ? (
            <FraudNetwork3D
              selectedNodeId={selectedNodeId}
              onSelectNode={handleNodeClick}
              onOpenCase={onOpenCase}
              filterType={filterType}
            />
          ) : (
            <div className="absolute inset-0 bg-[#0A0E13]">
              {/* Toolbar Top Left */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 bg-brand-surface p-1.5 rounded border border-brand-border z-10">
                <div
                  className="w-7 h-7 flex items-center justify-center rounded text-brand-muted hover:bg-brand-elevated hover:text-brand-text cursor-pointer transition-colors"
                  onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </div>
                <div
                  className="w-7 h-7 flex items-center justify-center rounded text-brand-muted hover:bg-brand-elevated hover:text-brand-text cursor-pointer transition-colors"
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </div>
                <div
                  className="w-7 h-7 flex items-center justify-center rounded text-brand-muted hover:bg-brand-elevated hover:text-brand-text cursor-pointer transition-colors"
                  onClick={() => setZoomLevel(1)}
                  title="Reset View"
                >
                  <Maximize2 size={14} />
                </div>
              </div>

              {/* Legend Top Right */}
              <div className="absolute top-3 right-3 bg-brand-surface p-2.5 rounded border border-brand-border z-10 flex flex-col gap-1 text-[11px] text-brand-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Normal Customer
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> Beneficiary
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" /> Hardware Device
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Flagged Mule Node
                </span>
              </div>

              {/* SVG Graph Drawing */}
              <svg
                viewBox="0 0 920 520"
                className="w-full h-full"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center", transition: "transform 0.2s ease" }}
              >
                {/* Edges */}
                <g>
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
                          stroke={edge.isHot ? "#EF4444" : "#252D37"}
                          strokeWidth={edge.isHot ? 2 : 1}
                          strokeDasharray={edge.isHot ? undefined : "3 3"}
                        />
                        {edge.amount && (
                          <text
                            x={(sNode.x + tNode.x) / 2}
                            y={(sNode.y + tNode.y) / 2 - 4}
                            fill="#9AA6B2"
                            fontSize="8.5"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            ৳{edge.amount.toLocaleString()}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* Nodes */}
                {networkNodes.map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  const fillColor =
                    node.risk === "Critical"
                      ? "#EF4444"
                      : node.risk === "High"
                      ? "#F97316"
                      : node.type === "device"
                      ? "#3B82F6"
                      : "#10B981";

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x} ${node.y})`}
                      onClick={() => handleNodeClick(node)}
                      style={{ cursor: "pointer" }}
                    >
                      <circle
                        r={isSelected ? 24 : node.clusterId === 17 ? 20 : 16}
                        fill={fillColor}
                        stroke="#0B0F14"
                        strokeWidth={isSelected ? 3 : 2}
                      />
                      <text
                        textAnchor="middle"
                        y="3.5"
                        fill="#0B0F14"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {node.type === "device" ? "DEV" : node.type === "merchant" ? "M" : "U"}
                      </text>
                      <text
                        textAnchor="middle"
                        y={isSelected ? 36 : 30}
                        fill="#F4F7FA"
                        fontSize="9.5"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Right Side: Cluster Intelligence Panel */}
        <div className="lg:col-span-4 card-base flex flex-col justify-between border border-brand-border p-4 bg-brand-surface">
          <div>
            {/* Header */}
            <div className="flex items-start gap-2.5 mb-3.5">
              <div className="w-8 h-8 rounded bg-brand-elevated text-upay-gold border border-brand-border flex items-center justify-center shrink-0">
                <Share2 size={16} />
              </div>
              <div>
                <div className="eyebrow text-upay-gold text-[9.5px]">AI-DETECTED SYNDICATE</div>
                <h3 className="text-sm font-bold text-brand-text">Suspicious Cluster #17</h3>
              </div>
            </div>

            {/* Stats Metrics */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-brand-elevated p-2 rounded border border-brand-border">
                <span className="text-[9.5px] text-brand-subtle uppercase font-mono font-bold block">TOTAL WALLETS</span>
                <b className="text-sm font-bold text-brand-text font-mono mt-0.5 block">17 Wallets</b>
              </div>
              <div className="bg-brand-elevated p-2 rounded border border-brand-border">
                <span className="text-[9.5px] text-brand-subtle uppercase font-mono font-bold block">SHARED DEVICES</span>
                <b className="text-sm font-bold text-brand-text font-mono mt-0.5 block">4 Shared</b>
              </div>
              <div className="bg-brand-elevated p-2 rounded border border-brand-border">
                <span className="text-[9.5px] text-brand-subtle uppercase font-mono font-bold block">DISPUTED VOLUME</span>
                <b className="text-sm font-bold text-upay-gold font-mono mt-0.5 block">৳ 2.84M BDT</b>
              </div>
              <div className="bg-brand-elevated p-2 rounded border border-brand-border">
                <span className="text-[9.5px] text-brand-subtle uppercase font-mono font-bold block">CLUSTER RISK</span>
                <b className="text-sm font-bold text-rose-400 font-mono mt-0.5 block">92 / 100</b>
              </div>
            </div>

            {/* AI Graph Assessment */}
            <div className="p-3 rounded bg-brand-elevated border border-brand-border mb-3 text-xs text-brand-muted">
              <div className="flex gap-2">
                <AlertTriangle size={15} className="text-upay-gold shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-brand-text block mb-1 uppercase tracking-wide text-[10.5px]">
                    TOPOLOGICAL LAYERING ARCHITECTURE
                  </span>
                  Hub-and-spoke layering architecture identified. Originating funds routed through burner wallets into single liquidation merchant node (M-0081).
                  <span className="block mt-1 font-mono text-upay-gold font-semibold text-[10.5px]">
                    &bull; Graph Centrality: 8.4 (Critical)
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Node Details */}
            {selectedNode && (
              <div className="p-3 rounded bg-brand-elevated border border-brand-border">
                <div className="text-xs font-bold text-brand-text mb-1 flex items-center justify-between">
                  <span>Selected Entity: <span className="font-mono text-upay-gold">{selectedNode.id}</span></span>
                  <span className={`badge ${selectedNode.risk === "Critical" ? "badge-critical" : "badge-high"}`}>
                    {selectedNode.risk}
                  </span>
                </div>
                <div className="text-[11px] text-brand-muted space-y-0.5">
                  <div>Type: <b className="text-brand-text capitalize">{selectedNode.type}</b></div>
                  <div>Details: {selectedNode.details || "Inspected by Graph Neural Network"}</div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate("investigations")}
            className="btn btn-primary w-full text-xs mt-3 flex items-center justify-center gap-1.5"
          >
            <span>Open Case for Cluster #17</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
