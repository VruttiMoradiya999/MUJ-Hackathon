import { request, USE_MOCK, delay } from './client.js';
import alertsJson from '../data/alerts.json';

/**
 * GET /api/alerts
 * Optional filters: type (STOCKOUT | OVERSTOCK | ...), severity (HIGH | MEDIUM | LOW)
 */
export async function getAlerts(params = {}) {
  if (USE_MOCK) {
    await delay();
    let alerts = alertsJson.alerts || [];

    if (params.type) {
      alerts = alerts.filter(
        (a) => String(a.type).toUpperCase() === String(params.type).toUpperCase()
      );
    }
    if (params.severity) {
      alerts = alerts.filter(
        (a) => String(a.severity).toUpperCase() === String(params.severity).toUpperCase()
      );
    }

    return { alerts };
  }

  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.set(k, v);
  });
  const qs = query.toString();
  return request(`/alerts${qs ? `?${qs}` : ''}`);
}
