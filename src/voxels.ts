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
}

export const createVoxelManager = (scene: Scene): VoxelManager => {
	const geometry = new BoxGeometry(GRID_SIZE, GRID_SIZE, GRID_SIZE);
	const material = new MeshLambertMaterial({ color: 0xfeb74c });
	const mesh = new InstancedMesh(geometry, material, MAX_VOXELS);
	mesh.count = 0;
	mesh.instanceMatrix.setUsage(DynamicDrawUsage);
	scene.add(mesh);

	const matrix = new Matrix4();

	const add = (x: number, y: number, z: number) => {
		if (mesh.count >= MAX_VOXELS) return;
		matrix.makeTranslation(x, y, z);
		mesh.setMatrixAt(mesh.count, matrix);
		mesh.count++;
		mesh.instanceMatrix.needsUpdate = true;
		mesh.computeBoundingSphere();
	};

	const removeAt = (instanceId: number) => {
		if (mesh.count === 0 || instanceId >= mesh.count) return;

		const lastIndex = mesh.count - 1;

		if (instanceId !== lastIndex) {
			mesh.getMatrixAt(lastIndex, matrix);
			mesh.setMatrixAt(instanceId, matrix);
		}

		mesh.count--;
		mesh.instanceMatrix.needsUpdate = true;
		mesh.computeBoundingSphere();
	};

	return { mesh, add, removeAt };
};
