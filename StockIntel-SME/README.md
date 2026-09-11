# StockIntel SME — Inventory Management

```
StockIntel-SME/
├── backend/     Django API (port 8000)
└── frontend/    React dashboard (port 3000)
```

hello how are you

## Start backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 8000
```

## Start frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

`.env` is pre-configured:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK_DATA=false
```
