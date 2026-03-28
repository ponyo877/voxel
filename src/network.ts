// --- Message types (Server -> Client) ---

export interface WelcomeMsg {
	type: "welcome";
	id: string;
	players: { id: string; x: number; y: number; z: number; ry: number }[];
}

export interface PlayerJoinMsg {
	type: "player_join";
	id: string;
}

export interface PlayerLeaveMsg {
	type: "player_leave";
	id: string;
}

export interface PlayerMoveMsg {
	type: "player_move";
	id: string;
	x: number;
	y: number;
	z: number;
	ry: number;
}

export type ServerMessage =
	| WelcomeMsg
	| PlayerJoinMsg
	| PlayerLeaveMsg
	| PlayerMoveMsg;

// --- Connection ---

export const connectToServer = (url: string): WebSocket => {
	const ws = new WebSocket(url);
	ws.addEventListener("open", () => console.log("[ws] connected"));
	ws.addEventListener("close", () => console.log("[ws] disconnected"));
	ws.addEventListener("error", (e) => console.error("[ws] error", e));
	return ws;
};

// --- Send helpers ---

const MOVE_INTERVAL_MS = 66; // ~15 Hz
let lastMoveSent = 0;

export const sendMove = (
	ws: WebSocket,
	x: number,
	y: number,
	z: number,
	ry: number,
): void => {
	const now = performance.now();
	if (now - lastMoveSent < MOVE_INTERVAL_MS) return;
	if (ws.readyState !== WebSocket.OPEN) return;

	lastMoveSent = now;
	ws.send(JSON.stringify({ type: "move", x, y, z, ry }));
};
