import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Leaf, 
  Coins, 
  Car, 
  ChevronDown, 
  ChevronUp, 
  Info 
} from 'lucide-react';
import type { 
  CampusLocation, 
  RideSearchResult, 
  MatchCandidate 
} from '../../types/rides';
import { ridesApi } from '../../services/ridesApi';

interface PassengerSearchSectionProps {
  locations: CampusLocation[];
  onSelectRoute?: (path: string[], origin: string, dest: string) => void;
  onActivityLogged?: (title: string, type: 'info' | 'success' | 'warning') => void;
  onCarpoolConfirmed?: () => void;
}

export const PassengerSearchSection: React.FC<PassengerSearchSectionProps> = ({
  locations,
  onSelectRoute,
  onActivityLogged,
  onCarpoolConfirmed,
}) => {
  // Search criteria
  const [pickupId, setPickupId] = useState('node-hostel-north');
  const [dropoffId, setDropoffId] = useState('node-south-gate');
  const [preferredTime, setPreferredTime] = useState('08:35');
  const [timeFlexibility, setTimeFlexibility] = useState(15);
  const [seatsNeeded, setSeatsNeeded] = useState(1);
  const [maxDetourKm, setMaxDetourKm] = useState(2.0);

  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<RideSearchResult | null>(null);
  const [searchError, setSearchError] = useState('');

  // Booking states
  const [bookingRideId, setBookingRideId] = useState<string | null>(null);
  const [bookedSuccess, setBookedSuccess] = useState<string | null>(null);

  // Diagnostics toggle
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pickupId === dropoffId) {
      setSearchError('Pickup and drop-off cannot be the same campus location.');
      return;
    }

    try {
      setSearching(true);
      setSearchError('');
      setBookedSuccess(null);

      const result = await ridesApi.searchRideMatches({
        pickup_id: pickupId,
        dropoff_id: dropoffId,
        preferred_time: preferredTime,
        time_flexibility_mins: timeFlexibility,
        seats_needed: seatsNeeded,
        max_detour_km: maxDetourKm,
      });

      setSearchResult(result);
    } catch (err: any) {
      setSearchError(err.message || 'Ride search failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleConfirmPool = async (match: MatchCandidate) => {
    try {
      setBookingRideId(match.ride_id);
      await ridesApi.confirmCarpoolMatch(match.ride_id);

      setBookedSuccess(
        `Carpool successfully booked with ${match.driver_name}! You saved ${match.net_saved_distance_km} km of travel (₹${match.estimated_cost_savings_inr} cost offset).`
      );

      if (onActivityLogged) {
        onActivityLogged(
          `Carpool booked with ${match.driver_name}: ${match.net_saved_distance_km} km avoided, ₹${match.estimated_cost_savings_inr} saved`,
          'success'
        );
      }

      if (onCarpoolConfirmed) {
        onCarpoolConfirmed();
      }
    } catch (err: any) {
      setSearchError(err.message || 'Failed to confirm carpool.');
    } finally {
      setBookingRideId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Passenger Search Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-slate-900 text-base">Find a Compatible Campus Carpool</h3>
          <p className="text-xs text-slate-500">
            Dijkstra-optimized graph routing matching student passengers with drivers along your path.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4 text-xs">
          {searchError && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Locations Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Your Pickup Location *
              </label>
              <select
                value={pickupId}
                onChange={(e) => setPickupId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Your Drop-Off Destination *
              </label>
              <select
                value={dropoffId}
                onChange={(e) => setDropoffId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule & Constraints */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Preferred Time
              </label>
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Time Window (&plusmn; mins)
              </label>
              <select
                value={timeFlexibility}
                onChange={(e) => setTimeFlexibility(parseInt(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value={5}>&plusmn; 5 minutes</option>
                <option value={15}>&plusmn; 15 minutes</option>
                <option value={30}>&plusmn; 30 minutes</option>
                <option value={60}>&plusmn; 60 minutes</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Passengers (Seats)
              </label>
              <input
                type="number"
                min={1}
                max={4}
                value={seatsNeeded}
                onChange={(e) => setSeatsNeeded(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Max Detour Tolerance
              </label>
              <select
                value={maxDetourKm}
                onChange={(e) => setMaxDetourKm(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value={1.0}>Strict (&le; 1.0 km)</option>
                <option value={2.0}>Moderate (&le; 2.0 km)</option>
                <option value={3.5}>Flexible (&le; 3.5 km)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Matches are ranked deterministically: smallest additional detour first, then closest departure schedule.
            </span>
            <button
              type="submit"
              disabled={searching}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              {searching ? 'Computing Routes...' : 'Search Compatible Carpools'}
            </button>
          </div>
        </form>
      </div>

      {/* Booking Success Banner */}
      {bookedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Booking Confirmed!</span>
              <p className="mt-0.5 leading-relaxed">{bookedSuccess}</p>
            </div>
          </div>
          <button
            onClick={() => setBookedSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Search Results Section */}
      {searchResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Search Results: {searchResult.matches_count} Compatible Match{searchResult.matches_count !== 1 ? 'es' : ''} Found
              </h4>
              <p className="text-xs text-slate-500">
                Direct trip distance: <span className="font-mono font-semibold text-slate-700">{searchResult.passenger_direct_distance_km} km</span>
              </p>
            </div>

            {searchResult.rejected_candidates.length > 0 && (
              <button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg cursor-pointer"
              >
                <span>Diagnostics ({searchResult.rejected_candidates.length} Incompatible)</span>
                {showDiagnostics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Compatible Match Cards */}
          {searchResult.compatible_matches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              <Car className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span className="font-bold text-slate-800 block text-sm">No Compatible Rides Found</span>
              <p className="mt-1 max-w-md mx-auto text-slate-400">
                No active driver routes matched your pickup, drop-off, and schedule window within the specified detour constraint.
                Try widening your time flexibility or detour limit.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResult.compatible_matches.map((match) => {
                return (
                  <div
                    key={match.ride_id}
                    onClick={() => onSelectRoute && onSelectRoute(match.shared_path_nodes, pickupId, dropoffId)}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:border-blue-300 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Driver & Match Score */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-base">{match.driver_name}</span>
                          <span className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                            {match.match_score}% Match Score
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Departs {match.departure_time} (&plusmn;{match.time_difference_mins}m)
                          </span>
                        </div>

                        {/* Itinerary Sequence */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <span className="text-slate-400">Order:</span>
                          <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                            Driver Orig
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                            Pickup
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                            Drop-off
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                            Driver Dest
                          </span>
                        </div>

                        {/* Route Distance Comparison */}
                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                          <span>
                            Driver Direct: <strong className="text-slate-800">{match.driver_direct_distance_km} km</strong>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Shared Route: <strong className="text-slate-800">{match.shared_distance_km} km</strong>
                          </span>
                          <span>&bull;</span>
                          <span className="text-blue-700 font-semibold">
                            Detour: +{match.detour_km} km
                          </span>
                        </div>
                      </div>

                      {/* Savings & Booking Action */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                        {/* Micro Savings Box */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5 text-amber-500" />
                              Travel Cost Saved:
                            </span>
                            <span className="font-bold text-slate-900 font-mono">
                              ₹{match.estimated_cost_savings_inr}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                              Avoided CO₂e:
                            </span>
                            <span className="font-bold text-emerald-700 font-mono">
                              {match.estimated_co2_avoided_kg} kg
                            </span>
                          </div>
                        </div>

                        {/* Booking Button */}
                        <button
                          onClick={() => handleConfirmPool(match)}
                          disabled={bookingRideId === match.ride_id}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {bookingRideId === match.ride_id ? 'Confirming...' : 'Confirm & Book Pool'}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      {match.methodology_disclaimer}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rejection Diagnostics Accordion */}
          {showDiagnostics && searchResult.rejected_candidates.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Info className="w-4 h-4 text-slate-500" />
                <span>Incompatible Routes Diagnostic Log</span>
              </div>
              <p className="text-[11px] text-slate-500">
                The following active rides were evaluated by the matching algorithm but failed one or more compatibility gates:
              </p>

              <div className="divide-y divide-slate-200/60 pt-1">
                {searchResult.rejected_candidates.map((rej, idx) => (
                  <div key={idx} className="py-2 flex items-start justify-between gap-3">
                    <div>
                      <span className="font-semibold text-slate-800">{rej.driver_name}</span>
                      <span className="text-slate-500 text-[11px] ml-2">Departs {rej.departure_time}</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">{rej.rejection_detail}</p>
                    </div>

                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                      {rej.rejection_reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
