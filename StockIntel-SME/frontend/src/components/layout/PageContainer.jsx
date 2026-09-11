import React from 'react';

export function PageContainer({
  title,
  subtitle,
  action,
  badge,
  children,
  className = '',
}) {
  return (
    <div className={`space-y-6 pb-12 ${className}`}>
      {/* Page Header */}
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
        </div>
      )}

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}

export default PageContainer;
