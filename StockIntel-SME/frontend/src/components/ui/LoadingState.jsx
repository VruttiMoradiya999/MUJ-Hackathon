import React from 'react';

/**
 * Lightweight skeleton placeholders for loading states.
 */
export function LoadingState({ rows = 4, className = '' }) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-200 rounded w-2/3" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 animate-pulse ${className}`}>
      <div className="h-3 bg-slate-200 rounded w-1/3 mb-4" />
      <div className="h-8 bg-slate-100 rounded w-1/2 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
  );
}

export function ChartSkeleton({ className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 animate-pulse ${className}`}>
      <div className="h-3 bg-slate-200 rounded w-1/4 mb-6" />
      <div className="h-48 bg-slate-100 rounded" />
    </div>
  );
}

export default LoadingState;
