import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { AlertCircle, ArrowRight, Clock, ShoppingCart } from 'lucide-react';

export function AttentionList({ items = [], onTakeAction }) {
  const navigate = useNavigate();

  return (
    <Card className="border-amber-200/90 bg-linear-to-b from-amber-50/20 to-white">
      <CardHeader
        title="What Needs Attention Today?"
        subtitle="Critical bottlenecks prioritized by immediate revenue loss & trapped cash"
        action={
          <Badge variant="warning" size="sm">
            {items.length} Priority Items
          </Badge>
        }
      />

      <div className="space-y-3 mt-1">
        {items.map((item) => {
          const isHigh = item.priority === 'HIGH';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                isHigh
                  ? 'bg-red-50/40 border-red-200/90 hover:border-red-300'
                  : 'bg-amber-50/30 border-amber-200/90 hover:border-amber-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={isHigh ? 'danger' : 'warning'} size="sm">
                      {item.priority} PRIORITY
                    </Badge>
                    <span
                      onClick={() => navigate(`/products/${item.product_id}`)}
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 hover:underline cursor-pointer"
                    >
                      {item.product_name}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">({item.sku})</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="font-semibold text-red-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.issue}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>
                      {item.metric_label}:{' '}
                      <strong className="text-slate-900">{item.metric_value}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-white/80 p-2 rounded-lg border border-slate-200/80 inline-block mt-1">
                    <strong className="text-slate-900 font-semibold">Recommended:</strong>{' '}
                    {item.recommended_action}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isHigh ? 'danger' : 'secondary'}
                    onClick={() => {
                      if (onTakeAction) {
                        onTakeAction(item);
                      } else {
                        navigate(isHigh ? '/recommendations' : '/working-capital');
                      }
                    }}
                  >
                    Take Action
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default AttentionList;
