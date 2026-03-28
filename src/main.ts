import { Clock } from "three";
import { setupInteraction } from "./interaction";
import { connectToServer, type ServerMessage, sendMove } from "./network";
import { createObjects } from "./objects";
import { createPlayer } from "./player";
import { createRemotePlayerManager } from "./remotePlayers";
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
const remotePlayers = createRemotePlayerManager(scene);

const { updatePreview } = setupInteraction({
	camera,
	controls,
	rollOverMesh,
	plane,
	voxels,
});

// WebSocket connection
const wsUrl = `ws://${window.location.hostname}:8080/ws`;
const ws = connectToServer(wsUrl);

ws.addEventListener("message", (event: MessageEvent) => {
	const msg = JSON.parse(event.data as string) as ServerMessage;
	switch (msg.type) {
		case "welcome":
			console.log(`[ws] my id: ${msg.id}`);
			for (const p of msg.players) {
				remotePlayers.add(p.id, p.x, p.y, p.z, p.ry);
			}
			break;
		case "player_join":
			remotePlayers.add(msg.id, 0, 80, 0, 0);
			break;
		case "player_leave":
			remotePlayers.remove(msg.id);
			break;
		case "player_move":
			remotePlayers.update(msg.id, msg.x, msg.y, msg.z, msg.ry);
			break;
	}
});

// Animation loop
const clock = new Clock();

renderer.setAnimationLoop(() => {
	const delta = clock.getDelta();

	updatePlayer(delta);
	updatePreview();

	// Send position to server (~15 Hz, throttled inside sendMove)
	sendMove(
		ws,
		camera.position.x,
		camera.position.y,
		camera.position.z,
		camera.rotation.y,
	);

	renderer.render(scene, camera);
});

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});
