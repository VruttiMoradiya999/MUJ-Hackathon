import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import ProductTable from '../components/products/ProductTable.jsx';
import SearchInput from '../components/ui/SearchInput.jsx';
import Select from '../components/ui/Select.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import UploadPanel from '../components/ui/UploadPanel.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { importProducts } from '../api/productsApi.js';
import {
  parseCsv,
  downloadTextFile,
  PRODUCT_CSV_TEMPLATE,
  validateProductRows,
} from '../utils/csv.js';
import { Plus, Download, RefreshCw, Upload } from 'lucide-react';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery !== null && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  const { data, loading, error, refetch } = useProducts({
    search: debouncedSearch,
    category: selectedCategory,
  });

  const products = data?.products || [];

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  const statusOptions = [
    { value: '', label: 'All Stock Statuses' },
    { value: 'CRITICAL', label: 'Stockout Risk (<50% reorder)' },
    { value: 'LOW', label: 'Low Stock (< reorder level)' },
    { value: 'OPTIMAL', label: 'Optimal Stock' },
    { value: 'OVERSTOCK', label: 'Overstocked (>2.5x)' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      let matchesStatus = true;
      if (selectedStatus) {
        const current = p.inventory?.current_stock ?? 0;
        const reorder = p.inventory?.reorder_level ?? 0;
        if (selectedStatus === 'CRITICAL') matchesStatus = current <= reorder * 0.5;
        else if (selectedStatus === 'LOW') matchesStatus = current <= reorder;
        else if (selectedStatus === 'OVERSTOCK') matchesStatus = current > reorder * 2.5;
        else if (selectedStatus === 'OPTIMAL')
          matchesStatus = current > reorder && current <= reorder * 2.5;
      }
      return matchesStatus;
    });
  }, [products, selectedStatus]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('search', value);
    else next.delete('search');
    setSearchParams(next, { replace: true });
  };

  const handleExportCSV = () => {
    showToast('Catalog inventory export drafted (CSV). Connect backend to download live file.', 'info');
  };

  const handleAddProduct = () => {
    setIsAddModalOpen(false);
    showToast('Product draft saved locally. Backend integration required to persist.', 'success');
  };

  const handleProductFile = async (file) => {
    setUploadErrors([]);
    setUploadResult(null);
    if (!file) return;

    if (!/\.csv$/i.test(file.name) && file.type && !file.type.includes('csv') && file.type !== 'text/plain') {
      setUploadErrors(['Please upload a .csv file.']);
      return;
    }

    try {
      setUploading(true);
      const text = await file.text();
      const { headers, rows, errors: parseErrors } = parseCsv(text);
      if (parseErrors.length) {
        setUploadErrors(parseErrors);
        return;
      }
      const { valid, errors: validationErrors } = validateProductRows(headers, rows);
      if (!valid) {
        setUploadErrors(validationErrors);
        return;
      }

      const result = await importProducts(file, { headers, rows });
      setUploadResult(result);
      showToast(result.message || 'Product catalog uploaded.', 'success');
      refetch();
    } catch (err) {
      setUploadErrors([err?.message || 'Upload failed. Please try again.']);
      showToast(err?.message || 'Product upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageContainer
      title="Product Catalog & Inventory"
      subtitle="Search, filter, upload, and monitor stock positions across your active SKU portfolio."
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refetch} title="Refresh">
            Refresh
          </Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
            Export
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Upload}
            onClick={() => {
              setIsUploadOpen(true);
              setUploadErrors([]);
              setUploadResult(null);
            }}
          >
            Upload Products
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            Add Product
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by name, SKU, brand, or supplier…"
            />
          </div>
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
            className="sm:w-48"
          />
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={statusOptions}
            className="sm:w-56"
          />
        </div>

        {loading && <LoadingState rows={6} />}

        {!loading && error && (
          <ErrorState
            title="Unable to load products"
            message={error?.message || 'Unable to load inventory data.'}
            onRetry={refetch}
          />
        )}

        {!loading && !error && <ProductTable products={filteredProducts} />}
      </div>

      {/* Single product add modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
        subtitle="Create a draft SKU entry"
        confirmLabel="Save Draft"
        onConfirm={handleAddProduct}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
            <input
              type="text"
              placeholder="e.g. Organic Brown Rice 1kg"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SKU Code</label>
              <input
                type="text"
                placeholder="RCE-017"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                placeholder="Grains / Grocery"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
              <input
                type="number"
                placeholder="80"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Selling MRP (₹)</label>
              <input
                type="number"
                placeholder="110"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Opening Stock</label>
              <input
                type="number"
                placeholder="50"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reorder Level</label>
              <input
                type="number"
                placeholder="30"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
          <p className="text-slate-500 pt-1">
            Draft only — backend API is required to persist new products.
          </p>
        </div>
      </Modal>

      {/* Bulk catalog upload modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Product Catalog"
        subtitle="Import SKUs from a CSV file"
        confirmLabel="Done"
        onConfirm={() => setIsUploadOpen(false)}
        cancelLabel="Close"
      >
        <UploadPanel
          title="Product CSV"
          description="Required columns: sku, name. Optional: category, brand, cost_price, selling_price, current_stock, reorder_level, supplier_name, lead_time_days, minimum_order_quantity."
          onDownloadTemplate={() =>
            downloadTextFile('product-catalog-template.csv', PRODUCT_CSV_TEMPLATE)
          }
          onFileSelected={handleProductFile}
          uploading={uploading}
          errors={uploadErrors}
          result={uploadResult}
          onClearResult={() => setUploadResult(null)}
        />
      </Modal>
    </PageContainer>
  );
}

export default ProductsPage;
