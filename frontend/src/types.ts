export interface Report {
  id: number;
  child_name: string;
  age: number;
  last_seen_location: string;
  lat: number;
  lon: number;
  photo_url: string | null;
  reporter_name: string;
  reporter_contact: string;
  status: 'pending' | 'approved' | 'solved' | 'rejected';
  submitted_at: string;
  resolved_at: string | null;
  sightings?: Sighting[];
}

export interface Sighting {
  id: number;
  report_id: number;
  description: string;
  lat: number;
  lon: number;
  submitted_by: string;
  submitted_at: string;
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'watcher';
  phone_number?: string | null;
  lat?: number | null;
  lon?: number | null;
  created_at: string;
}

export interface AlertPayload {
  child_name: string;
  age: number;
  last_seen_location: string;
  lat: number;
  lon: number;
  photo_url: string | null;
  reporter_contact: string;
  report_id: number;
  timestamp: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface Stats {
  pending: number;
  approved: number;
  solved: number;
  total_sightings: number;
  total_watchers: number;
}

export interface MapPoint {
  id: number;
  lat: number;
  lon: number;
  child_name: string;
  age: number;
  status: string;
  type: 'report' | 'sighting';
  report_id?: number;
}
