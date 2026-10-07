"use client";

import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Globe, RefreshCw, Radio, Activity } from "lucide-react";

export interface Hub {
  name: string;
  lat: number;
  lng: number;
  color: number;
  hexColor: string;
  role: string;
  tps: number;
  threatLevel: "Shielded" | "Normal" | "Elevated";
}

export const HUBS: Hub[] = [
  {
    name: "Dhaka Central",
    lat: 23.8103,
    lng: 90.4125,
    color: 0xf59e0b,
    hexColor: "#f59e0b",
    role: "AI Sentinel Primary Gateway",
    tps: 840,
    threatLevel: "Shielded",
  },
  {
    name: "Chattogram Hub",
    lat: 22.3569,
    lng: 91.7832,
    color: 0x06b6d4,
    hexColor: "#06b6d4",
    role: "Port & Commercial Clearing",
    tps: 320,
    threatLevel: "Normal",
  },
  {
    name: "Sylhet Corridor",
    lat: 24.8949,
    lng: 91.8687,
    color: 0x10b981,
    hexColor: "#10b981",
    role: "Remittance & Inbound Smurfing Monitor",
    tps: 185,
    threatLevel: "Elevated",
  },
  {
    name: "Rajshahi Gateway",
    lat: 24.3745,
    lng: 88.6042,
    color: 0x8b5cf6,
    hexColor: "#8b5cf6",
    role: "Western Border Cross-Route",
    tps: 120,
    threatLevel: "Normal",
  },
  {
    name: "Khulna Node",
    lat: 22.8456,
    lng: 89.5403,
    color: 0xf97316,
    hexColor: "#f97316",
    role: "South-West Logistics & Cash-out",
    tps: 160,
    threatLevel: "Normal",
  },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const SentinelGeospatialGrid: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedHub, setSelectedHub] = useState<Hub>(HUBS[0]);
  const [orbiting, setOrbiting] = useState<boolean>(true);
  const [streamVelocity, setStreamVelocity] = useState<number>(1425);

  // Dynamic stream velocity fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setStreamVelocity((v) => Math.floor(v + (40 * Math.random() - 20)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 11);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroup.rotation.y = -0.45 * Math.PI;
    globeGroup.rotation.x = 0.25;

    // 1. Dark core sphere
    const innerGeo = new THREE.SphereGeometry(3.724, 48, 48);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x070d18,
      transparent: true,
      opacity: 0.85,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerMesh);

    // 2. Wireframe grid sphere
    const wireGeo = new THREE.SphereGeometry(3.8, 28, 28);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a5f,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // 3. Atmosphere halo
    const haloGeo = new THREE.SphereGeometry(3.99, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    globeGroup.add(haloMesh);

    // 4. Fibonacci point cloud
    const count = 1400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colGold = new THREE.Color(0xf59e0b);
    const colCyan = new THREE.Color(0x38bdf8);
    const colDim = new THREE.Color(0x334155);

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + 2.23606797749979) * i;
      const radius = 3.8 + (Math.random() - 0.5) * 0.08;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      positions[3 * i] = x;
      positions[3 * i + 1] = y;
      positions[3 * i + 2] = z;

      const rnd = Math.random();
      const col = rnd > 0.85 ? colGold : rnd > 0.6 ? colCyan : colDim;
      colors[3 * i] = col.r;
      colors[3 * i + 1] = col.g;
      colors[3 * i + 2] = col.b;
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    dotGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const dotMat = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const dotPoints = new THREE.Points(dotGeo, dotMat);
    globeGroup.add(dotPoints);

    // 5. Hub markers with radar rings and beacon lines
    const hubMarkers: { mesh: THREE.Mesh; ring: THREE.Mesh; hub: Hub }[] = [];
    HUBS.forEach((hub) => {
      const pos = latLngToVector3(hub.lat, hub.lng, 3.838);

      // Hub node sphere
      const hubGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const hubMat = new THREE.MeshBasicMaterial({ color: hub.color });
      const hubMesh = new THREE.Mesh(hubGeo, hubMat);
      hubMesh.position.copy(pos);
      globeGroup.add(hubMesh);

      // Glowing vertical beacon
      const beaconGeo = new THREE.CylinderGeometry(0.015, 0.04, 0.6, 8);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: hub.color,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.copy(pos.clone().multiplyScalar(1.06));
      beaconMesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        pos.clone().normalize()
      );
      globeGroup.add(beaconMesh);

      // Expanding radar ring
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
      ringMesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        pos.clone().normalize()
      );
      globeGroup.add(ringMesh);

      hubMarkers.push({ mesh: hubMesh, ring: ringMesh, hub });
    });

    // 6. Arcs and flowing telemetry packets
    const connections: [number, number][] = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [1, 2],
      [3, 4],
    ];
    const arcData: {
      curve: THREE.CatmullRomCurve3;
      tubeMesh: THREE.Mesh;
      packetMesh: THREE.Mesh;
      progress: number;
      speed: number;
    }[] = [];

    connections.forEach(([sIdx, eIdx], i) => {
      const p1 = latLngToVector3(HUBS[sIdx].lat, HUBS[sIdx].lng, 3.838);
      const p2 = latLngToVector3(HUBS[eIdx].lat, HUBS[eIdx].lng, 3.838);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      mid.normalize().multiplyScalar(3.8 + Math.max(0.4, 0.7 * dist));

      const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.02, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: i === 0 || i === 1 ? 0xf59e0b : 0x06b6d4,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      globeGroup.add(tubeMesh);

      const packetGeo = new THREE.SphereGeometry(0.065, 12, 12);
      const packetMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
      });
      const packetMesh = new THREE.Mesh(packetGeo, packetMat);
      globeGroup.add(packetMesh);

      arcData.push({
        curve,
        tubeMesh,
        packetMesh,
        progress: Math.random(),
        speed: 0.35 + 0.4 * Math.random(),
      });
    });

    // Interaction controls
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    const targetRotation = { x: 0.25, y: -0.45 * Math.PI };
    const mouseOffset = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / height) * 2 - 1);
      mouseOffset.x = 0.2 * normX;
      mouseOffset.y = 0.2 * normY;

      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      targetRotation.y += 0.006 * dx;
      targetRotation.x = Math.max(-0.8, Math.min(0.8, targetRotation.x + 0.006 * dy));
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

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

    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (orbiting && !isDragging) {
        targetRotation.y += 0.12 * delta;
      }

      globeGroup.rotation.y +=
        (targetRotation.y + mouseOffset.x - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x +=
        (targetRotation.x + mouseOffset.y - globeGroup.rotation.x) * 0.08;
      wireMesh.rotation.y = 0.03 * elapsed;

      hubMarkers.forEach((m, idx) => {
        const pulse = 1 + 0.25 * Math.sin(3 * elapsed + idx);
        m.ring.scale.set(pulse, pulse, 1);
        (m.ring.material as THREE.MeshBasicMaterial).opacity =
          0.4 + 0.35 * Math.sin(3 * elapsed + idx);
      });

      arcData.forEach((arc) => {
        arc.progress = (arc.progress + delta * arc.speed) % 1;
        const pt = arc.curve.getPoint(arc.progress);
        arc.packetMesh.position.copy(pt);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
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
  }, [orbiting]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden select-none border border-line bg-gradient-to-b from-[#090e1a] via-[#0c1424] to-[#070b14] text-white shadow-xl"
      style={{ minHeight: "420px" }}
    >
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />

      {/* Top Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 backdrop-blur-md shadow-lg shadow-amber-500/10">
            <Globe size={18} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Sentinel Geospatial Defense Grid
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              National Digital Financial Infrastructure · DIU CPC × upay Telemetry
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 pointer-events-auto">
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-1.5 backdrop-blur-md flex items-center gap-2 text-xs">
            <Activity size={14} className="text-amber-400" />
            <span className="text-slate-400">Stream Velocity:</span>
            <span className="font-mono font-bold text-amber-300">
              {streamVelocity.toLocaleString()} TPS
            </span>
          </div>

          <button
            onClick={() => setOrbiting(!orbiting)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all backdrop-blur-md flex items-center gap-1.5 ${
              orbiting
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800/80 text-slate-400 border-slate-700"
            }`}
            title="Toggle Orbital Auto-Rotation"
          >
            <RefreshCw
              size={12}
              className={orbiting ? "animate-spin" : ""}
              style={{ animationDuration: "8s" }}
            />
            <span>Orbit {orbiting ? "ON" : "PAUSED"}</span>
          </button>
        </div>
      </div>

      {/* Bottom Overlay: Hub switchers & Telemetry details */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-3 pointer-events-none">
        {/* Hub Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80 backdrop-blur-md max-w-lg">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 py-1 flex items-center gap-1">
            <Radio size={11} className="text-amber-400" />
            Hubs:
          </span>
          {HUBS.map((hub) => {
            const isSelected = selectedHub.name === hub.name;
            return (
              <button
                key={hub.name}
                onClick={() => setSelectedHub(hub)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hub.hexColor }} />
                <span>{hub.name.replace(" Central", "").replace(" Hub", "").replace(" Corridor", "").replace(" Gateway", "").replace(" Node", "")}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Hub Inspector Card */}
        <div className="pointer-events-auto bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 backdrop-blur-md shadow-2xl min-w-[280px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: selectedHub.hexColor }}
              />
              <span className="text-xs font-bold text-white">{selectedHub.name}</span>
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                selectedHub.threatLevel === "Shielded"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : selectedHub.threatLevel === "Elevated"
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-sky-500/20 text-sky-300"
              }`}
            >
              {selectedHub.threatLevel}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mb-2 leading-tight">{selectedHub.role}</p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[9px]">LOCAL TPS</span>
              <b className="text-amber-400 font-bold">{selectedHub.tps} txns/s</b>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[9px]">AI INTERCEPT</span>
              <b className="text-emerald-400 font-bold">&lt; 14ms Latency</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
