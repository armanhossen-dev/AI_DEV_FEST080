---
name: full-threejs-skills
description: 18 specialized Three.js skills including camera, controls, animation, geometry, lights, materials, post-processing, scenes, textures, and renderers.
source: https://github.com/full-stack-skills/threejs-skills
---

# Full Three.js Skills Collection

## Lighting & Atmosphere
- Ambient light: Low intensity (0.2 - 0.4) to maintain deep shadows.
- Directional / Point lights: Accentuate key facets with brand colors (Amber 0xf59e0b, Cyan 0x06b6d4, Emerald 0x10b981).
- Fog: Use THREE.FogExp2 for infinite depth fading in dark mode dashboards.

## Interaction & Raycasting
- Raycaster setup on pointermove / click: project ray from camera to pointer coordinates.
- Smooth mouse parallax: lerp camera or scene rotation towards pointer target (current + (target - current) * 0.05).
