import React from 'react';
import DataTable from '../ui/DataTable.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { Building2, Phone, Mail } from 'lucide-react';

export function SupplierTable({ suppliers = [], onSelectSupplier }) {
  const columns = [
    {
      header: 'Supplier Partner',
      key: 'supplier_name',
      sortKey: 'supplier_name',
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
            {item.supplier_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{item.supplier_name}</div>
            <div className="text-[11px] text-slate-400 font-mono">
              {item.supplier_id} • {item.contact_person}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Quoted Lead Time',
      key: 'quoted_lead_time_days',
      sortKey: 'quoted_lead_time_days',
      render: (item) => (
        <span className="text-xs text-slate-700">{item.quoted_lead_time_days} days</span>
      ),
    },
    {
      header: 'Actual Average',
      key: 'actual_average_lead_time',
      sortKey: 'actual_average_lead_time',
      render: (item) => {
        const isLate = item.actual_average_lead_time > item.quoted_lead_time_days;
        return (
          <span
            className={`text-xs font-semibold ${
              isLate ? 'text-amber-700' : 'text-slate-900'
            }`}
          >
            {item.actual_average_lead_time} days
          </span>
        );
      },
    },
    {
      header: 'Max Delay',
      key: 'max_delay_days',
      sortKey: 'max_delay_days',
      render: (item) => (
        <span className="text-xs text-slate-600">+{item.max_delay_days} days</span>
      ),
    },
    {
      header: 'Total Orders',
      key: 'total_orders',
      sortKey: 'total_orders',
      render: (item) => (
        <span className="text-xs text-slate-700 font-medium">
          {item.total_orders} completed
        </span>
      ),
    },
    {
      header: 'On-Time Rate',
      key: 'on_time_rate',
      sortKey: 'on_time_rate',
      render: (item) => {
        const rate = item.on_time_rate;
        const color =
          rate >= 90
            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
            : rate >= 75
            ? 'text-amber-700 bg-amber-50 border-amber-200'
            : 'text-red-700 bg-red-50 border-red-200';
        return (
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${color}`}>
            {rate}%
          </span>
        );
      },
    },
    {
      header: 'Reliability',
      key: 'reliability',
      sortKey: 'reliability',
      render: (item) => {
        const variant =
          item.reliability === 'HIGH'
            ? 'success'
            : item.reliability === 'MEDIUM'
            ? 'warning'
            : 'danger';
        return (
          <Badge variant={variant} size="sm">
            {item.reliability}
          </Badge>
        );
      },
    },
    {
      header: '',
      key: 'actions',
      render: (item) => (
        <Button
          variant="secondary"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            onSelectSupplier(item);
          }}
        >
          View Trends
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={suppliers}
      keyField="supplier_id"
      pageSize={10}
      onRowClick={(item) => onSelectSupplier(item)}
      emptyTitle="No suppliers found"
    />
  );
}

export default SupplierTable;
