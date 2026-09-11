import React from 'react';
import DataTable from '../ui/DataTable.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { Clock, ShoppingCart, Eye } from 'lucide-react';

export function RecommendationTable({
  recommendations = [],
  onReview,
  onCreatePO,
}) {
  const columns = [
    {
      header: 'Product',
      key: 'product_name',
      sortKey: 'product_name',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.product_name}</div>
          <div className="text-[11px] text-slate-400">
            {item.category} • <span className="font-mono">{item.sku}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Current Stock',
      key: 'current_stock',
      sortKey: 'current_stock',
      render: (item) => (
        <span className="font-semibold text-xs text-slate-900">
          {item.current_stock} units
        </span>
      ),
    },
    {
      header: 'Expected Demand',
      key: 'expected_demand',
      sortKey: 'expected_demand',
      render: (item) => (
        <span className="text-xs text-slate-700">{item.expected_demand} units</span>
      ),
    },
    {
      header: 'Lead Time',
      key: 'lead_time_days',
      sortKey: 'lead_time_days',
      render: (item) => (
        <span className="text-xs text-slate-700 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {item.lead_time_days} days
        </span>
      ),
    },
    {
      header: 'Recommended Qty',
      key: 'recommended_quantity',
      sortKey: 'recommended_quantity',
      render: (item) => (
        <span className="font-bold text-xs text-emerald-700">
          {item.recommended_quantity} units
        </span>
      ),
    },
    {
      header: 'Order By',
      key: 'order_by',
      render: (item) => (
        <span className="text-xs font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          {item.order_by}
        </span>
      ),
    },
    {
      header: 'Estimated Cost',
      key: 'estimated_cost',
      sortKey: 'estimated_cost',
      render: (item) => (
        <span className="font-bold text-xs text-slate-900">
          {item.estimated_cost_formatted}
        </span>
      ),
    },
    {
      header: 'Priority',
      key: 'priority',
      sortKey: 'priority',
      render: (item) => {
        const variant =
          item.priority === 'HIGH'
            ? 'danger'
            : item.priority === 'MEDIUM'
            ? 'warning'
            : 'info';
        return (
          <Badge variant={variant} size="sm">
            {item.priority}
          </Badge>
        );
      },
    },
    {
      header: 'Action',
      key: 'actions',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onReview(item);
            }}
          >
            Review
          </Button>
          <Button
            variant={item.priority === 'HIGH' ? 'danger' : 'primary'}
            size="xs"
            icon={ShoppingCart}
            onClick={(e) => {
              e.stopPropagation();
              onCreatePO(item);
            }}
          >
            Create PO
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={recommendations}
      keyField="id"
      pageSize={10}
      emptyTitle="No pending recommendations"
      emptyDescription="All inventory items are currently within safe buffer thresholds."
    />
  );
}

export default RecommendationTable;
