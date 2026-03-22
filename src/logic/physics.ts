export type MovementKey = "forward" | "backward" | "left" | "right";

export const CODE_TO_KEY: Readonly<Record<string, MovementKey>> = {
	KeyW: "forward",
	KeyS: "backward",
	KeyA: "left",
	KeyD: "right",
};

export interface Direction {
	x: number;
	z: number;
}

export const computeDirection = (
	keys: Record<MovementKey, boolean>,
): Direction => {
	let x = 0;
	let z = 0;
	if (keys.forward) z -= 1;
	if (keys.backward) z += 1;
	if (keys.left) x -= 1;
	if (keys.right) x += 1;
	const length = Math.sqrt(x * x + z * z);
	if (length > 0) {
		x /= length;
		z /= length;
	}
	return { x, z };
};

export interface GravityState {
	velocityY: number;
	positionY: number;
	canJump: boolean;
}

export interface GravityConfig {
	gravity: number;
	playerHeight: number;
}

export const applyGravity = (
	state: GravityState,
	delta: number,
	config: GravityConfig,
): GravityState => {
	const velocityY = state.velocityY - config.gravity * delta;
	const positionY = state.positionY + velocityY * delta;

	if (positionY < config.playerHeight) {
		return {
			velocityY: 0,
			positionY: config.playerHeight,
			canJump: true,
		};
	}

	return { velocityY, positionY, canJump: state.canJump };
};
