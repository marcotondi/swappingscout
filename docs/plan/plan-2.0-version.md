# Piano di Riscrittura SwappingScout v2.0

## Panoramica

Riscrittura completa dell'applicazione SwappingScout da un'architettura client-server obsoleta (LoopBack 3 + AngularJS) a un'applicazione **Local-First 100% client-side** basata su SvelteKit, Dexie.js (IndexedDB), PapaParse (CSV) e Tailwind CSS.

**Requisito FONDAMENTALE:** L'algoritmo di matching deve mantenere lo **stesso comportamento** del codice legacy (`server/swapping.js`). La logica di business (sistema di puntate, tie-breaking) va preservata. Il codice verrà riscritto per correggere bug strutturali e renderlo testabile.

---

## Stack Tecnologico

| Componente | Scelta | Motivazione |
|---|---|---|
| Framework | SvelteKit + adapter-static | SPA pura, zero SSR, deploy statico |
| Linguaggio | **TypeScript** | Type safety, refactoring sicuro, documentazione intrinseca |
| Database | Dexie.js (IndexedDB) | Persistenza locale, query indicizzate, async/Promise |
| CSV | PapaParse + @types/papaparse | Standard JS per parsing/generazione CSV |
| CSS | Tailwind CSS | Utility-first, bundle minimo, design moderno |
| PWA | Vite PWA Plugin | Service worker, manifest, installabilità |
| Testing | Vitest | Test unitari per algoritmo di matching |
| Deploy | GitHub Pages | Hosting gratuito, zero costi |

---

## Struttura del Progetto

```
swappingscout/
├── old/                          # Tutto il codice legacy spostato qui
│   ├── client/
│   ├── common/
│   ├── server/
│   └── ...
├── src/
│   ├── lib/
│   │   ├── db.ts                 # Dexie.js schema e operazioni CRUD
│   │   ├── algorithm.ts          # Algoritmo di matching (corretto dal legacy)
│   │   ├── csv.ts                # Import/export CSV con PapaParse
│   │   ├── stores.ts             # Svelte stores per stato globale
│   │   └── types.ts              # TypeScript interfaces e types
│   ├── routes/
│   │   ├── +layout.svelte        # Layout con navbar PWA (script lang="ts")
│   │   ├── +page.svelte          # Home page
│   │   ├── consumatori/
│   │   │   └── +page.svelte      # CRUD consumatori + import CSV
│   │   ├── magazzino/
│   │   │   └── +page.svelte      # CRUD oggetti + import CSV
│   │   └── scambio/
│   │       └── +page.svelte      # Avvio algoritmo + risultati + consegnato
│   ├── app.html                  # HTML template
│   ├── app.css                   # Tailwind imports
│   └── app.d.ts                  # TypeScript declarations
├── static/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── icons/                    # PWA icons
├── tests/
│   └── algorithm.test.ts         # Test algoritmo di matching
├── tsconfig.json                 # TypeScript configuration
├── svelte.config.js
├── vite.config.js
├── tailwind.config.js
├── package.json
└── docs/
    ├── adr/
    └── plan/
        └── plan-2.0-version.md   # Questo file
```

---

## Fasi di Implementazione

### Fase 1: Setup del Progetto e Migrazione Legacy

**Obiettivo:** Preparare l'ambiente di sviluppo e archiviare il codice legacy.

1. **Spostare codice legacy in `old/`**
   - `mv client/ old/client/`
   - `mv common/ old/common/`
   - `mv server/ old/server/`
   - Spostare anche: `package.json`, `package-lock.json`, `bower.json`, `.bowerrc`, `.yo-rc.json`
   - Mantenere in root: `.gitignore`, `LICENSE`, `README.md`, `docs/`, `AGENTS.md`

2. **Inizializzare nuovo progetto SvelteKit con TypeScript**
   ```bash
   npm create svelte@latest . -- --template skeleton
   ```
   - Selezionare: **TypeScript**, ESLint, Prettier
   - Configurare `adapter-static` in `svelte.config.js`
   - Impostare `prerender: { entries: ['*'] }` e `trailingSlash: 'always'`
   - Configurare `tsconfig.json` con `strict: true`

3. **Installare dipendenze**
   ```bash
   npm install dexie papaparse
   npm install -D @sveltejs/adapter-static @vite-pwa/sveltekit tailwindcss postcss autoprefixer vitest typescript @types/papaparse
   ```

4. **Configurare TypeScript**
   - `tsconfig.json` con `strict: true`, `moduleResolution: "bundler"`
   - `src/app.d.ts` per le dichiarazioni globali
   - Tutti i file `.svelte` usano `<script lang="ts">`
   - File di libreria in `.ts` (db.ts, algorithm.ts, csv.ts, stores.ts, types.ts)

5. **Configurare Tailwind CSS**
   - `npx tailwindcss init -p`
   - Configurare `tailwind.config.js` con i path dei file Svelte
   - Aggiungere direttive Tailwind in `src/app.css`

6. **Configurare PWA**
   - Aggiungere `@vite-pwa/sveltekit` a `vite.config.js`
   - Creare `static/manifest.json` con nome, icone, theme color
   - Configurare service worker per cache statica e runtime

7. **Aggiornare `.gitignore`**
   - Aggiungere `.svelte-kit/`, `build/`, `node_modules/`
   - Rimuovere riferimenti a bower_components, lib-cov, ecc.

---

### Fase 2: Schema Database (Dexie.js)

**Obiettivo:** Definire la struttura dati in IndexedDB.

**File:** `src/lib/db.ts`

```typescript
import Dexie, { type Table } from 'dexie';

export interface Consumer {
  id?: number;
  name: string;
  obj: { label: string; bet: number; assign: boolean }[];
}

export interface ScoutObject {
  id?: number;
  code: string;
  description: string;
}

export interface Result {
  id?: number;
  consumer: string;
  label: string;
  bet: number;
  point: number;
}

export class SwappingScoutDB extends Dexie {
  consumers!: Table<Consumer>;
  objects!: Table<ScoutObject>;
  results!: Table<Result>;

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
```

**Schema tabelle:**

| Tabella | Campi | Indici | Note |
|---|---|---|---|
| `consumers` | `id` (auto), `name` (string), `obj` (array) | `name` (unique) | `obj`: `[{label, bet, assign}]` |
| `objects` | `id` (auto), `code` (string), `description` (string) | `code` (unique) | |
| `results` | `id` (auto), `consumer` (string), `label` (string), `bet` (number), `point` (number) | `consumer`, `label` | Risultati dell'algoritmo |

**Operazioni CRUD da implementare:**

| Entità | Create | Read | Update | Delete | Delete All |
|---|---|---|---|---|---|
| Consumer | `addConsumer()` | `getAllConsumers()` | `updateConsumer()` | `deleteConsumer()` | `clearConsumers()` |
| Objects | `addObject()` | `getAllObjects()` | `updateObject()` | `deleteObject()` | `clearObjects()` |
| Results | `addResult()` | `getAllResults()` | — | `deleteResult()` | `clearResults()` |

**Nota sugli ID:** Si usa `++id` (auto-increment) invece di UUID. Motivazione:
- Single-device, nessun sync multi-postazione
- ID numerici più leggibili in debug
- Dexie gestisce auto-increment nativamente
- UUID sarebbe overkill per questo use case

---

### Fase 3: Riscrittura Algoritmo di Matching

**Obiettivo:** Riscrivere l'algoritmo da `server/swapping.js` come modulo JS puro, **correggendo i bug del legacy** e implementando correttamente la logica di tie-breaking ricorsivo come era inteso.

**File:** `src/lib/algorithm.ts`

#### Logica di Business Estratta

L'algoritmo gestisce l'assegnazione di oggetti a consumatori tramite un **sistema di puntate**:

1. **Puntate (bet):** Ogni consumatore esprime fino a 3 preferenze con puntate decrescenti:
   - 1° scelta: bet = 15
   - 2° scelta: bet = 10
   - 3° scelta: bet = 5

2. **Punteggio (point):** Per ogni oggetto, il punteggio di un consumatore è:
   ```
   point = bet / (numero_oggetti_desiderati + oggetti_già_assegnati)
   ```
   Questo favorisce chi ha espresso meno preferenze (più "fame") e chi ha già ricevuto meno oggetti.

3. **Assegnazione:** Per ogni oggetto (ordinato per desiderabilità):
   - Si calcolano i punti di tutti i consumatori che lo vogliono
   - Vince chi ha il punteggio più alto
   - In caso di pareggio: si attiva il **tie-breaking ricorsivo**

4. **Tie-breaking ricorsivo (CORRETTO):**
   - Quando 2+ consumatori hanno lo stesso punteggio massimo per un oggetto
   - Si cerca un oggetto alternativo che almeno uno di loro vuole (diverso da quello corrente)
   - Si esegue ricorsivamente l'algoritmo su quell'oggetto alternativo
   - Il "perdente" della ricorsione viene eliminato dalla contesa
   - Si ripete finché non resta un solo candidato
   - Se non si riesce a risolvere: fallback a `chooseKey` (minore countAss, poi random)

5. **Modalità `oneObj`:** Se attiva, un consumatore viene rimosso dopo aver ricevuto un oggetto.

#### Bug Identificati nel Legacy

| # | Funzione | Bug | Impatto |
|---|---|---|---|
| 1 | `searchObjKey` | `return` dentro `forEach` non esce dalla funzione | Restituisce SEMPRE `undefined` |
| 2 | `reviewUsersID` | `evens.length > 1` è falso quando rimuove 1 elemento | Il do-while si ferma sempre |
| 3 | `startAlgo` ricorsivo | `oneObj` non passato nella chiamata ricorsiva | Comportamento inconsistente |

**Conseguenza pratica nel legacy:** Il tie-breaking ricorsivo non ha mai funzionato. Il fallback era sempre `chooseKey`. Nella riscrittura, questa logica verrà **implementata correttamente**.

#### Decisione per la Riscrittura

- **Correggere** `searchObjKey`: usare `for` loop invece di `forEach` per poter fare `return`
- **Correggere** `reviewUsersID`: ritornare `true` quando rimuove almeno 1 elemento
- **Correggere** `startAlgo` ricorsivo: passare `oneObj` nella chiamata ricorsiva
- **Mantenere** `chooseKey` come fallback finale quando la ricorsione non risolve
- **Struttura** come modulo puro e testabile

#### Struttura del Nuovo Algoritmo

```typescript
// src/lib/algorithm.ts

export interface ConsumerChoice {
  label: string;
  bet: number;
  assign: boolean;
  point?: number;
}

export interface Consumer {
  name: string;
  obj: ConsumerChoice[];
  countAss: number;
}

export interface SwapResult {
  consumer: string;
  label: string;
  bet: number;
  point: number;
}

export interface SwapParams {
  order: 'increasing' | 'decreasing';
  oneObj: boolean;
}

/**
 * Trova tutti i consumatori che vogliono un oggetto e calcola i punti
 * point = bet / (obj.length + countAss)
 */
function searchObj(strObj: string, users: Map<string, Consumer>): Map<string, ConsumerChoice> { ... }

/**
 * Trova il punteggio massimo e i consumatori che lo hanno
 */
function maxMap(map: Map<string, ConsumerChoice>): { max: number; keys: string[] } { ... }

/**
 * Trova un oggetto alternativo per il tie-breaking
 */
function searchObjKey(keys: string[], currObj: string, users: Map<string, Consumer>): string | undefined { ... }

/**
 * Rimuove un utente dalla lista dei tied
 */
function reviewUsersID(keys: string[], idRem: string): boolean { ... }

/**
 * Break tie finale: consumatore con meno assegnazioni (random se pari)
 */
function chooseKey(keys: string[], users: Map<string, Consumer>): string { ... }

/**
 * Assegna un oggetto al vincitore
 */
function assignObject(
  map: Map<string, ConsumerChoice>,
  winnerKey: string,
  oneObj: boolean,
  users: Map<string, Consumer>
): string { ... }

/**
 * Algoritmo principale per un singolo oggetto
 */
function startAlgo(strObj: string, oneObj: boolean, users: Map<string, Consumer>): string | undefined { ... }

/**
 * Ordina gli oggetti per desiderabilità
 */
function sortObjects(objectMap: Map<string, number>, order: string): { key: string; value: number }[] { ... }

/**
 * Entry point: esegue lo swapping completo
 */
export function runSwap(
  consumers: Consumer[],
  objects: { code: string }[],
  params: SwapParams
): SwapResult[] { ... }
```

#### Pseudocodice dell'Algoritmo Corretto

```
function startAlgo(strObj, oneObj, users):
    map = searchObj(strObj, users)
    vKeyMax = maxMap(map)

    if vKeyMax.keys.length == 1:
        // Vincitore singolo
        assignObject(map, vKeyMax.keys[0], oneObj, users)

    else if vKeyMax.keys.length > 1:
        // TIE - tie-breaking ricorsivo
        keysCopy = [...vKeyMax.keys]
        idRem = undefined

        do:
            // Cerca oggetto alternativo
            strObj_X = searchObjKey(keysCopy, strObj, users)

            if strObj_X == undefined:
                break  // Nessun oggetto alternativo trovato

            // Risoluzione ricorsiva
            idRem = startAlgo(strObj_X, oneObj, users)

            // Rimuovi perdente dalla contesa
            if idRem != undefined:
                reviewUsersID(keysCopy, idRem)

        while keysCopy.length > 1 && idRem != undefined

        if keysCopy.length == 1:
            // Resta un solo candidato
            assignObject(map, keysCopy[0], oneObj, users)
        else:
            // Fallback: chooseKey
            assignObject(map, chooseKey(keysCopy, users), oneObj, users)
```

#### Note Critiche

- L'algoritmo deve essere **puro** — nessuna dipendenza da DB o UI
- Riceve i dati come parametri e restituisce i risultati
- I risultati vengono poi salvati in Dexie.js dal chiamante
- **NON modificare la formula dei punti**: `point = bet / (obj.length + countAss)`
- **Correggere** la logica di tie-breaking ricorsivo (bug del legacy)
- **Mantenere** `chooseKey` come fallback finale

---

### Fase 4: Svelte Stores

**Obiettivo:** Gestire lo stato globale dell'applicazione.

**File:** `src/lib/stores.ts`

```typescript
import { writable } from 'svelte/store';
import type { Consumer, ScoutObject, Result } from './db';

export const consumers = writable<Consumer[]>([]);
export const objects = writable<ScoutObject[]>([]);
export const results = writable<Result[]>([]);
export const swapInProgress = writable(false);
export const swapSettings = writable({ order: 'decreasing' as const, oneObj: true });
```

---

### Fase 5: UI — Layout e Navigazione

**Obiettivo:** Creare il layout base con navbar responsive.

**File:** `src/routes/+layout.svelte`

- Navbar con logo e 4 link: Home, Partecipanti, Magazzino, Scambio
- Indicatore di pagina attiva
- Design responsive con Tailwind
- Versione app nell'header (es. "v2.0.0")
- PWA install prompt se applicabile

---

### Fase 6: UI — Home Page

**File:** `src/routes/+page.svelte`

- Pagina di benvenuto semplice
- Logo SwappingScout
- Breve descrizione dell'app
- Link rapidi alle sezioni principali
- Design pulito e moderno con Tailwind

---

### Fase 7: UI — Gestione Consumatori (CRUD + Import CSV)

**File:** `src/routes/consumatori/+page.svelte`

**Funzionalità:**
1. **Form di inserimento/modifica:**
   - Campo "Nome e Cognome" (obbligato, unique)
   - 3 dropdown per le scelte (popolati dagli oggetti in magazzino)
   - 1° scelta: obbligatoria, bet = 15
   - 2° scelta: opzionale, bet = 10
   - 3° scelta: opzionale, bet = 5
   - Validazione: nome non duplicato, scelte non ripetute

2. **Tabella consumatori:**
   - Colonne: Nome, 1° scelta, 2° scelta, 3° scelta, Azioni
   - Azioni: Modifica, Elimina
   - Filtro di ricerca per nome
   - Contatore totale consumatori

3. **Import CSV:**
   - Pulsante "Importa da CSV"
   - Formato atteso: `nome,scelta1,scelta2,scelta3`
   - Validazione righe con errori
   - Preview prima dell'import

4. **Export CSV:**
   - Pulsante "Esporta CSV"
   - File: `consumers_YYYY-MM-DD.csv`

---

### Fase 8: UI — Gestione Magazzino (CRUD + Import CSV)

**File:** `src/routes/magazzino/+page.svelte`

**Funzionalità:**
1. **Form di inserimento/modifica:**
   - Campo "Codice" (obbligato, unique, lowercase)
   - Campo "Descrizione" (obbligato)
   - Validazione: codice non duplicato

2. **Tabella oggetti:**
   - Colonne: Codice, Descrizione, Azioni
   - Azioni: Modifica, Elimina
   - Filtro di ricerca per codice/descrizione
   - Contatore totale oggetti

3. **Import CSV:**
   - Pulsante "Importa da CSV"
   - Formato atteso: `codice,descrizione`
   - Validazione righe con errori

4. **Export CSV:**
   - Pulsante "Esporta CSV"
   - File: `objects_YYYY-MM-DD.csv`

---

### Fase 9: UI — Scambio (Algoritmo + Risultati)

**File:** `src/routes/baratto/+page.svelte`

**Funzionalità:**
1. **Pannello di controllo:**
   - Pulsante "Avvia Scambio" (grande, evidente)
   - Toggle "Oggetto unico" (oneObj) — default: ON
   - Select "Ordinamento oggetti": `decrescente` (default) | `crescente`
   - **RIMOSSO:** opzione "nessun ordinamento"

2. **Dialogo di conferma:**
   - Modale prima dell'avvio dell'algoritmo
   - Riepilogo: N consumatori, N oggetti, impostazioni selezionate
   - Pulsanti: "Annulla" | "Avvia"
   - Warning: "Questa azione cancellerà i risultati precedenti"

3. **Tabella risultati:**
   - Colonne: Nome, Oggetto Assegnato, Puntata, Punti, Azioni
   - Azione: "Consegnato" (icona check) — rimuove oggetto e risultato
   - Filtro di ricerca per nome/oggetto
   - Totali: somma puntate, somma punti
   - Contatore: consegnati / totali

4. **Export CSV risultati:**
   - Pulsante "Esporta Risultati"
   - File: `results_YYYY-MM-DD.csv`

5. **Stato durante l'esecuzione:**
   - Spinner/loading durante l'algoritmo
   - Messaggio di successo/errore

---

### Fase 10: Funzione Reset Completo

**Obiettivo:** Permettere di cancellare tutti i dati e ricominciare.

- Pulsante "Reset Completo" nella pagina Scambio (o in una pagina Impostazioni)
- Dialogo di conferma con warning forte: "Questa azione è irreversibile"
- Richiede digitazione di una parola di conferma (es. "RESET")
- Cancella: consumers, objects, results
- Redirect alla Home dopo il reset

---

### Fase 11: CSV Import/Export Module

**File:** `src/lib/csv.ts`

**Funzioni da implementare:**

| Funzione | Descrizione |
|---|---|
| `exportConsumers(consumers)` | Genera CSV: `nome,scelta1,scelta2,scelta3` |
| `exportObjects(objects)` | Genera CSV: `codice,descrizione` |
| `exportResults(results)` | Genera CSV: `nome,oggetto,puntata,punti` |
| `importConsumers(csvText)` | Parsa CSV → array di consumer, valida |
| `importObjects(csvText)` | Parsa CSV → array di oggetti, valida |
| `downloadCSV(content, filename)` | Trigger download file CSV |

**Formati CSV:**

`consumers.csv`:
```csv
nome,scelta1,scelta2,scelta3
Mario Rossi,A1,B2,C3
Luigi Verdi,A1,,
```

`objects.csv`:
```csv
codice,descrizione
A1,Peluche orso
B2,Libro avventura
C3,Set colori
```

`results.csv`:
```csv
nome,oggetto,puntata,punti
Mario Rossi,A1,15,3.75
Luigi Verdi,B2,10,2.5
```

---

### Fase 12: Test Algoritmo di Matching

**File:** `tests/algorithm.test.ts`

**Obiettivo:** Verificare che l'algoritmo funzioni correttamente, inclusi i bug fix rispetto al legacy.

**Strategia:**
1. Creare dataset di test sintetici con scenari noti
2. Eseguire l'algoritmo e confrontare con risultati attesi
3. Testare casi limite: pareggi, ricorsione, un solo utente, un solo oggetto, oneObj on/off

**Test cases:**

| Test | Descrizione |
|---|---|
| `basic_assignment` | 3 consumatori, 3 oggetti, nessuna collisione |
| `single_winner` | 2 consumatori vogliono lo stesso oggetto, bet diversi → vince chi ha bet più alto |
| `tie_breaking_countAss` | Tie: stesso oggetto, stesso bet → vince chi ha meno countAss |
| `tie_breaking_random` | Tie con stesso countAss → assegnazione random |
| `recursive_tie_basic` | Tie → oggetto alternativo trovato → ricorsione risolve → perdente eliminato |
| `recursive_tie_chain` | Tie → catena di ricorsioni multiple per risolvere pareggio complesso |
| `recursive_tie_no_alt_obj` | Tie → nessun oggetto alternativo → fallback a chooseKey |
| `recursive_tie_oneObj` | Ricorsione con oneObj=true → utente rimosso correttamente |
| `oneObj_mode` | Verifica che utente rimosso dopo assegnazione |
| `decreasing_order` | Verifica ordinamento decrescente |
| `increasing_order` | Verifica ordinamento crescente |
| `empty_input` | Nessun consumatore o nessun oggetto |
| `single_consumer` | Un solo consumatore con 3 scelte |
| `bet_calculation` | Verifica formula: point = bet / (obj.length + countAss) |
| `searchObjKey_returns_first_alt` | Verifica che searchObjKey restituisca il primo oggetto alternativo trovato |
| `reviewUsersID_removes_correctly` | Verifica che reviewUsersID rimuova l'utente corretto dalla lista |

---

### Fase 13: PWA Completa

**Obiettivo:** Rendere l'app installabile e offline-first.

1. **Manifest (`static/manifest.json`):**
   ```json
   {
     "name": "SwappingScout",
     "short_name": "SwapScout",
     "description": "Gestione baratto per mercatini scout",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#4F46E5",
     "icons": [...]
   }
   ```

2. **Service Worker:**
   - Cache statica: HTML, CSS, JS, fonts, logo
   - Cache runtime: nessuna (app local-first, nessun fetch esterno)
   - Fallback offline: pagina di errore custom

3. **Icone PWA:**
   - Generare icone 192x192 e 512x512
   - Salvare in `static/icons/`

4. **Install Prompt:**
   - Mostrare banner di installazione quando disponibile
   - Pulsante "Installa app" nella navbar

---

### Fase 14: Deploy su GitHub Pages

**Obiettivo:** Configurare il deploy automatico.

1. **Configurare `svelte.config.js`:**
   ```javascript
   import adapter from '@sveltejs/adapter-static';
   export default {
     kit: {
       adapter: adapter({ fallback: 'index.html' }),
       paths: { base: process.env.NODE_ENV === 'production' ? '/swappingscout' : '' }
     }
   };
   ```

2. **GitHub Actions workflow (`.github/workflows/deploy.yml`):**
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [master]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./build
   ```

3. **Test locale:**
   ```bash
   npm run build
   npx serve build
   ```

---

## Dipendenze tra Fasi

```
Fase 1 (Setup) ─────────────────────────────────────────────────────┐
    ↓                                                               │
Fase 2 (DB Schema) ─────────────────────────────────────────────────┤
    ↓                                                               │
Fase 3 (Algoritmo) ─────────────────────────────────────────────────┤
    ↓                                                               │
Fase 4 (Stores) ────────────────────────────────────────────────────┤
    ↓                                                               │
Fase 5 (Layout) ────────────────────────────────────────────────────┤
    ↓                                                               │
Fase 6 (Home)                                                       │
    ↓                                                               │
Fase 7 (Consumatori) ← dipende da Fase 2, 4, 5                      │
Fase 8 (Magazzino) ← dipende da Fase 2, 4, 5                        │
Fase 9 (Scambio) ← dipende da Fase 2, 3, 4, 5                       │
Fase 10 (Reset) ← dipende da Fase 2, 5                              │
Fase 11 (CSV) ← dipende da Fase 2                                   │
    ↓                                                               │
Fase 12 (Test) ← dipende da Fase 3                                  │
    ↓                                                               │
Fase 13 (PWA) ← dipende da Fase 5-11                                │
    ↓                                                               │
Fase 14 (Deploy) ← dipende da tutto                                 │
    ↓                                                               │
    └───────────────────────────────────────────────────────────────┘
```

---

## Criteri di Accettazione

- [ ] L'algoritmo di matching funziona correttamente con tie-breaking ricorsivo (verificato dai test)
- [ ] CRUD completo per consumatori e oggetti con validazione univocità
- [ ] Import/export CSV funzionante per tutte le entità (3 file separati)
- [ ] Scambio avviabile con conferma modale e impostazioni (oneObj, ordinamento)
- [ ] Funzione "Consegnato" operativa
- [ ] Reset completo con conferma sicura
- [ ] PWA installabile e funzionante offline
- [ ] Deploy su GitHub Pages funzionante
- [ ] UI responsive e moderna con Tailwind CSS
- [ ] 4 pagine: Home, Partecipanti, Magazzino, Scambio

---

## Rischi e Mitigazione

| Rischio | Impatto | Mitigazione |
|---|---|---|
| Algoritmo ricorsivo causa stack overflow con molti tie | Alto | Limitare profondità ricorsione, fallback a chooseKey |
| Performance con molti consumatori (>500) + ricorsione | Medio | Monitorare tempi esecuzione, ottimizzare se necessario |
| Perdita dati IndexedDB (clear browser) | Medio | Export CSV visibile e incentivato, backup automatico |
| Compatibilità browser vecchi | Basso | IndexedDB supportato da Chrome 24+, Firefox 10+, Safari 7+ |

---

## Timeline Stimata

| Fase | Durata Stimata |
|---|---|
| Fase 1-4: Setup, DB, Algoritmo (ricorsivo corretto), Stores | 3-4 ore |
| Fase 5-6: Layout, Home | 1-2 ore |
| Fase 7-8: Consumatori, Magazzino | 3-4 ore |
| Fase 9: Scambio + Risultati | 3-4 ore |
| Fase 10-11: Reset, CSV | 1-2 ore |
| Fase 12: Test (inclusi test ricorsione) | 3-4 ore |
| Fase 13-14: PWA, Deploy | 1-2 ore |
| **Totale** | **15-24 ore** |
