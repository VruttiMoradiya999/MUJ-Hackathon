import React from 'react';
import { Card } from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { AlertTriangle, Clock, Coins, ShoppingCart, ArrowRight } from 'lucide-react';

export function AlertCard({ alert, onResolve, onAction }) {
  const isStockout = alert.type === 'STOCKOUT';
  const isHigh = alert.severity === 'HIGH';
  const isMedium = alert.severity === 'MEDIUM';

  const severityVariant = isHigh ? 'danger' : isMedium ? 'warning' : 'info';

  return (
    <Card
      className={`border transition-all ${
        isHigh
          ? 'border-red-200/90 bg-red-50/15 hover:border-red-300'
          : isMedium
          ? 'border-amber-200/90 bg-amber-50/15 hover:border-amber-300'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          {/* Top badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={severityVariant} size="sm">
              {alert.severity} SEVERITY
            </Badge>
            <Badge
              variant={isStockout ? 'danger' : 'warning'}
              size="sm"
            >
              {isStockout ? 'STOCKOUT RISK' : 'OVERSTOCK'}
            </Badge>
            <span className="text-xs text-slate-400 font-mono">ID: {alert.id}</span>
          </div>

          {/* Title & SKU */}
          <div>
            <h4 className="text-base font-bold text-slate-900">{alert.product_name}</h4>
            <div className="text-xs text-slate-500 mt-0.5">
              Category: <strong className="text-slate-700">{alert.category}</strong> • SKU:{' '}
              <span className="font-mono text-slate-600">{alert.sku}</span> • Current Stock:{' '}
              <strong className="text-slate-900">{alert.current_stock} units</strong>
            </div>
          </div>

          {/* Risk Prediction */}
          <div className="p-3 bg-white rounded-lg border border-slate-200/80 text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Diagnostic:</span>
            </div>
            <p className="leading-relaxed">{alert.risk_prediction}</p>
          </div>

          {/* Financial Impact & Recommended Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] text-slate-500 block">Financial Exposure</span>
              <span
                className={`font-bold text-sm ${
                  isStockout ? 'text-red-700' : 'text-amber-800'
                }`}
              >
                {alert.financial_impact}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/70">
              <span className="text-[11px] text-emerald-800 block">Prescribed Action</span>
              <strong className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                {alert.recommended_action}
              </strong>
            </div>
          </div>

          {alert.action_detail && (
            <p className="text-xs text-slate-600 italic">
              &rarr; {alert.action_detail}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex md:flex-col items-center gap-2 shrink-0 self-end md:self-start">
          <Button
            variant={isHigh ? 'danger' : 'primary'}
            size="sm"
            className="w-full"
            onClick={() => onAction(alert)}
          >
            {alert.recommended_action.includes('ORDER')
              ? 'Place Order'
              : alert.recommended_action.includes('BUNDLE')
              ? 'View Bundles'
              : 'Execute Action'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => onResolve(alert)}
          >
            Dismiss Alert
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default AlertCard;
