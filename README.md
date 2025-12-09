# FaceCheck URL Discover

Estensione Chrome MV3 che intercetta le risposte di `facecheck.id` per estrarre e aprire rapidamente gli URL originali delle immagini restituite dalla ricerca.

## Caratteristiche
- Menu contestuale con due azioni: apri l'URL in una nuova scheda oppure copialo negli appunti.
- Evidenzia i risultati con URL estratto e mostra un tooltip con il link.
- Funziona direttamente sulla pagina di risultati di `https://facecheck.id`.

## Installazione da sorgente
1. Clona il repository: `git clone https://github.com/rstlgu/facecheck-companion.git`.
2. Apri `chrome://extensions` e attiva **Developer mode**.
3. Seleziona **Load unpacked** e scegli la cartella del progetto.

## Utilizzo
- Esegui una ricerca su facecheck.id.
- Clic destro su un risultato o sull'immagine: scegli **Apri URL FaceCheck** per aprirlo in una nuova scheda oppure **Copia URL FaceCheck** per copiarlo.
- Passando il mouse sui risultati con URL estratto compare l'icona 🔗 e un tooltip con il link.

## Struttura dei file
- `manifest.json`: configurazione MV3 e permessi.
- `background.js`: crea il menu contestuale e gestisce apertura/copia dei link.
- `content.js`: inietta lo script nel main world, traccia il click e dialoga col background.
- `injected.js`: intercetta fetch/XHR delle API `/api/search`, decodifica i base64 e popola la cache degli URL.
- `styles.css`: evidenzia i risultati con URL estratto.

## Permessi
- `contextMenus`, `activeTab`, `scripting`, e host permission su `https://facecheck.id/*`, necessari per intercettare le risposte e interagire con la pagina.

