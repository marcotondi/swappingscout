// Tipi globali per SwappingScout

export interface ConsumerChoice {
	label: string;
	bet: number;
	assign: boolean;
	point?: number;
}

export interface Consumer {
	id?: number;
	name: string;
	obj: ConsumerChoice[];
}

export interface ScoutObject {
	id?: number;
	code: string;
	description: string;
}

export interface SwapResult {
	id?: number;
	consumer: string;
	label: string;
	bet: number;
	point: number;
}

export interface SwapParams {
	order: 'increasing' | 'decreasing';
	oneObj: boolean;
}

export interface CSVConsumerRow {
	nome: string;
	scelta1?: string;
	scelta2?: string;
	scelta3?: string;
}

export interface CSVObjectRow {
	codice: string;
	descrizione: string;
}

export interface CSVResultRow {
	nome: string;
	oggetto: string;
	puntata: number;
	punti: number;
}
