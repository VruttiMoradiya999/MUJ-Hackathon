import { request, USE_MOCK, delay } from './client.js';
import recommendationsJson from '../data/recommendations.json';

/**
 * GET /api/recommendations
 * Optional: priority filter (HIGH | MEDIUM | LOW)
 */
export async function getRecommendations(params = {}) {
  if (USE_MOCK) {
    await delay();
    let recommendations = recommendationsJson.recommendations || [];

    if (params.priority) {
      recommendations = recommendations.filter(
        (r) => String(r.priority).toUpperCase() === String(params.priority).toUpperCase()
      );
    }

    return { recommendations };
  }

  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.set(k, v);
  });
  const qs = query.toString();
  return request(`/recommendations${qs ? `?${qs}` : ''}`);
}
