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

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Shift") isShiftDown = true;
	};

	const onKeyUp = (event: KeyboardEvent) => {
		if (event.key === "Shift") isShiftDown = false;
	};

	document.addEventListener("pointerdown", onPointerDown);
	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("keyup", onKeyUp);

	return { updatePreview };
};
