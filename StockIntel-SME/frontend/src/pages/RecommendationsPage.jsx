import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import RecommendationCard from '../components/recommendations/RecommendationCard.jsx';
import RecommendationTable from '../components/recommendations/RecommendationTable.jsx';
import SearchInput from '../components/ui/SearchInput.jsx';
import Select from '../components/ui/Select.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';

import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import { useRecommendations } from '../hooks/useRecommendations.js';
import {
  LayoutGrid,
  List,
  ShoppingCart,
  Download,
  AlertTriangle,
  Clock,
  Coins,
  CheckCircle2,
} from 'lucide-react';

export function RecommendationsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, loading, error, refetch } = useRecommendations();
  const recommendations = data?.recommendations || [];

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals state
  const [reviewItem, setReviewItem] = useState(null);
  const [orderItem, setOrderItem] = useState(null);
  const [orderQty, setOrderQty] = useState(100);

  const categories = useMemo(() => {
    const set = new Set(
      recommendations.map((r) => r.category)
    );
    return Array.from(set);
  }, [recommendations]);

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'HIGH', label: 'High Priority (Urgent)' },
    { value: 'MEDIUM', label: 'Medium Priority' },
    { value: 'LOW', label: 'Low Priority' },
  ];

  const filteredItems = useMemo(() => {
    return recommendations.filter((item) => {
      const supplierName = item.supplier_name || item.supplier?.supplier_name || '';
      const matchesSearch =
        searchQuery.trim() === '' ||
        (item.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplierName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority =
        !selectedPriority || item.priority === selectedPriority;

      const matchesCategory =
        !selectedCategory || item.category === selectedCategory;

      return matchesSearch && matchesPriority && matchesCategory;
    });
  }, [recommendations, searchQuery, selectedPriority, selectedCategory]);

  const totalCost = useMemo(() => {
    return filteredItems.reduce((acc, r) => acc + r.estimated_cost, 0);
  }, [filteredItems]);

  const highPriorityCount = useMemo(() => {
    return filteredItems.filter((r) => r.priority === 'HIGH').length;
  }, [filteredItems]);

  const handleReview = (item) => {
    setReviewItem(item);
  };

  const handleOpenPO = (item) => {
    setOrderItem(item);
    setOrderQty(item.recommended_quantity);
  };

  const handleConfirmPO = () => {
    const item = orderItem;
    setOrderItem(null);
    showToast(
      `Purchase order draft created for ${orderQty} units of ${item.product_name} (${item.supplier_name || 'supplier'}).`,
      'success'
    );
  };

  const handleOrderAllHigh = () => {
    showToast(
      `Bulk PO drafted for all ${highPriorityCount} HIGH priority replenishment lines.`,
      'success'
    );
  };

  if (loading) {
    return (
      <PageContainer title="Reorder Recommendations" subtitle="Loading…">
        <LoadingState rows={6} />
      </PageContainer>
    );
  }
  if (error) {
    return (
      <PageContainer title="Reorder Recommendations" subtitle="Smart replenishment suggestions">
        <ErrorState title="Unable to load recommendations" message={error?.message} onRetry={refetch} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Reorder Recommendations"
      subtitle="Data-driven purchase orders to prevent stockouts while optimizing working capital and supplier lead times."
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => showToast('Replenishment schedule exported.', 'success')}
          >
            Export Schedule
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={ShoppingCart}
            onClick={handleOrderAllHigh}
          >
            Batch Order High Priority ({highPriorityCount})
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-red-800 uppercase tracking-wider block">
                Critical Stockout Reorders
              </span>
              <div className="text-2xl font-bold text-red-700 mt-0.5">
                {highPriorityCount} Items
              </div>
              <span className="text-[11px] text-red-600">Must place PO before 4 PM today</span>
            </div>
            <div className="p-2.5 rounded-lg bg-red-100 text-red-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Recommended Orders
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-0.5">
                {filteredItems.length} SKUs
              </div>
              <span className="text-[11px] text-slate-500">Across 6 verified vendors</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-200/70 text-slate-700">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                Total Estimated Capital Needed
              </span>
              <div className="text-2xl font-bold text-emerald-900 mt-0.5">
                ₹{totalCost.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-700">Net replenishment outlay</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Coins className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex-1 max-w-sm">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search product, SKU, supplier..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Select
              value={selectedPriority}
              onChange={setSelectedPriority}
              options={priorityOptions}
              className="w-40 sm:w-48"
            />
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              className="w-40 sm:w-44"
            />

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* View Layout */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((rec) => (
              <RecommendationCard
                key={rec.id}
                item={rec}
                onReview={handleReview}
                onCreatePO={handleOpenPO}
              />
            ))}
          </div>
        ) : (
          <RecommendationTable
            recommendations={filteredItems}
            onReview={handleReview}
            onCreatePO={handleOpenPO}
          />
        )}
      </div>

      {/* Review Explanation Modal */}
      {reviewItem && (
        <Modal
          isOpen={Boolean(reviewItem)}
          onClose={() => setReviewItem(null)}
          title={`Order Rationale: ${reviewItem.product_name}`}
          subtitle={`SKU: ${reviewItem.sku} • Supplier: ${reviewItem.supplier.supplier_name}`}
          confirmLabel="Create PO Now"
          onConfirm={() => {
            const item = reviewItem;
            setReviewItem(null);
            handleOpenPO(item);
          }}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Current On-Hand Stock:</span>
                <strong className="text-slate-900">{reviewItem.current_stock} units</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Next 7 Days Projected Demand:</span>
                <strong className="text-slate-900">{reviewItem.expected_demand} units</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Supplier Lead Time:</span>
                <strong className="text-slate-900">{reviewItem.lead_time_days} days</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Minimum Order Quantity (MOQ):</span>
                <strong className="text-slate-900">
                  {reviewItem.supplier.minimum_order_quantity} units
                </strong>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-1">
                Root Cause Analysis:
              </span>
              <div className="space-y-1.5">
                {reviewItem.reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-950">
              <strong className="block mb-0.5">Order Deadline Risk:</strong>
              Order must be transmitted to {reviewItem.supplier.supplier_name} by{' '}
              <strong>{reviewItem.order_by}</strong> to prevent zero-stock shelf outage.
            </div>
          </div>
        </Modal>
      )}

      {/* PO Creation Dialog */}
      {orderItem && (
        <Modal
          isOpen={Boolean(orderItem)}
          onClose={() => setOrderItem(null)}
          title="Draft Purchase Order"
          subtitle={orderItem.product_name}
          confirmLabel="Submit PO to Supplier"
          confirmVariant={orderItem.priority === 'HIGH' ? 'danger' : 'primary'}
          onConfirm={handleConfirmPO}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-800">
                  {orderItem.supplier.supplier_name}
                </span>
                <Badge variant="neutral" size="sm">
                  Lead Time: {orderItem.lead_time_days}d
                </Badge>
              </div>
              <span className="text-slate-500">Contact: {orderItem.supplier.contact_phone}</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Order Quantity (Units)
              </label>
              <input
                type="number"
                min={orderItem.supplier.minimum_order_quantity}
                value={orderQty}
                onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                MOQ requirement is {orderItem.supplier.minimum_order_quantity} units.
              </span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-emerald-950">
              <span className="font-semibold">Estimated Net PO Value:</span>
              <strong className="text-base font-bold text-emerald-800">
                ₹{((orderQty / orderItem.recommended_quantity) * orderItem.estimated_cost).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </strong>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}

export default RecommendationsPage;
