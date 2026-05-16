# Architectural Decision Record (ADR)

## Titolo: ADR 001 - Riscrittura in Architettura Local-First e Client-Side per SwappingScout

* **Stato:** Approvato
* **Data:** 16 Maggio 2026
* **Autore:** Marco Tondi
* **Contesto:** Refactoring totale dello stack tecnologico di `swappingscout`

---

## 1. Contesto e Problema

Il software originale `swappingscout`, nato per gestire il baratto in un mercatino scout, era basato su un'architettura client-server obsoleta e deprecata con persistenza basata su file JSON.

L'applicazione deve essere riscritta da zero con uno stack moderno. I requisiti principali emersi sono:
1. **Topologia d'uso:** Gestione prevalentemente da una singola postazione (computer del banchetto del mercatino) presidiata dallo staff/organizzatori. La gestione multi-dispositivo è considerata a bassa priorità.
2. **Ambiente operativo:** Spesso i mercatini scout avvengono in contesti con connettività internet assente o instabile (campi estivi, piazze, parrocchie). Il software deve essere resiliente all'offline.
3. **Infrastruttura:** Ridurre a zero i costi vivi di hosting, server e manutenzione di database centralizzati.
4. **Funzionalità core:** Algoritmo di matching leggero per le 3 opzioni espresse dagli utenti, gestione inventario/magazzino e supporto obbligatorio a importazione ed esportazione dei dati in formato CSV.

## 2. Decisione

Si decide di adottare un'architettura **Local-First (100% Client-Side)** strutturata con le seguenti componenti tecnologiche:

1. **Frontend Framework:** **SvelteKit** configurato con `adapter-static` (Single Page Application pura).
2. **Database / Persistenza:** **Dexie.js** come wrapper sopra **IndexedDB** (il database nativo del browser).
3. **Gestione Dati Esteri:** **PapaParse** per il parsing e la generazione dei file CSV.

I dati risiederanno interamente all'interno del browser del dispositivo utilizzato per la gestione del mercatino.

---

## 3. Motivazioni delle Scelte Tecnologiche

### SvelteKit (`adapter-static`) vs Next.js
* **Perché SvelteKit:** Consente una Developer Experience moderna (routing basato su file, reattività nativa e pulita tramite *stores*) ma compila in codice HTML/JS/CSS statico privo di overhead di runtime pesanti.
* **Esclusione di Next.js:** Next.js è orientato al Server-Side Rendering (SSR) e alle Server Actions. Utilizzarlo in modalità `output: 'export'` costringerebbe a disabilitare la maggior parte delle sue feature core, portando un peso del bundle ingiustificato per un'applicazione locale.

### Dexie.js (IndexedDB) vs LocalStorage / JSON tradizionali
* **Capacità e Struttura:** IndexedDB supera il limite di 5MB del LocalStorage, consentendo il salvataggio di grandi volumi di dati (oggetti strutturati tipo NoSQL/JSON).
* **Performance:** Dexie.js fornisce un'interfaccia asincrona robusta basata su Promise, permette di creare indici sui campi di ricerca (es. codice oggetto, nome utente) garantendo query fulminee.
* **Predisposizione Multi-Device:** Dexie.js possiede un ecosistema nativo predisposto alla sincronizzazione (es. Dexie Cloud o soluzioni P2P), facilitando l'eventuale implementazione futura della multi-postazione senza dover stravolgere il codice dell'applicazione.

### PapaParse
* È lo standard de facto in JavaScript per l'elaborazione dei CSV. È leggero, accurato nel gestire i caratteri speciali/escape e non blocca l'interfaccia utente in caso di file corposi.

---

## 4. Conseguenze

### Aspetti Positivi (Vantaggi)
* **Costo Zero:** Nessun server backend, nessuna licenza database, nessun costo di hosting cloud. L'applicazione può essere ospitata gratuitamente (es. GitHub Pages, Vercel static) o persino avviata localmente da una chiavetta USB aprendo il file `index.html`.
* **Resilienza Totale all'Offline:** Il software funziona al 100% in assenza di rete.
* **Manutenzione Semplificata:** Non essendoci un backend, non ci sono API da mantenere, breaking change di librerie server-side o problemi di sicurezza legati alle porte di rete.
* **Sicurezza dei Dati (Privacy):** I dati del mercatino non transitano su internet e rimangono sul dispositivo dell'organizzazione.

### Aspetti Negativi / Rischi da Mitigare
* **Dipendenza dal Browser:** I dati sono legati al profilo del browser della postazione. Se l'operatore cancella accidentalmente la cronologia e i dati dei siti web, il database locale viene svuotato.
  * *Mitigazione:* Implementare un sistema visibile e forzato di "Backup Rapido CSV" nell'interfaccia, incentivando lo staff a scaricare un dump dei dati a intervalli regolari (es. ogni ora o a fine giornata).
* **Sincronizzazione Multi-Postazione complessa (al momento esclusa):** Se due computer dovessero operare contemporaneamente sullo stesso inventario, non essendoci un server centrale, l'allineamento dei dati richiederebbe logiche CRDT o architetture P2P non banali. Rimane a bassa priorità come da requisiti.
