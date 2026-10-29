import type { 
  CampusLocation, 
  DriverRide, 
  PassengerRequest, 
  RideSearchResult, 
  TransportSavingsSummary 
} from '../types/rides';

const API_BASE_URL = 'http://localhost:8000/api';

export const FALLBACK_LOCATIONS: CampusLocation[] = [
  { id: 'node-main-gate', name: 'Main Campus Gate (North)', category: 'Gate / Transit', x: 50, y: 10 },
  { id: 'node-hostel-north', name: 'North Hostel Quad (Blocks A-C)', category: 'Residential', x: 25, y: 18 },
  { id: 'node-sports-arena', name: 'Sports Complex & Stadium', category: 'Recreation', x: 80, y: 22 },
  { id: 'node-admin', name: 'Administrative Block & Registry', category: 'Administration', x: 50, y: 32 },
  { id: 'node-eng-cluster', name: 'Engineering & Computing Complex', category: 'Academic', x: 28, y: 42 },
  { id: 'node-central-lib', name: 'Central University Library', category: 'Academic', x: 72, y: 42 },
  { id: 'node-student-center', name: 'Student Activity Center & Dining', category: 'Amenity', x: 50, y: 55 },
  { id: 'node-science-park', name: 'Science & Advanced Research Labs', category: 'Research', x: 24, y: 68 },
  { id: 'node-medical-center', name: 'Campus Health & Medical Centre', category: 'Medical', x: 78, y: 65 },
  { id: 'node-hostel-south', name: 'South Hostel Complex (Blocks D-F)', category: 'Residential', x: 78, y: 82 },
  { id: 'node-tech-incubator', name: 'Innovation Hub & Tech Incubator', category: 'Research', x: 22, y: 86 },
  { id: 'node-south-gate', name: 'South Gate & Metro Transit Terminal', category: 'Gate / Transit', x: 50, y: 92 },
];

export const FALLBACK_EDGES: [string, string, number][] = [
  ['node-main-gate', 'node-hostel-north', 0.8],
  ['node-main-gate', 'node-admin', 1.0],
  ['node-main-gate', 'node-sports-arena', 1.6],
  ['node-admin', 'node-eng-cluster', 1.1],
  ['node-admin', 'node-central-lib', 0.9],
  ['node-admin', 'node-student-center', 1.2],
  ['node-hostel-north', 'node-eng-cluster', 1.4],
  ['node-eng-cluster', 'node-science-park', 1.0],
  ['node-eng-cluster', 'node-student-center', 0.9],
  ['node-central-lib', 'node-sports-arena', 1.2],
  ['node-central-lib', 'node-medical-center', 1.1],
  ['node-central-lib', 'node-student-center', 0.8],
  ['node-student-center', 'node-science-park', 1.3],
  ['node-student-center', 'node-medical-center', 1.0],
  ['node-student-center', 'node-south-gate', 1.8],
  ['node-science-park', 'node-tech-incubator', 1.1],
  ['node-science-park', 'node-south-gate', 1.7],
  ['node-medical-center', 'node-hostel-south', 1.2],
  ['node-hostel-south', 'node-south-gate', 1.4],
  ['node-tech-incubator', 'node-south-gate', 1.5],
];

let fallbackDriverRides: DriverRide[] = [
  {
    id: 'ride-01',
    driver_id: 'DRV-101',
    driver_name: 'Marcus Vance (Transit Coordinator)',
    origin_id: 'node-main-gate',
    origin_name: 'Main Campus Gate (North)',
    destination_id: 'node-south-gate',
    destination_name: 'South Gate & Metro Transit Terminal',
    departure_time: '08:30',
    available_seats: 3,
    total_seats: 4,
    max_detour_km: 1.5,
    direct_distance_km: 4.0,
    direct_path: ['node-main-gate', 'node-admin', 'node-student-center', 'node-south-gate'],
    status: 'active',
    created_at: '2026-10-29 07:30:00',
  },
  {
    id: 'ride-02',
    driver_id: 'DRV-102',
    driver_name: 'Sarah Lin (Peer Mentor)',
    origin_id: 'node-hostel-north',
    origin_name: 'North Hostel Quad (Blocks A-C)',
    destination_id: 'node-eng-cluster',
    destination_name: 'Engineering & Computing Complex',
    departure_time: '08:45',
    available_seats: 2,
    total_seats: 3,
    max_detour_km: 1.0,
    direct_distance_km: 1.4,
    direct_path: ['node-hostel-north', 'node-eng-cluster'],
    status: 'active',
    created_at: '2026-10-29 07:45:00',
  },
  {
    id: 'ride-03',
    driver_id: 'DRV-103',
    driver_name: 'Dev Patel (Student)',
    origin_id: 'node-student-center',
    origin_name: 'Student Activity Center & Dining',
    destination_id: 'node-tech-incubator',
    destination_name: 'Innovation Hub & Tech Incubator',
    departure_time: '14:00',
    available_seats: 3,
    total_seats: 4,
    max_detour_km: 1.5,
    direct_distance_km: 2.4,
    direct_path: ['node-student-center', 'node-science-park', 'node-tech-incubator'],
    status: 'active',
    created_at: '2026-10-29 08:00:00',
  },
];

let fallbackSavings: TransportSavingsSummary = {
  total_rides_offered: 4,
  active_rides_count: 3,
  total_carpools_completed: 3,
  total_saved_vkt_km: 9.6,
  total_cost_saved_inr: 81.60,
  total_co2_avoided_kg: 1.152,
  assumed_cost_per_km_inr: 8.50,
  assumed_emission_factor_g_km: 120.0,
  methodology_note: 'Assumes ₹8.50/km operational baseline and EPA/DEFRA 120g/km passenger car standard.',
};

export const ridesApi = {
  // 1. Locations & Graph
  async getLocations(): Promise<CampusLocation[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/rides/locations`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return FALLBACK_LOCATIONS;
  },

  async getShortestPath(sourceId: string, targetId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/rides/routes/shortest-path?source_id=${sourceId}&target_id=${targetId}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      source_id: sourceId,
      target_id: targetId,
      reachable: true,
      distance_km: 2.1,
      path: [sourceId, targetId],
      stops_count: 2,
    };
  },

  // 2. Driver Rides
  async getDriverRides(statusFilter: string = 'active'): Promise<DriverRide[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/rides?status_filter=${statusFilter}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return fallbackDriverRides.filter(r => statusFilter === 'all' || r.status === statusFilter);
  },

  async createDriverRide(data: {
    origin_id: string;
    destination_id: string;
    departure_time: string;
    available_seats: number;
    max_detour_km: number;
    driver_name?: string;
  }): Promise<DriverRide> {
    try {
      const res = await fetch(`${API_BASE_URL}/rides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const origLoc = FALLBACK_LOCATIONS.find(l => l.id === data.origin_id);
    const destLoc = FALLBACK_LOCATIONS.find(l => l.id === data.destination_id);
    const newRide: DriverRide = {
      id: `ride-${Date.now()}`,
      driver_id: 'DRV-CURRENT',
      driver_name: data.driver_name || 'Marcus Vance (Transit Coordinator)',
      origin_id: data.origin_id,
      origin_name: origLoc ? origLoc.name : data.origin_id,
      destination_id: data.destination_id,
      destination_name: destLoc ? destLoc.name : data.destination_id,
      departure_time: data.departure_time,
      available_seats: data.available_seats,
      total_seats: data.available_seats,
      max_detour_km: data.max_detour_km,
      direct_distance_km: 2.8,
      direct_path: [data.origin_id, data.destination_id],
      status: 'active',
      created_at: new Date().toISOString(),
    };
    fallbackDriverRides.unshift(newRide);
    return newRide;
  },

  async cancelDriverRide(rideId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/rides/${rideId}/cancel`, { method: 'PATCH' });
    } catch {
      // fallback
    }
    const r = fallbackDriverRides.find(ride => ride.id === rideId);
    if (r) r.status = 'cancelled';
  },

  // 3. Passenger Requests
  async getPassengerRequests(): Promise<PassengerRequest[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/rides/requests`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return [];
  },

  async searchRideMatches(data: {
    pickup_id: string;
    dropoff_id: string;
    preferred_time: string;
    time_flexibility_mins: number;
    seats_needed: number;
    max_detour_km: number;
  }): Promise<RideSearchResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/rides/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    // Client-side fallback match result
    return {
      passenger_request: data,
      passenger_direct_distance_km: 3.2,
      matches_count: 1,
      compatible_matches: [
        {
          ride_id: 'ride-01',
          driver_name: 'Marcus Vance (Transit Coordinator)',
          driver_origin: 'node-main-gate',
          driver_destination: 'node-south-gate',
          departure_time: '08:30',
          available_seats: 3,
          driver_direct_distance_km: 4.0,
          passenger_direct_distance_km: 3.2,
          shared_distance_km: 4.8,
          detour_km: 0.8,
          time_difference_mins: 5,
          net_saved_distance_km: 2.4,
          estimated_cost_savings_inr: 20.40,
          estimated_co2_avoided_kg: 0.288,
          assumed_stop_order: ['node-main-gate', data.pickup_id, data.dropoff_id, 'node-south-gate'],
          shared_path_nodes: ['node-main-gate', data.pickup_id, data.dropoff_id, 'node-south-gate'],
          legs: { leg_1_pickup_km: 0.8, leg_2_ride_km: 2.4, leg_3_drop_km: 1.6 },
          match_score: 91.5,
          methodology_disclaimer: 'Assumes ₹8.50/km carpool operating baseline and EPA/DEFRA 120g/km passenger car standard.',
        }
      ],
      rejected_candidates: [
        {
          ride_id: 'ride-03',
          driver_name: 'Dev Patel (Student)',
          departure_time: '14:00',
          rejection_reason: 'TIME_INCOMPATIBLE',
          rejection_detail: 'Departure time difference (330 mins) exceeds your 15 min flexibility window.',
        }
      ],
    };
  },

  async confirmCarpoolMatch(rideId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/rides/match/confirm?ride_id=${rideId}`, {
        method: 'POST',
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const r = fallbackDriverRides.find(ride => ride.id === rideId);
    if (r && r.available_seats > 0) {
      r.available_seats -= 1;
    }
    fallbackSavings.total_carpools_completed += 1;
    fallbackSavings.total_saved_vkt_km += 2.4;
    fallbackSavings.total_cost_saved_inr += 20.40;
    fallbackSavings.total_co2_avoided_kg += 0.288;

    return {
      status: 'success',
      match_record_id: `match-${Date.now()}`,
      ride_id: rideId,
      remaining_seats: r ? r.available_seats : 2,
      saved_distance_km: 2.4,
      saved_cost_inr: 20.40,
      avoided_co2_kg: 0.288,
    };
  },

  // 4. Savings Summary
  async getTransportSavings(): Promise<TransportSavingsSummary> {
    try {
      const res = await fetch(`${API_BASE_URL}/rides/summary/savings`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return fallbackSavings;
  },
};
