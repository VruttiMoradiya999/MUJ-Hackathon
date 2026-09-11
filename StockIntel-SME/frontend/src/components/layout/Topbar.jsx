import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Building,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';

export function Topbar({ onToggleSidebar, alertCount = 9 }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (globalQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(globalQuery.trim())}`);
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'Milk 1L stockout in 1.4 days',
      time: '10 mins ago',
      type: 'critical',
      link: '/recommendations',
    },
    {
      id: 2,
      title: 'Ghee Jar 1L dropped below buffer',
      time: '35 mins ago',
      type: 'critical',
      link: '/recommendations',
    },
    {
      id: 3,
      title: ' boAt Speaker has ₹2.2L locked capital',
      time: '2 hours ago',
      type: 'warning',
      link: '/working-capital',
    },
    {
      id: 4,
      title: 'Zenith Care Supplies delivery delayed (+1.4 days)',
      time: '4 hours ago',
      type: 'warning',
      link: '/suppliers',
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Store Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 hidden sm:flex items-center justify-center text-slate-700 font-semibold text-xs shrink-0">
            <Building className="w-4 h-4 text-slate-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 truncate">
                Apex Mart & Wholesale Distro
              </span>
              <span className="hidden md:inline-flex text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Store
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:block truncate">
              Bangalore Central Hub • GSTIN: 29AAACA1234A1Z5
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Quick Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalQuery}
            onChange={(e) => setGlobalQuery(e.target.value)}
            placeholder="Search inventory, SKU, category, brand (Press Enter)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
          />
        </form>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Inventory Alerts</span>
                    <Badge variant="danger" size="sm">
                      {alertCount} Active
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/alerts');
                    }}
                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate(n.link);
                      }}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition flex items-start gap-2.5"
                    >
                      {n.type === 'critical' ? (
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-800 line-clamp-1">{n.title}</p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {n.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/recommendations');
                    }}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                  >
                    Review Recommended Reorders &rarr;
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-medium text-xs flex items-center justify-center">
            AK
          </div>
          <div className="hidden xl:block text-left">
            <span className="text-xs font-semibold text-slate-800 block leading-tight">
              Arun Kumar
            </span>
            <span className="text-[10px] text-slate-500">Retail Partner</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
