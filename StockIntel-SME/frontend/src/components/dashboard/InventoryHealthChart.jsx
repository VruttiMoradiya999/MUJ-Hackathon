import React from 'react';
import { Card, CardHeader } from '../ui/Card.jsx';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export function InventoryHealthChart({ data = [] }) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg border border-slate-700">
          <div className="font-semibold">{item.name}</div>
          <div className="text-slate-300 mt-0.5">
            {item.value} SKUs ({((item.value / total) * 100).toFixed(1)}%)
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
          title="Inventory Health Breakdown"
          subtitle="Real-time stock classification across 1,480 active catalog SKUs"
        />

        <div className="h-48 w-full mt-2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-800">{total}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              SKUs Tracked
            </span>
          </div>
        </div>
      </div>

      {/* Legend and percentage list */}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3.5">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="min-w-0 flex-1 flex items-center justify-between">
              <span className="text-slate-600 truncate">{item.name}</span>
              <span className="font-semibold text-slate-900 ml-1">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default InventoryHealthChart;
