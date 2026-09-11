import { request, USE_MOCK, delay } from './client.js';
import workingCapitalJson from '../data/workingCapital.json';

/**
 * GET /api/working-capital
 */
export async function getWorkingCapital() {
  if (USE_MOCK) {
    await delay();
    return workingCapitalJson;
  }
  return request('/working-capital');
}
