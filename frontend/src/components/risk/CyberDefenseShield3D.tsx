"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Shield, Sparkles, Activity } from "lucide-react";

interface CyberDefenseShield3DProps {
  score: number;
  threatLevel: string;
}

export const CyberDefenseShield3D: React.FC<CyberDefenseShield3DProps> = ({
  score,
  threatLevel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    let width = container.clientWidth || 320;
    let height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const shieldGroup = new THREE.Group();
    scene.add(shieldGroup);

    // Color based on risk score
    let themeColorHex = 0x10b981; // Green
    if (score >= 80) themeColorHex = 0xf43f5e; // Crimson
    else if (score >= 50) themeColorHex = 0xf59e0b; // Amber

    // 1. Faceted Shield Prism Geometry
    // Extrude or create a custom shield-shaped polygon
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.8);
    shape.lineTo(1.4, 1.2);
    shape.lineTo(1.3, -0.4);
    shape.lineTo(0, -1.8);
    shape.lineTo(-1.3, -0.4);
    shape.lineTo(-1.4, 1.2);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.15,
      bevelThickness: 0.15,
    };

    const shieldGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    shieldGeo.center();

    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: themeColorHex,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.7,
      wireframe: false,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldGroup.add(shieldMesh);

    // Outer wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: themeColorHex,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const wireMesh = new THREE.Mesh(shieldGeo, wireMat);
    shieldGroup.add(wireMesh);

    // 2. Orbital Cyber Radar Rings
    const ring1Geo = new THREE.RingGeometry(2.3, 2.38, 36);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: themeColorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ringMat1);
    shieldGroup.add(ring1);

    const ring2Geo = new THREE.RingGeometry(2.6, 2.65, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ringMat2);
    shieldGroup.add(ring2);

    // 3. Ambient & Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(themeColorHex, 2.5, 20);
    pointLight.position.set(0, 2, 5);
    scene.add(pointLight);

    // 4. Floating Defense Particles
    const pCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 1.8 + Math.random() * 1.5;
      pPos[i * 3] = Math.cos(angle) * dist;
      pPos[i * 3 + 1] = Math.sin(angle) * dist;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: themeColorHex,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const pSystem = new THREE.Points(pGeo, pMat);
    shieldGroup.add(pSystem);

    // 5. Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / height) * 2 - 1);
    };
    container.addEventListener("mousemove", handleMove);

    // 6. Resize
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width || 320;
        height = entry.contentRect.height || 260;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    ro.observe(container);

    // 7. Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Gentle floating oscillation + mouse follow
      shieldMesh.rotation.y = Math.sin(time * 1.2) * 0.15 + mouseX * 0.4;
      shieldMesh.rotation.x = Math.cos(time * 1.0) * 0.1 + mouseY * 0.3;
      wireMesh.rotation.copy(shieldMesh.rotation);

      // Radar rings rotation
      ring1.rotation.z = time * 0.4;
      ring2.rotation.z = -time * 0.25;
      ring2.rotation.x = 0.3 + Math.sin(time * 0.5) * 0.1;

      // Particle rotation
      pSystem.rotation.z = time * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      container.removeEventListener("mousemove", handleMove);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
          o.geometry?.dispose();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material?.dispose();
        }
      });
      renderer.dispose();
    };
  }, [score, threatLevel]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[260px] rounded-2xl overflow-hidden select-none bg-gradient-to-b from-[#090d18] to-[#040710] border border-line flex items-center justify-center shadow-lg"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Center Score Badge */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
          Neural Defense Index
        </span>
        <span className="text-3xl font-black font-mono text-white tracking-tight drop-shadow-lg">
          {score}
          <span className="text-base text-slate-400 font-normal">/100</span>
        </span>
        <span
          className={`px-2 py-0.5 mt-1 rounded text-[10px] font-bold font-mono tracking-wide uppercase ${
            score >= 80
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : score >= 50
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          }`}
        >
          {threatLevel} Threat
        </span>
      </div>
    </div>
  );
};
