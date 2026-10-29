import React from 'react';
import { Menu, Bell } from 'lucide-react';
import type { ModuleId, UserRole } from '../../types/navigation';

interface HeaderProps {
  activeModule: ModuleId;
  activeRole: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}

const moduleTitles: Record<ModuleId, string> = {
  'overview': 'Overview Dashboard',
  'academic-hub': 'Student Intelligence & Academic Hub',
  'ride-pooling': 'Smart Campus Ride-Pooling',
  'sustainable-compute': 'Sustainable Computing Observatory',
  'digital-wellbeing': 'Privacy-Aware Digital Wellbeing',
  'exam-monitoring': 'Responsible Examination Monitoring',
};

const roleInfo: Record<UserRole, { initials: string; roleLabel: string; name: string }> = {
  'student': {
    initials: 'AR',
    roleLabel: 'Student',
    name: 'Alex Rivera',
  },
  'peer-mentor': {
    initials: 'SL',
    roleLabel: 'Peer Mentor',
    name: 'Sarah Lin',
  },
  'transit-coordinator': {
    initials: 'MV',
    roleLabel: 'Transit Coordinator',
    name: 'Marcus Vance',
  },
  'sustainability-analyst': {
    initials: 'ER',
    roleLabel: 'Sustainability Analyst',
    name: 'Dr. Elena Rostova',
  },
  'exam-proctor': {
    initials: 'DK',
    roleLabel: 'Exam Proctor',
    name: 'Prof. David Kelling',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  activeRole,
  isCollapsed,
  onToggleCollapse,
  onOpenNotifications,
  unreadCount,
}) => {
  const currentRole = roleInfo[activeRole] || roleInfo['student'];
  const title = moduleTitles[activeModule] || 'UniVerse Campus';

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-5 md:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Sidebar Toggle + Current Page Title ONLY */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base md:text-lg font-semibold text-slate-900 tracking-tight truncate">
          {title}
        </h1>
      </div>

      {/* Right: Notification Bell + Initials Avatar with Role Label */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Notifications"
          aria-label="Campus notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          )}
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div
            className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-xs font-mono tracking-tight shrink-0 shadow-xs"
            title={`${currentRole.name} (${currentRole.roleLabel})`}
          >
            {currentRole.initials}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-medium text-slate-700 block leading-tight">
              {currentRole.roleLabel}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
