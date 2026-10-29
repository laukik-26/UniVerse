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
  badge?: string;
  icon: React.ElementType;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Ecosystem Telemetry',
  },
  {
    id: 'academic-hub',
    label: 'Academic Hub',
    badge: 'Mod A',
    icon: GraduationCap,
    description: 'Placement & Resources',
  },
  {
    id: 'ride-pooling',
    label: 'Ride-Pooling',
    badge: 'Mod B',
    icon: Car,
    description: 'Graph Route Matching',
  },
  {
    id: 'sustainable-compute',
    label: 'Eco Observatory',
    badge: 'Mod C',
    icon: Leaf,
    description: 'Energy & Carbon Models',
  },
  {
    id: 'digital-wellbeing',
    label: 'Digital Wellbeing',
    badge: 'Mod D',
    icon: HeartPulse,
    description: 'Privacy Focus Analytics',
  },
  {
    id: 'exam-monitoring',
    label: 'Exam Proctoring',
    badge: 'Mod E',
    icon: ShieldAlert,
    description: 'Responsible CV Review',
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
      className={`bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                  UniVerse
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded border border-blue-200">
                    MVP
                  </span>
                </span>
                <p className="text-[11px] text-slate-400 font-medium">Campus Ecosystem</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Core Modules
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon 
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`} 
                />

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate text-left">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                        isActive 
                          ? 'bg-blue-100/70 text-blue-800 border-blue-200' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom User Role Switcher & Eco Status */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {!isCollapsed && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                Active Persona
              </span>
            </div>
            
            <div className="relative">
              <select
                value={activeRole}
                onChange={(e) => onChangeRole(e.target.value as UserRole)}
                className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="student">Student (Alex Rivera)</option>
                <option value="peer-mentor">Peer Mentor (Sarah Lin)</option>
                <option value="transit-coordinator">Transit Coordinator</option>
                <option value="sustainability-analyst">Green IT Analyst</option>
                <option value="exam-proctor">Exam Proctor / Auditor</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        )}

        {!isCollapsed && (
          <div className="px-2 py-1 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              PUE 1.14 Eco Mode
            </span>
            <span className="font-mono text-[10px]">v0.1.0-alpha</span>
          </div>
        )}
      </div>
    </aside>
  );
};
