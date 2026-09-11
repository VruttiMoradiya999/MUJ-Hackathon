import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import AppLayout from './components/layout/AppLayout.jsx';

// Pages
import DashboardPage from './pages/DashboardPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import ForecastPage from './pages/ForecastPage.jsx';
import RecommendationsPage from './pages/RecommendationsPage.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import SuppliersPage from './pages/SuppliersPage.jsx';
import WorkingCapitalPage from './pages/WorkingCapitalPage.jsx';
import BundlesPage from './pages/BundlesPage.jsx';
import SubstitutionsPage from './pages/SubstitutionsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/forecast/:productId" element={<ForecastPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/working-capital" element={<WorkingCapitalPage />} />
            <Route path="/bundles" element={<BundlesPage />} />
            <Route path="/bundles/:productId" element={<BundlesPage />} />
            <Route path="/substitutions" element={<SubstitutionsPage />} />
            <Route path="/substitutions/:productId" element={<SubstitutionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
