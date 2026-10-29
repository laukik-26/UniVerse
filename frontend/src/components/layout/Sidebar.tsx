import React, { useState } from 'react';
import { 
  Home, 
  GraduationCap, 
  Car, 
  Leaf, 
  HeartPulse, 
  ShieldCheck, 
  ChevronDown, 
  User
} from 'lucide-react';
import type { ModuleId, UserRole } from '../../types/navigation';

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  activeRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: ModuleId;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview /\nExecutive Dashboard',
    icon: Home,
  },
  {
    id: 'academic-hub',
    label: 'Academic Hub &\nPlacement Readiness',
    icon: GraduationCap,
  },
  {
    id: 'ride-pooling',
    label: 'Smart Campus\nRide-Pooling',
    icon: Car,
  },
  {
    id: 'sustainable-compute',
    label: 'Sustainable Computing\nObservatory',
    icon: Leaf,
  },
  {
    id: 'digital-wellbeing',
    label: 'Digital Wellbeing &\nFocus',
    icon: HeartPulse,
  },
  {
    id: 'exam-monitoring',
    label: 'Exam Proctor &\nAudit Queue',
    icon: ShieldCheck,
  },
];

const roleLabels: Record<UserRole, { name: string; subtitle: string }> = {
  'student': { name: 'Alex Rivera', subtitle: '(Student / Lead)' },
  'peer-mentor': { name: 'Sarah Lin', subtitle: '(Peer Mentor)' },
  'transit-coordinator': { name: 'Marcus Vance', subtitle: '(Transit Lead)' },
  'sustainability-analyst': { name: 'Dr. Elena Rostova', subtitle: '(Green IT)' },
  'exam-proctor': { name: 'Prof. David Kelling', subtitle: '(Certified Proctor)' },
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  activeRole,
  onChangeRole,
  isCollapsed,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const currentRole = roleLabels[activeRole] || roleLabels['student'];

  return (
    <aside 
      className={`bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between transition-all duration-150 ease-in-out shrink-0 select-none z-30 ${
        isCollapsed ? 'w-16' : 'w-[230px]'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="pt-6 pb-5 px-5 flex flex-col items-start border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl text-slate-900 tracking-tight">
                UniVerse
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div className="mt-2 ml-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200/70 tracking-wide">
                v1.0 Enterprise
              </span>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectModule(item.id)}
                title={item.label.replace('\n', ' ')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border border-blue-100/80'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon 
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-slate-500'
                  }`} 
                />

                {!isCollapsed && (
                  <span className="text-left leading-tight whitespace-pre-line text-xs font-medium">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role Switcher & System Status */}
      <div className="p-3 space-y-3 pb-6">
        {!isCollapsed && (
          <>
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="w-full flex items-center justify-between p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors text-left shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      Role: {currentRole.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {currentRole.subtitle}
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {roleMenuOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-40 space-y-0.5 text-xs">
                  {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        onChangeRole(r);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex flex-col ${
                        activeRole === r ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{roleLabels[r].name}</span>
                      <span className="text-[10px] text-slate-400">{roleLabels[r].subtitle}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* System Status Pill */}
            <div className="flex items-center gap-2 px-2 py-1 text-slate-700 text-xs">
              <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11px] font-medium text-slate-700">
                All Systems Operational &bull; <strong className="text-emerald-700 font-bold">99.8% Eco</strong>
              </span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
