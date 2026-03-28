import {
	PerspectiveCamera,
	type Scene,
	Vector3,
	type WebGLRenderer,
} from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { createCharacterGroup, PLAYER_HEIGHT } from "./character";
import {
	applyGravity,
	CODE_TO_KEY,
	computeDirection,
	type MovementKey,
} from "./logic/physics";

const MOVE_SPEED = 400;
const JUMP_SPEED = 350;
const GRAVITY = 980;

export interface PlayerContext {
	camera: PerspectiveCamera;
	controls: PointerLockControls;
	update: (delta: number) => void;
}

export const createPlayer = (
	scene: Scene,
	renderer: WebGLRenderer,
): PlayerContext => {
	const camera = new PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		1,
		10000,
	);
	camera.position.set(0, PLAYER_HEIGHT, 500);

	const controls = new PointerLockControls(camera, renderer.domElement);
	const character = createCharacterGroup(0x44aa88, 0x66ccaa);
	scene.add(character);

	// Blocker / crosshair UI
	const blocker = document.getElementById("blocker");
	const crosshair = document.getElementById("crosshair");

	controls.addEventListener("lock", () => {
		if (blocker) blocker.style.display = "none";
		if (crosshair) crosshair.style.display = "block";
	});

	controls.addEventListener("unlock", () => {
		if (blocker) blocker.style.display = "flex";
		if (crosshair) crosshair.style.display = "none";
	});

	blocker?.addEventListener("click", () => controls.lock());

	// Movement state
	const velocity = new Vector3();
	let canJump = false;

	const keys: Record<MovementKey, boolean> = {
		forward: false,
		backward: false,
		left: false,
		right: false,
	};

	const onKeyDown = (event: KeyboardEvent) => {
		const key = CODE_TO_KEY[event.code];
		if (key) {
			keys[key] = true;
			return;
		}
		if (event.code === "Space" && canJump) {
			velocity.y = JUMP_SPEED;
			canJump = false;
		}
	};

	const onKeyUp = (event: KeyboardEvent) => {
		const key = CODE_TO_KEY[event.code];
		if (key) keys[key] = false;
	};

	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("keyup", onKeyUp);

	// Update loop
	const update = (delta: number) => {
		if (!controls.isLocked) return;

		const dir = computeDirection(keys);
		controls.moveRight(dir.x * MOVE_SPEED * delta);
		controls.moveForward(-dir.z * MOVE_SPEED * delta);

		const gravity = applyGravity(
			{ velocityY: velocity.y, positionY: camera.position.y, canJump },
			delta,
			{ gravity: GRAVITY, playerHeight: PLAYER_HEIGHT },
		);
		velocity.y = gravity.velocityY;
		camera.position.y = gravity.positionY;
		canJump = gravity.canJump;

		character.position.x = camera.position.x;
		character.position.z = camera.position.z;
		character.position.y = camera.position.y - PLAYER_HEIGHT;
		character.rotation.y = camera.rotation.y;
	};

	return { camera, controls, update };
};
