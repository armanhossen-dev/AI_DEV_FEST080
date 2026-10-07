---
name: r3f-quality-performance
description: High-performance 3D scene architecture, visual quality, GPU optimization, responsive layout, and browser QA.
source: https://github.com/nonaxanon/r3f-skills
---

# R3F Quality & Performance

## Optimization Checklist
1. Clamp DPR to 2 maximum.
2. Geometry instancing for multi-node graphs (InstancedMesh).
3. Disable shadow maps when soft ambient and emissive glows convey depth.
4. Pause rendering when tab is inactive (document.visibilityState).
5. Comprehensive dispose() cleanup in useEffect return callback.
