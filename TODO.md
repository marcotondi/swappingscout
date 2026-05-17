## TODO
- [x] Effettuare redesign della UX.

## BUG
- [x] (MID) Apro la pagina web e carico i dati. Ricaricando la pagina web i dati dalle tabelle non vengono mostrati, inserendo un nuovo dato tornano visibili tutti i dati presenti.
- [x] (LOW) Tasto RESET. Creare un tasto reset per ogni tabella. Un tasto solo nella pagina di SCAMBIO, non chiarisce che svuoterà TUTTE le tabelle
- [x] (HIGH) L'algoritmo di scambio non funziona come dovrebbe. es: 1 persona ha vinto la sua terza scelta, ma ne la prima scelta ne la seconda scelta sono state assegnate.
  - [x] Risolto: in modalità `oneObj` l'ordinamento ora processa prima gli oggetti con bet più alto (prime scelte), evitando che un consumatore vinca una scelta a bassa priorità prima delle sue scelte preferite.
- [x] Pagina di SCAMBIO. Se Avvio uno scambio e poi senza consegnare l'ogetto ne avvio un altro, gli ogetti poi finiscono. Svuotare automaticamente il risultato prima di far avviare un nuovo scambio.

## NICE HAVE
- [x] Le tabelle devono poter essere ordinate in maniera crescente o decrescente. Di default il codice è ordinato, ma volendo anche gli altri campi l'utente può ordinarli
- [x] Nella pagina dei partecipanti, i menù a tendina devono essere ordinati in maniera descrescente (fissa)
  - [x] abilitala in maniera crescente è preferibile
- [x] Nella pagina dei partecipanti, i menù a tendina contendono "codice - descrizione"
