import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Save, Store, Bell, Sliders, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function SettingsPage() {
  const { showToast } = useToast();

  const [storeName, setStoreName] = useState('Apex Mart & Wholesale Distro');
  const [hubAddress, setHubAddress] = useState('102, 100ft Road, Indiranagar, Bangalore - 560038');
  const [gstin, setGstin] = useState('29AAACA1234A1Z5');
  const [safetyBufferPercent, setSafetyBufferPercent] = useState('20');
  const [stockoutDaysThreshold, setStockoutDaysThreshold] = useState('2.0');
  const [overstockDaysThreshold, setOverstockDaysThreshold] = useState('90');

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Store rules and intelligence thresholds updated successfully!', 'success');
  };

  return (
    <PageContainer
      title="Store Configuration & Intelligence Rules"
      subtitle="Calibrate algorithm parameters, replenishment safety margins, and alert sensitivity thresholds."
      action={
        <Button variant="primary" size="sm" icon={Save} onClick={handleSave}>
          Save Changes
        </Button>
      }
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile */}
        <Card>
          <CardHeader
            title="Retail Enterprise Profile"
            subtitle="Identification details used on generated purchase orders and vendor scorecards"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Store / Hub Trading Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                GSTIN / Tax Registration
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Warehouse Dispatch & Inwarding Address
              </label>
              <input
                type="text"
                value={hubAddress}
                onChange={(e) => setHubAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Intelligence Algorithm Parameters */}
        <Card>
          <CardHeader
            title="Replenishment & Capital Rules"
            subtitle="Determine how aggressively the system flags reorder deadlines and capital blockages"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <label className="block font-semibold text-slate-900">
                Safety Stock Buffer (%)
              </label>
              <p className="text-[11px] text-slate-500">
                Extra units added over forecasted lead-time consumption to prevent stockout spikes.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  value={safetyBufferPercent}
                  onChange={(e) => setSafetyBufferPercent(e.target.value)}
                  className="w-20 px-2 py-1.5 border border-slate-300 rounded bg-white font-bold text-slate-900 text-xs"
                />
                <span className="text-slate-600 font-semibold">% buffer</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <label className="block font-semibold text-slate-900">
                Critical Stockout Threshold
              </label>
              <p className="text-[11px] text-slate-500">
                Raise HIGH priority emergency banner when days of inventory drop below this level.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  step="0.5"
                  value={stockoutDaysThreshold}
                  onChange={(e) => setStockoutDaysThreshold(e.target.value)}
                  className="w-20 px-2 py-1.5 border border-slate-300 rounded bg-white font-bold text-slate-900 text-xs"
                />
                <span className="text-slate-600 font-semibold">days supply</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <label className="block font-semibold text-slate-900">
                Overstock Benchmark
              </label>
              <p className="text-[11px] text-slate-500">
                Flag SKUs as idle cash traps when days of supply exceed this turnover limit.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  value={overstockDaysThreshold}
                  onChange={(e) => setOverstockDaysThreshold(e.target.value)}
                  className="w-20 px-2 py-1.5 border border-slate-300 rounded bg-white font-bold text-slate-900 text-xs"
                />
                <span className="text-slate-600 font-semibold">days supply</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Operational Notifications */}
        <Card>
          <CardHeader
            title="Alert Notifications"
            subtitle="Configure delivery channels for daily morning inventory digest"
          />

          <div className="space-y-3 mt-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
              />
              <div>
                <span className="font-semibold text-slate-900 block">
                  Daily 08:30 AM Stockout Brief
                </span>
                <span className="text-slate-500">
                  Notify store director of all SKUs scheduled to deplete within 48 hours.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
              />
              <div>
                <span className="font-semibold text-slate-900 block">
                  Supplier SLA Delay Warnings
                </span>
                <span className="text-slate-500">
                  Notify when a vendor’s delivery history slips below 80% on-time benchmark.
                </span>
              </div>
            </label>
          </div>
        </Card>
      </form>
    </PageContainer>
  );
}

export default SettingsPage;
