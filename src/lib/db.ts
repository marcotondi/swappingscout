import Dexie, { type Table } from 'dexie';
import type { Consumer, ScoutObject, SwapResult } from './types';

export class SwappingScoutDB extends Dexie {
	consumers!: Table<Consumer>;
	objects!: Table<ScoutObject>;
	results!: Table<SwapResult>;

	constructor() {
		super('SwappingScoutDB');
		this.version(1).stores({
			consumers: '++id, name',
			objects: '++id, code',
			results: '++id, consumer, label'
		});
	}
}

export const db = new SwappingScoutDB();

// CRUD Consumers
export async function addConsumer(consumer: Omit<Consumer, 'id'>): Promise<number> {
	return await db.consumers.add(consumer);
}

export async function getAllConsumers(): Promise<Consumer[]> {
	return await db.consumers.toArray();
}

export async function updateConsumer(id: number, consumer: Partial<Consumer>): Promise<number> {
	return await db.consumers.update(id, consumer);
}

export async function deleteConsumer(id: number): Promise<void> {
	return await db.consumers.delete(id);
}

export async function clearConsumers(): Promise<void> {
	return await db.consumers.clear();
}

// CRUD Objects
export async function addObject(obj: Omit<ScoutObject, 'id'>): Promise<number> {
	return await db.objects.add(obj);
}

export async function getAllObjects(): Promise<ScoutObject[]> {
	return await db.objects.toArray();
}

export async function updateObject(id: number, obj: Partial<ScoutObject>): Promise<number> {
	return await db.objects.update(id, obj);
}

export async function deleteObject(id: number): Promise<void> {
	return await db.objects.delete(id);
}

export async function clearObjects(): Promise<void> {
	return await db.objects.clear();
}

// CRUD Results
export async function addResult(result: Omit<SwapResult, 'id'>): Promise<number> {
	return await db.results.add(result);
}

export async function getAllResults(): Promise<SwapResult[]> {
	return await db.results.toArray();
}

export async function deleteResult(id: number): Promise<void> {
	return await db.results.delete(id);
}

export async function clearResults(): Promise<void> {
	return await db.results.clear();
}

// Reset completo
export async function resetDatabase(): Promise<void> {
	await db.consumers.clear();
	await db.objects.clear();
	await db.results.clear();
}
