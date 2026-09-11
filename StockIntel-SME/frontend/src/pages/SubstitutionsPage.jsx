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
import { useSubstitutions } from '../hooks/useSubstitutions.js';
import {
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Layers,
  PhoneCall,
  Printer,
} from 'lucide-react';

export function SubstitutionsPage() {
  const { productId: routeProductId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // List mode for dropdown + detail for selected
  const { data: listData, loading: listLoading } = useSubstitutions(null);
  const substitutionsList = listData?.substitutions || [];

  const [selectedProductId, setSelectedProductId] = useState(
    routeProductId || 'P001'
  );
  const { data: currentRaw, loading, error, refetch } = useSubstitutions(selectedProductId);
  const [selectedSubstitute, setSelectedSubstitute] = useState(null);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);

  const productOptions = useMemo(() => {
    return substitutionsList.map((item) => ({
      value: item.product_id,
      label: `${item.product_name} (${item.sku})`,
    }));
  }, [substitutionsList]);

  const currentItem = useMemo(() => {
    return (
      currentRaw ||
      substitutionsList.find((s) => s.product_id === selectedProductId) ||
      substitutionsList[0] || {
        product_id: selectedProductId,
        product_name: '—',
        sku: '—',
        category: '—',
        brand: '—',
        price: 0,
        stock_status: '—',
        recommended_substitutes: [],
      }
    );
  }, [currentRaw, substitutionsList, selectedProductId]);

  const handleProductChange = (val) => {
    setSelectedProductId(val);
    navigate(`/substitutions/${val}`, { replace: true });
  };

  const handleOpenScript = (sub) => {
    setSelectedSubstitute(sub);
    setIsScriptModalOpen(true);
  };

  if (loading || listLoading) {
    return (
      <PageContainer title="Product Substitutions" subtitle="Loading…">
        <LoadingState rows={5} />
      </PageContainer>
    );
  }
  if (error) {
    return (
      <PageContainer title="Product Substitutions" subtitle="Alternatives when stock is unavailable">
        <ErrorState title="Unable to load substitutions" message={error?.message} onRetry={refetch} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Product Substitutions & Alternative Matrix"
      subtitle="Protect customer satisfaction and prevent sales loss when items run out of stock by suggesting optimal substitutes."
      action={
        <Button
          variant="secondary"
          size="sm"
          icon={Printer}
          onClick={() => showToast('Substitution cheat-sheet dispatched to cashier terminals.', 'success')}
        >
          Print Register Cheat-Sheet
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Selector Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Primary Product Checked:
            </span>
            <Select
              value={selectedProductId}
              onChange={handleProductChange}
              options={productOptions}
              className="w-full sm:w-80"
            />
          </div>

          <div className="text-xs text-slate-500">
            Algorithmic ranking factoring category, price variance, and ready shelf stock
          </div>
        </div>

        {/* Primary Product Card */}
        <Card className="border-red-200 bg-linear-to-r from-red-50/30 to-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="danger" size="sm">
                  Stock Depletion Risk
                </Badge>
                <span className="text-xs text-slate-500 font-mono">
                  SKU: {currentItem.sku}
                </span>
                <span className="text-xs text-slate-500">• {currentItem.category}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {currentItem.product_name}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Base MRP: <strong className="text-slate-900">₹{currentItem.price}</strong> • Stock
                Coverage: <strong className="text-red-600">{currentItem.stock_status}</strong>
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Available Substitutes</span>
                <span className="text-base font-bold text-slate-900">
                  {currentItem.recommended_substitutes?.length || 0} Certified Options
                </span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-slate-400 block">Highest Match</span>
                <span className="text-base font-bold text-emerald-600">
                  {currentItem.recommended_substitutes?.[0]?.similarity_score || 94}% Match
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Suggested Substitutes Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Ranked Alternative Products in Warehouse
            </h3>
            <span className="text-xs text-slate-500">
              Ranked from highest consumer acceptance rate to lowest
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(currentItem.recommended_substitutes || []).map((sub, idx) => {
              const isFirst = idx === 0;

              return (
                <Card
                  key={sub.substitute_id || idx}
                  className={`flex flex-col justify-between transition ${
                    isFirst
                      ? 'border-emerald-300 ring-1 ring-emerald-400/20 bg-emerald-50/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          {isFirst && (
                            <Badge variant="success" size="sm">
                              Top Match
                            </Badge>
                          )}
                          <span className="text-xs text-slate-400 font-mono">
                            {sub.substitute_id}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{sub.name}</h4>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Brand: <span className="font-medium text-slate-700">{sub.brand}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {sub.similarity_score}% Match
                        </div>
                      </div>
                    </div>

                    {/* Stock and Price details */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Substitute Price:</span>
                        <strong className="text-slate-900">₹{sub.price}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Price Variance:</span>
                        <span
                          className={`font-semibold ${
                            String(sub.price_difference).startsWith('+')
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {sub.price_difference}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200">
                        <span className="text-slate-600">Ready Units on Shelf:</span>
                        <strong className="text-emerald-800 font-bold">
                          {sub.available_stock} units
                        </strong>
                      </div>
                    </div>

                    {/* Key Attributes Match */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Parity Attributes:
                      </span>
                      {(sub.key_match_attributes || []).map((attr, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{attr}</span>
                        </div>
                      ))}
                    </div>

                    {/* Recommendation Tip */}
                    <div className="text-[11px] text-slate-600 bg-blue-50/50 p-2 rounded border border-blue-100">
                      <strong className="text-blue-900 block mb-0.5">Clerk Tip:</strong>
                      {sub.recommendation_tip}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      icon={PhoneCall}
                      onClick={() => handleOpenScript(sub)}
                    >
                      Cashier Verbal Script
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cashier Verbal Recommendation Modal */}
      {selectedSubstitute && (
        <Modal
          isOpen={isScriptModalOpen}
          onClose={() => setIsScriptModalOpen(false)}
          title="Cashier Verbal Substitution Script"
          subtitle={`Substitute: ${selectedSubstitute.name} for ${currentItem.product_name}`}
          confirmLabel="Copy Script"
          onConfirm={() => {
            setIsScriptModalOpen(false);
            showToast('Customer pitch script copied for checkout register.', 'success');
          }}
        >
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-950">
              <strong className="text-xs font-bold text-blue-900 block mb-1">
                Suggested Customer Pitch:
              </strong>
              <p className="text-sm italic leading-relaxed text-blue-900">
                &ldquo;We are momentarily awaiting our fresh replenishment of{' '}
                {currentItem.product_name}. However, we have{' '}
                {selectedSubstitute.name} fresh on the shelf at ₹{selectedSubstitute.price}{' '}
                — it has the exact same quality and {selectedSubstitute.key_match_attributes?.[0] || 'comparable features'}!
                Would you like me to add this to your basket today?&rdquo;
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 space-y-1">
              <div className="font-semibold text-slate-900">Why this satisfies the customer:</div>
              <ul className="list-disc list-inside space-y-0.5">
                {(selectedSubstitute.key_match_attributes || []).map((attr, idx) => (
                  <li key={idx}>{attr}</li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}

export default SubstitutionsPage;
