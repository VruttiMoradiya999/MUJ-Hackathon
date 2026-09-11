import React from 'react';

export function Card({
  children,
  className = '',
  hoverEffect = false,
  padding = 'default',
  onClick,
  ...props
}) {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const selectedPadding = paddings[padding] || paddings.default;

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/80 rounded-xl shadow-xs transition-all ${
        hoverEffect ? 'hover:border-slate-300 hover:shadow-md cursor-pointer' : ''
      } ${selectedPadding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default Card;
