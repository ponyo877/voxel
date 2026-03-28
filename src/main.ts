import { Clock } from "three";
import { setupInteraction } from "./interaction";
import {
	connectToServer,
	type ServerMessage,
	sendMove,
	sendVoxelAdd,
	sendVoxelRemove,
} from "./network";
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

// WebSocket connection
const wsUrl = `ws://${window.location.hostname}:8080/ws`;
const ws = connectToServer(wsUrl);

const { updatePreview } = setupInteraction({
	camera,
	controls,
	rollOverMesh,
	plane,
	voxels,
	onVoxelAdd: (x, y, z) => sendVoxelAdd(ws, x, y, z),
	onVoxelRemove: (x, y, z) => sendVoxelRemove(ws, x, y, z),
});

ws.addEventListener("message", (event: MessageEvent) => {
	const msg = JSON.parse(event.data as string) as ServerMessage;
	switch (msg.type) {
		case "welcome":
			console.log(`[ws] my id: ${msg.id}, voxels: ${msg.voxels.length}`);
			for (const [x, y, z] of msg.voxels) {
				voxels.add(x, y, z);
			}
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
		case "voxel_add":
			voxels.add(msg.x, msg.y, msg.z);
			break;
		case "voxel_remove":
			voxels.removeByPosition(msg.x, msg.y, msg.z);
			break;
	}
});

// Animation loop
const clock = new Clock();

renderer.setAnimationLoop(() => {
	const delta = clock.getDelta();

	updatePlayer(delta);
	updatePreview();

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
