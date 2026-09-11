import React from 'react';
import { Card, CardHeader } from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Clock, CheckCircle2, AlertTriangle, Phone, Mail, Sparkles } from 'lucide-react';

export function SupplierPerformance({ supplier, suppliersList = [] }) {
  if (!supplier) return null;

  // Lead time comparison chart data across all suppliers
  const chartData = suppliersList.map((s) => ({
    name: s.supplier_name.split(' ')[0], // short name
    fullName: s.supplier_name,
    quoted: s.quoted_lead_time_days,
    actual: s.actual_average_lead_time,
  }));

  const reliabilityVariant =
    supplier.reliability === 'HIGH'
      ? 'success'
      : supplier.reliability === 'MEDIUM'
      ? 'warning'
      : 'danger';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-xl border border-slate-700">
          <div className="font-semibold border-b border-slate-700 pb-1 mb-1">
            {item.fullName}
          </div>
          <div className="text-slate-300">Quoted Lead Time: {item.quoted} days</div>
          <div className="text-emerald-400 font-bold">
            Actual Average: {item.actual} days
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Selected Supplier Highlight Card */}
      <Card className="border-slate-300 bg-linear-to-br from-slate-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                {supplier.supplier_name}
              </h3>
              <Badge variant={reliabilityVariant} size="sm">
                {supplier.reliability} RELIABILITY
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>Contact: <strong>{supplier.contact_person}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {supplier.phone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                {supplier.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {supplier.categories_supplied.map((cat) => (
              <span
                key={cat}
                className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-1 rounded border border-slate-200"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* 5 KPI metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 text-xs">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Quoted SLA</span>
            <strong className="text-base font-bold text-slate-900">
              {supplier.quoted_lead_time_days} days
            </strong>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Actual Average</span>
            <strong className="text-base font-bold text-amber-700">
              {supplier.actual_average_lead_time} days
            </strong>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-500 block">On-Time Rate</span>
            <strong className="text-base font-bold text-emerald-700">
              {supplier.on_time_rate}%
            </strong>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Late Deliveries</span>
            <strong className="text-base font-bold text-red-600">
              {supplier.late_deliveries} of {supplier.total_orders}
            </strong>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-slate-500 block">Max Recorded Delay</span>
            <strong className="text-base font-bold text-slate-900">
              +{supplier.max_delay_days} days
            </strong>
          </div>
        </div>

        {/* Actionable recommendation */}
        <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">AI System Safety Stock Recommendation:</strong>{' '}
            {supplier.recommendation}
          </div>
        </div>
      </Card>

      {/* Quoted vs Actual Lead Time Comparative Chart */}
      <Card>
        <CardHeader
          title="Quoted vs Actual Lead Time Across Suppliers"
          subtitle="Identifies vendors consistently missing standard fulfillment timelines (days)"
        />

        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
              />
              <Bar dataKey="quoted" name="Quoted Lead Time (days)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual Avg Lead Time (days)" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default SupplierPerformance;
