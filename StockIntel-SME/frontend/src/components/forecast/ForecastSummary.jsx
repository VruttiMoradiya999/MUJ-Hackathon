import React from 'react';
import { Card, CardHeader } from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import {
  TrendingUp,
  Activity,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  Layers,
} from 'lucide-react';

export function ForecastSummary({ forecastInfo, period, seriesData = [] }) {
  if (!forecastInfo) return null;

  const currentSummary = forecastInfo.summary?.[period] || {
    predicted_units: 0,
    estimated_revenue: '₹0',
    recommended_buffer: 0,
  };

  return (
    <div className="space-y-6">
      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card padding="sm" className="bg-slate-50/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Avg Daily Demand</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {forecastInfo.average_daily_demand}
            <span className="text-xs font-normal text-slate-500 ml-1">units/day</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Based on 30-day velocity</div>
        </Card>

        <Card padding="sm" className="bg-emerald-50/30 border-emerald-200/80">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 mb-1">
            <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
            <span>Next {period} Days Total</span>
          </div>
          <div className="text-xl font-bold text-emerald-900">
            {currentSummary.predicted_units}
            <span className="text-xs font-normal text-emerald-700 ml-1">units</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">
            Est. Rev: <strong>{currentSummary.estimated_revenue}</strong>
          </div>
        </Card>

        <Card padding="sm" className="bg-slate-50/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Forecast Confidence</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {forecastInfo.forecast_confidence}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Confidence interval 95%</div>
        </Card>

        <Card padding="sm" className="bg-slate-50/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            <span>Demand Trend</span>
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {forecastInfo.trend}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Short-term trajectory</div>
        </Card>

        <Card padding="sm" className="col-span-2 md:col-span-3 lg:col-span-1 bg-amber-50/30 border-amber-200/80">
          <div className="flex items-center gap-1.5 text-xs text-amber-900 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Safety Stock Buffer</span>
          </div>
          <div className="text-xl font-bold text-amber-900">
            +{currentSummary.recommended_buffer}
            <span className="text-xs font-normal text-amber-700 ml-1">units buffer</span>
          </div>
          <div className="text-[11px] text-amber-800 mt-1">To absorb demand spikes</div>
        </Card>
      </div>

      {/* Seasonality Banner */}
      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900">
        <Layers className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Seasonality & Pattern Insight:</strong>{' '}
          {forecastInfo.seasonality_detected}
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <Card>
        <CardHeader
          title={`Day-by-Day Forecast Schedule (${period} Days)`}
          subtitle="Direct comparison of actual recorded registers vs future run-rate prediction"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Actual Units</th>
                <th className="py-2.5 px-4">Predicted Units</th>
                <th className="py-2.5 px-4">Variance / Status</th>
                <th className="py-2.5 px-4">Action Implication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {seriesData.map((row, idx) => {
                const variance =
                  row.actual !== null && row.actual !== undefined
                    ? row.actual - row.predicted
                    : null;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/50 ${
                      row.is_future ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {row.date}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {row.actual !== null && row.actual !== undefined ? (
                        `${row.actual} units`
                      ) : (
                        <span className="text-slate-400 italic">Projected</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-emerald-700">
                      {row.predicted} units
                    </td>
                    <td className="py-2.5 px-4">
                      {variance !== null ? (
                        <span
                          className={`font-semibold ${
                            variance > 0
                              ? 'text-emerald-600'
                              : variance < 0
                              ? 'text-amber-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {variance > 0 ? `+${variance}` : variance} units
                        </span>
                      ) : (
                        <Badge variant="success" size="sm">
                          Model Forecast
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {row.is_future
                        ? 'Ensure stock available before opening'
                        : 'Recorded pos checkout'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default ForecastSummary;
