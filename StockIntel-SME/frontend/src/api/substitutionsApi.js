import { request, USE_MOCK, delay } from './client.js';
import substitutionsJson from '../data/substitutions.json';

/**
 * GET /api/substitutions
 * GET /api/substitutions/:productId
 */
export async function getSubstitutions(productId) {
  if (USE_MOCK) {
    await delay();
    const list = substitutionsJson.substitutions || [];

    if (productId) {
      const item = list.find((s) => s.product_id === productId);
      return item || null;
    }
    return { substitutions: list };
  }

  if (productId) {
    return request(`/substitutions/${encodeURIComponent(productId)}`);
  }
  return request('/substitutions');
}
