import { request, USE_MOCK, delay } from './client.js';
import dashboardJson from '../data/dashboard.json';
import recommendationsJson from '../data/recommendations.json';

/**
 * GET /api/dashboard
 * Returns summary KPIs, attention items, charts, stockout/overstock lists.
 */
export async function getDashboard() {
  if (USE_MOCK) {
    await delay();
    // Enrich with a couple of recent recommendations for the dashboard preview
    return {
      ...dashboardJson,
      recent_recommendations: (recommendationsJson.recommendations || []).slice(0, 2),
    };
  }
  return request('/dashboard');
}
