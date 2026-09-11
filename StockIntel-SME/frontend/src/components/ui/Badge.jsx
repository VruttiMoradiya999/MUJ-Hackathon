import React from 'react';

export function Badge({ children, variant = 'neutral', size = 'md', className = '' }) {
  const variants = {
    danger: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-600/10',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-600/10',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/10',
    info: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-600/10',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-600/10',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-600/10',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-md',
    lg: 'text-sm px-3 py-1.5 font-semibold rounded-lg',
  };

  const selectedVariant = variants[variant] || variants.neutral;
  const selectedSize = sizes[size] || sizes.md;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border leading-none whitespace-nowrap ${selectedVariant} ${selectedSize} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
