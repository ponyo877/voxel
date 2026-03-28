import { Matrix4, Scene } from "three";
import { describe, expect, it } from "vitest";
import { createVoxelManager } from "./voxels";

describe("createVoxelManager", () => {
	it("starts with count 0", () => {
		const { mesh } = createVoxelManager(new Scene());
		expect(mesh.count).toBe(0);
	});

	it("increments count on add", () => {
		const voxels = createVoxelManager(new Scene());
		voxels.add(25, 25, 25);
		expect(voxels.mesh.count).toBe(1);
	});

	it("stores correct position in instance matrix", () => {
		const voxels = createVoxelManager(new Scene());
		voxels.add(75, 25, 125);

		const matrix = new Matrix4();
		voxels.mesh.getMatrixAt(0, matrix);
		const elements = matrix.elements;
		// Translation is stored at indices 12, 13, 14
		expect(elements[12]).toBe(75);
		expect(elements[13]).toBe(25);
		expect(elements[14]).toBe(125);
	});

	it("decrements count on removeAt", () => {
		const voxels = createVoxelManager(new Scene());
		voxels.add(25, 25, 25);
		voxels.removeAt(0);
		expect(voxels.mesh.count).toBe(0);
	});

	it("swap-removes by moving last instance to removed slot", () => {
		const voxels = createVoxelManager(new Scene());
		voxels.add(25, 25, 25); // index 0
		voxels.add(75, 25, 25); // index 1
		voxels.add(125, 25, 25); // index 2

		// Remove index 0 → last (index 2) swaps into slot 0
		voxels.removeAt(0);
		expect(voxels.mesh.count).toBe(2);

		const matrix = new Matrix4();
		voxels.mesh.getMatrixAt(0, matrix);
		expect(matrix.elements[12]).toBe(125); // was at index 2
	});

	it("handles removing the last instance without swap", () => {
		const voxels = createVoxelManager(new Scene());
		voxels.add(25, 25, 25);
		voxels.add(75, 25, 25);

		voxels.removeAt(1); // remove last → no swap needed
		expect(voxels.mesh.count).toBe(1);

		const matrix = new Matrix4();
		voxels.mesh.getMatrixAt(0, matrix);
		expect(matrix.elements[12]).toBe(25); // unchanged
	});

	it("ignores removeAt on empty mesh", () => {
		const voxels = createVoxelManager(new Scene());
		voxels.removeAt(0);
		expect(voxels.mesh.count).toBe(0);
	});

	it("ignores removeAt with out-of-range instanceId", () => {
		const voxels = createVoxelManager(new Scene());
		voxels.add(25, 25, 25);
		voxels.removeAt(5);
		expect(voxels.mesh.count).toBe(1);
	});

	it("adds mesh to scene", () => {
		const scene = new Scene();
		const voxels = createVoxelManager(scene);
		expect(scene.children).toContain(voxels.mesh);
	});

	it("prevents duplicate add at same position", () => {
		const voxels = createVoxelManager(new Scene());
		voxels.add(25, 25, 25);
		voxels.add(25, 25, 25); // duplicate
		expect(voxels.mesh.count).toBe(1);
	});

	it("removes by position", () => {
		const voxels = createVoxelManager(new Scene());
		voxels.add(25, 25, 25);
		voxels.add(75, 25, 25);

		voxels.removeByPosition(25, 25, 25);
		expect(voxels.mesh.count).toBe(1);
	});

	it("removeByPosition ignores non-existent position", () => {
		const voxels = createVoxelManager(new Scene());
		voxels.add(25, 25, 25);
		voxels.removeByPosition(999, 999, 999);
		expect(voxels.mesh.count).toBe(1);
	});

	it("getPosition returns correct coordinates", () => {
		const voxels = createVoxelManager(new Scene());
		voxels.add(75, 125, 25);
		expect(voxels.getPosition(0)).toEqual([75, 125, 25]);
	});

	it("getPosition returns null for out-of-range", () => {
		const voxels = createVoxelManager(new Scene());
		expect(voxels.getPosition(0)).toBeNull();
	});

	it("position map stays consistent after swap-remove", () => {
		const voxels = createVoxelManager(new Scene());
		voxels.add(25, 25, 25); // index 0
		voxels.add(75, 25, 25); // index 1
		voxels.add(125, 25, 25); // index 2

		voxels.removeAt(0); // swap: index 2 → index 0
		// Now removeByPosition should find the swapped voxel
		voxels.removeByPosition(125, 25, 25);
		expect(voxels.mesh.count).toBe(1);
		expect(voxels.getPosition(0)).toEqual([75, 25, 25]);
	});
});
