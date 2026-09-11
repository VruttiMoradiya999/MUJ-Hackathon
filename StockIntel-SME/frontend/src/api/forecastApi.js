import { request, USE_MOCK, delay } from './client.js';
import forecastJson from '../data/forecast.json';

/**
 * GET /api/forecast
 * GET /api/forecast/:productId
 *
 * Mock shape: { products_forecast: { [productId]: ForecastObject } }
 */
export async function getForecast(productId) {
  if (USE_MOCK) {
    await delay();
    const map = forecastJson.products_forecast || {};

    if (productId) {
      const item = map[productId];
      if (!item) {
        // Return a graceful empty-ish structure so the page can show empty state
        return null;
      }
      return item;
    }

    // List mode: array of all forecasts
    return {
      forecasts: Object.values(map),
    };
  }

  if (productId) {
    return request(`/forecast/${encodeURIComponent(productId)}`);
  }
  return request('/forecast');
}

/**
 * Convenience: list of product IDs that have forecast data (mock only helper).
 */
export async function getForecastProductIds() {
  if (USE_MOCK) {
    await delay(100);
    return Object.keys(forecastJson.products_forecast || {});
  }
  const data = await getForecast();
  return (data?.forecasts || []).map((f) => f.product_id).filter(Boolean);
}

/**
 * POST /api/forecast/import
 * Upload historical sales CSV to seed demand models.
 *
 * @param {File|Blob} file
 * @param {{ rows?: object[], headers?: string[] }} [parsed]
 */
export async function importSales(file, parsed = {}) {
  if (USE_MOCK) {
    await delay(700);
    const rows = parsed.rows || [];
    const headers = parsed.headers || [];
    const skus = new Set(
      rows.map((r) => r.sku || r.SKU || r.product_id || r.productId).filter(Boolean)
    );
    const dates = rows
      .map((r) => r.date || r.Date)
      .filter(Boolean)
      .sort();
    return {
      import_id: `SALES-IMP-${Date.now()}`,
      status: 'PROCESSED',
      message: `Sales history processed for ${skus.size} SKU(s). Forecast insights refreshed (mock).`,
      summary: {
        rows_received: rows.length,
        rows_valid: rows.length,
        rows_rejected: 0,
        skus_matched: skus.size,
        date_from: dates[0] || '—',
        date_to: dates[dates.length - 1] || '—',
        file_name: file?.name || 'sales.csv',
      },
      insights: {
        note: 'Mock mode does not retrain models. Backend will compute demand curves from this file.',
      },
    };
  }

  const form = new FormData();
  form.append('file', file);
  const { API_BASE_URL } = await import('./client.js');
  const base = (API_BASE_URL || '/api').replace(/\/$/, '');
  const response = await fetch(`${base}/forecast/import`, {
    method: 'POST',
    body: form,
  });
  if (!response.ok) {
    let message = 'Sales import failed.';
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      /* ignore */
    }
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  return response.json();
}
