import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Search, 
  Plus, 
  Compass, 
  Leaf 
} from 'lucide-react';
import { CampusGraphMap } from './CampusGraphMap';
import { DriverRidesSection } from './DriverRidesSection';
import { PassengerSearchSection } from './PassengerSearchSection';
import { TransportSavingsSummaryCard } from './TransportSavingsSummaryCard';
import type { CampusLocation, TransportSavingsSummary } from '../../types/rides';
import { ridesApi } from '../../services/ridesApi';

interface RidePoolingViewProps {
  onActivityLogged?: (title: string, type: 'info' | 'success' | 'warning') => void;
}

type RideTab = 'passenger' | 'driver' | 'map' | 'savings';

export const RidePoolingView: React.FC<RidePoolingViewProps> = ({
  onActivityLogged,
}) => {
  const [activeTab, setActiveTab] = useState<RideTab>('passenger');
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [savings, setSavings] = useState<TransportSavingsSummary | null>(null);

  // Map state for tracing active routes
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [activeOrigin, setActiveOrigin] = useState<string>('node-main-gate');
  const [activeDest, setActiveDest] = useState<string>('node-south-gate');

  const loadInitialData = async () => {
    try {
      const [locs, sav] = await Promise.all([
        ridesApi.getLocations(),
        ridesApi.getTransportSavings(),
      ]);
      setLocations(locs);
      setSavings(sav);
    } catch (err) {
      console.error('Failed to load ride pooling data', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectRoute = (path: string[], origin: string, dest: string) => {
    setHighlightedPath(path);
    setActiveOrigin(origin);
    setActiveDest(dest);
  };

  const handleRefreshSavings = () => {
    ridesApi.getTransportSavings().then(res => setSavings(res));
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header matching established enterprise style */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Module B
                </span>
                <span className="text-xs text-slate-400 font-medium">Smart Mobility Ecosystem</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                Smart Campus Ride-Pooling
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Graph-optimized campus commuting connecting drivers and riders with transparent detour and carbon tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Dijkstra Status:</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Deterministic Routing Online
            </span>
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-100 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('passenger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'passenger'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4" />
            Find a Carpool (Passenger)
          </button>

          <button
            onClick={() => setActiveTab('driver')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'driver'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            Offerings & Driver Routes
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            Campus Road Graph & Visualizer
          </button>

          <button
            onClick={() => setActiveTab('savings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'savings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Leaf className="w-4 h-4" />
            Sustainability Observatory
          </button>
        </div>
      </div>

      {/* 3. Interactive Map (Shown alongside search or in full tab) */}
      {(activeTab === 'map' || activeTab === 'passenger' || activeTab === 'driver') && (
        <CampusGraphMap
          locations={locations}
          highlightedPath={highlightedPath}
          activeOrigin={activeOrigin}
          activeDestination={activeDest}
        />
      )}

      {/* 4. Tab Views */}
      {activeTab === 'passenger' && (
        <PassengerSearchSection
          locations={locations}
          onSelectRoute={handleSelectRoute}
          onActivityLogged={onActivityLogged}
          onCarpoolConfirmed={handleRefreshSavings}
        />
      )}

      {activeTab === 'driver' && (
        <DriverRidesSection
          locations={locations}
          onSelectRoute={handleSelectRoute}
          onActivityLogged={onActivityLogged}
        />
      )}

      {activeTab === 'savings' && savings && (
        <TransportSavingsSummaryCard savings={savings} />
      )}
    </div>
  );
};
