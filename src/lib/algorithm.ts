import type { Consumer, ConsumerChoice, ScoutObject, SwapResult, SwapParams } from './types';

/**
 * Trova tutti i consumatori che vogliono un oggetto e calcola i punti
 * point = bet / (obj.length + countAss)
 */
function searchObj(strObj: string, users: Map<string, Consumer & { countAss: number }>): Map<string, ConsumerChoice> {
	const map = new Map<string, ConsumerChoice>();

	for (const [, value] of users) {
		const keyUser = value.name;
		const sizeUser = value.obj.length + value.countAss;

		for (const obj of value.obj) {
			if (obj.label === strObj && !obj.assign) {
				// Modifica direttamente l'oggetto originale per tracciare il point
				obj.point = obj.bet / sizeUser;
				map.set(keyUser, obj);
			}
		}
	}
	return map;
}

/**
 * Trova il punteggio massimo e i consumatori che lo hanno
 */
function maxMap(map: Map<string, ConsumerChoice>): { max: number; keys: string[] } {
	let max = -1;
	const keys: string[] = [];

	for (const [key, value] of map.entries()) {
		if (value.point! > max) {
			max = value.point!;
			keys.length = 0;
			keys.push(key);
		} else if (value.point === max) {
			keys.push(key);
		}
	}
	return { max, keys };
}

/**
 * Trova un oggetto alternativo per il tie-breaking
 * Cerca il primo oggetto non assegnato e diverso da currObj
 * tra gli utenti in tie. Usa for loop (non forEach) per poter return.
 */
function searchObjKey(
	keys: string[],
	currObj: string,
	users: Map<string, Consumer & { countAss: number }>
): string | undefined {
	for (const key of keys) {
		const user = users.get(key);
		if (!user) continue;

		for (const obj of user.obj) {
			if (!obj.assign && obj.label !== currObj) {
				return obj.label;
			}
		}
	}
	return undefined;
}

/**
 * Rimuove un utente dalla lista dei tied
 * @returns true se l'utente è stato rimosso con successo
 */
function reviewUsersID(keys: string[], idRem: string): boolean {
	const initialLength = keys.length;
	for (let i = keys.length - 1; i >= 0; i--) {
		if (keys[i] === idRem) {
			keys.splice(i, 1);
		}
	}
	return keys.length < initialLength;
}

/**
 * Break tie finale: consumatore con meno assegnazioni (random se pari)
 */
function chooseKey(
	keys: string[],
	users: Map<string, Consumer & { countAss: number }>
): string {
	let winner = '';
	let min = Infinity;

	for (const key of keys) {
		const user = users.get(key);
		if (!user) continue;

		if (user.countAss < min) {
			min = user.countAss;
			winner = key;
		} else if (user.countAss === min) {
			winner = '';
		}
	}

	if (!winner) {
		const randomIndex = Math.floor(Math.random() * keys.length);
		winner = keys[randomIndex];
	}

	return winner;
}

/**
 * Assegna un oggetto al vincitore
 * - Marca l'oggetto come assegnato
 * - Incrementa countAss del vincitore
 * - Se oneObj: rimuove tutte le preferenze del vincitore
 */
function assignObject(
	map: Map<string, ConsumerChoice>,
	winnerKey: string,
	oneObj: boolean,
	users: Map<string, Consumer & { countAss: number }>
): SwapResult | undefined {
	let result: SwapResult | undefined = undefined;

	for (const [key, value] of map.entries()) {
		value.assign = true;

		if (key === winnerKey) {
			const user = users.get(key);
			if (user) {
				user.countAss++;
				result = {
					consumer: user.name,
					label: value.label,
					bet: value.bet,
					point: value.point || 0
				};

				if (oneObj) {
					user.obj.length = 0;
				}
			}
		}
	}

	// Rimuovi oggetti assegnati da TUTTI i consumatori (tranne il vincitore in modalità oneObj)
	for (const [, user] of users) {
		if (!(oneObj && result && user.name === result.consumer)) {
			user.obj = user.obj.filter((o) => !o.assign);
		}
	}

	return result;
}

/**
 * Algoritmo principale per un singolo oggetto
 * Gestisce il tie-breaking ricorsivo corretto.
 * Restituisce tutti i risultati generati (inclusi quelli del tie-breaking ricorsivo).
 */
function startAlgo(
	strObj: string,
	oneObj: boolean,
	users: Map<string, Consumer & { countAss: number }>
): SwapResult[] {
	const map = searchObj(strObj, users);
	const vKeyMax = maxMap(map);

	if (vKeyMax.keys.length === 1) {
		// Vincitore singolo
		const result = assignObject(map, vKeyMax.keys[0], oneObj, users);
		return result ? [result] : [];
	} else if (vKeyMax.keys.length > 1) {
		// TIE - tie-breaking ricorsivo
		const keysCopy = [...vKeyMax.keys];
		let idRem: string | undefined = undefined;
		const allResults: SwapResult[] = [];

		do {
			const strObj_X = searchObjKey(keysCopy, strObj, users);

			if (strObj_X === undefined) {
				break; // Nessun oggetto alternativo trovato
			}

			// Risoluzione ricorsiva
			const subResults = startAlgo(strObj_X, oneObj, users);
			allResults.push(...subResults);

			// Identifica chi ha vinto l'oggetto alternativo per eliminarlo dal tie
			const subResult = subResults.find(r => r.label === strObj_X);
			idRem = subResult?.consumer;

			// Rimuovi perdente dalla contesa
			if (idRem !== undefined) {
				reviewUsersID(keysCopy, idRem);
			}
		} while (keysCopy.length > 1 && idRem !== undefined);

		if (keysCopy.length === 1) {
			// Resta un solo candidato
			const result = assignObject(map, keysCopy[0], oneObj, users);
			if (result) allResults.push(result);
		} else {
			// Fallback: chooseKey
			const result = assignObject(map, chooseKey(keysCopy, users), oneObj, users);
			if (result) allResults.push(result);
		}

		return allResults;
	}

	return [];
}

/**
 * Ordina gli oggetti per desiderabilità.
 * Quando oneObj è true, ordina prima per bet decrescente (così le prime scelte
 * vengono processate prima delle seconde e terze), poi per desiderabilità.
 */
function sortObjects(
	objectMap: Map<string, number>,
	order: string,
	oneObj: boolean,
	maxBetMap: Map<string, number>
): { key: string; value: number }[] {
	const array: { key: string; value: number; maxBet: number }[] = [];

	for (const [key, value] of objectMap.entries()) {
		array.push({ key, value, maxBet: maxBetMap.get(key) || 0 });
	}

	return array.sort((a, b) => {
		// In modalità oneObj, priorità assoluta al bet più alto
		if (oneObj) {
			const betDiff = b.maxBet - a.maxBet;
			if (betDiff !== 0) return betDiff;
		}

		// Poi per desiderabilità
		switch (order) {
			case 'increasing':
				return a.value - b.value;
			case 'decreasing':
				return b.value - a.value;
			default:
				return 0;
		}
	});
}

/**
 * Entry point: esegue lo swapping completo
 */
export function runSwap(
	consumers: Consumer[],
	objects: ScoutObject[],
	params: SwapParams
): SwapResult[] {
	// Reset stato
	const users = new Map<string, Consumer & { countAss: number }>();
	const objectSwap = new Map<string, number>();
	const maxBetMap = new Map<string, number>();
	const results: SwapResult[] = [];

	// Inizializza oggetti
	for (const obj of objects) {
		objectSwap.set(obj.code, 0);
	}

	// Inizializza consumatori
	for (const cons of consumers) {
		users.set(cons.name, {
			...cons,
			countAss: 0
		});

		for (const obj of cons.obj) {
			const count = objectSwap.get(obj.label) || 0;
			objectSwap.set(obj.label, count + 1);

			const currentMax = maxBetMap.get(obj.label) || 0;
			if (obj.bet > currentMax) {
				maxBetMap.set(obj.label, obj.bet);
			}
		}
	}

	// Ordina oggetti
	const sortedObjects = sortObjects(objectSwap, params.order, params.oneObj, maxBetMap);

	// Esegui algoritmo
	for (const obj of sortedObjects) {
		const subResults = startAlgo(obj.key, params.oneObj, users);
		results.push(...subResults);
	}

	return results;
}
