import { Clock } from "three";
import { setupInteraction } from "./interaction";
import { createObjects } from "./objects";
import { createPlayer } from "./player";
import { createScene } from "./scene";
import { createVoxelManager } from "./voxels";

const { scene, renderer } = createScene();
const {
	camera,
	controls,
	update: updatePlayer,
} = createPlayer(scene, renderer);
const { rollOverMesh, plane } = createObjects(scene);
const voxels = createVoxelManager(scene);

const { updatePreview } = setupInteraction({
	camera,
	controls,
	rollOverMesh,
	plane,
	voxels,
});

const clock = new Clock();

renderer.setAnimationLoop(() => {
	const delta = clock.getDelta();

	updatePlayer(delta);
	updatePreview();

	renderer.render(scene, camera);
});

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});
