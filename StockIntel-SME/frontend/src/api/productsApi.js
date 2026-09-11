import { request, USE_MOCK, delay } from './client.js';
import productsJson from '../data/products.json';

/**
 * GET /api/products
 * Optional query params: search, category, status (client-side filter today; backend can support later)
 */
export async function getProducts(params = {}) {
  if (USE_MOCK) {
    await delay();
    let products = productsJson.products || [];

    if (params.search) {
      const q = String(params.search).toLowerCase();
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }
    if (params.category) {
      products = products.filter((p) => p.category === params.category);
    }
    // status filtering is currently done in the page for richer stock logic

    return { products };
  }

  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.set(k, v);
  });
  const qs = query.toString();
  return request(`/products${qs ? `?${qs}` : ''}`);
}

/**
 * GET /api/products/:productId
 */
export async function getProduct(productId) {
  if (USE_MOCK) {
    await delay(200);
    const product = (productsJson.products || []).find(
      (p) => p.product_id === productId || p.id === productId
    );
    if (!product) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }
    return { product };
  }
  return request(`/products/${encodeURIComponent(productId)}`);
}

/**
 * POST /api/products/import
 * Upload product catalog CSV (multipart file on real backend).
 * In mock mode, parses client-side and returns a success summary.
 *
 * @param {File|Blob} file
 * @param {{ rows?: object[], headers?: string[] }} [parsed] - optional pre-parsed rows from client
 */
export async function importProducts(file, parsed = {}) {
  if (USE_MOCK) {
    await delay(600);
    const rows = parsed.rows || [];
    const headers = parsed.headers || [];
    return {
      import_id: `PRD-IMP-${Date.now()}`,
      status: 'PROCESSED',
      message: `Catalog import draft processed for ${rows.length} product row(s). Connect backend to persist.`,
      summary: {
        rows_received: rows.length,
        rows_valid: rows.length,
        rows_rejected: 0,
        columns: headers.length,
        file_name: file?.name || 'products.csv',
      },
    };
  }

  const form = new FormData();
  form.append('file', file);
  // request() defaults to JSON content-type — use raw fetch path for multipart
  const { API_BASE_URL } = await import('./client.js');
  const base = (API_BASE_URL || '/api').replace(/\/$/, '');
  const response = await fetch(`${base}/products/import`, {
    method: 'POST',
    body: form,
  });
  if (!response.ok) {
    let message = 'Product import failed.';
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
