import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Target 
} from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
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
      {/* 1. Page Header */}
      <PageHeader
        title="Student Intelligence & Academic Hub"
        subtitle="Build placement readiness, connect with peer mentors, and discover academic resources."
      />

      {/* 2. Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('readiness')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'readiness'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Placement readiness</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mentors')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'mentors'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Peer mentor directory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('resources')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'resources'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Academic resources</span>
          </button>
        </nav>
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
