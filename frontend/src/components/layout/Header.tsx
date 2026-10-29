import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Calendar, 
  SlidersHorizontal, 
  Download, 
  ChevronDown 
} from 'lucide-react';
import type { ModuleId, UserRole } from '../../types/navigation';

interface HeaderProps {
  activeModule: ModuleId;
  activeRole: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}

const moduleBreadcrumbs: Record<ModuleId, { title: string; subtitle: string }> = {
  'overview': {
    title: 'Welcome back, Alex Rivera!',
    subtitle: 'Thursday, Term: Fall 2026 (Semester 7)',
  },
  'academic-hub': {
    title: 'Student Intelligence & Academic Hub',
    subtitle: 'Placement preparation, peer mentorship & curated course resources',
  },
  'ride-pooling': {
    title: 'Smart Campus Ride-Pooling',
    subtitle: 'Algorithmic Dijkstra route matching, carpool capacity & carbon offsets',
  },
  'sustainable-compute': {
    title: 'Sustainable Computing Observatory',
    subtitle: 'Workload telemetry, linear SPECpower modeling & grid carbon accounting',
  },
  'digital-wellbeing': {
    title: 'Privacy-Aware Digital Wellbeing',
    subtitle: 'Voluntary focus sessions, local classification & client data sovereignty',
  },
  'exam-monitoring': {
    title: 'Responsible Examination Monitoring',
    subtitle: 'Observable geometric cues, certified proctor audit queue & non-punitive safeguards',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  isCollapsed,
  onToggleCollapse,
  onOpenNotifications,
  unreadCount,
}) => {
  const [selectedTerm, setSelectedTerm] = useState('Thu, Oct 30, 2026');
  const [isDateOpen, setIsDateOpen] = useState(false);
  const info = moduleBreadcrumbs[activeModule] || moduleBreadcrumbs['overview'];

  const handleExport = () => {
    const reportData = {
      platform: "UniVerse Campus Operations",
      timestamp: new Date().toISOString(),
      activeModule,
      metrics: {
        placementReadiness: "50%",
        activeCarpoolRoutes: 4,
        computeEnergyAvoidedKwh: 0.243,
        examAuditStatus: "3/4 cleared"
      }
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `universe-campus-report-${activeModule}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="bg-slate-50/95 backdrop-blur-xs border-b border-slate-200/60 px-6 sm:px-8 py-5 sticky top-0 z-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Sidebar Toggle + Title & Subtitle */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white border border-slate-200 rounded-lg transition-colors shrink-0 lg:hidden shadow-2xs"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight truncate">
              {info.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium truncate">
              {info.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Controls matching reference image exactly */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
          {/* 1. Date Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDateOpen(!isDateOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{selectedTerm}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDateOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-40 text-xs">
                {['Thu, Oct 30, 2026', 'Wed, Oct 29, 2026', 'Fall Term 2026', 'Spring Term 2026'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setSelectedTerm(t);
                      setIsDateOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                      selectedTerm === t ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Filter Action Button */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter</span>
          </button>

          {/* 3. Export Report Button */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="Download JSON telemetry and audit export"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>

          {/* 4. Notification Bell with Count Badge */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-colors shadow-2xs cursor-pointer"
            title="Notifications"
            aria-label="Campus notifications"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* 5. Circular User Avatar */}
          <div className="relative pl-1">
            <div 
              className="w-8 h-8 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shadow-2xs shrink-0 cursor-pointer"
              title="Alex Rivera (Student / Lead)"
            >
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" 
                alt="Alex Rivera"
                onError={(e) => {
                  // Fallback to stylized initials if image blocked
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-full h-full object-cover"
              />
              <span className="text-[11px] font-bold text-slate-700 font-mono">AR</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
