# SwappingScout v2.0

PWA local-first per gestire il baratto nei mercatini scout, anche offline.

SwappingScout aiuta a registrare partecipanti e oggetti, calcolare le assegnazioni
e tracciare le consegne, con persistenza 100% locale nel browser.

## Quick start

```bash
npm install
npm run dev        # Avvia il server su http://localhost:5173
```

Apri l'app nel browser e inizia caricando partecipanti e oggetti, anche via CSV.

## Caratteristiche principali

- Gestione partecipanti con CRUD e import/export CSV
- Gestione magazzino oggetti con CRUD e import/export CSV
- Matching automatico con tie-breaking ricorsivo
- Modalità "oggetto unico per partecipante" (ogni partecipante può ricevere
  al massimo un oggetto per sessione)
- Export risultati in CSV
- Tracciamento consegne con stato "Consegnato"
- Reset completo dei dati

## Stack

- **Frontend:** SvelteKit + TypeScript + Tailwind CSS
- **Database:** Dexie.js (IndexedDB) — persistenza 100% locale
- **CSV:** PapaParse — import/export dati
- **PWA:** Installabile, funziona offline
- **Deploy:** GitHub Pages

## Algoritmo di Matching

L'algoritmo assegna oggetti ai partecipanti basandosi su un **sistema di puntate**.

**Valore della puntata in base alla preferenza espressa:**

| Preferenza | Puntata |
|------------|---------|
| 1ª scelta  | 15      |
| 2ª scelta  | 10      |
| 3ª scelta  | 5       |

**Punteggio:**
score = puntata / (quanti_hanno_scelto_quell_oggetto + oggetti_già_assegnati_al_partecipante)

Vince l'assegnazione il partecipante con lo score più alto.

**Tie-breaking:** in caso di parità, l'algoritmo tenta ricorsivamente con
l'oggetto alternativo del partecipante; se il pareggio persiste, viene
privilegiato chi ha già ricevuto meno oggetti in sessione (a parità, estrazione casuale).

## Versioning

Il versioning è automatizzato con [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version), basato sui messaggi dei commit in formato [Conventional Commits](https://www.conventionalcommits.org/).

**Regole di bump automatico:**

| Tipo di commit | Bump | Esempio |
|----------------|------|---------|
| `fix:` | patch | `2.0.0` → `2.0.1` |
| `feat:` | minor | `2.0.0` → `2.1.0` |
| `BREAKING CHANGE:` nel body | major | `2.0.0` → `3.0.0` |

**Come rilasciare una nuova versione:**

```bash
# Dopo aver fatto i commit con Conventional Commits:
npm run release              # calcola il bump, aggiorna version, genera CHANGELOG, crea commit + tag
git push --follow-tags       # pusha su remoto
```

## Comandi

```bash
npm install          # Installa dipendenze
npm run dev          # Avvia server di sviluppo
npm run build        # Build produzione
npm run preview      # Preview build produzione
npm test             # Esegui test
npm run check        # Type checking
```

## Deploy

Il deploy è automatizzato su GitHub Pages tramite GitHub Actions.

## Licenza

Distribuito sotto licenza [GPL-3.0](LICENSE).

---

<div align="center">
  <sub><em>Creato con ❤️ e un supporto AI 🤖</em></sub>
</div>
