import {
	BoxGeometry,
	GridHelper,
	Mesh,
	MeshBasicMaterial,
	PlaneGeometry,
	type Scene,
} from "three";
import { GRID_SIZE } from "./logic/grid";

export interface SceneObjects {
	rollOverMesh: Mesh;
	plane: Mesh;
}

export const createObjects = (scene: Scene): SceneObjects => {
	// Translucent cube for placement preview
	const rollOverGeo = new BoxGeometry(GRID_SIZE, GRID_SIZE, GRID_SIZE);
	const rollOverMaterial = new MeshBasicMaterial({
		color: 0xff0000,
		opacity: 0.5,
		transparent: true,
	});
	const rollOverMesh = new Mesh(rollOverGeo, rollOverMaterial);
	scene.add(rollOverMesh);

	// Grid
	const gridHelper = new GridHelper(1000, 20);
	scene.add(gridHelper);

	// Invisible ground plane for raycasting
	const geometry = new PlaneGeometry(1000, 1000);
	geometry.rotateX(-Math.PI / 2);

	const plane = new Mesh(geometry, new MeshBasicMaterial({ visible: false }));
	scene.add(plane);

	return { rollOverMesh, plane };
};
