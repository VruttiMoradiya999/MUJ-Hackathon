import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import InventoryBreakdown from '../components/workingCapital/InventoryBreakdown.jsx';
import CashOpportunity from '../components/workingCapital/CashOpportunity.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';

import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import { useWorkingCapital } from '../hooks/useWorkingCapital.js';
import {
  Coins,
  IndianRupee,
  TrendingUp,
  Clock,
  Download,
  Boxes,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function WorkingCapitalPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, loading, error, refetch } = useWorkingCapital();

  const {
    summary = {},
    breakdown = [],
    breakdown_by_velocity = [],
    top_cash_traps = [],
    inventory_table = [],
    products_working_capital = [],
    cash_stuck_top_products = [],
  } = data || {};
  const velocityBreakdown = breakdown_by_velocity.length ? breakdown_by_velocity : breakdown;
  const cashTraps = top_cash_traps.length ? top_cash_traps : cash_stuck_top_products;
  const inventoryRows = inventory_table.length ? inventory_table : products_working_capital;

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);

  const handleOpenStrategy = (item) => {
    setSelectedProduct(item);
    setIsStrategyModalOpen(true);
  };

  const handleConfirmDiscount = () => {
    setIsStrategyModalOpen(false);
    showToast(
      `Liquidation discount promo scheduled for ${selectedProduct?.name}.`,
      'success'
    );
  };

  const tableColumns = [
    {
      header: 'Product',
      key: 'name',
      sortKey: 'name',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.name}</div>
          <div className="text-[11px] text-slate-400">
            {item.category} • <span className="font-mono">{item.sku}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Inventory Value',
      key: 'inventory_value',
      sortKey: 'inventory_value',
      render: (item) => (
        <span className="font-bold text-xs text-slate-900">
          {item.inventory_value_formatted}
        </span>
      ),
    },
    {
      header: 'Stock Type',
      key: 'stock_type',
      sortKey: 'stock_type',
      render: (item) => {
        const variants = {
          'Excess Stock': 'warning',
          'Slow Moving': 'purple',
          'Fast Moving': 'success',
          'At Risk': 'danger',
        };
        return (
          <Badge variant={variants[item.stock_type] || 'neutral'} size="sm">
            {item.stock_type}
          </Badge>
        );
      },
    },
    {
      header: 'Excess Value',
      key: 'excess_value',
      sortKey: 'excess_value',
      render: (item) => (
        <span
          className={`font-semibold text-xs ${
            item.excess_value > 0 ? 'text-amber-800' : 'text-slate-400'
          }`}
        >
          {item.excess_value_formatted}
        </span>
      ),
    },
    {
      header: 'Days of Inventory',
      key: 'days_of_inventory',
      sortKey: 'days_of_inventory',
      render: (item) => {
        const isHigh = item.days_of_inventory > 90;
        return (
          <span
            className={`text-xs font-semibold ${
              isHigh ? 'text-amber-700' : 'text-slate-700'
            }`}
          >
            {item.days_of_inventory} days
          </span>
        );
      },
    },
    {
      header: 'Turnover Rate',
      key: 'turnover_rate',
      sortKey: 'turnover_rate',
      render: (item) => (
        <span className="text-xs text-slate-600 font-medium">
          {item.turnover_rate}
        </span>
      ),
    },
    {
      header: 'Action',
      key: 'action',
      render: (item) => (
        <Button
          variant="secondary"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenStrategy(item);
          }}
        >
          Cash Action
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <PageContainer title="Working Capital" subtitle="Loading…">
        <LoadingState rows={5} />
      </PageContainer>
    );
  }
  if (error || !data) {
    return (
      <PageContainer title="Working Capital" subtitle="Capital locked in inventory">
        <ErrorState title="Unable to load working capital data" message={error?.message} onRetry={refetch} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Working Capital & Inventory Liquidity"
      subtitle="Analyze cash trapped in slow-moving stock, unlock trapped liquidity, and balance SKU turnover velocity."
      action={
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={() => showToast('Working Capital summary report exported.', 'success')}
        >
          Export Balance
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Top 4 Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-xs text-slate-500 block">Total Inventory Value</span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {summary.total_inventory_value_formatted || summary.total_inventory_value || '—'}
            </div>
            <span className="text-[11px] text-slate-400">At landed purchase cost</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/90">
            <span className="text-xs text-amber-800 font-semibold block">
              Potentially Recoverable Cash
            </span>
            <div className="text-2xl font-bold text-amber-900 mt-0.5">
              {summary.recoverable_cash_formatted || summary.potentially_recoverable_cash_formatted || '—'}
            </div>
            <span className="text-[11px] text-amber-800 font-medium">
              Stuck in &gt;90-day inventory supplies
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Average Days of Inventory (DSI)</span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {summary.cash_conversion_cycle_days ?? summary.average_days_of_inventory ?? '—'} Days
            </div>
            <span className="text-[11px] text-slate-400">Target benchmark: &lt;45 days</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
            <span className="text-xs text-emerald-800 font-semibold block">
              Annual Inventory Turns
            </span>
            <div className="text-2xl font-bold text-emerald-900 mt-0.5">
              {summary.average_inventory_turnover ?? summary.inventory_turnover_ratio ?? '—'}
            </div>
            <span className="text-[11px] text-emerald-700">Healthy retail benchmark</span>
          </div>
        </div>

        {/* Chart & Top Cash Traps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <InventoryBreakdown
              breakdown={velocityBreakdown}
              summary={summary}
            />
          </div>
          <div className="lg:col-span-2">
            <CashOpportunity
              topProducts={cashTraps}
              onLiquidateAction={handleOpenStrategy}
            />
          </div>
        </div>

        {/* Working Capital Ledger Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Complete Working Capital Allocation Ledger
            </h3>
            <span className="text-xs text-slate-500">
              Ranked by total capital exposure
            </span>
          </div>

          <DataTable
            columns={tableColumns}
            data={inventoryRows}
            keyField="product_id"
            pageSize={10}
            onRowClick={(item) => navigate(`/products/${item.product_id}`)}
          />
        </div>
      </div>

      {/* Cash Release Strategy Modal */}
      {selectedProduct && (
        <Modal
          isOpen={isStrategyModalOpen}
          onClose={() => setIsStrategyModalOpen(false)}
          title={`Liquidity Release Strategy: ${selectedProduct.name}`}
          subtitle={`SKU: ${selectedProduct.sku}`}
          confirmLabel="Execute Recommended Action"
          onConfirm={handleConfirmDiscount}
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Current Tied Capital:</span>
                <strong className="text-slate-900">
                  {selectedProduct.inventory_value_formatted}
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Excess Trapped Capital:</span>
                <strong className="text-amber-800">
                  {selectedProduct.excess_value_formatted || selectedProduct.excess_value}
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Inventory Cover:</span>
                <strong className="text-slate-900">
                  {selectedProduct.days_of_inventory} days
                </strong>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950">
              <strong className="block mb-1 font-semibold">Recommended Liquidity Actions:</strong>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>
                  Bundle with fast-moving companion item at 10-15% margin discount.
                </li>
                <li>
                  Place supplier PO freeze for the next 45 days until stock drops below 40 units.
                </li>
                <li>
                  Feature on front-aisle promotional shelf to accelerate register clearance.
                </li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}

export default WorkingCapitalPage;
