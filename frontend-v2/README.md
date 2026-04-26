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

## Vercel Deploy

- Root Directory: `frontend-v2`
- Build Command: leer lassen
- Output Directory: leer lassen oder `.`
- Install Command: leer lassen
- Environment Variables: keine

Die App nutzt nur relative Fetch-URLs wie `/api/register` und ist damit preview- und production-faehig.
