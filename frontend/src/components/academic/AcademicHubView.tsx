import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Target 
} from 'lucide-react';
import { PlacementReadinessView } from './PlacementReadinessView';
import { MentorDirectoryView } from './MentorDirectoryView';
import { AcademicResourceView } from './AcademicResourceView';
import type { UserRole } from '../../types/navigation';

interface AcademicHubViewProps {
  activeRole: UserRole;
  onActivityLogged?: (title: string, type: 'info' | 'success' | 'warning') => void;
}

type AcademicTab = 'readiness' | 'mentors' | 'resources';

export const AcademicHubView: React.FC<AcademicHubViewProps> = ({
  activeRole,
  onActivityLogged,
}) => {
  const [activeTab, setActiveTab] = useState<AcademicTab>('readiness');

  return (
    <div className="space-y-6">
      {/* 1. Page Header (Inspired by screenshot compact header) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  Module A
                </span>
                <span className="text-xs text-slate-400 font-medium">Academic Ecosystem</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                Student Intelligence & Academic Hub
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Build placement readiness, connect with peer mentors, and discover academic resources.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Active Section:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
              {activeTab === 'readiness' && 'Placement Readiness'}
              {activeTab === 'mentors' && 'Peer Mentors'}
              {activeTab === 'resources' && 'Academic Resources'}
            </span>
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-100 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('readiness')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'readiness'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Target className="w-4 h-4" />
            Placement Readiness
          </button>

          <button
            onClick={() => setActiveTab('mentors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'mentors'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Peer Mentor Directory
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'resources'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Academic Resource Repository
          </button>
        </div>
      </div>

      {/* 3. Render Active Tab View */}
      {activeTab === 'readiness' && (
        <PlacementReadinessView onActivityLogged={onActivityLogged} />
      )}

      {activeTab === 'mentors' && (
        <MentorDirectoryView 
          activeRole={activeRole} 
          onActivityLogged={onActivityLogged} 
        />
      )}

      {activeTab === 'resources' && (
        <AcademicResourceView onActivityLogged={onActivityLogged} />
      )}
    </div>
  );
};
