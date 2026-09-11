# StockIntel SME Dashboard — Frontend API Contract

This document describes the HTTP API the frontend expects.  
Mock mode (`VITE_USE_MOCK_DATA=true`) serves the same shapes from local JSON under `src/data/`.

**Base URL:** `VITE_API_BASE_URL` (default `/api`)

---

## Conventions

- JSON request/response bodies
- `Content-Type: application/json`
- Product identifiers use `product_id` (e.g. `P001`) consistently
- Supplier identifiers use `supplier_id` (e.g. `S001`)
- Currency amounts may include both raw numbers and pre-formatted strings (`*_formatted`) for INR display
- Dates: ISO-8601 preferred; display strings accepted in mock data

### Error responses

```json
{
  "message": "Human readable error",
  "error": "optional_code"
}
```

Status codes used by the client: `400`, `401`, `403`, `404`, `409`, `429`, `500`, network/timeout.

---

## Endpoints

### GET /dashboard

**Purpose:** Aggregated KPI summary, attention list, chart series, top stockout/overstock lists.

**Response (current frontend shape):**

```json
{
  "kpis": {
    "total_products": 1480,
    "inventory_value_formatted": "₹42.5L",
    "inventory_value_raw": 4250000,
    "stockout_risks": 18,
    "overstock_items": 34,
    "orders_to_place": 27,
    "potential_lost_sales_formatted": "₹1.45L",
    "potential_lost_sales_raw": 145000,
    "excess_inventory_formatted": "₹6.20L",
    "excess_inventory_raw": 620000
  },
  "attention_today": [],
  "inventory_health": [],
  "demand_trend": [],
  "stockout_risk_products": [],
  "overstock_products": [],
  "recent_recommendations": []
}
```

---

### GET /products

**Query (optional):** `search`, `category`

**Response:**

```json
{
  "products": [
    {
      "product_id": "P001",
      "sku": "MILK-001",
      "name": "Milk 1L",
      "category": "Dairy",
      "brand": "Aavin",
      "pricing": { "cost_price": 45, "selling_price": 55 },
      "inventory": {
        "current_stock": 50,
        "reserved_stock": 5,
        "available_stock": 45,
        "reorder_level": 80
      },
      "supplier": {
        "supplier_id": "S001",
        "supplier_name": "ABC Distributors",
        "minimum_order_quantity": 100,
        "lead_time_days": 4
      },
      "shelf_life": { "days": 7, "expiry_tracking": true },
      "status": "ACTIVE",
      "last_updated": "2026-09-11T10:30:00Z"
    }
  ]
}
```

### GET /products/:productId

**Response:** `{ "product": { ...same shape as above... } }`

---

### GET /forecast

Returns `{ "forecasts": [ ... ] }` when no product is specified.

### GET /forecast/:productId

**Response:** single forecast object (mock: from `products_forecast` map), including:

- `product_id`, `product_name`, `sku`, `category`
- `average_daily_demand`, `forecast_confidence`, `trend`, `trend_direction`
- `summary`: keyed by horizon (`"7"`, `"14"`, `"30"`)
- `series_7` / series arrays with `{ date, actual, predicted, is_future }`

---

### GET /recommendations

**Query (optional):** `priority` (`HIGH` | `MEDIUM` | `LOW`)

**Response:**

```json
{
  "recommendations": [
    {
      "id": "REC-001",
      "product_id": "P001",
      "product_name": "Milk 1L",
      "sku": "MILK-001",
      "current_stock": 50,
      "expected_demand": 142,
      "lead_time_days": 4,
      "recommended_quantity": 200,
      "order_by": "Today (Before 4:00 PM)",
      "estimated_cost": 9000,
      "estimated_cost_formatted": "₹9,000",
      "priority": "HIGH",
      "supplier_id": "S001",
      "supplier_name": "ABC Distributors",
      "reasons": ["..."],
      "status": "PENDING",
      "confidence": "94%"
    }
  ]
}
```

---

### GET /alerts

**Query (optional):** `type`, `severity`

**Response:**

```json
{
  "alerts": [
    {
      "id": "ALT-001",
      "type": "STOCKOUT",
      "severity": "HIGH",
      "product_id": "P001",
      "product_name": "Milk 1L",
      "sku": "MILK-001",
      "category": "Dairy",
      "current_stock": 50,
      "risk_prediction": "Stockout in 1.4 days...",
      "financial_impact": "₹3,300 potential lost sales",
      "financial_impact_value": 3300,
      "recommended_action": "ORDER NOW",
      "action_detail": "...",
      "created_at": "2026-09-11T07:15:00Z"
    }
  ]
}
```

---

### GET /suppliers

**Query (optional):** `search`

**Response:**

```json
{
  "suppliers": [
    {
      "supplier_id": "S001",
      "supplier_name": "ABC Distributors",
      "contact_person": "Rajesh Sharma",
      "phone": "+91 ...",
      "email": "...",
      "categories_supplied": ["Dairy"],
      "quoted_lead_time_days": 4,
      "actual_average_lead_time": 4.2,
      "total_orders": 84,
      "on_time_deliveries": 77,
      "late_deliveries": 7,
      "on_time_rate": 91.7,
      "reliability": "HIGH",
      "recommendation": "...",
      "performance_history": [{ "month": "Apr", "quoted": 4, "actual": 4.1 }]
    }
  ]
}
```

---

### GET /working-capital

**Response:** includes inventory value breakdown, cash opportunity, and top locked-capital products.  
Field names in the current mock include `summary`, `breakdown_by_velocity`, `cash_stuck_top_products`, etc. Backend may normalize to the shapes described in the project brief; the frontend tolerates both via optional chaining.

---

### GET /bundles

### GET /bundles/:productId

List returns `{ "bundles": [ ... ] }`.  
Detail returns a single bundle object with `frequently_bought_together` (or equivalent) array of companion products and co-purchase rates.

---

### GET /substitutions

### GET /substitutions/:productId

List returns `{ "substitutions": [ ... ] }`.  
Detail returns an object with `recommended_substitutes` (similarity, stock, price delta).

---

## Frontend integration notes

1. Switch mock → real: set `VITE_USE_MOCK_DATA=false` and point `VITE_API_BASE_URL` at the backend.
2. All UI data flows: **Page → Hook → API module → client.js → Backend / Mock**.
3. Components never import JSON from `src/data/` directly.
4. Actions (Create PO, Resolve alert, etc.) currently create **local drafts / toasts only**. Wire POST/PUT endpoints later without changing the card/table UI.

## Suggested future write endpoints (not implemented in UI yet)

- `POST /recommendations/:id/create-po`
- `POST /alerts/:id/resolve`
- `POST /products`
- `PUT /settings`

---

## Import endpoints (new)

### POST /products/import

**Purpose:** Bulk-upload product catalog from CSV.

**Request:** `multipart/form-data` with field `file` (CSV)

**Required CSV columns:** `sku`, `name`  
**Optional:** `category`, `brand`, `cost_price`, `selling_price`, `current_stock`, `reorder_level`, `supplier_name`, `lead_time_days`, `minimum_order_quantity`

**Response example:**

```json
{
  "import_id": "PRD-IMP-...",
  "status": "PROCESSED",
  "message": "Catalog import processed.",
  "summary": {
    "rows_received": 120,
    "rows_valid": 118,
    "rows_rejected": 2,
    "file_name": "products.csv"
  }
}
```

---

### POST /forecast/import

**Purpose:** Upload historical product sales to seed / refresh demand forecasts.

**Request:** `multipart/form-data` with field `file` (CSV)

**Required CSV columns:** `date`, `sku` (or `product_id`), `quantity_sold`  
**Optional:** `product_name`, `revenue`

**Response example:**

```json
{
  "import_id": "SALES-IMP-...",
  "status": "PROCESSED",
  "message": "Sales history processed.",
  "summary": {
    "rows_received": 12450,
    "rows_valid": 12380,
    "rows_rejected": 70,
    "skus_matched": 148,
    "date_from": "2026-03-01",
    "date_to": "2026-09-10",
    "file_name": "sales.csv"
  },
  "insights": {}
}
```

Frontend mock mode validates CSV client-side and returns a synthetic success summary without persisting rows.
