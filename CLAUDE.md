# Voxel Space

Interactive voxel builder using three.js and TypeScript.

## Build & Dev

- Dev server: `npm run dev`
- Build: `npm run build`
- Type check: `npx tsc --noEmit`
- Lint & format: `npx @biomejs/biome check --write ./src`
- Full check: `npx @biomejs/biome check ./src && npx tsc --noEmit`

## Code Style

- Arrow functions with `const` (no `function` declarations)
- Named imports from three.js (not `import * as THREE`)
- `import type` for type-only imports (`verbatimModuleSyntax` enforced)
- Explicit return types on exported functions
- Comments in English
- Biome handles formatting: tabs, double quotes, organized imports

## Project Structure

- `src/main.ts` — Entry point, wires modules together
- `src/scene.ts` — Scene, Camera, Renderer, Lights
- `src/objects.ts` — Grid, Ground plane, Voxel definitions
- `src/interaction.ts` — Raycaster, Pointer/Keyboard events

## Architecture

- On-demand rendering (no `requestAnimationFrame` loop)
- `render()` called only on user events (pointermove, pointerdown) and resize
- All voxels share a single geometry and material instance
- `objects` array serves as the raycast hit-test target list
