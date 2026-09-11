import React from 'react';
import { Card, CardHeader } from '../ui/Card.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function InventoryBreakdown({ breakdown = [], summary = {} }) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-xl border border-slate-700">
          <div className="font-semibold">{item.name}</div>
          <div className="text-slate-300 mt-0.5">
            {item.formatted} ({item.percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <CardHeader
          title="Capital Allocation by Velocity"
          subtitle="How working capital is distributed across inventory velocity tiers"
        />

        <div className="h-52 w-full mt-2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdown}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={84}
                paddingAngle={3}
                dataKey="value"
              >
                {breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-900">
              {summary.total_inventory_value_formatted || '₹42.5L'}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Total Tied Capital
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-3.5 mt-2">
        {breakdown.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="min-w-0 flex-1 flex items-center justify-between">
              <span className="text-slate-600 truncate">{item.name}</span>
              <strong className="text-slate-900 ml-1">{item.formatted}</strong>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default InventoryBreakdown;
