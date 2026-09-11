import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { PackageX } from 'lucide-react';

export function OverstockList({ products = [] }) {
  const navigate = useNavigate();

  return (
    <Card className="h-full">
      <CardHeader
        title="Top Overstock Products"
        subtitle="Idle capital locked in slow-moving inventory"
        action={
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate('/working-capital')}
          >
            View capital analysis &rarr;
          </Button>
        }
      />

      <div className="divide-y divide-slate-100">
        {products.slice(0, 4).map((item) => (
          <div
            key={item.product_id}
            className="py-3 flex items-center justify-between gap-3 text-xs"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  onClick={() => navigate(`/products/${item.product_id}`)}
                  className="font-semibold text-slate-900 hover:text-blue-600 hover:underline cursor-pointer truncate"
                >
                  {item.name}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{item.sku}</span>
              </div>
              <div className="text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                <span className="text-amber-800 font-medium">
                  {item.days_of_inventory} days supply
                </span>
                <span>•</span>
                <span>
                  Locked: <strong className="text-slate-900">{item.excess_value}</strong>
                </span>
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5 italic">
                {item.action}
              </div>
            </div>

            <div className="shrink-0">
              <Badge variant="warning" size="sm">
                Overstock
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default OverstockList;
