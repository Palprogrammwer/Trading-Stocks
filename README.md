# Trading Research App

Eine lokale Aktien-Analyse-Web-App im Research-Stil. Das Projekt ist bewusst als Fullstack-Basis ohne Echtgeld-, Broker- oder Order-Funktionen aufgebaut.

## Struktur

- `backend/`: HTTP API, Authentifizierung, SQLite-Datenbank, Firmensuche, Feature-Gating, Analyse-Engine
- `frontend/`: statische SPA mit Firmenprofil, Logo, Dashboard, Watchlist, Historie und Premium-UI
- `tests/`: Node-Testdateien fuer Kernlogik

## Start

```powershell
node scripts/dev.mjs
```

Backend: `http://localhost:4000`

Frontend: `http://localhost:5173`

## Hinweise

Die Marktdaten sind derzeit Mock-Daten ueber eine klare Service-Schnittstelle. Spaeter kann `backend/src/services/marketData.js` gegen einen echten Provider ausgetauscht werden. Free/Premium-Limits liegen in `backend/src/services/featureGate.js` und sind fuer eine spaetere Payment-Integration vorbereitet.
