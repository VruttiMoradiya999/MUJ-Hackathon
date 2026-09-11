# Inventory Backend (Django + DRF)

Complete ready-to-use backend for **Products**, **Suppliers**, **Alerts**, **Recommendations**, **Forecasts**, and **Dashboard**.

## Features

| Feature            | Endpoints                                      | Extra Actions                          |
|--------------------|------------------------------------------------|----------------------------------------|
| Categories         | `/api/categories/`                             | CRUD                                   |
| Products           | `/api/products/`                               | `low_stock/`, `out_of_stock/`, `inventory_summary/` |
| Suppliers          | `/api/suppliers/`                              | `alerts/`                              |
| Alerts             | `/api/alerts/`                                 | `acknowledge/`, `resolve/`, `summary/` |
| Recommendations    | `/api/recommendations/`                        | `accept/`, `reject/`, `implement/`     |
| Forecasts          | `/api/forecasts/`                              | `accuracy_report/`                     |
| Dashboard          | `/api/dashboard/`                              | `kpis/`, `generate_snapshot/`          |

## Quick Start

```bash
# 1. Unzip & enter folder
cd inventory_backend

# 2. Create virtualenv (recommended)
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run migrations
python manage.py migrate

# 5. Create superuser
python manage.py createsuperuser

# 6. (Optional) Load sample data
python manage.py shell < sample_data.py

# 7. Start server
python manage.py runserver
```

- Admin panel: http://127.0.0.1:8000/admin/
- API root:    http://127.0.0.1:8000/api/
- Browsable API login: http://127.0.0.1:8000/api-auth/login/

## Authentication

By default all endpoints require authentication (`IsAuthenticated`).

You can use:
- Session authentication (via browsable API or Django login)
- Basic Auth (username:password)

To open endpoints for development, change in `config/settings.py`:

```python
'DEFAULT_PERMISSION_CLASSES': [
    'rest_framework.permissions.AllowAny',
],
```

## Environment Variables (optional)

Copy `.env.example` to `.env` and edit:

```
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

For PostgreSQL:

```
DB_ENGINE=django.db.backends.postgresql
DB_NAME=inventory
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
```

## Project Structure

```
inventory_backend/
├── config/                 # Project settings & root URLs
├── products/               # Categories + Products
├── inventory/              # Suppliers, Alerts, Recommendations, Forecasts, Dashboard
├── manage.py
├── requirements.txt
├── sample_data.py
└── README.md
```

## Notes

- Uses SQLite by default (zero config).
- CORS is open in DEBUG mode.
- Image uploads go to `media/products/`.
- Adjust Product field names if you already have a different schema.
