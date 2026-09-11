import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { useAlerts } from '../../hooks/useAlerts.js';
import { useRecommendations } from '../../hooks/useRecommendations.js';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: alertsData } = useAlerts();
  const { data: recsData } = useRecommendations();

  const alertCount = (alertsData?.alerts || []).length;
  const reorderCount = (recsData?.recommendations || []).filter(
    (r) => String(r.priority).toUpperCase() === 'HIGH'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        alertCount={alertCount}
        reorderCount={reorderCount}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Topbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          alertCount={alertCount}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
