/**
 * Centralized API client.
 * All network requests go through this module.
 * Base URL and mock mode are controlled via environment variables.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_DATA || 'true').toLowerCase() === 'true';

/**
 * Custom API error with status and friendly message.
 */
export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Map HTTP status codes to human-readable messages.
 */
function getFriendlyMessage(status, fallback) {
  const messages = {
    400: 'Invalid request. Please check your input.',
    401: 'You are not authenticated. Please sign in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'A conflict occurred. The resource may have been modified.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'A server error occurred. Please try again later.',
    502: 'Service temporarily unavailable.',
    503: 'Service temporarily unavailable. Please try again later.',
  };
  return messages[status] || fallback || 'An unexpected error occurred.';
}

/**
 * Core request helper.
 * @param {string} path - Path relative to API_BASE_URL (e.g. '/products')
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
export async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let details = null;
      try {
        details = await response.json();
      } catch {
        // ignore parse errors
      }
      const message = getFriendlyMessage(
        response.status,
        details?.message || details?.error || response.statusText
      );
      throw new ApiError(message, response.status, details);
    }

    // Handle 204 / empty body
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408);
    }
    if (err instanceof ApiError) {
      throw err;
    }
    // Network / CORS / offline
    throw new ApiError(
      'Unable to reach the server. Check your connection and try again.',
      0,
      { original: err.message }
    );
  }
}

/**
 * Simulate network latency for mock mode (helps exercise loading states).
 * @param {number} ms
 */
export function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { API_BASE_URL, USE_MOCK };
