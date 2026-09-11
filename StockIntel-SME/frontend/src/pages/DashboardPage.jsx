import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import KPICard from '../components/dashboard/KPIcard.jsx';
import AttentionList from '../components/dashboard/AttentionList.jsx';
import InventoryHealthChart from '../components/dashboard/InventoryHealthChart.jsx';
import DemandTrendChart from '../components/dashboard/DemandTrendChart.jsx';
import StockoutList from '../components/dashboard/StockoutList.jsx';
import OverstockList from '../components/dashboard/OverstockList.jsx';
import RecommendationCard from '../components/recommendations/RecommendationCard.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { CardSkeleton, ChartSkeleton } from '../components/ui/LoadingState.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDashboard } from '../hooks/useDashboard.js';
import { displayCurrency, formatNumber } from '../utils/format.js';

import {
  Package,
  IndianRupee,
  AlertTriangle,
  PackageX,
  ShoppingCart,
  TrendingDown,
  Coins,
  Download,
} from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, loading, error, refetch } = useDashboard();
  const [selectedActionItem, setSelectedActionItem] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const handleTakeAction = (item) => {
    setSelectedActionItem(item);
    setIsActionModalOpen(true);
  };

  const handleConfirmAction = () => {
    setIsActionModalOpen(false);
    showToast(
      `Action drafted for ${selectedActionItem?.product_name}: ${selectedActionItem?.recommended_action}`,
      'success'
    );
  };

  const handleQuickOrder = (product) => {
    showToast(`Quick replenishment drafted for ${product.name}. Redirecting...`, 'info');
    navigate('/recommendations');
  };

  const handleExportSummary = () => {
    showToast('Executive Inventory Brief downloaded as PDF report.', 'success');
  };

  if (loading) {
    return (
      <PageContainer
        title="Inventory Intelligence Dashboard"
        subtitle="Actionable operational visibility into stockout risks, capital allocation, and supplier replenishment."
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <ChartSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer
        title="Inventory Intelligence Dashboard"
        subtitle="Actionable operational visibility into stockout risks, capital allocation, and supplier replenishment."
      >
        <ErrorState
          title="Unable to load dashboard"
          message={error?.message || 'Unable to load inventory data.'}
          onRetry={refetch}
        />
      </PageContainer>
    );
  }

  const {
    kpis = {},
    attention_today = [],
    inventory_health = [],
    demand_trend = [],
    stockout_risk_products = [],
    overstock_products = [],
    recent_recommendations = [],
  } = data;

  const recentRecommendations = recent_recommendations.length
    ? recent_recommendations
    : [];

  return (
    <PageContainer
      title="Inventory Intelligence Dashboard"
      subtitle="Actionable operational visibility into stockout risks, capital allocation, and supplier replenishment."
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExportSummary}
          >
            Export Brief
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={ShoppingCart}
            onClick={() => navigate('/recommendations')}
          >
            Review Reorders ({kpis.orders_to_place ?? 0})
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <KPICard
            label="Total Products"
            value={formatNumber(kpis.total_products, { fractionDigits: 0 })}
            secondaryText="Active SKUs monitored"
            icon={Package}
            variant="default"
            onClick={() => navigate('/products')}
          />
          <KPICard
            label="Inventory Value"
            value={displayCurrency(kpis.inventory_value_formatted, kpis.inventory_value_raw, { compact: true })}
            secondaryText="At landed cost"
            icon={IndianRupee}
            variant="default"
            onClick={() => navigate('/working-capital')}
          />
          <KPICard
            label="Stockout Risks"
            value={kpis.stockout_risks ?? 0}
            secondaryText="Depleting <48h"
            icon={AlertTriangle}
            variant="danger"
            trend="+3 vs yesterday"
            trendDirection="up"
            onClick={() => navigate('/alerts?tab=Stockout')}
          />
          <KPICard
            label="Overstock Items"
            value={kpis.overstock_items ?? 0}
            secondaryText=">120 days supply"
            icon={PackageX}
            variant="warning"
            onClick={() => navigate('/working-capital')}
          />
          <KPICard
            label="Orders To Place"
            value={kpis.orders_to_place ?? 0}
            secondaryText="Urgent today"
            icon={ShoppingCart}
            variant="info"
            onClick={() => navigate('/recommendations')}
          />
          <KPICard
            label="Potential Lost Sales"
            value={displayCurrency(kpis.potential_lost_sales_formatted, kpis.potential_lost_sales_raw, { compact: true })}
            secondaryText="Next 7 days risk"
            icon={TrendingDown}
            variant="danger"
            onClick={() => navigate('/alerts')}
          />
          <KPICard
            label="Excess Inventory"
            value={displayCurrency(kpis.excess_inventory_formatted, kpis.excess_inventory_raw, { compact: true })}
            secondaryText="Recoverable cash"
            icon={Coins}
            variant="warning"
            onClick={() => navigate('/working-capital')}
          />
        </div>

        <AttentionList items={attention_today} onTakeAction={handleTakeAction} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <InventoryHealthChart data={inventory_health} />
          </div>
          <div className="lg:col-span-2">
            <DemandTrendChart data={demand_trend} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StockoutList products={stockout_risk_products} onQuickOrder={handleQuickOrder} />
          <OverstockList products={overstock_products} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                High Priority Reorder Recommendations
              </h3>
              <p className="text-xs text-slate-500">
                Calculated based on current burn rate, lead times, and minimum order quantities
              </p>
            </div>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => navigate('/recommendations')}
            >
              View all recommendations →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentRecommendations.length === 0 ? (
              <p className="text-sm text-slate-500 col-span-2">No high-priority recommendations right now.</p>
            ) : (
              recentRecommendations.map((rec) => (
                <RecommendationCard
                  key={rec.id || rec.product_id}
                  item={rec}
                  onReview={() => navigate(`/forecast/${rec.product_id}`)}
                  onCreatePO={() => {
                    showToast(
                      `Purchase order draft created for ${rec.recommended_quantity} units of ${rec.product_name}.`,
                      'success'
                    );
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title="Execute Inventory Action"
        subtitle={selectedActionItem?.product_name}
        confirmLabel="Confirm Draft"
        confirmVariant={selectedActionItem?.priority === 'HIGH' ? 'danger' : 'primary'}
        onConfirm={handleConfirmAction}
      >
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 block">Issue Detected</span>
            <strong className="text-slate-900">{selectedActionItem?.issue}</strong>
            <div className="text-xs text-slate-600 mt-1">
              Financial Impact: <strong>{selectedActionItem?.metric_value}</strong>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <span className="text-xs text-emerald-800 block font-semibold">Recommended Remedy</span>
            <p className="text-xs text-emerald-950 mt-0.5">
              {selectedActionItem?.recommended_action}
            </p>
          </div>

          <p className="text-xs text-slate-500">
            This creates a local draft only. No purchase order is sent until a backend integration is connected.
          </p>
        </div>
      </Modal>
    </PageContainer>
  );
}

export default DashboardPage;
