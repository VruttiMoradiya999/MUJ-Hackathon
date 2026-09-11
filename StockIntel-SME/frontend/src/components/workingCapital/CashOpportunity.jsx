import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { Coins, AlertCircle, ArrowUpRight, TrendingDown } from 'lucide-react';

export function CashOpportunity({ topProducts = [], onLiquidateAction }) {
  const navigate = useNavigate();

  return (
    <Card className="border-amber-200/90 bg-linear-to-b from-amber-50/20 to-white">
      <CardHeader
        title="Where Is Your Cash Stuck?"
        subtitle="Top products tying up surplus working capital beyond 60-day turnover benchmarks"
        action={
          <Badge variant="warning" size="md">
            Recoverable cash opportunity
          </Badge>
        }
      />

      <div className="space-y-3.5 mt-2">
        {topProducts.map((item, idx) => (
          <div
            key={item.product_id}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                  <span
                    onClick={() => navigate(`/products/${item.product_id}`)}
                    className="font-bold text-sm text-slate-900 hover:text-blue-600 hover:underline cursor-pointer"
                  >
                    {item.name}
                  </span>
                  <Badge variant="warning" size="sm">
                    {item.days_of_inventory} days supply
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>
                    Total Asset Value:{' '}
                    <strong className="text-slate-900">{item.inventory_value_formatted}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Excess Stuck Cash:{' '}
                    <strong className="text-amber-800 font-bold">
                      {item.excess_value_formatted}
                    </strong>
                  </span>
                  <span>•</span>
                  <span className="text-slate-500">Annual Turn: {item.turnover_rate}</span>
                </div>

                <p className="text-xs text-slate-700 bg-amber-50/70 border border-amber-100 p-2 rounded-lg mt-1">
                  <strong className="text-amber-950 font-semibold">Cash Release Strategy:</strong>{' '}
                  {item.action_recommendation}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/bundles/${item.product_id}`)}
                >
                  Create Bundle
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onLiquidateAction(item)}
                >
                  Review Strategy
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default CashOpportunity;
