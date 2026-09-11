/**
 * Formatting helpers for INR, numbers, percentages, and dates.
 * Safe against null / undefined / NaN.
 */

/**
 * Format a number as Indian Rupees.
 * @param {number|string|null|undefined} value
 * @param {object} options
 * @param {boolean} options.compact - use L / Cr style (e.g. ₹42.5L)
 * @param {number} options.fractionDigits
 */
export function formatCurrency(value, options = {}) {
  const { compact = false, fractionDigits } = options;
  const num = Number(value);
  if (value === null || value === undefined || Number.isNaN(num)) {
    return '—';
  }

  if (compact) {
    if (Math.abs(num) >= 1e7) {
      return `₹${(num / 1e7).toFixed(fractionDigits ?? 2)}Cr`;
    }
    if (Math.abs(num) >= 1e5) {
      return `₹${(num / 1e5).toFixed(fractionDigits ?? 1)}L`;
    }
    if (Math.abs(num) >= 1e3) {
      return `₹${(num / 1e3).toFixed(fractionDigits ?? 1)}K`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: fractionDigits ?? (num % 1 === 0 ? 0 : 2),
    minimumFractionDigits: 0,
  }).format(num);
}

/**
 * Format plain numbers with Indian grouping.
 */
export function formatNumber(value, options = {}) {
  const num = Number(value);
  if (value === null || value === undefined || Number.isNaN(num)) {
    return '—';
  }
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: options.fractionDigits ?? 2,
    minimumFractionDigits: options.minFractionDigits ?? 0,
  }).format(num);
}

/**
 * Format a ratio (0–1 or 0–100) as percentage.
 * @param {number} value
 * @param {boolean} alreadyPercent - if true, treat value as already 0–100
 */
export function formatPercent(value, alreadyPercent = false) {
  const num = Number(value);
  if (value === null || value === undefined || Number.isNaN(num)) {
    return '—';
  }
  const pct = alreadyPercent ? num : num * 100;
  return `${pct.toFixed(pct % 1 === 0 ? 0 : 1)}%`;
}

/**
 * Safe date formatting.
 */
export function formatDate(value, options = {}) {
  if (!value) return '—';
  try {
    const d = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: options.includeYear === false ? undefined : 'numeric',
      ...options,
    }).format(d);
  } catch {
    return String(value);
  }
}

/**
 * Prefer a pre-formatted string from the API when present; otherwise format the raw number.
 */
export function displayCurrency(formatted, raw, options = {}) {
  if (formatted && typeof formatted === 'string' && formatted.trim()) {
    return formatted;
  }
  return formatCurrency(raw, options);
}
