import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import AlertTabs from '../components/alerts/AlertTabs.jsx';
import AlertCard from '../components/alerts/AlertCard.jsx';
import SearchInput from '../components/ui/SearchInput.jsx';
import Select from '../components/ui/Select.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAlerts } from '../hooks/useAlerts.js';
import { CheckCircle2, ShieldAlert, Sparkles, Filter, RefreshCw } from 'lucide-react';

export function AlertsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const { data, loading, error, refetch } = useAlerts();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['All', 'Stockout', 'Overstock'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'All' ? {} : { tab });
  };

  const alerts = (data?.alerts || []).filter((a) => !dismissedIds.has(a.id));

  const counts = useMemo(() => {
    return {
      all: alerts.length,
      stockout: alerts.filter((a) => a.type === 'STOCKOUT').length,
      overstock: alerts.filter((a) => a.type === 'OVERSTOCK').length,
    };
  }, [alerts]);

  const severityOptions = [
    { value: '', label: 'All Severities' },
    { value: 'HIGH', label: 'High Severity' },
    { value: 'MEDIUM', label: 'Medium Severity' },
    { value: 'LOW', label: 'Low Severity' },
  ];

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      let matchesTab = true;
      if (activeTab === 'Stockout') matchesTab = alert.type === 'STOCKOUT';
      if (activeTab === 'Overstock') matchesTab = alert.type === 'OVERSTOCK';

      const matchesSearch =
        searchQuery.trim() === '' ||
        (alert.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (alert.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (alert.category || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity =
        !selectedSeverity || alert.severity === selectedSeverity;

      return matchesTab && matchesSearch && matchesSeverity;
    });
  }, [alerts, activeTab, searchQuery, selectedSeverity]);

  const handleResolveAlert = (alert) => {
    setDismissedIds((prev) => new Set([...prev, alert.id]));
    showToast(`Alert ${alert.id} dismissed from active attention list.`, 'info');
  };

  const handleAction = (alert) => {
    showToast(
      `Action drafted for ${alert.product_name}: ${alert.recommended_action || 'Review'}`,
      'success'
    );
    if (alert.type === 'STOCKOUT') {
      navigate('/recommendations');
    }
  };

  return (
    <PageContainer
      title="Inventory Alerts"
      subtitle="Proactive notifications for stockouts, overstock, and supplier risk."
      action={
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refetch}>
          Refresh
        </Button>
      }
    >
      <div className="space-y-4">
        <AlertTabs activeTab={activeTab} onSelect={handleSelectTab} counts={counts} />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search alerts by product, SKU, or category…"
            />
          </div>
          <Select
            value={selectedSeverity}
            onChange={setSelectedSeverity}
            options={severityOptions}
            className="sm:w-48"
          />
        </div>

        {loading && <LoadingState rows={5} />}

        {!loading && error && (
          <ErrorState
            title="Unable to load alerts"
            message={error?.message || 'Unable to load inventory alerts.'}
            onRetry={refetch}
          />
        )}

        {!loading && !error && filteredAlerts.length === 0 && (
          <EmptyState
            icon={CheckCircle2}
            title="No alerts match your filters"
            description="Inventory risk is currently within configured thresholds, or filters are excluding all items."
            actionLabel="Clear filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedSeverity('');
              handleSelectTab('All');
            }}
          />
        )}

        {!loading && !error && filteredAlerts.length > 0 && (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onResolve={() => handleResolveAlert(alert)}
                onAction={() => handleAction(alert)}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default AlertsPage;
