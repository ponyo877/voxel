import {
	AmbientLight,
	Color,
	DirectionalLight,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from "three";

export interface SceneContext {
	scene: Scene;
	camera: PerspectiveCamera;
	renderer: WebGLRenderer;
}

export const createScene = (): SceneContext => {
	const camera = new PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		10000,
	);
	camera.position.set(500, 800, 1300);
	camera.lookAt(0, 0, 0);

	const scene = new Scene();
	scene.background = new Color(0xf0f0f0);

	const ambientLight = new AmbientLight(0x606060, 3);
	scene.add(ambientLight);

	const directionalLight = new DirectionalLight(0xffffff, 3);
	directionalLight.position.set(1, 0.75, 0.5).normalize();
	scene.add(directionalLight);

	const renderer = new WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	return { scene, camera, renderer };
};
