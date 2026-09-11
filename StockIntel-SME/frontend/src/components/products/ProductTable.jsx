import React from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../ui/DataTable.jsx';
import Badge from '../ui/Badge.jsx';
import { ChevronRight, AlertCircle, CheckCircle2, TrendingDown } from 'lucide-react';

export function ProductTable({ products = [], isLoading = false }) {
  const navigate = useNavigate();

  const columns = [
    {
      header: 'Product',
      key: 'name',
      sortKey: 'name',
      render: (item) => (
        <div className="flex items-center gap-2.5">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200 bg-slate-50"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div
            className={`w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 border border-slate-200 ${
              item.image_url ? 'hidden' : ''
            }`}
          >
            {item.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {item.name}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {item.brand}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'SKU',
      key: 'sku',
      sortKey: 'sku',
      render: (item) => (
        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {item.sku}
        </span>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      sortKey: 'category',
      render: (item) => (
        <span className="text-xs font-medium text-slate-700">{item.category}</span>
      ),
    },
    {
      header: 'Stock',
      key: 'current_stock',
      sortKey: 'inventory.current_stock',
      render: (item) => {
        const current = item.inventory.current_stock;
        const reorder = item.inventory.reorder_level;
        const isCritical = current <= reorder * 0.6;
        const isLow = current <= reorder;

        return (
          <div>
            <span
              className={`font-semibold text-xs ${
                isCritical ? 'text-red-700' : isLow ? 'text-amber-700' : 'text-slate-900'
              }`}
            >
              {current} units
            </span>
            {item.inventory.reserved_stock > 0 && (
              <span className="block text-[10px] text-slate-400">
                {item.inventory.reserved_stock} resvd
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Available',
      key: 'available_stock',
      render: (item) => (
        <span className="text-xs font-medium text-slate-800">
          {item.inventory.available_stock}
        </span>
      ),
    },
    {
      header: 'Cost Price',
      key: 'cost_price',
      render: (item) => (
        <span className="text-xs text-slate-600">₹{item.pricing.cost_price}</span>
      ),
    },
    {
      header: 'Selling Price',
      key: 'selling_price',
      render: (item) => (
        <span className="text-xs font-semibold text-slate-900">
          ₹{item.pricing.selling_price}
        </span>
      ),
    },
    {
      header: 'Supplier',
      key: 'supplier',
      render: (item) => (
        <div className="text-xs">
          <div className="text-slate-800 font-medium truncate max-w-[140px]">
            {item.supplier?.supplier_name || '—'}
          </div>
          <div className="text-[10px] text-slate-400">
            {item.supplier?.lead_time_days != null
              ? `${item.supplier.lead_time_days}d lead time`
              : '—'}
          </div>
        </div>
      ),
    },
    {
      header: 'Reorder Level',
      key: 'reorder_level',
      render: (item) => (
        <span className="text-xs font-medium text-slate-600">
          {item.inventory.reorder_level} units
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (item) => {
        const current = item.inventory.current_stock;
        const reorder = item.inventory.reorder_level;

        if (current <= reorder * 0.5) {
          return (
            <Badge variant="danger" size="sm">
              Stockout Risk
            </Badge>
          );
        }
        if (current <= reorder) {
          return (
            <Badge variant="warning" size="sm">
              Low Stock
            </Badge>
          );
        }
        if (current > reorder * 2.5) {
          return (
            <Badge variant="purple" size="sm">
              Overstocked
            </Badge>
          );
        }
        return (
          <Badge variant="success" size="sm">
            Optimal
          </Badge>
        );
      },
    },
    {
      header: '',
      key: 'actions',
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/products/${item.product_id}`);
          }}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title="View product details"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      keyField="product_id"
      pageSize={10}
      isLoading={isLoading}
      onRowClick={(item) => navigate(`/products/${item.product_id}`)}
      emptyTitle="No products found"
      emptyDescription="Try clearing your search or category filters to view full inventory."
    />
  );
}

export default ProductTable;
