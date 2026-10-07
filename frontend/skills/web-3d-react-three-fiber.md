---
name: web-3d-react-three-fiber
description: React Three Fiber patterns for Canvas, meshes, materials, lights, cameras, animation, events, physics, and post-processing.
source: https://github.com/agents-inc/skills/tree/main/src/skills/web-3d-react-three-fiber
---

# Web 3D React Three Fiber Patterns

## Critical Rules
1. Do per-frame work by mutating refs inside useFrame, and allocate objects outside it.
2. Multiply per-frame motion by delta.
3. Put a <Suspense> boundary above anything calling asset loaders.
4. Share geometries and materials across identical meshes or use InstancedMesh.
5. In pointer handlers, call event.stopPropagation() to prevent unintended raycast pass-through.
