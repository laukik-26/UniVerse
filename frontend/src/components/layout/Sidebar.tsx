import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Car, 
  Leaf, 
  HeartPulse, 
  ShieldAlert, 
  ChevronDown, 
  Layers,
  UserCheck
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
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'academic-hub',
    label: 'Academic Hub',
    icon: GraduationCap,
  },
  {
    id: 'ride-pooling',
    label: 'Ride-Pooling',
    icon: Car,
  },
  {
    id: 'sustainable-compute',
    label: 'Eco Observatory',
    icon: Leaf,
  },
  {
    id: 'digital-wellbeing',
    label: 'Digital Wellbeing',
    icon: HeartPulse,
  },
  {
    id: 'exam-monitoring',
    label: 'Exam Proctoring',
    icon: ShieldAlert,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  activeRole,
  onChangeRole,
  isCollapsed,
}) => {
  return (
    <aside 
      className={`bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between transition-all duration-150 ease-in-out shrink-0 select-none ${
        isCollapsed ? 'w-16' : 'w-[220px]'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-14 flex items-center px-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-semibold text-base text-slate-900 tracking-tight block truncate">
                  UniVerse
                </span>
                <p className="text-[10px] text-slate-400 font-normal truncate">Campus Ecosystem</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-2.5 space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-1.5 text-[10px] font-medium tracking-wider text-slate-400 uppercase">
              Modules
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectModule(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon 
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`} 
                />

                {!isCollapsed && (
                  <span className="truncate text-left">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Simulated Persona Switcher */}
      <div className="p-2.5 border-t border-slate-100 space-y-2">
        {!isCollapsed && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-slate-400" />
                Demo Persona
              </span>
            </div>
            
            <div className="relative">
              <select
                value={activeRole}
                onChange={(e) => onChangeRole(e.target.value as UserRole)}
                className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="student">Student (Alex)</option>
                <option value="peer-mentor">Peer Mentor (Sarah)</option>
                <option value="transit-coordinator">Transit Coordinator</option>
                <option value="sustainability-analyst">Green IT Analyst</option>
                <option value="exam-proctor">Exam Proctor</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
