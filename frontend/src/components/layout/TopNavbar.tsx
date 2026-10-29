import React from 'react';
import { 
  Calendar, 
  SlidersHorizontal, 
  Download, 
  Bell, 
  Menu
} from 'lucide-react';
import type { UserRole } from '../../types/navigation';

interface TopNavbarProps {
  activeRole: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}

const roleProfiles: Record<UserRole, { name: string; title: string; avatar: string }> = {
  'student': {
    name: 'Alex Rivera',
    title: 'Computer Science ’27',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  'peer-mentor': {
    name: 'Sarah Lin',
    title: 'Head Peer Mentor (AI & Algo)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
  },
  'transit-coordinator': {
    name: 'Marcus Vance',
    title: 'Campus Transit Dispatcher',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  'sustainability-analyst': {
    name: 'Dr. Elena Rostova',
    title: 'Green Computing Chair',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  },
  'exam-proctor': {
    name: 'Prof. David Kelling',
    title: 'Chief Academic Proctor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  },
};

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeRole,
  isCollapsed,
  onToggleCollapse,
  onOpenNotifications,
  unreadCount,
}) => {
  const currentProfile = roleProfiles[activeRole];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Hamburger & Welcome Greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
            Welcome, {currentProfile.name}!
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Today is Thursday, 29th October 2026 &bull; <span className="text-slate-600 font-semibold">Fall Academic Term</span>
          </p>
        </div>
      </div>

      {/* Right: Quick Action Controls & User Profile Badge */}
      <div className="flex items-center gap-3">
        {/* Date / Term Selector */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Fall 2026 (Wk 9)</span>
          <span className="text-slate-300">|</span>
          <span className="text-blue-600 font-semibold cursor-pointer">Live Stream</span>
        </div>

        {/* Filter Trigger */}
        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Filter</span>
        </button>

        {/* Export Trigger */}
        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export</span>
        </button>

        {/* Notification Bell */}
        <button 
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Campus Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
          )}
        </button>

        {/* Profile Card Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <img
            src={currentProfile.avatar}
            alt={currentProfile.name}
            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {currentProfile.name}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {currentProfile.title}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
