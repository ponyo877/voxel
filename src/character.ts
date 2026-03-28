import { BoxGeometry, Group, Mesh, MeshLambertMaterial } from "three";

export const PLAYER_HEIGHT = 80;

export const createCharacterGroup = (
	bodyColor: number,
	headColor: number,
): Group => {
	const group = new Group();

	const body = new Mesh(
		new BoxGeometry(30, 60, 30),
		new MeshLambertMaterial({ color: bodyColor }),
	);
	body.position.y = 30;
	group.add(body);

	const head = new Mesh(
		new BoxGeometry(24, 24, 24),
		new MeshLambertMaterial({ color: headColor }),
	);
	head.position.y = 72;
	group.add(head);

	return group;
};
