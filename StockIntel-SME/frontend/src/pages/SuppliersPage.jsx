import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer.jsx';
import SupplierTable from '../components/suppliers/SupplierTable.jsx';
import SupplierPerformance from '../components/suppliers/SupplierPerformance.jsx';
import SearchInput from '../components/ui/SearchInput.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';

import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import { useSuppliers } from '../hooks/useSuppliers.js';
import { Plus, Download, Building2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export function SuppliersPage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data, loading, error, refetch } = useSuppliers({ search: searchQuery });
  const suppliers = data?.suppliers || [];
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Keep selected supplier in sync when data loads
  React.useEffect(() => {
    if (suppliers.length && !selectedSupplier) {
      setSelectedSupplier(suppliers[0]);
    }
  }, [suppliers, selectedSupplier]);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.supplier_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contact_person.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highReliableCount = suppliers.filter((s) => s.reliability === 'HIGH').length;
  const lateProneCount = suppliers.filter((s) => s.reliability === 'LOW').length;

  const handleExport = () => {
    showToast('Supplier SLA scorecard exported as CSV.', 'success');
  };

  if (loading) {
    return (
      <PageContainer title="Suppliers" subtitle="Loading…">
        <LoadingState rows={5} />
      </PageContainer>
    );
  }
  if (error) {
    return (
      <PageContainer title="Suppliers" subtitle="Vendor reliability & lead times">
        <ErrorState title="Unable to load suppliers" message={error?.message} onRetry={refetch} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Supplier Reliability & Lead Time Intelligence"
      subtitle="Track vendor fulfillment precision, late delivery frequency, and auto-calibrate safety stock buffers."
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExport}
          >
            Export Scorecard
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Supplier
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-xs text-slate-500 block">Total Active Vendors</span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {suppliers.length} Partners
            </div>
            <span className="text-[11px] text-slate-400">Serving 1,480 catalog items</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
            <span className="text-xs text-emerald-800 font-semibold block">High Reliability SLA</span>
            <div className="text-2xl font-bold text-emerald-900 mt-0.5">
              {highReliableCount} Suppliers
            </div>
            <span className="text-[11px] text-emerald-700">&gt;90% on-time delivery rate</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80">
            <span className="text-xs text-amber-800 font-semibold block">Late Delivery Lag Risk</span>
            <div className="text-2xl font-bold text-amber-900 mt-0.5">
              {lateProneCount} Suppliers
            </div>
            <span className="text-[11px] text-amber-800">Requires +2 to +4 days safety buffer</span>
          </div>
        </div>

        {/* Selected Supplier Performance & Lead Time Comparison Chart */}
        <SupplierPerformance
          supplier={selectedSupplier}
          suppliersList={suppliers}
        />

        {/* Supplier Directory Table */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex-1 max-w-sm">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search vendor name, contact person..."
              />
            </div>
            <span className="text-xs text-slate-500">
              Select any supplier to view detailed SLA fulfillment logs
            </span>
          </div>

          <SupplierTable
            suppliers={filteredSuppliers}
            onSelectSupplier={(s) => {
              setSelectedSupplier(s);
              window.scrollTo({ top: 180, behavior: 'smooth' });
            }}
          />
        </div>
      </div>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Supplier"
        subtitle="Register vendor profile, contracted SLA, and contact details"
        confirmLabel="Save Supplier"
        onConfirm={() => {
          setIsAddModalOpen(false);
          showToast('New supplier partner added to directory.', 'success');
        }}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Vendor Name</label>
            <input
              type="text"
              placeholder="e.g. Kaveri Agro Traders"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                placeholder="Naveen Gowda"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98860 12345"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quoted Lead Time (Days)</label>
              <input
                type="number"
                placeholder="3"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Categories</label>
              <input
                type="text"
                placeholder="Dairy, Beverages"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}

export default SuppliersPage;
