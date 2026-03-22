import { describe, expect, it } from "vitest";
import {
	applyGravity,
	CODE_TO_KEY,
	computeDirection,
	type GravityConfig,
} from "./physics";

// --- CODE_TO_KEY ---

describe("CODE_TO_KEY", () => {
	it("maps WASD codes to movement keys", () => {
		expect(CODE_TO_KEY.KeyW).toBe("forward");
		expect(CODE_TO_KEY.KeyS).toBe("backward");
		expect(CODE_TO_KEY.KeyA).toBe("left");
		expect(CODE_TO_KEY.KeyD).toBe("right");
	});

	it("returns undefined for unmapped codes", () => {
		expect(CODE_TO_KEY.KeyQ).toBeUndefined();
		expect(CODE_TO_KEY.Space).toBeUndefined();
	});
});

// --- computeDirection ---

describe("computeDirection", () => {
	const noKeys = { forward: false, backward: false, left: false, right: false };

	it("returns zero vector when no keys pressed", () => {
		const { x, z } = computeDirection(noKeys);
		expect(x).toBe(0);
		expect(z).toBe(0);
	});

	it("returns (0, -1) for forward only", () => {
		const { x, z } = computeDirection({ ...noKeys, forward: true });
		expect(x).toBe(0);
		expect(z).toBe(-1);
	});

	it("returns (0, 1) for backward only", () => {
		const { x, z } = computeDirection({ ...noKeys, backward: true });
		expect(x).toBe(0);
		expect(z).toBe(1);
	});

	it("returns (-1, 0) for left only", () => {
		const { x, z } = computeDirection({ ...noKeys, left: true });
		expect(x).toBe(-1);
		expect(z).toBe(0);
	});

	it("returns (1, 0) for right only", () => {
		const { x, z } = computeDirection({ ...noKeys, right: true });
		expect(x).toBe(1);
		expect(z).toBe(0);
	});

	it("normalizes diagonal movement to length 1", () => {
		const { x, z } = computeDirection({ ...noKeys, forward: true, left: true });
		const length = Math.sqrt(x * x + z * z);
		expect(length).toBeCloseTo(1);
	});

	it("cancels out opposing forward/backward", () => {
		const { x, z } = computeDirection({
			...noKeys,
			forward: true,
			backward: true,
		});
		expect(x).toBe(0);
		expect(z).toBe(0);
	});

	it("cancels out opposing left/right", () => {
		const { x, z } = computeDirection({
			...noKeys,
			left: true,
			right: true,
		});
		expect(x).toBe(0);
		expect(z).toBe(0);
	});
});

// --- applyGravity ---

describe("applyGravity", () => {
	const config: GravityConfig = { gravity: 980, playerHeight: 80 };
	const dt = 1 / 60;

	it("accelerates downward when in the air", () => {
		const state = { velocityY: 0, positionY: 200, canJump: false };
		const result = applyGravity(state, dt, config);
		expect(result.velocityY).toBeLessThan(0);
		expect(result.positionY).toBeLessThan(200);
	});

	it("clamps to ground and enables jump on landing", () => {
		const state = { velocityY: -500, positionY: 81, canJump: false };
		const result = applyGravity(state, dt, config);
		expect(result.positionY).toBe(80);
		expect(result.velocityY).toBe(0);
		expect(result.canJump).toBe(true);
	});

	it("preserves canJump=false while in air", () => {
		const state = { velocityY: 100, positionY: 200, canJump: false };
		const result = applyGravity(state, dt, config);
		expect(result.canJump).toBe(false);
	});

	it("preserves canJump=true while in air (edge case)", () => {
		const state = { velocityY: 100, positionY: 200, canJump: true };
		const result = applyGravity(state, dt, config);
		expect(result.canJump).toBe(true);
	});

	it("does not modify original state (immutability)", () => {
		const state = { velocityY: 0, positionY: 200, canJump: false };
		const copy = { ...state };
		applyGravity(state, dt, config);
		expect(state).toEqual(copy);
	});
});
