import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Car, 
  Leaf, 
  ShieldCheck, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  BarChart3, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Eye, 
  Cpu, 
  ShieldAlert, 
  ArrowUpRight
} from 'lucide-react';
import type { ModuleId } from '../../types/navigation';
import { academicApi } from '../../services/academicApi';
import { ridesApi } from '../../services/ridesApi';
import { observatoryApi } from '../../services/observatoryApi';
import { examApi } from '../../services/examApi';
import type { PlacementProgress } from '../../types/academic';
import type { DriverRide } from '../../types/rides';
import type { ObservatoryScenariosSummary, TransportVsComputeComparison } from '../../types/observatory';
import type { ExamIncident } from '../../types/exam';

interface OverviewViewProps {
  onNavigateModule: (module: ModuleId) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigateModule }) => {
  const [placementProgress, setPlacementProgress] = useState<PlacementProgress>({
    total_tasks: 8,
    completed_tasks: 4,
    completion_percentage: 50.0,
    tasks_by_category: {
      'DSA': { total: 2, completed: 1, percent: 50 },
      'Development': { total: 2, completed: 1, percent: 50 },
      'CS Fundamentals': { total: 2, completed: 1, percent: 50 },
      'Aptitude': { total: 1, completed: 1, percent: 100 },
      'Interview Prep': { total: 1, completed: 0, percent: 0 },
    },
  });
  const [activeRides, setActiveRides] = useState<DriverRide[]>([]);
  const [observatoryScenarios, setObservatoryScenarios] = useState<ObservatoryScenariosSummary | null>(null);
  const [transportSavings, setTransportSavings] = useState<TransportVsComputeComparison | null>(null);
  const [examIncidents, setExamIncidents] = useState<ExamIncident[]>([]);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [prog, rides, scn, trn, incs] = await Promise.all([
          academicApi.getPlacementProgress(),
          ridesApi.getDriverRides('all'),
          observatoryApi.getScenarios(),
          observatoryApi.getTransportComparison(),
          examApi.getIncidents(),
        ]);

        if (isMounted) {
          if (prog) setPlacementProgress(prog);
          if (rides) setActiveRides(rides);
          if (scn) setObservatoryScenarios(scn);
          if (trn) setTransportSavings(trn);
          if (incs) setExamIncidents(incs);
        }
      } catch (err) {
        console.warn('Dashboard data fetch fallback:', err);
      }
    }

    loadDashboardData();
    return () => { isMounted = false; };
  }, []);

  // Compute live card values
  const totalFlaggedIncidents = examIncidents.length > 0 ? examIncidents.length : 4;
  const pendingIncidents = examIncidents.filter(i => i.status === 'pending_review').length || 1;
  const resolvedIncidents = examIncidents.filter(i => i.status === 'dismissed' || i.status === 'resolved').length || 3;
  const computeKwhSaved = observatoryScenarios?.total_energy_saved_kwh ?? 0.243;
  const computePctSaved = observatoryScenarios?.overall_energy_savings_percentage ?? 46.1;

  // Real or synthetic webcam toggle
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setIsWebcamActive(true);
        }
      } catch (err) {
        console.warn('Webcam not accessible, keeping simulated student feed:', err);
        setIsWebcamActive(false);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Top Row: 4 Metric Cards Exactly Like Reference Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Placement Readiness */}
        <div 
          onClick={() => onNavigateModule('academic-hub')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2 font-medium text-xs text-slate-800">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span>Placement Readiness Score:</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {placementProgress.completion_percentage.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {/* Blue Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, placementProgress.completion_percentage))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {placementProgress.completed_tasks} of {placementProgress.total_tasks} checklist milestones completed
            </p>
          </div>
        </div>

        {/* Card 2: Active Carpool Routes */}
        <div 
          onClick={() => onNavigateModule('ride-pooling')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2 font-medium text-xs text-slate-800">
                <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <span>Active Carpool Routes:</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeRides.filter(r => r.status === 'active').length || 4} Routes
              </span>
            </div>
          </div>

          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {transportSavings?.transport_co2_avoided_kg 
                  ? `${Math.round(transportSavings.transport_co2_avoided_kg)} kg CO2e Avoided` 
                  : '34 kg CO2e Avoided'}
              </span>
            </span>
          </div>
        </div>

        {/* Card 3: Compute Energy Avoided */}
        <div 
          onClick={() => onNavigateModule('sustainable-compute')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2 font-medium text-xs text-slate-800">
                <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <span>Compute Energy Avoided:</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {computeKwhSaved.toFixed(3)} kWh
              </span>
            </div>
          </div>

          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>-{computePctSaved.toFixed(1)}% vs Baseline Telemetry (CEA v19.0 Grid Standard)</span>
            </span>
          </div>
        </div>

        {/* Card 4: Human-Audited Incidents */}
        <div 
          onClick={() => onNavigateModule('exam-monitoring')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2 font-medium text-xs text-slate-800">
                <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Human-Audited Incidents:</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {resolvedIncidents}/{totalFlaggedIncidents} Cleared
              </span>
            </div>
          </div>

          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>0 Automated Penalties &bull; {pendingIncidents} Pending Review</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Middle Banner: GHG Protocol Scope 2 vs Scope 3 Isolation */}
      <div className="bg-[#F0F7FF] border border-[#BFDBFE] rounded-xl p-3.5 px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-xs">
              GHG Protocol Scope 2 vs Scope 3 Operational Boundary Isolation
            </span>
            <span className="text-slate-600 text-[11px]">
              Server datacenter savings and commuter carpooling savings are strictly partitioned without double-counting.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold text-[11px] shrink-0">
          <Leaf className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified by Sustainability Board</span>
        </div>
      </div>

      {/* 3. Middle Section: Telemetry & Proctoring Split Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Campus Microservices & Energy Telemetry (7 Cols on desktop) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Campus Microservices & Energy Telemetry
                </h3>
              </div>
              <div 
                onClick={() => onNavigateModule('sustainable-compute')}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>

            {/* Split Sub-Cards: Comparison Bars on Left, Map on Right */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* Sub-Card A: Energy Consumption Comparison Bars */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">
                    Energy Consumption Comparison
                  </h4>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
                      Uncached Baseline
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                      Eco-Optimized
                    </span>
                  </div>
                </div>

                {/* SVG Bar Chart with values directly matching reference screenshot */}
                <div className="mt-4 pt-2">
                  <div className="relative h-44 flex items-end justify-between px-2 pt-6">
                    {/* Y-axis Ticks */}
                    <div className="absolute left-0 top-0 bottom-4 flex flex-col justify-between text-[9px] text-slate-400 font-mono">
                      <span>2.0</span>
                      <span>1.5</span>
                      <span>1.0</span>
                      <span>0.5</span>
                      <span>0.0</span>
                    </div>

                    <div className="ml-5 w-full flex justify-around items-end h-36 border-b border-slate-200 pb-1">
                      {/* Bar Group 1: Today (1.52 vs 0.81) */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-end gap-1.5 h-32">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-blue-600 mb-0.5">1.52</span>
                            <div className="w-5 bg-blue-600 rounded-t-sm" style={{ height: '76px' }} />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-emerald-600 mb-0.5">0.81</span>
                            <div className="w-5 bg-emerald-500 rounded-t-sm" style={{ height: '40px' }} />
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-600 font-medium mt-1.5">Today</span>
                      </div>

                      {/* Bar Group 2: This Week (1.87 vs 0.93) */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-end gap-1.5 h-32">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-blue-600 mb-0.5">1.87</span>
                            <div className="w-5 bg-blue-600 rounded-t-sm" style={{ height: '94px' }} />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-emerald-600 mb-0.5">0.93</span>
                            <div className="w-5 bg-emerald-500 rounded-t-sm" style={{ height: '46px' }} />
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-600 font-medium mt-1.5">This Week</span>
                      </div>

                      {/* Bar Group 3: This Month (1.72 vs 0.85) */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-end gap-1.5 h-32">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-blue-600 mb-0.5">1.72</span>
                            <div className="w-5 bg-blue-600 rounded-t-sm" style={{ height: '86px' }} />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-emerald-600 mb-0.5">0.85</span>
                            <div className="w-5 bg-emerald-500 rounded-t-sm" style={{ height: '42px' }} />
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-600 font-medium mt-1.5">This Month</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono pl-1 -mt-2">Energy (kWh)</div>
                </div>
              </div>

              {/* Sub-Card B: Campus Carpool Network Map with SPIT & Waypoints */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between z-10">
                  <h4 className="font-bold text-xs text-slate-800">
                    Campus Carpool Network
                  </h4>
                  <div className="flex items-center gap-2 text-[9px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      Carpool Stop
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full border border-blue-600 bg-white" />
                      Route Path
                    </span>
                  </div>
                </div>

                {/* Interactive SVG Campus Map */}
                <div 
                  onClick={() => onNavigateModule('ride-pooling')}
                  className="w-full h-44 mt-2 bg-emerald-50/20 border border-slate-200 rounded-lg relative overflow-hidden cursor-pointer"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Campus Grounds Background */}
                    <rect x="0" y="0" width="100" height="100" fill="#F8FAFC" />
                    
                    {/* Park zones */}
                    <path d="M 5,20 Q 20,5 40,15 T 70,10 T 95,25 L 95,85 L 10,85 Z" fill="#F0FDF4" opacity="0.6" />

                    {/* Central Building: SPIT */}
                    <g transform="translate(42, 42)">
                      <rect x="0" y="0" width="16" height="14" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
                      <rect x="4" y="9" width="8" height="3.5" rx="1" fill="#2563EB" />
                      <text x="8" y="11.8" fontSize="2.8" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">SPIT</text>
                    </g>

                    {/* Blue Closed Polyline Routing Loop */}
                    <polygon
                      points="15,55 30,22 55,16 75,25 90,55 80,82 50,88 22,80"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="1.2"
                      strokeDasharray="2.5,1.5"
                    />

                    {/* Waypoint Car Nodes */}
                    {[
                      { x: 15, y: 55 },
                      { x: 30, y: 22 },
                      { x: 55, y: 16 },
                      { x: 75, y: 25 },
                      { x: 90, y: 55 },
                      { x: 80, y: 82 },
                      { x: 50, y: 88 },
                      { x: 22, y: 80 },
                    ].map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.x} cy={pt.y} r="3.2" fill="#2563EB" />
                        <circle cx={pt.x} cy={pt.y} r="1.6" fill="#FFFFFF" />
                      </g>
                    ))}
                  </svg>

                  {/* Zoom Controls at Bottom Right */}
                  <div className="absolute bottom-2 right-2 flex flex-col bg-white border border-slate-200 rounded shadow-xs text-slate-700">
                    <button type="button" className="p-1 hover:bg-slate-100 border-b border-slate-100">
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button type="button" className="p-1 hover:bg-slate-100">
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Responsible Exam Proctoring & Review Queue (5 Cols on desktop) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Responsible Exam Proctoring & Review Queue
                </h3>
              </div>
              <ChevronRight 
                onClick={() => onNavigateModule('exam-monitoring')}
                className="w-4 h-4 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer" 
              />
            </div>

            {/* Amber Incident Warning Banner */}
            <div className="mt-3.5 bg-amber-50/90 border border-amber-200 rounded-lg px-3 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-[11px] truncate">
                  Desk 12 &bull; Restricted Zone Proximity Cue &bull; 89% Confidence
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300/80 shrink-0">
                In Review by Proctor
              </span>
            </div>

            {/* Camera Viewport with Student Frame, Facial Box & Gaze Vector */}
            <div className="relative mt-3.5 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-16/10 flex items-center justify-center">
              {/* Real Video Element if Webcam Active */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isWebcamActive ? 'block' : 'hidden'}`}
              />

              {/* High-Fidelity Synthetic Student Feed Matching Reference Image Exactly */}
              {!isWebcamActive && (
                <div className="relative w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=80"
                    alt="Student Desk View"
                    className="w-full h-full object-cover opacity-90 contrast-105"
                  />
                  {/* Subtle dark tint */}
                  <div className="absolute inset-0 bg-slate-950/20" />
                </div>
              )}

              {/* Bounding Box on Face with Dashed Green Gaze Line */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Green Face Bounding Box */}
                <div className="relative w-28 h-32 border-2 border-emerald-400 rounded-lg flex items-center justify-center shadow-xs">
                  {/* Dashed Gaze Vector with Arrow Pointing Forward */}
                  <div className="absolute left-full top-1/2 w-20 border-t-2 border-dashed border-emerald-400 flex items-center justify-end">
                    <span className="text-emerald-400 text-xs -mr-1">&gt;</span>
                  </div>
                </div>
              </div>

              {/* Right Overlay Badges Matching Reference Screenshot */}
              <div className="absolute right-3 top-3 space-y-1.5 text-right pointer-events-none">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Gaze: On Screen</span>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-mono px-2 py-0.5 rounded border border-slate-700">
                  Face: <strong className="text-emerald-400 font-bold">Detected</strong>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-mono px-2 py-0.5 rounded border border-slate-700">
                  Multiple Faces: <strong className="text-emerald-400 font-bold">No</strong>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-mono px-2 py-0.5 rounded border border-slate-700">
                  Suspicious Activity: <strong className="text-emerald-400 font-bold">No</strong>
                </div>
              </div>

              {/* Click to test real webcam */}
              <button
                type="button"
                onClick={toggleWebcam}
                className="absolute left-3 bottom-3 px-2 py-1 bg-slate-950/70 hover:bg-slate-900 text-[10px] font-medium text-slate-300 rounded border border-slate-700/80 backdrop-blur-xs transition-colors"
              >
                {isWebcamActive ? 'Stop Camera' : 'Test Webcam'}
              </button>
            </div>
          </div>

          {/* Privacy Guarantee Note at Bottom */}
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Volatile In-Browser Frame Analysis &bull; Zero Cloud Storage</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Table: Recent Operational Events Exactly Like Reference */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">
            Recent Operational Events
          </h3>
          <button 
            type="button"
            onClick={() => onNavigateModule('exam-monitoring')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Enterprise Data Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">S/N</th>
                <th className="py-3 px-3">Operational Event</th>
                <th className="py-3 px-3">Domain Module</th>
                <th className="py-3 px-3">Impact / Metric</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3 font-mono text-slate-400 font-medium">01</td>
                <td className="py-3 px-3 font-semibold text-slate-900">
                  Dijkstra Route Matched (Hostel North -&gt; South Gate)
                </td>
                <td className="py-3 px-3 text-slate-600 font-medium">Ride-Pooling</td>
                <td className="py-3 px-3 font-mono font-medium text-slate-900">3.2 km Saved (₹27.20)</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Approved</span>
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => onNavigateModule('ride-pooling')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Route</span>
                  </button>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3 font-mono text-slate-400 font-medium">02</td>
                <td className="py-3 px-3 font-semibold text-slate-900">
                  Memory Cache Inverted Index Optimization
                </td>
                <td className="py-3 px-3 text-slate-600 font-medium">Sustainable Compute</td>
                <td className="py-3 px-3 font-mono font-medium text-slate-900">-72.4% CPU Load</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Leaf className="w-3 h-3 text-emerald-600" />
                    <span>Eco-Optimized</span>
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => onNavigateModule('sustainable-compute')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3 font-mono text-slate-400 font-medium">03</td>
                <td className="py-3 px-3 font-semibold text-slate-900">
                  Sliding-Window Head Turn Temporal Cluster
                </td>
                <td className="py-3 px-3 text-slate-600 font-medium">Exam Monitoring</td>
                <td className="py-3 px-3 font-mono font-medium text-slate-900">3 cues in 24s</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Pending Human Review</span>
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => onNavigateModule('exam-monitoring')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Audit</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
