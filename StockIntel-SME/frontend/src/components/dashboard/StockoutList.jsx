import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { AlertCircle, ShoppingCart } from 'lucide-react';

export function StockoutList({ products = [], onQuickOrder }) {
  const navigate = useNavigate();

  return (
    <Card className="h-full">
      <CardHeader
        title="Stockout Risk Products"
        subtitle="SKUs predicted to deplete before next supplier batch arrives"
        action={
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate('/alerts?tab=Stockout')}
          >
            View all &rarr;
          </Button>
        }
      />

      <div className="divide-y divide-slate-100">
        {products.slice(0, 5).map((item) => (
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
              <div className="text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Stock: <strong>{item.current_stock}</strong></span>
                <span>•</span>
                <span className="text-red-600 font-medium">{item.days_left} days left</span>
                <span>•</span>
                <span className="text-slate-600">{item.impact}</span>
              </div>
            </div>

            <div className="shrink-0">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => (onQuickOrder ? onQuickOrder(item) : navigate('/recommendations'))}
              >
                {item.action}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default StockoutList;
