import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  ArrowLeft,
  Package,
  IndianRupee,
  Clock,
  Truck,
  TrendingUp,
  AlertTriangle,
  Boxes,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export function ProductDetails({ product }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderQty, setOrderQty] = useState(product?.supplier?.minimum_order_quantity || 100);

  if (!product) {
    return (
      <Card className="p-12 text-center">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900">Product Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested SKU does not exist in your active inventory catalog.
        </p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </Card>
    );
  }

  const { pricing, inventory, supplier, shelf_life } = product;
  const margin = pricing.selling_price - pricing.cost_price;
  const marginPercent = ((margin / pricing.selling_price) * 100).toFixed(1);
  const totalValue = inventory.current_stock * pricing.cost_price;

  const handleCreatePO = () => {
    setIsOrderModalOpen(false);
    showToast(
      `Purchase Order created for ${orderQty} units of ${product.name} to ${supplier.supplier_name}.`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Back and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Products
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={TrendingUp}
            onClick={() => navigate(`/forecast/${product.product_id}`)}
          >
            Demand Forecast
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Boxes}
            onClick={() => navigate(`/bundles/${product.product_id}`)}
          >
            Co-Purchase Bundles
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowRightLeft}
            onClick={() => navigate(`/substitutions/${product.product_id}`)}
          >
            Substitutions
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Truck}
            onClick={() => setIsOrderModalOpen(true)}
          >
            Create Purchase Order
          </Button>
        </div>
      </div>

      {/* Main Product Header Card */}
      <Card className="bg-linear-to-r from-slate-900 to-slate-800 text-white border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-20 h-20 rounded-xl object-cover border border-slate-600 bg-slate-800 shrink-0 shadow-lg"
                loading="lazy"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-slate-300 text-lg shrink-0 border border-slate-600">
                {product.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  {product.category}
                </span>
                <span className="font-mono text-xs text-slate-400">SKU: {product.sku}</span>
                <Badge
                  variant={product.status === 'ACTIVE' ? 'success' : 'neutral'}
                  size="sm"
                >
                  {product.status}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">{product.name}</h2>
              <p className="text-xs text-slate-300">
                Brand: <strong className="text-white">{product.brand}</strong> • Catalog ID:{' '}
                {product.product_id} • Last audited: {new Date(product.last_updated).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex items-center gap-6">
            <div>
              <div className="text-[11px] text-slate-400">Current Stock Value</div>
              <div className="text-xl font-bold text-white">₹{totalValue.toLocaleString('en-IN')}</div>
            </div>
            <div className="border-l border-slate-700 pl-6">
              <div className="text-[11px] text-slate-400">Gross Margin</div>
              <div className="text-xl font-bold text-emerald-400">{marginPercent}%</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Inventory Column */}
        <Card>
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
            <Package className="w-4 h-4 text-blue-600" />
            <span>Inventory Status</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Current Stock</span>
              <strong className="text-slate-900 font-semibold">
                {inventory.current_stock} units
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Reserved (In Baskets)</span>
              <span className="text-slate-700">{inventory.reserved_stock} units</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Net Available</span>
              <strong className="text-emerald-700 font-semibold">
                {inventory.available_stock} units
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Reorder Threshold</span>
              <span className="text-slate-800 font-medium">
                {inventory.reorder_level} units
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Stock Health</span>
              {inventory.current_stock <= inventory.reorder_level ? (
                <span className="text-red-600 font-semibold">Reorder Required</span>
              ) : (
                <span className="text-emerald-600 font-semibold">Sufficient</span>
              )}
            </div>
          </div>
        </Card>

        {/* Pricing Column */}
        <Card>
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <span>Pricing & Margins</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Purchase Cost</span>
              <strong className="text-slate-900 font-semibold">
                ₹{pricing.cost_price} / unit
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Selling MRP</span>
              <strong className="text-slate-900 font-semibold">
                ₹{pricing.selling_price} / unit
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Profit Margin</span>
              <span className="text-emerald-600 font-semibold">₹{margin} ({marginPercent}%)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Markup on Cost</span>
              <span className="text-slate-700 font-medium">
                {(((margin) / pricing.cost_price) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Pricing Tier</span>
              <span className="text-slate-800 font-medium">Standard Retail</span>
            </div>
          </div>
        </Card>

        {/* Supplier Column */}
        <Card>
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
            <Truck className="w-4 h-4 text-amber-600" />
            <span>Supplier Partner</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Vendor</span>
              <strong className="text-slate-900 font-semibold truncate max-w-[130px]">
                {supplier.supplier_name}
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Supplier Code</span>
              <span className="text-slate-700 font-mono">{supplier.supplier_id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Standard Lead Time</span>
              <strong className="text-slate-900">{supplier.lead_time_days} days</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Min Order Qty (MOQ)</span>
              <span className="text-slate-800 font-medium">{supplier.minimum_order_quantity} units</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Min Order Value</span>
              <span className="text-slate-800 font-semibold">
                ₹{(supplier.minimum_order_quantity * pricing.cost_price).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </Card>

        {/* Shelf Life & Handling Column */}
        <Card>
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Shelf Life & Expiry</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Shelf Life Span</span>
              <strong className="text-slate-900 font-semibold">
                {shelf_life.days} days
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Expiry Tracking</span>
              <span>
                {shelf_life.expiry_tracking ? (
                  <Badge variant="warning" size="sm">
                    Required (FIFO)
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Non-perishable
                  </Badge>
                )}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Storage Rule</span>
              <span className="text-slate-700">
                {product.category === 'Dairy' ? 'Chilled (2-4°C)' : 'Ambient Dry Shelving'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Batch Code</span>
              <span className="font-mono text-slate-600">BAT-2026-09</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Risk Assessment</span>
              <span className="text-slate-700">
                {shelf_life.days < 15 ? 'High turnover priority' : 'Long stability'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* PO Confirmation Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Create Purchase Order"
        subtitle={`Supplier: ${supplier.supplier_name} (${supplier.supplier_id})`}
        confirmLabel="Confirm Purchase Order"
        confirmVariant="primary"
        onConfirm={handleCreatePO}
      >
        <div className="space-y-4 text-sm">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-900">{product.name}</div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">SKU: {product.sku}</div>
            <div className="flex justify-between text-xs mt-2 pt-2 border-t border-slate-200">
              <span className="text-slate-600">Unit Cost Price:</span>
              <span className="font-semibold text-slate-900">₹{pricing.cost_price}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Order Quantity (MOQ: {supplier.minimum_order_quantity} units)
            </label>
            <input
              type="number"
              min={supplier.minimum_order_quantity}
              value={orderQty}
              onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
            <span>Total Estimated Cost:</span>
            <span className="text-base font-bold">
              ₹{(orderQty * pricing.cost_price).toLocaleString('en-IN')}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Expected arrival in approximately {supplier.lead_time_days} days. This PO will be saved to your local replenishment queue.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default ProductDetails;
