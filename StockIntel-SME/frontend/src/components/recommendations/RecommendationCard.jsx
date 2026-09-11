import React from 'react';
import { Card } from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { Clock, Truck, TrendingUp, AlertCircle, ShoppingCart } from 'lucide-react';

export function RecommendationCard({ item, onReview, onCreatePO }) {
  const isHigh = item.priority === 'HIGH';
  const isMedium = item.priority === 'MEDIUM';

  const badgeVariant = isHigh ? 'danger' : isMedium ? 'warning' : 'info';

  return (
    <Card className="flex flex-col justify-between border-slate-200 hover:border-slate-300 transition-shadow">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900">{item.product_name}</span>
              <Badge variant={badgeVariant} size="sm">
                {item.priority}
              </Badge>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {item.category} • SKU: <span className="font-mono">{item.sku}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Est. Cost</span>
            <span className="text-sm font-bold text-slate-900">
              {item.estimated_cost_formatted}
            </span>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 gap-2 my-3.5 text-xs bg-slate-50/60 p-3 rounded-lg border border-slate-100">
          <div>
            <span className="text-slate-500 block">Current Stock</span>
            <span className="font-bold text-slate-900 text-sm">
              {item.current_stock} units
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Expected Demand</span>
            <span className="font-bold text-slate-900 text-sm">
              {item.expected_demand} units
            </span>
          </div>
          <div className="mt-1">
            <span className="text-slate-500 block">Supplier Lead Time</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {item.lead_time_days} days
            </span>
          </div>
          <div className="mt-1">
            <span className="text-slate-500 block">Recommended Order</span>
            <span className="font-bold text-emerald-700 text-sm">
              {item.recommended_quantity} units
            </span>
          </div>
        </div>

        {/* Reasons */}
        <div className="space-y-1 mb-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Why order this now:
          </span>
          {item.reasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
              <span className="text-emerald-500 font-bold">•</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>

        {/* Order By alert */}
        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 flex items-center justify-between mb-4">
          <span className="font-medium">Order deadline:</span>
          <strong className="font-bold text-amber-950">{item.order_by}</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onReview(item)}
        >
          Review
        </Button>
        <Button
          variant={isHigh ? 'danger' : 'primary'}
          size="sm"
          className="flex-1"
          icon={ShoppingCart}
          onClick={() => onCreatePO(item)}
        >
          Create PO
        </Button>
      </div>
    </Card>
  );
}

export default RecommendationCard;
