# BridgeBC

BridgeBC is a full-stack MVP that helps nonprofits connect with volunteers while preserving continuity through volunteer handoffs.

## Project structure

- `client/`: React + Vite frontend with Tailwind CSS and React Router
- `server/`: Express backend serving mock JSON data

## Run the app

Open two terminals from the project root.

### Terminal 1: start the API

```bash
cd /Users/hoimingfong/BridgeBC/server
npm install
npm run dev
```

The API runs on `http://localhost:5001`.

### Terminal 2: start the frontend

```bash
cd /Users/hoimingfong/BridgeBC/client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.
