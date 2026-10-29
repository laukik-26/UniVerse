import React from 'react';
import { 
  GraduationCap, 
  Car, 
  Leaf, 
  ShieldCheck, 
  MoreVertical, 
  ArrowUpRight 
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import type { ModuleId } from '../../types/navigation';

interface OverviewViewProps {
  onNavigateModule: (module: ModuleId) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigateModule }) => {
  return (
    <div className="space-y-6">
      {/* 1. Top Row: 4 Metric Cards matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Academic Resources"
          value="1,248"
          deltaText="14% more than last term"
          deltaType="positive"
          icon={GraduationCap}
          iconBgColor="bg-orange-50"
          iconTextColor="text-orange-600"
          subtitle="Mod A"
          onClick={() => onNavigateModule('academic-hub')}
        />
        <MetricCard
          label="Active Carpool Requests"
          value="342"
          deltaText="8.4% more than last week"
          deltaType="positive"
          icon={Car}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
          subtitle="Mod B"
          onClick={() => onNavigateModule('ride-pooling')}
        />
        <MetricCard
          label="Eco Compute Energy Saved"
          value="3.42 kWh"
          deltaText="28% below baseline"
          deltaType="eco"
          icon={Leaf}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-700"
          subtitle="Mod C"
          onClick={() => onNavigateModule('sustainable-compute')}
        />
        <MetricCard
          label="Human-Audited Incidents"
          value="100%"
          deltaText="0 automated penalties"
          deltaType="neutral"
          icon={ShieldCheck}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
          subtitle="Mod D & E"
          onClick={() => onNavigateModule('exam-monitoring')}
        />
      </div>

      {/* 2. Middle Row: 3 Visual Analysis Cards (Ring, Stacked Bars, Gradient Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Concentric Doughnut Progress Ring (Screenshot: Staff applications card) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Ecosystem Health Card</h3>
              <p className="text-xs text-slate-500 font-medium">Cross-module operational loads</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Concentric Rings Visualizer */}
          <div className="relative py-4 flex flex-col items-center justify-center">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">
              {/* Outer Ring: Academic Hub (Blue) */}
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="#EEF2F6"
                strokeWidth="10"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="#6366F1"
                strokeWidth="10"
                strokeDasharray="427"
                strokeDashoffset="120"
                strokeLinecap="round"
              />

              {/* Middle Ring: Ride Matches (Orange) */}
              <circle
                cx="80"
                cy="80"
                r="52"
                fill="none"
                stroke="#F8FAFC"
                strokeWidth="10"
              />
              <circle
                cx="80"
                cy="80"
                r="52"
                fill="none"
                stroke="#F97316"
                strokeWidth="10"
                strokeDasharray="326"
                strokeDashoffset="100"
                strokeLinecap="round"
              />

              {/* Inner Ring: Eco Compute (Emerald) */}
              <circle
                cx="80"
                cy="80"
                r="36"
                fill="none"
                stroke="#F8FAFC"
                strokeWidth="10"
              />
              <circle
                cx="80"
                cy="80"
                r="36"
                fill="none"
                stroke="#10B981"
                strokeWidth="10"
                strokeDasharray="226"
                strokeDashoffset="70"
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 leading-tight">480</span>
              <span className="text-[11px] font-medium text-slate-500">Total Activities</span>
            </div>
          </div>

          {/* Ring Legend matching screenshot */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="border-l-2 border-indigo-500 pl-2 text-left">
              <span className="text-sm font-bold text-slate-900 block">210</span>
              <span className="text-[11px] text-slate-500">Hub Sessions</span>
            </div>
            <div className="border-l-2 border-orange-500 pl-2 text-left">
              <span className="text-sm font-bold text-slate-900 block">180</span>
              <span className="text-[11px] text-slate-500">Rides Shared</span>
            </div>
            <div className="border-l-2 border-emerald-500 pl-2 text-left">
              <span className="text-sm font-bold text-slate-900 block">90</span>
              <span className="text-[11px] text-slate-500">Eco Batches</span>
            </div>
          </div>
        </div>

        {/* Card 2: Stacked Multi-Bar Chart (Screenshot: Annual payroll summary) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Campus Energy & Commute</h3>
              <p className="text-xs text-slate-500 font-medium">Weekly baseline vs optimized impact</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 flex items-end justify-between gap-3 px-2 pt-4">
            {[
              { label: '30 Sep', bar1: 35, bar2: 25, bar3: 15 },
              { label: '10 Oct', bar1: 45, bar2: 20, bar3: 20 },
              { label: '20 Oct', bar1: 30, bar2: 15, bar3: 18 },
              { label: '30 Oct', bar1: 50, bar2: 22, bar3: 25 },
              { label: '10 Nov', bar1: 42, bar2: 20, bar3: 22 },
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full max-w-[22px] flex flex-col items-center gap-0.5">
                  {/* Top segment: Eco Savings (Yellow/Gold) */}
                  <div 
                    className="w-full bg-amber-400 rounded-t-sm" 
                    style={{ height: `${col.bar3}px` }} 
                    title={`Savings: ${col.bar3} kWh`}
                  />
                  {/* Middle segment: Commute Energy (Orange/Red) */}
                  <div 
                    className="w-full bg-rose-500" 
                    style={{ height: `${col.bar2}px` }} 
                    title={`Commute: ${col.bar2} kWh`}
                  />
                  {/* Bottom segment: Server Baseline (Indigo) */}
                  <div 
                    className="w-full bg-indigo-600 rounded-b-sm" 
                    style={{ height: `${col.bar1 * 2}px` }} 
                    title={`Baseline: ${col.bar1} kWh`}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{col.label}</span>
              </div>
            ))}
          </div>

          {/* Bar Legend matching screenshot */}
          <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-100 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600"></span>
              Server Baseline
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
              Commute Load
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
              Eco Offset
            </span>
          </div>
        </div>

        {/* Card 3: Gradient Area Curve (Screenshot: Total income) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Carbon Avoidance Curve</h3>
              <div className="mt-1">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">1,420 kg CO₂e</span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  24% vs last month
                </span>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Area Chart SVG with Pinpoint Callout */}
          <div className="relative py-2">
            <svg className="w-full h-36 overflow-visible" viewBox="0 0 240 100">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Shaded Area */}
              <path
                d="M 10 90 Q 70 85, 120 70 T 230 15 L 230 90 L 10 90 Z"
                fill="url(#areaGradient)"
              />

              {/* Smooth Trend Line */}
              <path
                d="M 10 90 Q 70 85, 120 70 T 230 15"
                fill="none"
                stroke="#6366F1"
                strokeWidth="2.5"
              />

              {/* Pinpoint Indicator Callout (Screenshot $3,400,849 pill style) */}
              <line x1="175" y1="36" x2="175" y2="90" stroke="#EF4444" strokeDasharray="3,3" strokeWidth="1.5" />
              <circle cx="175" cy="36" r="4.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            {/* Pinpoint Tooltip Badge */}
            <div className="absolute top-4 left-[58%] -translate-x-1/2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              1,120 kg CO₂
            </div>
          </div>

          {/* Bottom Time Axis */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            <span>30 Sep</span>
            <span>10 Oct</span>
            <span>20 Oct</span>
            <span>30 Oct</span>
            <span>10 Nov</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: 2 Enterprise Data Tables matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Table 1: Cross-Module Operations Stream */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Active Campus Workflow Queue</h3>
              <p className="text-xs text-slate-500">Live pooling requests and mentor pairings</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-2.5 px-4 w-12">S/N</th>
                  <th className="py-2.5 px-4">Subject / Activity</th>
                  <th className="py-2.5 px-4">Module</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono text-slate-400">01</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    Hostel Block B &rarr; Tech Park Pool (Detour 0.8km)
                  </td>
                  <td className="py-3 px-4 text-slate-500">Ride-Pooling</td>
                  <td className="py-3 px-4 text-slate-500">29/10/2026</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Pending
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono text-slate-400">02</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    Peer Mentorship: Distributed Systems Prep
                  </td>
                  <td className="py-3 px-4 text-slate-500">Academic Hub</td>
                  <td className="py-3 px-4 text-slate-500">28/10/2026</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Approved
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono text-slate-400">03</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    LMS Microservice Dynamic Eco-Scale
                  </td>
                  <td className="py-3 px-4 text-slate-500">Eco-Observatory</td>
                  <td className="py-3 px-4 text-slate-500">28/10/2026</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Approved
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono text-slate-400">04</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    Library Focus Block (Client Heuristics)
                  </td>
                  <td className="py-3 px-4 text-slate-500">Wellbeing</td>
                  <td className="py-3 px-4 text-slate-500">27/10/2026</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Completed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Responsible Governance & Verification Log */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Responsible Audit & Governance Log</h3>
              <p className="text-xs text-slate-500">Human-in-the-loop validation & privacy records</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-2.5 px-4 w-12">S/N</th>
                  <th className="py-2.5 px-4">Audit Record</th>
                  <th className="py-2.5 px-4">Safeguard Policy</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4 text-right">Human Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono text-slate-400">01</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    EXAM-2026-091 &bull; Desk Boundary Shift
                  </td>
                  <td className="py-3 px-4 text-slate-500">Non-punitive human check</td>
                  <td className="py-3 px-4 text-slate-500">29/10/2026 14:22</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      In Review
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono text-slate-400">02</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    WELLBEING-PRIV-14 &bull; Client Log Purge
                  </td>
                  <td className="py-3 px-4 text-slate-500">Local data sovereignty</td>
                  <td className="py-3 px-4 text-slate-500">28/10/2026 18:05</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Purged
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono text-slate-400">03</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    EXAM-2026-088 &bull; Head Pose Deviation
                  </td>
                  <td className="py-3 px-4 text-slate-500">Proctor review concluded</td>
                  <td className="py-3 px-4 text-slate-500">27/10/2026 11:30</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      Dismissed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono text-slate-400">04</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    OBSERVATORY-EST-05 &bull; Carbon Factor Audit
                  </td>
                  <td className="py-3 px-4 text-slate-500">Documented grid factor</td>
                  <td className="py-3 px-4 text-slate-500">26/10/2026 09:15</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
