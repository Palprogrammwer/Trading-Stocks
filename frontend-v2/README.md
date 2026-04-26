# ResearchDesk V2

Neue, parallel aufgebaute Vercel-Version der Trading-/Research-App. Die alte App im Repository bleibt unberuehrt.

## Architektur

- `index.html`, `styles.css`, `app.js`: statisches Frontend ohne Build-Schritt
- `api/`: Vercel Serverless Functions
- `lib/`: gemeinsame Demo-Auth- und Mock-Aktiendatenlogik fuer die API
- `assets/`: Platz fuer spaetere lokale Assets

## Annahmen

- Es gibt noch keine externe Datenbank.
- Auth ist ein Demo-Prototyp: Registrierung/Login setzen einen HttpOnly-Cookie und speichern den sichtbaren App-State zusaetzlich im Browser.
- Aktien- und Kursdaten sind Mock-Daten. Die Schnittstelle liegt in `lib/stocks.js` und kann spaeter gegen echte Marktdaten ersetzt werden.
- Paula-Accounts sind automatisch Pro, wenn der lokale Teil der E-Mail `paula` enthaelt. Zusaetzlich koennen Pro-Accounts spaeter ueber `PRO_EMAILS` konfiguriert werden.

## Vercel Deploy

- Root Directory: `frontend-v2`
- Build Command: leer lassen
- Output Directory: leer lassen oder `.`
- Install Command: leer lassen
- Environment Variables: optional `PRO_EMAILS=paula@example.com,weitere@example.com`

Die App nutzt nur relative Fetch-URLs wie `/api/register` und ist damit preview- und production-faehig.

## Testen

- Registriere oder logge dich mit `paula@example.com` ein, um Pro zu sehen.
- Tippe im Dashboard `app`, `tes`, `sap` oder `nv` ins Suchfeld. Die Vorschlaege kommen von `/api/search`.
- Waehle eine Aktie aus. Firmenprofil, Kennzahlen, Analyse, Chart, Watchlist und Verlauf werden aktualisiert.
