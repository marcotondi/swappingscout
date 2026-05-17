import Papa from 'papaparse';
import type { Consumer, ScoutObject, SwapResult, CSVConsumerRow, CSVObjectRow, CSVResultRow } from './types';

export function normalizeCode(raw: string): string {
	const match = raw.trim().match(/^([a-zA-Z]+)(\d+)$/);
	if (!match) return raw.trim().toLowerCase();
	const letter = match[1].toUpperCase();
	const num = match[2].padStart(2, '0');
	return `${letter}${num}`;
}

export function exportConsumers(consumers: Consumer[]): string {
	const data = consumers.map((c) => ({
		nome: c.name,
		scelta1: c.obj[0]?.label || '',
		scelta2: c.obj[1]?.label || '',
		scelta3: c.obj[2]?.label || ''
	}));
	return Papa.unparse(data);
}

export function exportObjects(objects: ScoutObject[]): string {
	const data = objects.map((o) => ({
		codice: o.code,
		descrizione: o.description
	}));
	return Papa.unparse(data);
}

export function exportResults(results: SwapResult[]): string {
	const data = results.map((r) => ({
		nome: r.consumer,
		oggetto: r.label,
		puntata: r.bet,
		punti: r.point
	}));
	return Papa.unparse(data);
}

export function importConsumers(csvText: string): Omit<Consumer, 'id'>[] {
	const parsed = Papa.parse<CSVConsumerRow>(csvText, {
		header: true,
		skipEmptyLines: true
	});

	return parsed.data.map((row) => {
		const obj: Consumer['obj'] = [];

		if (row.scelta1) {
			obj.push({ label: normalizeCode(row.scelta1), bet: 15, assign: false });
		}
		if (row.scelta2) {
			obj.push({ label: normalizeCode(row.scelta2), bet: 10, assign: false });
		}
		if (row.scelta3) {
			obj.push({ label: normalizeCode(row.scelta3), bet: 5, assign: false });
		}

		return {
			name: row.nome,
			obj
		};
	});
}

export function importObjects(csvText: string): Omit<ScoutObject, 'id'>[] {
	const parsed = Papa.parse<CSVObjectRow>(csvText, {
		header: true,
		skipEmptyLines: true
	});

	return parsed.data.map((row) => ({
		code: normalizeCode(row.codice),
		description: row.descrizione
	}));
}

export function downloadCSV(content: string, filename: string): void {
	const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	link.click();
	URL.revokeObjectURL(link.href);
}
