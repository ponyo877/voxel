import {
	BoxGeometry,
	GridHelper,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	type Object3D,
	PlaneGeometry,
	type Scene,
} from "three";

export interface SceneObjects {
	objects: Object3D[];
	rollOverMesh: Mesh;
	cubeGeo: BoxGeometry;
	cubeMaterial: MeshLambertMaterial;
	plane: Mesh;
}

export const createObjects = (scene: Scene): SceneObjects => {
	const objects: Object3D[] = [];

	// Translucent cube for placement preview
	const rollOverGeo = new BoxGeometry(50, 50, 50);
	const rollOverMaterial = new MeshBasicMaterial({
		color: 0xff0000,
		opacity: 0.5,
		transparent: true,
	});
	const rollOverMesh = new Mesh(rollOverGeo, rollOverMaterial);
	scene.add(rollOverMesh);

	// Voxel geometry and material
	const cubeGeo = new BoxGeometry(50, 50, 50);
	const cubeMaterial = new MeshLambertMaterial({ color: 0xfeb74c });

	// Grid
	const gridHelper = new GridHelper(1000, 20);
	scene.add(gridHelper);

	// Invisible ground plane for raycasting
	const geometry = new PlaneGeometry(1000, 1000);
	geometry.rotateX(-Math.PI / 2);

	const plane = new Mesh(geometry, new MeshBasicMaterial({ visible: false }));
	scene.add(plane);

	objects.push(plane);

	return { objects, rollOverMesh, cubeGeo, cubeMaterial, plane };
};
