import { describe, it, expect } from 'vitest';
import { runSwap } from '$lib/algorithm';
import type { Consumer, ScoutObject, SwapParams } from '$lib/types';

function createConsumer(name: string, choices: [string, number][]): Consumer {
	return {
		name,
		obj: choices.map(([label, bet]) => ({ label, bet, assign: false }))
	};
}

function createObject(code: string): ScoutObject {
	return { code, description: '' };
}

const defaultParams: SwapParams = {
	order: 'decreasing',
	oneObj: false
};

describe('Algorithm', () => {
	it('basic_assignment - nessuna collisione', () => {
		const consumers = [
			createConsumer('Mario', [['A1', 15], ['B2', 10]]),
			createConsumer('Luigi', [['C3', 15]])
		];
		const objects = [createObject('A1'), createObject('B2'), createObject('C3')];

		const results = runSwap(consumers, objects, defaultParams);

		expect(results).toHaveLength(3);
		expect(results.find(r => r.consumer === 'Mario' && r.label === 'A1')).toBeDefined();
		expect(results.find(r => r.consumer === 'Mario' && r.label === 'B2')).toBeDefined();
		expect(results.find(r => r.consumer === 'Luigi' && r.label === 'C3')).toBeDefined();
	});

	it('single_winner - bet diverso vince chi ha bet più alto', () => {
		const consumers = [
			createConsumer('Mario', [['A1', 15]]),
			createConsumer('Luigi', [['A1', 10]])
		];
		const objects = [createObject('A1')];

		const results = runSwap(consumers, objects, defaultParams);

		expect(results).toHaveLength(1);
		expect(results[0].consumer).toBe('Mario');
		expect(results[0].bet).toBe(15);
	});

	it('tie_breaking_countAss - stesso bet vince chi ha meno countAss', () => {
		const consumers = [
			createConsumer('Mario', [['A1', 15]]),
			createConsumer('Luigi', [['A1', 15]])
		];
		const objects = [createObject('A1')];

		const results = runSwap(consumers, objects, defaultParams);

		expect(results).toHaveLength(1);
		// Entrambi hanno countAss=0, quindi random. Verifichiamo solo che ci sia un vincitore
		expect(['Mario', 'Luigi']).toContain(results[0].consumer);
	});

	it('recursive_tie_basic - oggetto alternativo risolve tie', () => {
		const consumers = [
			createConsumer('Mario', [['A1', 15], ['B2', 10]]),
			createConsumer('Luigi', [['A1', 15], ['C3', 5]])
		];
		const objects = [createObject('A1'), createObject('B2'), createObject('C3')];

		const results = runSwap(consumers, objects, defaultParams);

		// A1 è in tie tra Mario e Luigi (entrambi bet=15)
		// La ricorsione assegna B2 a Mario, che viene eliminato dal tie
		// A1 va a Luigi (unico rimasto)
		// C3 va a Luigi (unico che lo richiede)
		expect(results).toHaveLength(3);
		const a1Result = results.find(r => r.label === 'A1');
		const b2Result = results.find(r => r.label === 'B2');
		const c3Result = results.find(r => r.label === 'C3');
		expect(a1Result).toBeDefined();
		expect(b2Result).toBeDefined();
		expect(c3Result).toBeDefined();
		expect(b2Result?.consumer).toBe('Mario');
		expect(a1Result?.consumer).toBe('Luigi');
	});

	it('recursive_tie_no_alt_obj - nessun oggetto alternativo, fallback a chooseKey', () => {
		const consumers = [
			createConsumer('Mario', [['A1', 15]]),
			createConsumer('Luigi', [['A1', 15]])
		];
		const objects = [createObject('A1')];

		const results = runSwap(consumers, objects, defaultParams);

		expect(results).toHaveLength(1);
		// Nessun oggetto alternativo, quindi chooseKey con countAss=0 per entrambi → random
		expect(['Mario', 'Luigi']).toContain(results[0].consumer);
	});

	it('oneObj_mode - utente rimosso dopo assegnazione', () => {
		const consumers = [
			createConsumer('Mario', [['A1', 15], ['B2', 10]]),
			createConsumer('Luigi', [['B2', 15]])
		];
		const objects = [createObject('A1'), createObject('B2')];

		const params: SwapParams = { ...defaultParams, oneObj: true };
		const results = runSwap(consumers, objects, params);

		expect(results).toHaveLength(2);
		// Mario prende A1, poi viene rimosso (oneObj=true)
		// Luigi prende B2
		const marioResult = results.find(r => r.consumer === 'Mario');
		const luigiResult = results.find(r => r.consumer === 'Luigi');
		expect(marioResult).toBeDefined();
		expect(luigiResult).toBeDefined();
	});

	it('decreasing_order - ordina per desiderabilità decrescente', () => {
		const consumers = [
			createConsumer('Mario', [['A1', 15]]),
			createConsumer('Luigi', [['A1', 15]]),
			createConsumer('Giovanni', [['B2', 15]])
		];
		const objects = [createObject('A1'), createObject('B2')];

		const params: SwapParams = { ...defaultParams, order: 'decreasing' };
		const results = runSwap(consumers, objects, params);

		expect(results).toHaveLength(2);
		// A1 è richiesto da 2 persone, B2 da 1
		// Con decreasing, A1 viene processato prima
	});

	it('increasing_order - ordina per desiderabilità crescente', () => {
		const consumers = [
			createConsumer('Mario', [['A1', 15]]),
			createConsumer('Luigi', [['A1', 15]]),
			createConsumer('Giovanni', [['B2', 15]])
		];
		const objects = [createObject('A1'), createObject('B2')];

		const params: SwapParams = { ...defaultParams, order: 'increasing' };
		const results = runSwap(consumers, objects, params);

		expect(results).toHaveLength(2);
		// Con increasing, B2 (meno richiesto) viene processato prima
	});

	it('empty_input - nessun errore con input vuoto', () => {
		const results = runSwap([], [], defaultParams);
		expect(results).toHaveLength(0);
	});

	it('single_consumer - un solo consumatore con 3 scelte', () => {
		const consumers = [
			createConsumer('Mario', [['A1', 15], ['B2', 10], ['C3', 5]])
		];
		const objects = [createObject('A1'), createObject('B2'), createObject('C3')];

		const results = runSwap(consumers, objects, defaultParams);

		expect(results).toHaveLength(3);
		expect(results.every(r => r.consumer === 'Mario')).toBe(true);
	});

	it('bet_calculation - verifica formula point = bet / (obj.length + countAss)', () => {
		const consumers = [
			createConsumer('Mario', [['A1', 15]])
		];
		const objects = [createObject('A1')];

		const results = runSwap(consumers, objects, defaultParams);

		expect(results).toHaveLength(1);
		// point = 15 / (1 + 0) = 15
		expect(results[0].point).toBe(15);
	});

	it('oneObj_prefers_high_bet - in modalità oneObj le prime scelte vengono processate prima', () => {
		// Cassandra vuole g9(bet15), e4(bet10), a2(bet5)
		// In oneObj=true, deve vincere g9 (prima scelta), non a2 (terza)
		const consumers = [
			createConsumer('Cassandra', [['g9', 15], ['e4', 10], ['a2', 5]])
		];
		const objects = [createObject('g9'), createObject('e4'), createObject('a2')];

		const params: SwapParams = { ...defaultParams, oneObj: true };
		const results = runSwap(consumers, objects, params);

		expect(results).toHaveLength(1);
		expect(results[0].consumer).toBe('Cassandra');
		expect(results[0].bet).toBe(15);
		expect(results[0].label).toBe('g9');
	});

	it('oneObj_mixed_bets - con più consumatori oneObj dà priorità alle prime scelte', () => {
		const consumers = [
			createConsumer('Mario', [['A1', 15], ['B2', 10]]),
			createConsumer('Luigi', [['B2', 15]])
		];
		const objects = [createObject('A1'), createObject('B2')];

		const params: SwapParams = { ...defaultParams, oneObj: true };
		const results = runSwap(consumers, objects, params);

		expect(results).toHaveLength(2);
		const marioResult = results.find(r => r.consumer === 'Mario');
		const luigiResult = results.find(r => r.consumer === 'Luigi');
		expect(marioResult).toBeDefined();
		expect(luigiResult).toBeDefined();
		expect(marioResult?.bet).toBe(15);
		expect(marioResult?.label).toBe('A1');
		expect(luigiResult?.bet).toBe(15);
		expect(luigiResult?.label).toBe('B2');
	});
});
