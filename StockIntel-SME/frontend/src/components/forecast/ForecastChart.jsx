import React from 'react';
import { Card, CardHeader } from '../ui/Card.jsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export function ForecastChart({ seriesData = [], productName, period = '7' }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isFuture = payload[0].payload.is_future;
      return (
        <div className="bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl border border-slate-700 space-y-1.5 min-w-[150px]">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1">
            <span className="font-semibold text-slate-200">{label}</span>
            {isFuture && (
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1 rounded border border-emerald-700">
                Predicted
              </span>
            )}
          </div>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-bold text-white">
                {entry.value !== null && entry.value !== undefined
                  ? `${entry.value} units`
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader
        title={`Forecast Model: ${productName}`}
        subtitle={`Historical actual consumption vs machine predicted demand over ${period} days`}
      />

      <div className="h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={seriesData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual Sales"
              stroke="#0f172a"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0f172a' }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              name="Predicted Demand"
              stroke="#10b981"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#10b981' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default ForecastChart;
