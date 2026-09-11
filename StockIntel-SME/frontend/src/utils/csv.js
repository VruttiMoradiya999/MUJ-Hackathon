/**
 * Lightweight CSV helpers for catalog & sales uploads.
 * Supports quoted fields and basic validation — no external dependency.
 */

/**
 * Parse a CSV string into an array of row objects using the header row as keys.
 * @param {string} text
 * @returns {{ headers: string[], rows: Record<string, string>[], errors: string[] }}
 */
export function parseCsv(text) {
  const errors = [];
  if (!text || !String(text).trim()) {
    return { headers: [], rows: [], errors: ['File is empty.'] };
  }

  const lines = splitCsvLines(String(text).replace(/^\uFEFF/, ''));
  if (lines.length < 2) {
    return { headers: [], rows: [], errors: ['CSV must include a header row and at least one data row.'] };
  }

  const headers = splitCsvRow(lines[0]).map((h) => h.trim());
  if (headers.some((h) => !h)) {
    errors.push('Header row contains an empty column name.');
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cells = splitCsvRow(line);
    if (cells.length !== headers.length) {
      errors.push(`Row ${i + 1}: expected ${headers.length} columns, found ${cells.length}.`);
      continue;
    }
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (cells[idx] ?? '').trim();
    });
    rows.push(obj);
  }

  return { headers, rows, errors };
}

function splitCsvLines(text) {
  const lines = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++;
      lines.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.length) lines.push(current);
  return lines;
}

function splitCsvRow(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

/**
 * Trigger a browser download for a text file (e.g. CSV template).
 */
export function downloadTextFile(filename, content, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Product catalog CSV template */
export const PRODUCT_CSV_TEMPLATE = `sku,name,category,brand,cost_price,selling_price,current_stock,reorder_level,supplier_name,lead_time_days,minimum_order_quantity
MILK-001,Milk 1L,Dairy,Aavin,45,55,50,80,ABC Distributors,4,100
BRD-002,Whole Wheat Bread 400g,Bakery,Britannia,32,40,35,60,Modern Bakers Depot,2,80
`;

/** Sales history CSV template for demand forecast */
export const SALES_CSV_TEMPLATE = `date,sku,product_name,quantity_sold,revenue
2026-08-01,MILK-001,Milk 1L,42,2310
2026-08-02,MILK-001,Milk 1L,38,2090
2026-08-01,BRD-002,Whole Wheat Bread 400g,28,1120
2026-08-02,BRD-002,Whole Wheat Bread 400g,31,1240
`;

/**
 * Validate product catalog rows.
 * Required headers: sku, name
 */
export function validateProductRows(headers, rows) {
  const required = ['sku', 'name'];
  const normalized = headers.map((h) => h.toLowerCase());
  const missing = required.filter((r) => !normalized.includes(r));
  const errors = [];
  if (missing.length) {
    errors.push(`Missing required columns: ${missing.join(', ')}.`);
  }
  if (!rows.length) {
    errors.push('No data rows found.');
  }
  const skus = new Set();
  rows.forEach((row, idx) => {
    const sku = row.sku || row.SKU || '';
    const name = row.name || row.Name || row.product_name || '';
    if (!sku) errors.push(`Row ${idx + 2}: sku is required.`);
    if (!name) errors.push(`Row ${idx + 2}: name is required.`);
    if (sku && skus.has(sku)) errors.push(`Row ${idx + 2}: duplicate sku "${sku}".`);
    if (sku) skus.add(sku);
  });
  return { valid: errors.length === 0, errors: errors.slice(0, 15) };
}

/**
 * Validate sales history rows.
 * Required headers: date, sku (or product_id), quantity_sold
 */
export function validateSalesRows(headers, rows) {
  const normalized = headers.map((h) => h.toLowerCase());
  const hasSku = normalized.includes('sku') || normalized.includes('product_id');
  const errors = [];
  if (!normalized.includes('date')) errors.push('Missing required column: date.');
  if (!hasSku) errors.push('Missing required column: sku or product_id.');
  if (!normalized.includes('quantity_sold') && !normalized.includes('qty') && !normalized.includes('quantity')) {
    errors.push('Missing required column: quantity_sold.');
  }
  if (!rows.length) errors.push('No data rows found.');

  rows.slice(0, 50).forEach((row, idx) => {
    const date = row.date || row.Date || '';
    const qty = row.quantity_sold || row.qty || row.quantity || '';
    if (date && Number.isNaN(Date.parse(date))) {
      errors.push(`Row ${idx + 2}: invalid date "${date}". Use YYYY-MM-DD.`);
    }
    if (qty !== '' && Number.isNaN(Number(qty))) {
      errors.push(`Row ${idx + 2}: quantity_sold must be a number.`);
    }
  });

  return { valid: errors.length === 0, errors: errors.slice(0, 15) };
}
