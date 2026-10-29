import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  ArrowRight, 
  X 
} from 'lucide-react';
import type { CampusLocation, DriverRide } from '../../types/rides';
import { ridesApi } from '../../services/ridesApi';

interface DriverRidesSectionProps {
  locations: CampusLocation[];
  onSelectRoute?: (path: string[], origin: string, dest: string) => void;
  onActivityLogged?: (title: string, type: 'info' | 'success' | 'warning') => void;
}

export const DriverRidesSection: React.FC<DriverRidesSectionProps> = ({
  locations,
  onSelectRoute,
  onActivityLogged,
}) => {
  const [rides, setRides] = useState<DriverRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form inputs
  const [originId, setOriginId] = useState('node-main-gate');
  const [destId, setDestId] = useState('node-south-gate');
  const [departureTime, setDepartureTime] = useState('08:30');
  const [availableSeats, setAvailableSeats] = useState(3);
  const [maxDetourKm, setMaxDetourKm] = useState(1.5);
  const [directDistance, setDirectDistance] = useState<number | null>(null);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRides = async () => {
    try {
      setLoading(true);
      const data = await ridesApi.getDriverRides('all');
      setRides(data);
    } catch (err) {
      console.error('Failed to load driver rides', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRides();
  }, []);

  // Compute live direct distance when origin or destination changes
  useEffect(() => {
    if (originId && destId && originId !== destId) {
      ridesApi.getShortestPath(originId, destId).then((res) => {
        if (res && res.reachable) {
          setDirectDistance(res.distance_km);
          if (onSelectRoute) {
            onSelectRoute(res.path, originId, destId);
          }
        } else {
          setDirectDistance(null);
        }
      });
    } else {
      setDirectDistance(null);
    }
  }, [originId, destId]);

  const handleOpenCreateModal = () => {
    setOriginId('node-main-gate');
    setDestId('node-south-gate');
    setDepartureTime('08:30');
    setAvailableSeats(3);
    setMaxDetourKm(1.5);
    setFormError('');
    setFormSuccess('');
    setIsCreateModalOpen(true);
  };

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (originId === destId) {
      setFormError('Origin and destination cannot be the same campus location.');
      return;
    }
    if (!departureTime) {
      setFormError('Please select a departure time.');
      return;
    }
    if (availableSeats < 1 || availableSeats > 6) {
      setFormError('Available seats must be between 1 and 6.');
      return;
    }
    if (maxDetourKm < 0.1 || maxDetourKm > 10.0) {
      setFormError('Maximum detour must be between 0.1 km and 10.0 km.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const created = await ridesApi.createDriverRide({
        origin_id: originId,
        destination_id: destId,
        departure_time: departureTime,
        available_seats: availableSeats,
        max_detour_km: maxDetourKm,
      });

      setRides(prev => [created, ...prev]);
      setFormSuccess('Driver ride offer published successfully!');

      if (onActivityLogged) {
        onActivityLogged(
          `New carpool route offered: ${created.origin_name} to ${created.destination_name} at ${created.departure_time}`,
          'info'
        );
      }

      setTimeout(() => {
        setIsCreateModalOpen(false);
        setFormSuccess('');
      }, 1400);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create driver ride.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRide = async (rideId: string) => {
    if (!window.confirm('Are you sure you want to cancel this offered carpool route?')) return;
    try {
      await ridesApi.cancelDriverRide(rideId);
      setRides(prev => prev.map(r => r.id === rideId ? { ...r, status: 'cancelled' } : r));

      if (onActivityLogged) {
        onActivityLogged(`Carpool route '${rideId}' cancelled by driver.`, 'warning');
      }
    } catch (err) {
      console.error('Failed to cancel ride', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Offer Ride Action */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Campus Driver Departures & Offerings</h3>
          <p className="text-xs text-slate-500">
            Drivers offering empty seats on their daily campus commute with parameterized detour limits.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Offer a New Commute Ride
        </button>
      </div>

      {/* 2. Active Driver Rides Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">Current Campus Driver Offerings</span>
          <span className="text-xs font-mono text-slate-400">{rides.length} routes registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <th className="py-2.5 px-4">Driver & Identity</th>
                <th className="py-2.5 px-4">Origin & Destination</th>
                <th className="py-2.5 px-4">Departure</th>
                <th className="py-2.5 px-4">Seats</th>
                <th className="py-2.5 px-4">Max Detour</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium animate-pulse">
                    Loading driver offerings...
                  </td>
                </tr>
              ) : rides.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No rides currently scheduled. Click "Offer a New Commute Ride" to create one.
                  </td>
                </tr>
              ) : (
                rides.map((ride) => {
                  const isActive = ride.status === 'active';

                  return (
                    <tr 
                      key={ride.id} 
                      className="hover:bg-slate-50/70 cursor-pointer"
                      onClick={() => onSelectRoute && onSelectRoute(ride.direct_path, ride.origin_id, ride.destination_id)}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {ride.driver_name}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <span>{ride.origin_name}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{ride.destination_name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Direct: {ride.direct_distance_km} km
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {ride.departure_time}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-slate-700">
                          <Users className="w-3 h-3 text-slate-400" />
                          {ride.available_seats} / {ride.total_seats}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          &le; {ride.max_detour_km} km
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelRide(ride.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Cancel this ride"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offer Ride Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Offer Campus Commute Pool</h3>
                <p className="text-xs text-slate-500">Publish empty vehicle capacity with detour limits</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRide} className="mt-4 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Origin and Destination Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Origin Waypoint *
                  </label>
                  <select
                    value={originId}
                    onChange={(e) => setOriginId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                    disabled={submitting}
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Destination Waypoint *
                  </label>
                  <select
                    value={destId}
                    onChange={(e) => setDestId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                    disabled={submitting}
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Dijkstra Distance Preview */}
              {directDistance !== null && (
                <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-blue-900 flex items-center justify-between">
                  <span className="font-medium">Direct Dijkstra Shortest Distance:</span>
                  <span className="font-mono font-bold">{directDistance} km</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Departure Time *
                  </label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Available Seats *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={availableSeats}
                    onChange={(e) => setAvailableSeats(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Max Detour (km) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    max={10.0}
                    value={maxDetourKm}
                    onChange={(e) => setMaxDetourKm(parseFloat(e.target.value) || 1.0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 block mb-0.5">Detour Constraint:</span>
                Your route will only match passengers whose pickup and drop-off do not exceed your {maxDetourKm} km maximum diversion limit.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Commute Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
