import {
	BoxGeometry,
	Group,
	Mesh,
	MeshLambertMaterial,
	type Scene,
} from "three";

const PLAYER_HEIGHT = 80;

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

	// Shared geometry/material for all remote players
	const bodyGeo = new BoxGeometry(30, 60, 30);
	const bodyMat = new MeshLambertMaterial({ color: 0x4488aa });
	const headGeo = new BoxGeometry(24, 24, 24);
	const headMat = new MeshLambertMaterial({ color: 0x66aacc });

	const add = (id: string, x: number, y: number, z: number, ry: number) => {
		if (players.has(id)) return;

		const group = new Group();

		const body = new Mesh(bodyGeo, bodyMat);
		body.position.y = 30;
		group.add(body);

		const head = new Mesh(headGeo, headMat);
		head.position.y = 72;
		group.add(head);

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
