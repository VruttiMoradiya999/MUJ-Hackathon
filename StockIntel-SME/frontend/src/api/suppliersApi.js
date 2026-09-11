import { request, USE_MOCK, delay } from './client.js';
import suppliersJson from '../data/suppliers.json';

/**
 * GET /api/suppliers
 * Optional: search
 */
export async function getSuppliers(params = {}) {
  if (USE_MOCK) {
    await delay();
    let suppliers = suppliersJson.suppliers || [];

    if (params.search) {
      const q = String(params.search).toLowerCase();
      suppliers = suppliers.filter(
        (s) =>
          s.supplier_name?.toLowerCase().includes(q) ||
          s.contact_person?.toLowerCase().includes(q) ||
          (s.categories_supplied || []).some((c) => c.toLowerCase().includes(q))
      );
    }

    return { suppliers };
  }

  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.set(k, v);
  });
  const qs = query.toString();
  return request(`/suppliers${qs ? `?${qs}` : ''}`);
}
