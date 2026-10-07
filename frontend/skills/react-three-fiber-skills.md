---
name: react-three-fiber-skills
description: React Three Fiber (R3F) ecosystem best practices, component architecture, and hooks.
source: https://github.com/EnzeD/r3f-skills
---

# React Three Fiber Skills

## 1. Canvas & Declarative Scene Graph
- The React tree represents the 3D scene graph.
- Every Three.js class maps directly to a camelCase JSX element (<mesh>, <sphereGeometry>, <meshStandardMaterial>).
- R3F hooks (useFrame, useThree) must only be called inside <Canvas> child components.

## 2. Ref Mutation vs State
- Refs for mutation (x, y, z positions, rotations, colors inside useFrame).
- React state for structural changes (selected node, filter mode, active camera target).
