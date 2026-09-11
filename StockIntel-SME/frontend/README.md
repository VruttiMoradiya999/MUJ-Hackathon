# StockIntel — SME Inventory Intelligence Dashboard

React + Vite frontend for inventory intelligence (stockouts, overstock, reorder recommendations, suppliers, working capital, bundles, substitutions).

## Quick start

```bash
npm install
cp .env.example .env   # already defaults to mock data
npm run dev
```

Open http://localhost:3000

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_USE_MOCK_DATA` | `true` | Use local JSON mocks instead of HTTP |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Backend base URL when mock is off |

## Architecture

```
Page  →  Hook (useDashboard, useProducts, …)
      →  API module (dashboardApi, productsApi, …)
      →  client.js  →  Mock JSON  |  Real HTTP
```

- Components **do not** import `src/data/*.json` directly.
- Switch to a live backend by setting `VITE_USE_MOCK_DATA=false`.

See [docs/API_CONTRACT.md](docs/API_CONTRACT.md) for endpoint contracts.

## Scripts

- `npm run dev` — development server (port 3000)
- `npm run build` — production build
- `npm run preview` — preview production build
