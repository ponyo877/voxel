import {
	type Mesh,
	type Object3D,
	type PerspectiveCamera,
	Raycaster,
	Vector2,
	Vector3,
} from "three";
import type { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { snapToGrid } from "./logic/grid";
import type { VoxelManager } from "./voxels";

const MAX_DISTANCE = 250;

export interface InteractionParams {
	camera: PerspectiveCamera;
	controls: PointerLockControls;
	rollOverMesh: Mesh;
	plane: Mesh;
	voxels: VoxelManager;
	onVoxelAdd?: (x: number, y: number, z: number) => void;
	onVoxelRemove?: (x: number, y: number, z: number) => void;
}

export interface InteractionContext {
	updatePreview: () => void;
}

export const setupInteraction = ({
	camera,
	controls,
	rollOverMesh,
	plane,
	voxels,
	onVoxelAdd,
	onVoxelRemove,
}: InteractionParams): InteractionContext => {
	const raycaster = new Raycaster();
	raycaster.far = MAX_DISTANCE;
	const center = new Vector2(0, 0);
	const targets: Object3D[] = [plane, voxels.mesh];
	const tempVec = new Vector3();

	let isShiftDown = false;

	// Preview: raycast from camera center each frame
	const updatePreview = () => {
		if (!controls.isLocked) {
			rollOverMesh.visible = false;
			return;
		}

		raycaster.setFromCamera(center, camera);
		const intersect = raycaster.intersectObjects(targets, false)[0];

		if (!intersect?.face) {
			rollOverMesh.visible = false;
			return;
		}

		rollOverMesh.visible = true;
		const p = rollOverMesh.position;
		p.copy(intersect.point).add(intersect.face.normal);
		p.set(snapToGrid(p.x), snapToGrid(p.y), snapToGrid(p.z));
	};

	// Place / remove voxel on click
	const onPointerDown = () => {
		if (!controls.isLocked) return;

		raycaster.setFromCamera(center, camera);
		const intersect = raycaster.intersectObjects(targets, false)[0];
		if (!intersect?.face) return;

		if (isShiftDown) {
			if (intersect.object === voxels.mesh && intersect.instanceId != null) {
				const pos = voxels.getPosition(intersect.instanceId);
				voxels.removeAt(intersect.instanceId);
				if (pos) onVoxelRemove?.(pos[0], pos[1], pos[2]);
			}
		} else {
			tempVec.copy(intersect.point).add(intersect.face.normal);
			const x = snapToGrid(tempVec.x);
			const y = snapToGrid(tempVec.y);
			const z = snapToGrid(tempVec.z);
			voxels.add(x, y, z);
			onVoxelAdd?.(x, y, z);
		}
	};

	// Place 250 voxels in a 5w x 10h x 5d block in front of the player
	const placeVoxelWall = () => {
		const forward = new Vector3();
		camera.getWorldDirection(forward);
		forward.y = 0;
		forward.normalize();

		const right = new Vector3();
		right.crossVectors(forward, new Vector3(0, 1, 0)).normalize();

		const startX = snapToGrid(camera.position.x + forward.x * 200);
		const startZ = snapToGrid(camera.position.z + forward.z * 200);

		for (let w = -2; w <= 2; w++) {
			for (let h = 0; h < 10; h++) {
				for (let d = 0; d < 5; d++) {
					const x = snapToGrid(startX + right.x * w * 50 + forward.x * d * 50);
					const y = snapToGrid(25 + h * 50);
					const z = snapToGrid(startZ + right.z * w * 50 + forward.z * d * 50);
					voxels.add(x, y, z);
					onVoxelAdd?.(x, y, z);
				}
			}
		}
	};

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Shift") isShiftDown = true;
		if (event.shiftKey && event.key === "K") placeVoxelWall();
	};

	const onKeyUp = (event: KeyboardEvent) => {
		if (event.key === "Shift") isShiftDown = false;
	};

	document.addEventListener("pointerdown", onPointerDown);
	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("keyup", onKeyUp);

	return { updatePreview };
};
