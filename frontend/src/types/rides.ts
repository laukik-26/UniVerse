export interface CampusLocation {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
}

export interface DriverRide {
  id: string;
  driver_id: string;
  driver_name: string;
  origin_id: string;
  origin_name: string;
  destination_id: string;
  destination_name: string;
  departure_time: string;
  available_seats: number;
  total_seats: number;
  max_detour_km: number;
  direct_distance_km: number;
  direct_path: string[];
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface PassengerRequest {
  id: string;
  passenger_id: string;
  passenger_name: string;
  pickup_id: string;
  pickup_name: string;
  dropoff_id: string;
  dropoff_name: string;
  preferred_time: string;
  time_flexibility_mins: number;
  seats_needed: number;
  max_detour_km: number;
  direct_distance_km: number;
  status: 'pending' | 'matched' | 'cancelled';
  matched_ride_id?: string;
  created_at: string;
}

export interface MatchCandidate {
  ride_id: string;
  driver_name: string;
  driver_origin: string;
  driver_destination: string;
  departure_time: string;
  available_seats: number;
  driver_direct_distance_km: number;
  passenger_direct_distance_km: number;
  shared_distance_km: number;
  detour_km: number;
  time_difference_mins: number;
  net_saved_distance_km: number;
  estimated_cost_savings_inr: number;
  estimated_co2_avoided_kg: number;
  assumed_stop_order: string[];
  shared_path_nodes: string[];
  legs: {
    leg_1_pickup_km: number;
    leg_2_ride_km: number;
    leg_3_drop_km: number;
  };
  match_score: number;
  methodology_disclaimer: string;
}

export interface RejectedCandidate {
  ride_id: string;
  driver_name: string;
  departure_time: string;
  rejection_reason: 'INSUFFICIENT_SEATS' | 'TIME_INCOMPATIBLE' | 'EXCESSIVE_DETOUR' | 'UNREACHABLE_ROUTE';
  rejection_detail: string;
}

export interface RideSearchResult {
  passenger_request: {
    pickup_id: string;
    dropoff_id: string;
    preferred_time: string;
    time_flexibility_mins: number;
    seats_needed: number;
    max_detour_km: number;
  };
  passenger_direct_distance_km: number;
  matches_count: number;
  compatible_matches: MatchCandidate[];
  rejected_candidates: RejectedCandidate[];
}

export interface TransportSavingsSummary {
  total_rides_offered: number;
  active_rides_count: number;
  total_carpools_completed: number;
  total_saved_vkt_km: number;
  total_cost_saved_inr: number;
  total_co2_avoided_kg: number;
  assumed_cost_per_km_inr: number;
  assumed_emission_factor_g_km: number;
  methodology_note: string;
}
