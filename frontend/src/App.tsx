import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { OverviewView } from './components/dashboard/OverviewView';
import { AcademicHubView } from './components/academic/AcademicHubView';
import { ModuleFoundationView } from './components/modules/ModuleFoundationView';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import type { ModuleId, UserRole, ActivityNotification } from './types/navigation';
import { academicApi } from './services/academicApi';

export const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleId>('overview');
  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState<ActivityNotification[]>([
    {
      id: 'notif-1',
      module: 'ride-pooling',
      title: 'New carpool match found: Hostel Block B to Innovation Center (Detour 0.8km)',
      timestamp: '10 mins ago',
      type: 'info',
      read: false,
    },
    {
      id: 'notif-2',
      module: 'sustainable-compute',
      title: 'LMS Workload Optimization: 28% carbon reduction achieved in evening batch',
      timestamp: '42 mins ago',
      type: 'success',
      read: false,
    },
    {
      id: 'notif-3',
      module: 'exam-monitoring',
      title: 'Human Review Pending: 1 posture event recorded in Hall C (Non-punitive)',
      timestamp: '1 hour ago',
      type: 'alert',
      read: false,
    },
    {
      id: 'notif-4',
      module: 'academic-hub',
      title: 'Sarah Lin accepted your peer mentorship request on "Graph Algorithms"',
      timestamp: '3 hours ago',
      type: 'success',
      read: true,
    },
  ]);

  // Load activities from backend if connected
  useEffect(() => {
    academicApi.getActivities().then((backendActs) => {
      if (backendActs && backendActs.length > 0) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map(p => p.id));
          const newActs = backendActs.filter(b => !existingIds.has(b.id));
          return [...newActs, ...prev];
        });
      }
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleActivityLogged = (title: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotif: ActivityNotification = {
      id: `notif-${Date.now()}`,
      module: 'academic-hub',
      title,
      timestamp: 'Just now',
      type,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
        activeRole={activeRole}
        onChangeRole={(role) => setActiveRole(role)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <TopNavbar
          activeRole={activeRole}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          unreadCount={unreadCount}
        />

        {/* Page Body */}
        <main className="flex-1 p-5 md:p-7 max-w-7xl w-full mx-auto">
          {activeModule === 'overview' && (
            <OverviewView onNavigateModule={(mod) => setActiveModule(mod)} />
          )}

          {activeModule === 'academic-hub' && (
            <AcademicHubView
              activeRole={activeRole}
              onActivityLogged={handleActivityLogged}
            />
          )}

          {activeModule !== 'overview' && activeModule !== 'academic-hub' && (
            <ModuleFoundationView
              moduleId={activeModule}
              onBackToOverview={() => setActiveModule('overview')}
            />
          )}
        </main>

        {/* Enterprise Bottom Status Footer */}
        <footer className="border-t border-slate-200 bg-white py-3.5 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">UniVerse Campus Ecosystem</span>
            <span>&bull;</span>
            <span>12-Hour Evaluation Integrated MVP</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Graph Algorithms</span>
            <span>&bull;</span>
            <span>Computer Vision</span>
            <span>&bull;</span>
            <span>Sustainability Telemetry</span>
            <span>&bull;</span>
            <span>Privacy Engineering</span>
          </div>
        </footer>
      </div>

      {/* Unified Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onSelectModule={(mod) => setActiveModule(mod)}
      />
    </div>
  );
};

export default App;
