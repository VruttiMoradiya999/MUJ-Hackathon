import React from 'react';

export function AlertTabs({
  activeTab,
  onSelectTab,
  counts = { all: 0, stockout: 0, overstock: 0 },
}) {
  const tabs = [
    { id: 'All', label: 'All Alerts', count: counts.all },
    { id: 'Stockout', label: 'Stockout Risks', count: counts.stockout, variant: 'danger' },
    { id: 'Overstock', label: 'Overstock Items', count: counts.overstock, variant: 'warning' },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                isActive
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default AlertTabs;
