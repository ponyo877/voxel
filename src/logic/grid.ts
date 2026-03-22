export const GRID_SIZE = 50;

export const snapToGrid = (
	value: number,
	gridSize: number = GRID_SIZE,
): number => Math.floor(value / gridSize) * gridSize + gridSize / 2;
