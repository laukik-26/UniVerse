import React from 'react';
import { 
  GraduationCap, 
  Car, 
  Leaf, 
  HeartPulse, 
  ShieldAlert, 
  ArrowLeft,
  CheckCircle2,
  Database,
  Cpu
} from 'lucide-react';
import type { ModuleId } from '../../types/navigation';

interface ModuleFoundationViewProps {
  moduleId: ModuleId;
  onBackToOverview: () => void;
}

interface ModuleMeta {
  title: string;
  badge: string;
  phase: string;
  icon: React.ElementType;
  iconBg: string;
  iconText: string;
  description: string;
  keyAlgorithms: string[];
  plannedEntities: string[];
  ethicalSafeguards: string;
  sampleStatus: { label: string; value: string; badge: string };
}

const moduleDetails: Record<Exclude<ModuleId, 'overview'>, ModuleMeta> = {
  'academic-hub': {
    title: 'Student Intelligence & Academic Hub',
    badge: 'Module A',
    phase: 'Phase 2 (Next Milestone)',
    icon: GraduationCap,
    iconBg: 'bg-orange-50',
    iconText: 'text-orange-600',
    description: 'Centralized student placement readiness scoring, peer mentorship discovery, and curated academic resource repository.',
    keyAlgorithms: [
      'Placement Readiness Index (Weighted skill assessment + project portfolio + mock interview results)',
      'Mentor Compatibility Matcher (Specialization matrix, mutual availability time slots)',
      'Search & Tag Inverted Index for academic papers, lecture notes, and question banks'
    ],
    plannedEntities: [
      'StudentProfile (skills, placement goals, verified scores)',
      'PeerMentor (specializations, capacity, open office hours)',
      'AcademicResource (subject tags, download metrics, peer ratings)'
    ],
    ethicalSafeguards: 'Placement analytics empower students with transparent growth feedback without ranking bias.',
    sampleStatus: { label: 'Placement Readiness Pipeline', value: 'Ready for Phase 2 Scaffolding', badge: 'Active Spec' }
  },
  'ride-pooling': {
    title: 'Smart Campus Ride-Pooling',
    badge: 'Module B',
    phase: 'Phase 3 Milestone',
    icon: Car,
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-600',
    description: 'Graph-based campus route pooling connecting drivers and passenger students while optimizing detours and carbon savings.',
    keyAlgorithms: [
      'Campus Road Network Adjacency Graph with weighted edge traversal times',
      'Greedy / Dijkstra Route Compatibility Matcher with max detour constraint (delta ≤ 1.5 km)',
      'Vehicle-Kilometers-Travelled (VKT) reduction & EPA emission factor calculation'
    ],
    plannedEntities: [
      'CampusNode (hostels, engineering blocks, library, sports complex)',
      'RideOffer (driver, origin, destination, seats, time window)',
      'CarpoolMatch (shared itinerary, estimated detour % and carbon saved)'
    ],
    ethicalSafeguards: 'Campus verified identity tokens for rider safety and transparent detour acceptance.',
    sampleStatus: { label: 'Campus Graph Schema', value: '12 Node Adjacency Topology Defined', badge: 'Validated' }
  },
  'sustainable-compute': {
    title: 'Sustainable Computing Observatory',
    badge: 'Module C',
    phase: 'Phase 4 Milestone',
    icon: Leaf,
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-700',
    description: 'Live observability into campus microservices workload telemetry, estimated power draw, and grid carbon emissions.',
    keyAlgorithms: [
      'Synthetic Workload Generator simulating request bursts and CPU/RAM load curves',
      'SPECpower / Server TDP Energy Estimation Model: P = P_idle + (P_peak - P_idle) * U_cpu',
      'Marginal Grid Carbon Intensity factor (gCO2e/kWh) with baseline vs eco-optimized comparison'
    ],
    plannedEntities: [
      'CampusMicroservice (LMS Portal, Auth Service, Media Streamer)',
      'TelemetrySnapshot (timestamp, RPS, latency ms, CPU %)',
      'EnergyAuditRecord (Joules, kWh, carbon offset grams)'
    ],
    ethicalSafeguards: 'Strictly documented estimation formulas avoiding greenwashing or unverified carbon claims.',
    sampleStatus: { label: 'Service Simulation Engine', value: '3 Workload Profiles Configured', badge: 'Calibrated' }
  },
  'digital-wellbeing': {
    title: 'Privacy-Aware Digital Wellbeing',
    badge: 'Module D',
    phase: 'Phase 5 Milestone',
    icon: HeartPulse,
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
    description: 'Voluntary student focus sessions with local heuristic domain categorization and total data sovereignty controls.',
    keyAlgorithms: [
      'Client-Side Focus Session Timer with state transitions (Active, Paused, Concluded)',
      'Privacy-Preserving Domain Categorizer (Local regex/hash matching without storing full URLs)',
      'Context Switch Frequency & Distraction Time Ratio Calculator'
    ],
    plannedEntities: [
      'FocusSession (duration, user notes, category allocations)',
      'LocalCategoryRule (educational vs leisure domain tags)',
      'PrivacyAuditRecord (Inspectable raw logs, purge timestamp)'
    ],
    ethicalSafeguards: 'Strictly client-side execution; zero keystroke or page content harvesting; one-click local log purge.',
    sampleStatus: { label: 'Privacy Controller', value: 'Pause, Inspect & Purge Hooks Built', badge: 'Privacy-Safe' }
  },
  'exam-monitoring': {
    title: 'Responsible Examination Monitoring',
    badge: 'Module E',
    phase: 'Phase 6 Milestone',
    icon: ShieldAlert,
    iconBg: 'bg-indigo-50',
    iconText: 'text-indigo-600',
    description: 'Controlled proctor stream processing detecting physical anomalies for human verification without automated penalties.',
    keyAlgorithms: [
      'Observable Event Trigger (Head pose yaw/pitch deviation sustained > 3.0s)',
      'Restricted Boundary Intrusion (Secondary person or banned physical item bounding box)',
      'Proctor Incident Prioritization Queue with timestamped confidence weights'
    ],
    plannedEntities: [
      'ExamSession (candidate token, authorized webcam feed, start time)',
      'ObservableIncident (timestamp, event type, model confidence score, snapshot clip)',
      'ProctorReviewDecision (human notes, dismiss / confirm, timestamp)'
    ],
    ethicalSafeguards: 'Strict prohibition on automated misconduct declaration; all flags are advisory for human proctor audit.',
    sampleStatus: { label: 'Human Review Protocol', value: 'Zero-Automated-Penalty Enforcement', badge: 'Audited' }
  }
};

export const ModuleFoundationView: React.FC<ModuleFoundationViewProps> = ({
  moduleId,
  onBackToOverview,
}) => {
  if (moduleId === 'overview') return null;

  const meta = moduleDetails[moduleId];
  const Icon = meta.icon;

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToOverview}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Overview
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-slate-400">Status:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            {meta.phase}
          </span>
        </div>
      </div>

      {/* Main Module Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${meta.iconBg} ${meta.iconText}`}>
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {meta.badge}
                </span>
                <span className="text-xs text-slate-400 font-medium">UniVerse Integrated Module</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {meta.title}
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                {meta.description}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-right shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">
              {meta.sampleStatus.label}
            </span>
            <span className="text-sm font-bold text-slate-900 block mt-0.5">
              {meta.sampleStatus.value}
            </span>
            <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {meta.sampleStatus.badge}
            </span>
          </div>
        </div>
      </div>

      {/* Architecture & Algorithmic Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Core Algorithms */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Key Computational Algorithms</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {meta.keyAlgorithms.map((algo, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                  0{idx + 1}
                </span>
                <span className="leading-relaxed">{algo}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Planned Data Schemas */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Target Data Models & Interfaces</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {meta.plannedEntities.map((entity, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                  E{idx + 1}
                </span>
                <span className="font-mono text-slate-800">{entity}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ethical & Regulatory Governance Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Ethical Safeguards & Compliance Assurance</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {meta.ethicalSafeguards}
            </p>
            <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                No unconsented data capture
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Honest simulation indicators
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Human-in-the-loop review guarantee
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
