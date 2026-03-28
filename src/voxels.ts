import {
	BoxGeometry,
	DynamicDrawUsage,
	InstancedMesh,
	Matrix4,
	MeshLambertMaterial,
	type Scene,
} from "three";
import { GRID_SIZE } from "./logic/grid";

const MAX_VOXELS = 10000;

export interface VoxelManager {
	mesh: InstancedMesh;
	add: (x: number, y: number, z: number) => void;
	removeAt: (instanceId: number) => void;
	removeByPosition: (x: number, y: number, z: number) => void;
	getPosition: (instanceId: number) => [number, number, number] | null;
}

const posKey = (x: number, y: number, z: number): string => `${x},${y},${z}`;

export const createVoxelManager = (scene: Scene): VoxelManager => {
	const geometry = new BoxGeometry(GRID_SIZE, GRID_SIZE, GRID_SIZE);
	const material = new MeshLambertMaterial({ color: 0xfeb74c });
	const mesh = new InstancedMesh(geometry, material, MAX_VOXELS);
	mesh.count = 0;
	mesh.instanceMatrix.setUsage(DynamicDrawUsage);
	scene.add(mesh);

	const matrix = new Matrix4();

	// Position tracking for coordinate-based operations
	const positions: [number, number, number][] = [];
	const posToIndex = new Map<string, number>();

	const add = (x: number, y: number, z: number) => {
		if (mesh.count >= MAX_VOXELS) return;
		const key = posKey(x, y, z);
		if (posToIndex.has(key)) return; // already exists

		const index = mesh.count;
		matrix.makeTranslation(x, y, z);
		mesh.setMatrixAt(index, matrix);
		positions[index] = [x, y, z];
		posToIndex.set(key, index);

		mesh.count++;
		mesh.instanceMatrix.needsUpdate = true;
		mesh.computeBoundingSphere();
	};

	const removeAt = (instanceId: number) => {
		if (mesh.count === 0 || instanceId >= mesh.count) return;

		const lastIndex = mesh.count - 1;

		// Remove position mapping for the removed voxel
		const removedPos = positions[instanceId];
		if (removedPos) {
			posToIndex.delete(posKey(...removedPos));
		}

		if (instanceId !== lastIndex) {
			// Swap last into removed slot
			mesh.getMatrixAt(lastIndex, matrix);
			mesh.setMatrixAt(instanceId, matrix);

			const lastPos = positions[lastIndex];
			if (lastPos) {
				positions[instanceId] = lastPos;
				posToIndex.set(posKey(...lastPos), instanceId);
			}
		}

		mesh.count--;
		mesh.instanceMatrix.needsUpdate = true;
		mesh.computeBoundingSphere();
	};

	const removeByPosition = (x: number, y: number, z: number) => {
		const key = posKey(x, y, z);
		const index = posToIndex.get(key);
		if (index == null) return;
		removeAt(index);
	};

	const getPosition = (instanceId: number): [number, number, number] | null => {
		if (instanceId >= mesh.count) return null;
		return positions[instanceId] ?? null;
	};

	return { mesh, add, removeAt, removeByPosition, getPosition };
};
