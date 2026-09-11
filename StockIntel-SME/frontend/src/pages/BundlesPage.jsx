import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import Select from '../components/ui/Select.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';

import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import { useBundles } from '../hooks/useBundles.js';
import { useProducts } from '../hooks/useProducts.js';
import {
  Boxes,
  Plus,
  Percent,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  CheckCircle2,
  PackageCheck,
} from 'lucide-react';

export function BundlesPage() {
  const { productId: routeProductId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  // List all bundles (null productId) then pick selected
  const { data: listData, loading: listLoading } = useBundles(null);
  const bundlesList = listData?.bundles || [];
  const [selectedProductId, setSelectedProductId] = useState(
    routeProductId || 'P001'
  );
  const { data: bundle, loading, error, refetch } = useBundles(selectedProductId);
  const { data: productsWrap } = useProducts();
  const productsList = productsWrap?.products || [];
  const [isCreateBundleModalOpen, setIsCreateBundleModalOpen] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState(null);

  const productOptions = useMemo(() => {
    return bundlesList.map((bundle) => ({
      value: bundle.product_id,
      label: `${bundle.product_name} (${bundle.sku})`,
    }));
  }, [bundlesList]);

  const currentBundle = useMemo(() => {
    return (
      bundle ||
      bundlesList.find((b) => b.product_id === selectedProductId) ||
      bundlesList[0] || {
        product_id: selectedProductId,
        product_name: '—',
        sku: '—',
        category: '—',
        brand: '—',
        frequently_bought_together: [],
      }
    );
  }, [bundle, bundlesList, selectedProductId]);

  const anchorProduct = useMemo(() => {
    return (
      productsList.find((p) => p.product_id === currentBundle.product_id) || {
        pricing: { selling_price: 0, cost_price: 0 },
      }
    );
  }, [currentBundle, productsList]);

  const handleProductChange = (val) => {
    setSelectedProductId(val);
    navigate(`/bundles/${val}`, { replace: true });
  };

  const handleCreatePromo = (companion) => {
    setSelectedCompanion(companion);
    setIsCreateBundleModalOpen(true);
  };

  const handleConfirmBundle = () => {
    setIsCreateBundleModalOpen(false);
    showToast(
      `Bundle campaign published: ${currentBundle.product_name} + ${selectedCompanion?.name}.`,
      'success'
    );
  };

  if (loading || listLoading) {
    return (
      <PageContainer title="Product Bundles & Basket Affinity" subtitle="Loading…">
        <LoadingState rows={5} />
      </PageContainer>
    );
  }
  if (error) {
    return (
      <PageContainer title="Product Bundles & Basket Affinity" subtitle="Frequently bought together">
        <ErrorState title="Unable to load bundles" message={error?.message} onRetry={refetch} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Product Bundles & Basket Affinity"
      subtitle="Discover items frequently purchased together to boost average basket size and cross-merchandising revenue."
      action={
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            if (currentBundle.frequently_bought_together?.length > 0) {
              setSelectedCompanion(currentBundle.frequently_bought_together[0]);
            }
            setIsCreateBundleModalOpen(true);
          }}
        >
          Create Bundle Campaign
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Product Selector Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Anchor Product:
            </span>
            <Select
              value={selectedProductId}
              onChange={handleProductChange}
              options={productOptions}
              className="w-full sm:w-80"
            />
          </div>

          <div className="text-xs text-slate-500">
            Analysis derived from 12,450 POS checkout registers
          </div>
        </div>

        {/* Primary Product Header */}
        <Card className="bg-slate-900 text-white border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success" size="sm">
                  Anchor SKU
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  SKU: {currentBundle.sku}
                </span>
                <span className="text-xs text-slate-400">
                  • Brand: {currentBundle.brand}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {currentBundle.product_name}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Category: <strong className="text-white">{currentBundle.category}</strong> • Base Selling Price:{' '}
                <strong className="text-emerald-400">
                  ₹{anchorProduct.pricing?.selling_price || 55}
                </strong>{' '}
                • Basket Penetration:{' '}
                <strong className="text-white">{currentBundle.basket_penetration || '35%'}</strong>
              </p>
            </div>

            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Identified Pairings</span>
                <span className="text-base font-bold text-white">
                  {currentBundle.frequently_bought_together?.length || 0} High Affinity
                </span>
              </div>
              <div className="border-l border-slate-700 pl-4">
                <span className="text-slate-400 block">Analyzed Baskets</span>
                <span className="text-base font-bold text-emerald-400">
                  {currentBundle.total_transactions_analyzed?.toLocaleString() || '1,420'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recommended Combo Promo Banner */}
        {currentBundle.recommended_combo && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                <strong className="font-bold text-emerald-900 text-sm">
                  Recommended Combo: {currentBundle.recommended_combo.title}
                </strong>
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Est. Monthly Uplift: {currentBundle.recommended_combo.estimated_monthly_uplift}
                </span>
              </div>
              <p className="leading-relaxed text-emerald-900 mb-2">
                Items:{' '}
                <span className="font-semibold">
                  {currentBundle.recommended_combo.items?.join(' + ')}
                </span>{' '}
                | Regular Total: ₹{currentBundle.recommended_combo.combined_regular_price} → Combo Offer:{' '}
                <strong className="text-emerald-950 font-bold">
                  ₹{currentBundle.recommended_combo.bundle_price}
                </strong>
              </p>
            </div>
          </div>
        )}

        {/* Frequently Bought Together Items Grid */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900">
            Top Co-Purchased Items with {currentBundle.product_name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(currentBundle.frequently_bought_together || []).map((item) => {
              const compProduct = productsList.find(
                (p) => p.product_id === item.product_id
              );
              const compPrice = compProduct?.pricing?.selling_price || 40;
              const combinedPrice = (anchorProduct.pricing?.selling_price || 55) + compPrice;
              const comboOffer = Math.round(combinedPrice * 0.9);

              return (
                <Card
                  key={item.product_id}
                  className="flex flex-col justify-between border-slate-200 hover:border-slate-300 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                          {item.name}
                        </h4>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {item.sku} • {item.category}
                        </div>
                      </div>
                      <Badge variant="purple" size="sm">
                        {item.co_purchase_rate}% Affinity
                      </Badge>
                    </div>

                    {/* Affinity Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Co-purchase Frequency</span>
                        <strong className="text-slate-900">
                          {item.co_purchase_rate}% of baskets
                        </strong>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${item.co_purchase_rate}%` }}
                        />
                      </div>
                    </div>

                    {/* Pricing Comparison */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Companion Price:</span>
                        <strong className="text-slate-900">₹{compPrice}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Separate Total:</span>
                        <span className="line-through text-slate-400">
                          ₹{combinedPrice}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-700 pt-1 border-t border-slate-200">
                        <span>10% Off Combo Offer:</span>
                        <span>₹{comboOffer}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                      <strong className="text-amber-950 font-medium block mb-0.5">
                        Merchandising Action:
                      </strong>
                      <span className="text-amber-900">{item.merchandising_tip}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      icon={Boxes}
                      onClick={() => handleCreatePromo(item)}
                    >
                      Activate Bundle Combo
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Bundle Dialog */}
      {selectedCompanion && (
        <Modal
          isOpen={isCreateBundleModalOpen}
          onClose={() => setIsCreateBundleModalOpen(false)}
          title="Create Retail Bundle Combo"
          subtitle={`${currentBundle.product_name} + ${selectedCompanion.name}`}
          confirmLabel="Publish Bundle to POS"
          onConfirm={handleConfirmBundle}
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Primary Anchor SKU:</span>
                <strong className="text-slate-900">
                  {currentBundle.product_name} (₹{anchorProduct.pricing?.selling_price || 55})
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Bundled Companion SKU:</span>
                <strong className="text-slate-900">
                  {selectedCompanion.name}
                </strong>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Merchandising Display Placement
              </label>
              <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-lg text-blue-900">
                {selectedCompanion.merchandising_tip}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950">
              <strong className="block mb-0.5">Automated POS Cashier Script:</strong>
              When either SKU is scanned, register will pop up: &ldquo;Offer customer combo pairing
              for a special package discount!&rdquo;
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}

export default BundlesPage;
