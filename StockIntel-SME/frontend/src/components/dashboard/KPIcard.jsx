import React from 'react';
import { Card } from '../ui/Card.jsx';
import { TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';

export function KPICard({
  label,
  value,
  secondaryText,
  icon: Icon,
  variant = 'default', // 'default' | 'danger' | 'warning' | 'success' | 'info'
  trend,
  trendDirection = 'up',
  onClick,
}) {
  const variantStyles = {
    default: {
      border: 'border-slate-200/80',
      iconBg: 'bg-slate-100 text-slate-700',
      valueColor: 'text-slate-900',
    },
    danger: {
      border: 'border-red-200/80 bg-red-50/20',
      iconBg: 'bg-red-100 text-red-700',
      valueColor: 'text-red-700',
    },
    warning: {
      border: 'border-amber-200/80 bg-amber-50/20',
      iconBg: 'bg-amber-100 text-amber-700',
      valueColor: 'text-amber-800',
    },
    success: {
      border: 'border-emerald-200/80 bg-emerald-50/20',
      iconBg: 'bg-emerald-100 text-emerald-700',
      valueColor: 'text-emerald-700',
    },
    info: {
      border: 'border-blue-200/80 bg-blue-50/20',
      iconBg: 'bg-blue-100 text-blue-700',
      valueColor: 'text-blue-700',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <Card
      padding="sm"
      className={`${style.border} transition-all ${
        onClick ? 'hover:shadow-md cursor-pointer hover:border-slate-300' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 line-clamp-1">{label}</span>
        {Icon && (
          <div className={`p-1.5 rounded-lg ${style.iconBg} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <div className={`text-xl sm:text-2xl font-bold tracking-tight ${style.valueColor}`}>
          {value}
        </div>

        {(secondaryText || trend) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {trend && (
              <span
                className={`font-semibold inline-flex items-center gap-0.5 ${
                  trendDirection === 'up'
                    ? variant === 'danger'
                      ? 'text-red-600'
                      : 'text-emerald-600'
                    : 'text-slate-500'
                }`}
              >
                {trendDirection === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend}
              </span>
            )}
            {secondaryText && (
              <span className="text-slate-500 font-normal truncate">{secondaryText}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default KPICard;
