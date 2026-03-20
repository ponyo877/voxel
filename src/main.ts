import { setupInteraction } from "./interaction";
import { createObjects } from "./objects";
import { createScene } from "./scene";

const { scene, camera, renderer } = createScene();
const { objects, rollOverMesh, cubeGeo, cubeMaterial, plane } =
	createObjects(scene);

const render = () => {
	renderer.render(scene, camera);
};

setupInteraction({
	scene,
	camera,
	objects,
	rollOverMesh,
	cubeGeo,
	cubeMaterial,
	plane,
	render,
});

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

	render();
});

render();
