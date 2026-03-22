# Voxel Space

FPS-style interactive voxel builder using three.js and TypeScript.

## Build & Dev

- Dev server: `npm run dev`
- Build: `npm run build`
- Type check: `npx tsc --noEmit`
- Lint & format: `npx @biomejs/biome check --write ./src`
- Test: `npm test`
- Test (watch): `npm run test:watch`
- Full check: `npx @biomejs/biome check ./src && npx tsc --noEmit && npm test`

## Code Style

- Arrow functions with `const` (no `function` declarations)
- Named imports from three.js (not `import * as THREE`)
- `import type` for type-only imports (`verbatimModuleSyntax` enforced)
- Explicit return types on exported functions
- Comments in English
- Biome handles formatting: tabs, double quotes, organized imports

## Project Structure

- `src/main.ts` — Entry point, animation loop
- `src/scene.ts` — Scene, Renderer, Lights, Fog
- `src/player.ts` — Camera, PointerLockControls, Character, Movement, Jump
- `src/objects.ts` — Grid, Ground plane, Voxel definitions
- `src/interaction.ts` — Crosshair raycast, Voxel place/remove
- `src/logic/grid.ts` — Grid snap pure function
- `src/logic/physics.ts` — Movement direction, gravity pure functions

## Architecture

- Animation loop via `renderer.setAnimationLoop` (three.js recommended)
- PointerLockControls for FPS camera (click to lock, Esc to unlock)
- Player movement: WASD + Space jump with gravity
- Voxel interaction: raycast from screen center, max 250 units (5 voxels)
- All voxels share a single geometry and material instance
- `objects` array serves as the raycast hit-test target list

## Testing

- Vitest for unit tests on pure logic extracted to `src/logic/`
- Test files co-located: `*.test.ts` next to source
- Pure functions (grid snap, physics) are separated from three.js dependencies
