import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Building2,
  Coins,
  Boxes,
  ArrowRightLeft,
  Settings,
  Store,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';

export function Sidebar({ isOpen, onClose, alertCount = 9, reorderCount = 7 }) {
  const location = useLocation();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      highlight: false,
    },
    {
      to: '/products',
      label: 'Products',
      icon: Package,
      highlight: false,
    },
    {
      to: '/forecast',
      label: 'Demand Forecast',
      icon: TrendingUp,
      highlight: false,
    },
    {
      to: '/recommendations',
      label: 'Reorder Recommendations',
      icon: ShoppingCart,
      badge: reorderCount,
      badgeVariant: 'warning',
    },
    {
      to: '/alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      badge: alertCount,
      badgeVariant: 'danger',
    },
    {
      to: '/suppliers',
      label: 'Suppliers',
      icon: Building2,
      highlight: false,
    },
    {
      to: '/working-capital',
      label: 'Working Capital',
      icon: Coins,
      highlight: false,
    },
    {
      to: '/bundles',
      label: 'Bundles',
      icon: Boxes,
      highlight: false,
    },
    {
      to: '/substitutions',
      label: 'Substitutions',
      icon: ArrowRightLeft,
      highlight: false,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-white block leading-tight">
                StockSense SME
              </span>
              <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
                Inventory Intelligence
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Priority Callout */}
        <div className="mx-3.5 my-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center gap-2 mb-1 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Action Required</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            3 critical stockouts in &lt;48h. Place recommended POs before 4 PM.
          </p>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-1.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to ||
              (item.to === '/dashboard' && location.pathname === '/') ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors select-none ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge ? (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-800 text-emerald-100'
                        : item.badgeVariant === 'danger'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Sidebar: Settings & Profile */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 space-y-2">
          <NavLink
            to="/settings"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Store Settings & Rules</span>
          </NavLink>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/80 border border-slate-800/90">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-semibold text-slate-200 shrink-0">
              AK
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">Arun Kumar</div>
              <div className="text-[10px] text-slate-400 truncate">Store Ops Director</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
