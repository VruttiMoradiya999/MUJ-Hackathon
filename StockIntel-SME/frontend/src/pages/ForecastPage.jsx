import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import ForecastChart from '../components/forecast/ForecastChart.jsx';
import ForecastSummary from '../components/forecast/ForecastSummary.jsx';
import Select from '../components/ui/Select.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import UploadPanel from '../components/ui/UploadPanel.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useForecast } from '../hooks/useForecast.js';
import { useProducts } from '../hooks/useProducts.js';
import { importSales } from '../api/forecastApi.js';
import {
  parseCsv,
  downloadTextFile,
  SALES_CSV_TEMPLATE,
  validateSalesRows,
} from '../utils/csv.js';
import { Sparkles, Download, RefreshCw, ShoppingCart, Upload } from 'lucide-react';

export function ForecastPage() {
  const { productId: routeProductId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [selectedProductId, setSelectedProductId] = useState(routeProductId || 'P001');
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);

  const { data: productsData, loading: productsLoading } = useProducts();
  const { data: forecast, loading, error, refetch } = useForecast(selectedProductId);

  const productOptions = useMemo(() => {
    return (productsData?.products || []).map((p) => ({
      value: p.product_id,
      label: `${p.name} (${p.sku})`,
    }));
  }, [productsData]);

  const periodOptions = [
    { value: '7', label: '7-Day Forecast Horizon' },
    { value: '14', label: '14-Day Forecast Horizon' },
    { value: '30', label: '30-Day Forecast Horizon' },
  ];

  const currentProduct = useMemo(() => {
    const list = productsData?.products || [];
    return list.find((p) => p.product_id === selectedProductId) || list[0] || null;
  }, [selectedProductId, productsData]);

  const currentForecast = useMemo(() => {
    if (forecast && forecast.product_id) {
      return forecast;
    }
    if (!currentProduct) return null;

    const baseP = currentProduct;
    const baseDemand = Math.max(5, Math.round((baseP?.inventory?.reorder_level || 50) / 4));
    const price = baseP?.pricing?.selling_price || 50;

    const generateSeries = (days) => {
      const dates = [];
      const today = new Date(2026, 8, 11);
      const half = Math.floor(days / 2);

      for (let i = -half; i <= days - half; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const isToday = i === 0;
        const isFuture = i > 0;
        const variance = Math.round((Math.sin(i * 1.2) + Math.cos(i * 0.7)) * 3);
        const actualVal = isFuture ? null : Math.max(2, baseDemand + variance);
        const predictedVal = Math.max(2, baseDemand + variance + (isFuture ? 2 : 0));

        dates.push({
          date: isToday ? `${dateStr} (Today)` : dateStr,
          actual: actualVal,
          predicted: predictedVal,
          is_future: isFuture,
        });
      }
      return dates;
    };

    return {
      product_id: baseP.product_id,
      product_name: baseP.name,
      sku: baseP.sku,
      category: baseP.category,
      average_daily_demand: baseDemand,
      forecast_confidence: '86%',
      trend: 'Stable (+3.2% WoW)',
      trend_direction: 'up',
      seasonality_detected: 'Standard weekday grocery run-rate',
      summary: {
        '7': {
          predicted_units: baseDemand * 7,
          estimated_revenue: `₹${(baseDemand * 7 * price).toLocaleString('en-IN')}`,
          recommended_buffer: Math.round(baseDemand * 1.5),
        },
        '14': {
          predicted_units: baseDemand * 14,
          estimated_revenue: `₹${(baseDemand * 14 * price).toLocaleString('en-IN')}`,
          recommended_buffer: Math.round(baseDemand * 2.5),
        },
        '30': {
          predicted_units: baseDemand * 30,
          estimated_revenue: `₹${(baseDemand * 30 * price).toLocaleString('en-IN')}`,
          recommended_buffer: Math.round(baseDemand * 5),
        },
      },
      series_7: generateSeries(7),
      series_14: generateSeries(14),
      series_30: generateSeries(30),
    };
  }, [forecast, selectedProductId, currentProduct]);

  const seriesData = useMemo(() => {
    if (!currentForecast) return [];
    return currentForecast[`series_${selectedPeriod}`] || [];
  }, [currentForecast, selectedPeriod]);

  const handleProductChange = (val) => {
    setSelectedProductId(val);
    navigate(`/forecast/${val}`, { replace: true });
  };

  const handleExport = () => {
    showToast(
      `Forecast data export drafted for ${currentProduct?.name || currentForecast?.product_name || 'SKU'}.`,
      'success'
    );
  };

  const handleSalesFile = async (file) => {
    setUploadErrors([]);
    setUploadResult(null);
    if (!file) return;

    if (!/\.csv$/i.test(file.name) && file.type && !file.type.includes('csv') && file.type !== 'text/plain') {
      setUploadErrors(['Please upload a .csv file.']);
      return;
    }

    try {
      setUploading(true);
      const text = await file.text();
      const { headers, rows, errors: parseErrors } = parseCsv(text);
      if (parseErrors.length) {
        setUploadErrors(parseErrors);
        return;
      }
      const { valid, errors: validationErrors } = validateSalesRows(headers, rows);
      if (!valid) {
        setUploadErrors(validationErrors);
        return;
      }

      const result = await importSales(file, { headers, rows });
      setUploadResult(result);
      showToast(result.message || 'Sales data uploaded. Forecast insights updated.', 'success');
      refetch();
    } catch (err) {
      setUploadErrors([err?.message || 'Upload failed. Please try again.']);
      showToast(err?.message || 'Sales upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading || productsLoading) {
    return (
      <PageContainer title="Demand Forecast" subtitle="Loading…">
        <LoadingState rows={5} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Demand Forecast" subtitle="Predicted demand by SKU">
        <ErrorState title="Unable to load forecast" message={error?.message} onRetry={refetch} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Demand Forecast Intelligence"
      subtitle="Upload sales history, anticipate consumption trends, and plan replenishment horizons."
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Upload}
            onClick={() => {
              setIsUploadOpen(true);
              setUploadErrors([]);
              setUploadResult(null);
            }}
          >
            Upload Sales Data
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={() => {
              refetch();
              showToast('Demand models refreshed.', 'info');
            }}
          >
            Recalibrate
          </Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>
            Export Forecast
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={ShoppingCart}
            onClick={() => navigate('/recommendations')}
          >
            View Reorder Plan
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Cold-start hint when user has not imported sales yet (mock still shows data) */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-900">Seed demand models with your sales</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Upload a CSV of historical sales (date, sku, quantity_sold) so forecasts reflect your real velocity—not sample data.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={Upload}
            onClick={() => {
              setIsUploadOpen(true);
              setUploadErrors([]);
              setUploadResult(null);
            }}
          >
            Upload CSV
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Select Product:
            </span>
            <Select
              value={selectedProductId}
              onChange={handleProductChange}
              options={productOptions}
              className="w-full sm:w-80"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Horizon:</span>
            <Select
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              options={periodOptions}
              className="w-48"
            />
          </div>
        </div>

        <ForecastChart
          seriesData={seriesData}
          productName={currentProduct?.name || currentForecast?.product_name}
          period={selectedPeriod}
        />

        <ForecastSummary
          forecastInfo={currentForecast}
          period={selectedPeriod}
          seriesData={seriesData}
        />
      </div>

      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Product Sales Data"
        subtitle="Import historical sales to generate demand insights"
        confirmLabel="Done"
        onConfirm={() => setIsUploadOpen(false)}
        cancelLabel="Close"
      >
        <UploadPanel
          title="Sales history CSV"
          description="Required columns: date (YYYY-MM-DD), sku or product_id, quantity_sold. Optional: product_name, revenue."
          onDownloadTemplate={() =>
            downloadTextFile('sales-history-template.csv', SALES_CSV_TEMPLATE)
          }
          onFileSelected={handleSalesFile}
          uploading={uploading}
          errors={uploadErrors}
          result={uploadResult}
          onClearResult={() => setUploadResult(null)}
        />
      </Modal>
    </PageContainer>
  );
}

export default ForecastPage;
