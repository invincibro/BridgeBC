# BridgeBC

BridgeBC is a full-stack MVP that helps nonprofits connect with volunteers while preserving continuity through volunteer handoffs.

## Project structure

- `client/`: React + Vite frontend with Tailwind CSS and React Router
- `server/`: Express backend serving mock JSON data

## Run the app

Open two terminals from the project root.

### Terminal 1: start the API

#### Install dependencies
```bash
cd /api

npm install
```
#### Run docker compose and set up database
- make sure docker is installed and running
```bash
docker-compose up -d --build

node ./api/migrate.js

node ./api/seed.js
```
The API runs on `http://localhost:3000`.

### Terminal 2: start the frontend

```bash
cd /client

npm install

npm run dev
```

The frontend runs on `http://localhost:5173`.
