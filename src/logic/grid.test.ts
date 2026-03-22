import { describe, expect, it } from "vitest";
import { GRID_SIZE, snapToGrid } from "./grid";

describe("GRID_SIZE", () => {
	it("is 50", () => {
		expect(GRID_SIZE).toBe(50);
	});
});

describe("snapToGrid", () => {
	it("snaps to grid center for value inside a cell", () => {
		// floor(123 / 50) * 50 + 25 = 2 * 50 + 25 = 125
		expect(snapToGrid(123)).toBe(125);
	});

	it("snaps value at cell boundary to next cell center", () => {
		// floor(100 / 50) * 50 + 25 = 2 * 50 + 25 = 125
		expect(snapToGrid(100)).toBe(125);
	});

	it("snaps value at cell center to itself", () => {
		// floor(75 / 50) * 50 + 25 = 1 * 50 + 25 = 75
		expect(snapToGrid(75)).toBe(75);
	});

	it("snaps zero to first cell center", () => {
		// floor(0 / 50) * 50 + 25 = 0 + 25 = 25
		expect(snapToGrid(0)).toBe(25);
	});

	it("snaps negative value to negative cell center", () => {
		// floor(-10 / 50) * 50 + 25 = -1 * 50 + 25 = -25
		expect(snapToGrid(-10)).toBe(-25);
	});

	it("works with custom grid size", () => {
		// floor(30 / 10) * 10 + 5 = 3 * 10 + 5 = 35
		expect(snapToGrid(30, 10)).toBe(35);
	});

	it("handles small fractional values", () => {
		// floor(0.5 / 50) * 50 + 25 = 0 * 50 + 25 = 25
		expect(snapToGrid(0.5)).toBe(25);
	});
});
