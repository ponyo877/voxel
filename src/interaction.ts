import {
	type BoxGeometry,
	Mesh,
	type MeshLambertMaterial,
	type Object3D,
	type PerspectiveCamera,
	Raycaster,
	type Scene,
	Vector2,
} from "three";

export interface InteractionParams {
	scene: Scene;
	camera: PerspectiveCamera;
	objects: Object3D[];
	rollOverMesh: Mesh;
	cubeGeo: BoxGeometry;
	cubeMaterial: MeshLambertMaterial;
	plane: Mesh;
	render: () => void;
}

export const setupInteraction = ({
	scene,
	camera,
	objects,
	rollOverMesh,
	cubeGeo,
	cubeMaterial,
	plane,
	render,
}: InteractionParams): void => {
	const raycaster = new Raycaster();
	const pointer = new Vector2();

	let isShiftDown = false;

	const onPointerMove = (event: PointerEvent) => {
		pointer.set(
			(event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1,
		);

		raycaster.setFromCamera(pointer, camera);

		const intersect = raycaster.intersectObjects(objects, false)[0];
		if (!intersect?.face) return;

		rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
		rollOverMesh.position
			.divideScalar(50)
			.floor()
			.multiplyScalar(50)
			.addScalar(25);

		render();
	};

	const onPointerDown = (event: PointerEvent) => {
		pointer.set(
			(event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1,
		);

		raycaster.setFromCamera(pointer, camera);

		const intersect = raycaster.intersectObjects(objects, false)[0];
		if (!intersect?.face) return;

		if (isShiftDown) {
			if (intersect.object !== plane) {
				scene.remove(intersect.object);
				objects.splice(objects.indexOf(intersect.object), 1);
			}
		} else {
			const voxel = new Mesh(cubeGeo, cubeMaterial);
			voxel.position.copy(intersect.point).add(intersect.face.normal);
			voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
			scene.add(voxel);
			objects.push(voxel);
		}

		render();
	};

	const onDocumentKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Shift") isShiftDown = true;
	};

	const onDocumentKeyUp = (event: KeyboardEvent) => {
		if (event.key === "Shift") isShiftDown = false;
	};

	document.addEventListener("pointermove", onPointerMove);
	document.addEventListener("pointerdown", onPointerDown);
	document.addEventListener("keydown", onDocumentKeyDown);
	document.addEventListener("keyup", onDocumentKeyUp);
};
