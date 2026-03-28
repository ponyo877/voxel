import type { Group, Scene } from "three";
import { createCharacterGroup, PLAYER_HEIGHT } from "./character";

interface RemotePlayer {
	group: Group;
}

export interface RemotePlayerManager {
	add: (id: string, x: number, y: number, z: number, ry: number) => void;
	remove: (id: string) => void;
	update: (id: string, x: number, y: number, z: number, ry: number) => void;
}

export const createRemotePlayerManager = (
	scene: Scene,
): RemotePlayerManager => {
	const players = new Map<string, RemotePlayer>();

	const add = (id: string, x: number, y: number, z: number, ry: number) => {
		if (players.has(id)) return;

		const group = createCharacterGroup(0x4488aa, 0x66aacc);
		group.position.set(x, y - PLAYER_HEIGHT, z);
		group.rotation.y = ry;
		scene.add(group);

		players.set(id, { group });
	};

	const remove = (id: string) => {
		const player = players.get(id);
		if (!player) return;
		scene.remove(player.group);
		players.delete(id);
	};

	const update = (id: string, x: number, y: number, z: number, ry: number) => {
		const player = players.get(id);
		if (!player) {
			add(id, x, y, z, ry);
			return;
		}
		player.group.position.set(x, y - PLAYER_HEIGHT, z);
		player.group.rotation.y = ry;
	};

	return { add, remove, update };
};
