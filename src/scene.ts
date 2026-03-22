import {
	AmbientLight,
	Color,
	DirectionalLight,
	Fog,
	Scene,
	WebGLRenderer,
} from "three";

export interface SceneContext {
	scene: Scene;
	renderer: WebGLRenderer;
}

export const createScene = (): SceneContext => {
	const scene = new Scene();
	scene.background = new Color(0x87ceeb);
	scene.fog = new Fog(0x87ceeb, 500, 2000);

	// Lights
	const ambientLight = new AmbientLight(0x606060, 3);
	scene.add(ambientLight);

	const directionalLight = new DirectionalLight(0xffffff, 3);
	directionalLight.position.set(1, 0.75, 0.5).normalize();
	scene.add(directionalLight);

	const renderer = new WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	return { scene, renderer };
};
