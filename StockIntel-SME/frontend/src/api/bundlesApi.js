import { request, USE_MOCK, delay } from './client.js';
import bundlesJson from '../data/bundles.json';

/**
 * GET /api/bundles
 * GET /api/bundles/:productId
 */
export async function getBundles(productId) {
  if (USE_MOCK) {
    await delay();
    const list = bundlesJson.bundles || [];

    if (productId) {
      const item = list.find((b) => b.product_id === productId);
      return item || null;
    }
    return { bundles: list };
  }

  if (productId) {
    return request(`/bundles/${encodeURIComponent(productId)}`);
  }
  return request('/bundles');
}
