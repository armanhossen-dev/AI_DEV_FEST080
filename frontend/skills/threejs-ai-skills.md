---
name: threejs-ai-skills
description: Comprehensive Three.js engineering guidelines for AI coding agents - Core, Geometry, PBR Materials, Lighting, Cameras, Shaders, Particle Systems, and GPU Performance.
source: https://github.com/alton47/threejs-skills
---

# Three.js AI Skills Guide

## 1. Core Principles
- Always set renderer pixel ratio with clamp: Math.min(window.devicePixelRatio, 2) to preserve mobile/high-DPI performance.
- Enable antialiasing and alpha transparency when layering over HTML/CSS interfaces: new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }).
- Always implement a ResizeObserver or window resize listener that updates camera.aspect = width / height, camera.updateProjectionMatrix(), and renderer.setSize(width, height).
- Clean up GPU resources on component unmount: traverse scene, call geometry.dispose(), material.dispose(), texture.dispose(), and renderer.dispose().

## 2. Animation & Frame Loops
- Use requestAnimationFrame with THREE.Clock.
- Multiply all movement and rotational delta by clock.getDelta() for 60Hz/144Hz consistency.
- Mutate Three.js object positions/rotations directly via refs; never trigger React state re-renders in the render loop.

## 3. Materials & Holographic Styling
- For fintech & cyber security dashboards, use MeshStandardMaterial or MeshPhysicalMaterial with emissive channels (emissive: 0xf59e0b, emissiveIntensity: 0.6).
- Use THREE.AdditiveBlending on particle clouds and glow halos for high-tech holographic vibrancy.
- Use Line2 or CatmullRomCurve3 with tube/cylinder geometries for 3D transaction conduits.
