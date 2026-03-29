import type { Tables } from '@/lib/supabase/types';

// Database row types
export type Hotel = Tables<'hotels'>;
export type Room = Tables<'rooms'>;
export type RoomType = Tables<'room_types'>;
export type Staff = Tables<'staff'>;
export type Notification = Tables<'notifications'>;
export type ChatMessage = Tables<'chat_messages'>;
export type Alarm = Tables<'alarms'>;
export type Promo = Tables<'promos'>;
export type Service = Tables<'services'>;
export type ServiceRequest = Tables<'service_requests'>;
export type Announcement = Tables<'announcements'>;

// Extended types with joins
export type RoomWithType = Room & {
  room_types: { name: string } | null;
};

export type ServiceRequestWithDetails = ServiceRequest & {
  services: { name: string; icon: string | null } | null;
  rooms: { room_code: string } | null;
};

// Room TV session (stored in localStorage)
export interface RoomSession {
  roomId: string;
  hotelId: string;
  roomCode: string;
  hotelSlug: string;
  guestName: string | null;
  guestPhotoUrl: string | null;
  backgroundUrl: string | null;
  hotelName: string;
  hotelTimezone: string;
  hotelLocation: string | null;
  wifiSsid: string | null;
  wifiPassword: string | null;
  wifiUsername: string | null;
  clockTimezone1: string;
  clockLabel1: string;
  clockTimezone2: string;
  clockLabel2: string;
  clockTimezone3: string;
  clockLabel3: string;
  airportIataCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

// PIN login API response
export interface RoomLoginResponse {
  session: RoomSession;
}

export interface RoomLoginError {
  error: 'Invalid PIN' | 'Room not found' | 'Hotel not found';
}

// Weather API response
export interface WeatherData {
  temp: number;
  icon: string;
  description: string;
  city: string;
}

// Flight API response
export type FlightStatus = 'on_schedule' | 'delay' | 'cancelled' | 'gate_open' | 'last_call' | 'check_in' | 'closed';

export interface FlightData {
  flightNumber: string;
  airline: string;
  time: string;
  destination: string;
  gate: string | null;
  status: FlightStatus;
}

// Offline queue item types
export type OfflineQueueItem =
  | { type: 'chat'; payload: { roomId: string; hotelId: string; message: string; senderName: string }; timestamp: number }
  | { type: 'service_request'; payload: { roomId: string; hotelId: string; serviceId: string; note: string }; timestamp: number }
  | { type: 'alarm'; payload: { roomId: string; hotelId: string; scheduledTime: string; note: string }; timestamp: number };
