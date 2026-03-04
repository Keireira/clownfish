import type { Shortcut } from '../types';

export type HintsPayload = {
	hints: Shortcut[];
	caret: [number, number, number, number] | null;
	selected: number;
};
