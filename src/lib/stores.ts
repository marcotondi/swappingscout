import { writable } from 'svelte/store';
import type { Consumer, ScoutObject, SwapResult } from './types';

export const consumers = writable<Consumer[]>([]);
export const objects = writable<ScoutObject[]>([]);
export const results = writable<SwapResult[]>([]);
export const swapInProgress = writable(false);
export const swapSettings = writable({
	order: 'decreasing' as const,
	oneObj: true
});
