"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Globe, Shield, Activity, RefreshCw, Zap, Eye, Radio } from "lucide-react";

interface Hub {
  name: string;
  lat: number;
  lng: number;
  color: number;
  hexColor: string;
  role: string;
  tps: number;
  threatLevel: "Normal" | "Elevated" | "Shielded";
}

const REGIONAL_HUBS: Hub[] = [
  { name: "Dhaka Central", lat: 23.8103, lng: 90.4125, color: 0xf59e0b, hexColor: "#f59e0b", role: "AI Sentinel Primary Gateway", tps: 840, threatLevel: "Shielded" },
  { name: "Chattogram Hub", lat: 22.3569, lng: 91.7832, color: 0x06b6d4, hexColor: "#06b6d4", role: "Port & Commercial Clearing", tps: 320, threatLevel: "Normal" },
  { name: "Sylhet Corridor", lat: 24.8949, lng: 91.8687, color: 0x10b981, hexColor: "#10b981", role: "Remittance & Inbound Smurfing Monitor", tps: 185, threatLevel: "Elevated" },
  { name: "Rajshahi Gateway", lat: 24.3745, lng: 88.6042, color: 0x8b5cf6, hexColor: "#8b5cf6", role: "Western Border Cross-Route", tps: 120, threatLevel: "Normal" },
  { name: "Khulna Node", lat: 22.8456, lng: 89.5403, color: 0xf97316, hexColor: "#f97316", role: "South-West Logistics & Cash-out", tps: 160, threatLevel: "Normal" },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const SentinelGlobe3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeHub, setActiveHub] = useState<Hub>(REGIONAL_HUBS[0]);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"standard" | "threat" | "arcs">("standard");
  const [liveTps, setLiveTps] = useState<number>(1425);
  const [isSimulatingAttack, setIsSimulatingAttack] = useState<boolean>(false);

  // Live TPS fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTps((prev) => Math.floor(prev + (Math.random() * 40 - 20)));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.8, 12.8);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Group that holds everything to allow uniform rotation
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Initial orientation focusing on South Asia
    globeGroup.rotation.y = -Math.PI * 0.45;
    globeGroup.rotation.x = 0.25;

    // 2. Core Globe Geometries
    const radius = 3.8;

    // Inner dark sphere core
    const sphereGeo = new THREE.SphereGeometry(radius * 0.98, 48, 48);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x070c18,
      transparent: true,
      opacity: 0.85,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphereMesh);

    // Outer wireframe latitude/longitude cage
    const wireGeo = new THREE.SphereGeometry(radius, 28, 28);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a5f,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // Outer atmosphere glow shell
    const atmoGeo = new THREE.SphereGeometry(radius * 1.05, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    globeGroup.add(atmoMesh);

    // 3. Dense Surface Particle Constellation (Financial Grid Points)
    const particleCount = 1400;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorGold = new THREE.Color(0xf59e0b);
    const colorCyan = new THREE.Color(0x38bdf8);
    const colorNavy = new THREE.Color(0x334155);

    for (let i = 0; i < particleCount; i++) {
      // Fibonacci sphere distribution
      const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
      const theta = Math.PI * (1 + 5 ** 0.5) * i;

      const pRadius = radius + (Math.random() - 0.5) * 0.08;
      const x = pRadius * Math.sin(phi) * Math.cos(theta);
      const y = pRadius * Math.cos(phi);
      const z = pRadius * Math.sin(phi) * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation
      const rand = Math.random();
      const col = rand > 0.85 ? colorGold : rand > 0.6 ? colorCyan : colorNavy;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particleSystem);

    // 4. Regional Hub Markers & Outer Pulsing Rings
    const hubMarkers: { mesh: THREE.Mesh; ring: THREE.Mesh; hub: Hub; baseScale: number }[] = [];

    REGIONAL_HUBS.forEach((hub) => {
      const pos = latLngToVector3(hub.lat, hub.lng, radius * 1.01);

      // Core node sphere
      const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: hub.color,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      globeGroup.add(nodeMesh);

      // Beacon beam radiating outward
      const beamGeo = new THREE.CylinderGeometry(0.015, 0.04, 0.6, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: hub.color,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      // Align beam to radial normal
      beamMesh.position.copy(pos.clone().multiplyScalar(1.06));
      beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      globeGroup.add(beamMesh);

      // Pulsing ring flat on sphere
      const ringGeo = new THREE.RingGeometry(0.14, 0.22, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hub.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos.clone().multiplyScalar(1.015));
      ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());
      globeGroup.add(ringMesh);

      hubMarkers.push({ mesh: nodeMesh, ring: ringMesh, hub, baseScale: 1 });
    });

    // 5. 3D Transaction Arcs between Regional Hubs
    interface ArcData {
      curve: THREE.CatmullRomCurve3;
      tubeMesh: THREE.Mesh;
      packetMesh: THREE.Mesh;
      progress: number;
      speed: number;
    }
    const arcs: ArcData[] = [];

    // Create arcs connecting Dhaka to all other hubs + Chattogram to Sylhet
    const hubPairs: [number, number][] = [
      [0, 1], // Dhaka -> Chattogram
      [0, 2], // Dhaka -> Sylhet
      [0, 3], // Dhaka -> Rajshahi
      [0, 4], // Dhaka -> Khulna
      [1, 2], // Chattogram -> Sylhet
      [3, 4], // Rajshahi -> Khulna
    ];

    hubPairs.forEach(([fromIdx, toIdx], arcIdx) => {
      const fromPos = latLngToVector3(REGIONAL_HUBS[fromIdx].lat, REGIONAL_HUBS[fromIdx].lng, radius * 1.01);
      const toPos = latLngToVector3(REGIONAL_HUBS[toIdx].lat, REGIONAL_HUBS[toIdx].lng, radius * 1.01);

      // Midpoint elevated above sphere to create arch
      const midPoint = new THREE.Vector3()
        .addVectors(fromPos, toPos)
        .multiplyScalar(0.5);
      const distance = fromPos.distanceTo(toPos);
      midPoint.normalize().multiplyScalar(radius + Math.max(0.4, distance * 0.7));

      const curve = new THREE.CatmullRomCurve3([fromPos, midPoint, toPos]);

      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.02, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: arcIdx === 0 || arcIdx === 1 ? 0xf59e0b : 0x06b6d4,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      globeGroup.add(tubeMesh);

      // Moving packet along arc
      const packetGeo = new THREE.SphereGeometry(0.065, 12, 12);
      const packetMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
      });
      const packetMesh = new THREE.Mesh(packetGeo, packetMat);
      globeGroup.add(packetMesh);

      arcs.push({
        curve,
        tubeMesh,
        packetMesh,
        progress: Math.random(),
        speed: 0.35 + Math.random() * 0.4,
      });
    });

    // 6. Interactive Drag & Mouse Parallax
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const targetRotation = { x: 0.25, y: -Math.PI * 0.45 };
    const mouseParallax = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / height) * 2 - 1);
      mouseParallax.x = normX * 0.2;
      mouseParallax.y = normY * 0.2;

      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      targetRotation.y += deltaX * 0.006;
      targetRotation.x = Math.max(-0.8, Math.min(0.8, targetRotation.x + deltaY * 0.006));

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // 7. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width || 600;
        height = entry.contentRect.height || 420;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    // 8. Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Auto-rotation if not dragging
      if (autoRotate && !isDragging) {
        targetRotation.y += delta * 0.12;
      }

      // Smooth interpolation for rotation
      globeGroup.rotation.y += (targetRotation.y + mouseParallax.x - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (targetRotation.x + mouseParallax.y - globeGroup.rotation.x) * 0.08;

      // Outer wireframe subtle counter-twist
      wireMesh.rotation.y = time * 0.03;

      // Pulse beacon rings
      hubMarkers.forEach(({ ring, hub }, i) => {
        const pulse = 1 + Math.sin(time * 3 + i) * 0.25;
        ring.scale.set(pulse, pulse, 1);
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.4 + Math.sin(time * 3 + i) * 0.35;
      });

      // Animate transaction packets along 3D arcs
      arcs.forEach((arc) => {
        arc.progress = (arc.progress + delta * arc.speed) % 1;
        const pt = arc.curve.getPoint(arc.progress);
        arc.packetMesh.position.copy(pt);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      // Traverse and dispose resources
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [autoRotate]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] md:h-[560px] rounded-2xl overflow-hidden select-none border border-brand-border dark:border-line bg-gradient-to-b from-[#080E1C] via-[#0B152A] to-[#050914] text-white shadow-xl dark:shadow-2xl transition-all duration-300"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Top Overlay: Title & Live Threat Badge */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-3 pointer-events-none z-10">
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/90 p-2 px-3 rounded-xl backdrop-blur-md shadow-lg pointer-events-auto">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
            <Globe size={16} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Sentinel Geospatial Defense Grid
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <p className="text-[10.5px] text-slate-300 font-medium">
              National Financial Infrastructure &middot; DIU CPC &times; upay Telemetry
            </p>
          </div>
        </div>

        {/* Live Metrics Header */}
        <div className="hidden md:flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl px-3 py-1.5 backdrop-blur-md flex items-center gap-2 text-xs shadow-lg">
            <Activity size={14} className="text-amber-400" />
            <span className="text-slate-300 font-medium">Velocity:</span>
            <span className="font-mono font-bold text-amber-300">{liveTps.toLocaleString()} TPS</span>
          </div>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all backdrop-blur-md flex items-center gap-1.5 shadow-lg ${
              autoRotate
                ? "bg-amber-500/25 text-amber-300 border-amber-500/50 hover:bg-amber-500/35"
                : "bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white"
            }`}
            title="Toggle Orbital Auto-Rotation"
          >
            <RefreshCw size={12} className={autoRotate ? "animate-spin" : ""} style={{ animationDuration: "8s" }} />
            <span>Orbit {autoRotate ? "ON" : "PAUSED"}</span>
          </button>
        </div>
      </div>

      {/* Bottom Overlay: Hub Selectors & Live Telemetry Inspector */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-3 pointer-events-none z-10">
        {/* Hub Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-slate-950/85 p-2 rounded-xl border border-slate-800/90 backdrop-blur-md shadow-xl max-w-lg">
          <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold px-2 py-0.5 flex items-center gap-1 font-mono">
            <Radio size={11} className="text-amber-400" />
            Hubs:
          </span>
          {REGIONAL_HUBS.map((hub) => {
            const isSelected = activeHub.name === hub.name;
            return (
              <button
                key={hub.name}
                onClick={() => setActiveHub(hub)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-extrabold"
                    : "text-slate-200 hover:bg-slate-800/90 hover:text-white"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: hub.hexColor }}
                />
                <span>{hub.name.replace(" Central", "").replace(" Hub", "").replace(" Corridor", "").replace(" Gateway", "").replace(" Node", "")}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Hub Telemetry Card */}
        <div className="pointer-events-auto bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 backdrop-blur-md shadow-2xl w-full md:w-80 shrink-0">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: activeHub.hexColor }}
              />
              <span className="text-xs font-bold text-white">{activeHub.name}</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
              activeHub.threatLevel === "Shielded"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : activeHub.threatLevel === "Elevated"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
            }`}>
              {activeHub.threatLevel}
            </span>
          </div>

          <p className="text-[11.5px] text-slate-200 mb-2.5 leading-snug font-medium">
            {activeHub.role}
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800/90">
              <span className="text-slate-400 block text-[9.5px] font-semibold">LOCAL VELOCITY</span>
              <b className="text-amber-400 font-bold text-xs">{activeHub.tps} txns/s</b>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800/90">
              <span className="text-slate-400 block text-[9.5px] font-semibold">AI INFERENCE</span>
              <b className="text-emerald-400 font-bold text-xs">&lt; 14ms Latency</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
