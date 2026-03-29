// Auto-generated types from Supabase schema
// Run: npx supabase gen types typescript --project-id ykyanayfwnkxxemdbwjh > src/lib/supabase/types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      hotels: {
        Row: {
          id: string;
          slug: string;
          name: string;
          logo_url: string | null;
          location: string | null;
          timezone: string;
          default_background_url: string | null;
          wifi_ssid: string | null;
          wifi_password: string | null;
          wifi_username: string | null;
          clock_timezone_1: string;
          clock_label_1: string;
          clock_timezone_2: string;
          clock_label_2: string;
          clock_timezone_3: string;
          clock_label_3: string;
          airport_iata_code: string | null;
          latitude: number | null;
          longitude: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hotels']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['hotels']['Insert']>;
      };
      room_types: {
        Row: {
          id: string;
          hotel_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['room_types']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['room_types']['Insert']>;
      };
      rooms: {
        Row: {
          id: string;
          hotel_id: string;
          room_type_id: string | null;
          room_code: string;
          is_occupied: boolean;
          pin: string | null;
          background_url: string | null;
          guest_name: string | null;
          guest_photo_url: string | null;
          custom_welcome_message: string | null;
          checkin_date: string | null;
          checkout_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>;
      };
      staff: {
        Row: {
          id: string;
          hotel_id: string;
          user_id: string;
          role: 'frontoffice' | 'manager';
          name: string | null;
          email: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['staff']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['staff']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          hotel_id: string;
          room_id: string | null;
          title: string;
          body: string | null;
          is_read: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      chat_messages: {
        Row: {
          id: string;
          hotel_id: string;
          room_id: string;
          sender_role: 'guest' | 'frontoffice';
          sender_name: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>;
      };
      alarms: {
        Row: {
          id: string;
          hotel_id: string;
          room_id: string;
          scheduled_time: string;
          note: string | null;
          is_acknowledged: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['alarms']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['alarms']['Insert']>;
      };
      promos: {
        Row: {
          id: string;
          hotel_id: string;
          title: string;
          description: string | null;
          poster_url: string | null;
          valid_from: string | null;
          valid_until: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['promos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['promos']['Insert']>;
      };
      services: {
        Row: {
          id: string;
          hotel_id: string;
          name: string;
          icon: string | null;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
      };
      service_requests: {
        Row: {
          id: string;
          hotel_id: string;
          room_id: string;
          service_id: string | null;
          note: string | null;
          status: 'pending' | 'in_progress' | 'done' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['service_requests']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['service_requests']['Insert']>;
      };
      announcements: {
        Row: {
          id: string;
          hotel_id: string | null;
          text: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_hotel_id: { Args: Record<string, never>; Returns: string };
      get_my_role: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
