import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Search, 
  Compass, 
  Leaf 
} from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
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

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Smart Campus Ride-Pooling"
        subtitle="Graph-optimized campus commuting connecting drivers and riders with transparent detour and carbon tracking."
      />

      {/* 2. Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('passenger')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'passenger'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Find a ride</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('driver')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'driver'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Driver dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'map'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Campus road graph</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('savings')}
            className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ${
              activeTab === 'savings'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span>Mobility carbon savings</span>
          </button>
        </nav>
      </div>

      {/* 3. Render Active Tab View */}
      {activeTab === 'passenger' && (
        <PassengerSearchSection
          locations={locations}
          onSelectRoute={handleSelectRoute}
          onActivityLogged={onActivityLogged}
        />
      )}

      {activeTab === 'driver' && (
        <DriverRidesSection
          locations={locations}
          onSelectRoute={handleSelectRoute}
          onActivityLogged={onActivityLogged}
        />
      )}

      {activeTab === 'map' && (
        <div className="space-y-4">
          <CampusGraphMap
            locations={locations}
            highlightedPath={highlightedPath}
            activeOrigin={activeOrigin}
            activeDestination={activeDest}
          />
        </div>
      )}

      {activeTab === 'savings' && (
        <TransportSavingsSummaryCard
          savings={savings ?? {
            total_rides_offered: 4,
            active_rides_count: 2,
            total_carpools_completed: 3,
            total_saved_vkt_km: 19.2,
            total_cost_saved_inr: 134.4,
            total_co2_avoided_kg: 2.304,
            assumed_cost_per_km_inr: 7.0,
            assumed_emission_factor_g_km: 120.0,
            methodology_note: 'Avoided passenger vehicle-km multiplied by standard emission factors.',
          }}
        />
      )}
    </div>
  );
};
