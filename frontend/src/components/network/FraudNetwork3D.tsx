"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { NetworkNode } from "@/types";
import { useSentinel } from "@/context/SentinelContext";
import {
  Share2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ShieldAlert,
  Sparkles,
  Info,
  Layers,
  Activity,
  User,
  Smartphone,
  Store,
} from "lucide-react";

interface FraudNetwork3DProps {
  selectedNodeId: string;
  onSelectNode: (node: NetworkNode) => void;
  onOpenCase: (caseId: string) => void;
  filterType: string;
}

export const FraudNetwork3D: React.FC<FraudNetwork3DProps> = ({
  selectedNodeId,
  onSelectNode,
  onOpenCase,
  filterType,
}) => {
  const { networkNodes, networkEdges } = useSentinel();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Filter nodes according to prop
  const visibleNodes = networkNodes.filter((node) => {
    if (filterType === "mule") return node.risk === "Critical" || node.risk === "High";
    if (filterType === "device") return node.type === "device";
    return true;
  });

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 540;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.025);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const clusterGroup = new THREE.Group();
    scene.add(clusterGroup);

    // 2. Node Meshes & Mapping to 3D Coordinates
    const nodeMeshes: { mesh: THREE.Mesh; halo?: THREE.Mesh; node: NetworkNode }[] = [];
    const nodePositionMap = new Map<string, THREE.Vector3>();

    // Map 2D coordinates (0..920, 0..520) to centered 3D (-8..8, -4.5..4.5, -2..2)
    visibleNodes.forEach((node, i) => {
      const x = ((node.x - 460) / 460) * 8.5;
      const y = -((node.y - 260) / 260) * 4.8;
      // Stagger in Z depth to create rich 3D space
      const z = ((i % 5) - 2) * 1.4;
      const pos = new THREE.Vector3(x, y, z);
      nodePositionMap.set(node.id, pos);

      // Node color according to type & risk
      let color = 0x10b981; // Green
      if (node.risk === "Critical") color = 0xf43f5e; // Crimson
      else if (node.risk === "High") color = 0xf97316; // Orange
      else if (node.risk === "Medium") color = 0xf59e0b; // Amber
      else if (node.type === "device") color = 0x3b82f6; // Blue
      else if (node.type === "merchant") color = 0xa855f7; // Purple

      const sphereGeo = new THREE.SphereGeometry(0.38, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.2,
      });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.copy(pos);
      mesh.userData = { nodeId: node.id, node };
      clusterGroup.add(mesh);

      // Halo for high risk nodes
      let halo: THREE.Mesh | undefined;
      if (node.risk === "Critical" || node.risk === "High") {
        const haloGeo = new THREE.RingGeometry(0.5, 0.68, 24);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0xf43f5e,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
        });
        halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.copy(pos);
        clusterGroup.add(halo);
      }

      nodeMeshes.push({ mesh, halo, node });
    });

    // 3. Connect Edges in 3D Space
    interface EdgeParticle {
      curve: THREE.LineCurve3;
      mesh: THREE.Mesh;
      progress: number;
      speed: number;
    }
    const edgeParticles: EdgeParticle[] = [];

    networkEdges.forEach((edge) => {
      const p1 = nodePositionMap.get(edge.source);
      const p2 = nodePositionMap.get(edge.target);
      if (!p1 || !p2) return;

      const curve = new THREE.LineCurve3(p1, p2);
      const points = curve.getPoints(20);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

      const isHot = edge.isHot;
      const lineMat = new THREE.LineBasicMaterial({
        color: isHot ? 0xf43f5e : 0x334155,
        transparent: true,
        opacity: isHot ? 0.85 : 0.4,
        linewidth: isHot ? 2 : 1,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      clusterGroup.add(line);

      // Energy pulse on edge
      const pulseGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: isHot ? 0xff2a55 : 0x38bdf8,
        blending: THREE.AdditiveBlending,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      clusterGroup.add(pulseMesh);

      edgeParticles.push({
        curve,
        mesh: pulseMesh,
        progress: Math.random(),
        speed: (isHot ? 0.7 : 0.35) + Math.random() * 0.2,
      });
    });

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xf59e0b, 2, 50);
    pointLight.position.set(0, 10, 15);
    scene.add(pointLight);

    // 5. Interaction (Raycasting & Orbit rotation)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const targetRot = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mouse.x = (clientX / width) * 2 - 1;
      mouse.y = -(clientY / height) * 2 + 1;

      if (isDragging) {
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        targetRot.y += dx * 0.005;
        targetRot.x = Math.max(-0.6, Math.min(0.6, targetRot.x + dy * 0.005));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        nodeMeshes.map((n) => n.mesh)
      );

      if (intersects.length > 0) {
        const targetMesh = intersects[0].object as THREE.Mesh;
        if (targetMesh.userData?.node) {
          onSelectNode(targetMesh.userData.node);
        }
      }
    };

    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("click", handleClick);

    // 6. Resize Observer
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width || 800;
        height = entry.contentRect.height || 540;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    ro.observe(container);

    // 7. Animation Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth camera/cluster rotation
      clusterGroup.rotation.y += (targetRot.y - clusterGroup.rotation.y) * 0.08;
      clusterGroup.rotation.x += (targetRot.x - clusterGroup.rotation.x) * 0.08;

      // Animate edge energy pulses
      edgeParticles.forEach((ep) => {
        ep.progress = (ep.progress + delta * ep.speed) % 1;
        ep.mesh.position.copy(ep.curve.getPoint(ep.progress));
      });

      // Pulse high-risk halos & bounce selected node
      nodeMeshes.forEach(({ mesh, halo, node }, idx) => {
        if (halo) {
          const s = 1 + Math.sin(time * 3 + idx) * 0.2;
          halo.scale.set(s, s, 1);
        }

        // Highlight selected node
        if (node.id === selectedNodeId) {
          const bump = 1.35 + Math.sin(time * 4) * 0.15;
          mesh.scale.set(bump, bump, bump);
        } else {
          mesh.scale.set(1, 1, 1);
        }
      });

      // Raycast hover check
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(nodeMeshes.map((n) => n.mesh));
      if (hits.length > 0) {
        const hit = hits[0].object as THREE.Mesh;
        const n = hit.userData?.node as NetworkNode;
        setHoveredNode(n);

        // Convert 3D hit position to 2D screen coordinates
        const v = hit.position.clone();
        v.applyMatrix4(clusterGroup.matrixWorld);
        v.project(camera);
        const sx = ((v.x + 1) * width) / 2;
        const sy = ((-v.y + 1) * height) / 2;
        setHoverPos({ x: sx, y: sy });
      } else {
        setHoveredNode(null);
        setHoverPos(null);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("click", handleClick);

      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Line) {
          o.geometry?.dispose();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material?.dispose();
        }
      });
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleNodes, selectedNodeId, filterType]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[540px] rounded-2xl overflow-hidden select-none border border-line bg-[#060a14] shadow-2xl"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* 3D Legend Bar Top Left */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
        <div className="bg-slate-900/90 border border-slate-700/80 px-3 py-2 rounded-xl backdrop-blur-md shadow-lg pointer-events-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles size={12} />
            3D Spatial Topology Mode
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Customer
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Device
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" /> Merchant
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] animate-pulse" /> Mule Node
            </span>
          </div>
        </div>
      </div>

      {/* 3D Hover Tooltip */}
      {hoveredNode && hoverPos && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900/95 border border-slate-700 p-2.5 rounded-xl shadow-2xl backdrop-blur-md text-white text-xs min-w-[180px] -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${hoverPos.x}px`, top: `${hoverPos.y - 12}px` }}
        >
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800">
            <b className="font-mono text-amber-400">{hoveredNode.id}</b>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                hoveredNode.risk === "Critical"
                  ? "bg-rose-500/20 text-rose-300"
                  : hoveredNode.risk === "High"
                  ? "bg-orange-500/20 text-orange-300"
                  : "bg-emerald-500/20 text-emerald-300"
              }`}
            >
              {hoveredNode.risk}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5">
            <div>Label: <b className="text-white">{hoveredNode.label}</b></div>
            <div>Type: <span className="capitalize text-slate-400">{hoveredNode.type}</span></div>
            {hoveredNode.amount && <div>Vol: <span className="font-mono text-amber-300">৳{hoveredNode.amount.toLocaleString()}</span></div>}
          </div>
          <div className="text-[10px] text-amber-400/90 mt-1.5 flex items-center gap-1">
            <span>&bull; Click node to inspect details</span>
          </div>
        </div>
      )}

      {/* Controls Hint Bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 border border-slate-800 px-4 py-1.5 rounded-full backdrop-blur-md text-[11px] text-slate-400 flex items-center gap-2 pointer-events-none">
        <Activity size={12} className="text-amber-400" />
        <span>Click &amp; drag to rotate in 3D &middot; Click any node to select cluster</span>
      </div>
    </div>
  );
};
