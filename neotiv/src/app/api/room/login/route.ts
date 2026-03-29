import { NextResponse, type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import type { RoomLoginResponse, RoomLoginError } from '@/types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<RoomLoginResponse | RoomLoginError>> {
  try {
    const body = (await request.json()) as {
      hotelSlug?: string;
      roomCode?: string;
      pin?: string;
    };
    const { hotelSlug, roomCode, pin } = body;

    if (!hotelSlug || !roomCode || !pin) {
      return NextResponse.json({ error: 'Room not found' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // 1. Look up hotel by slug
    const responseHotel = await supabase
      .from('hotels')
      .select(
        'id, name, location, timezone, wifi_ssid, wifi_password, wifi_username, ' +
        'clock_timezone_1, clock_label_1, clock_timezone_2, clock_label_2, ' +
        'clock_timezone_3, clock_label_3, airport_iata_code, latitude, longitude, ' +
        'default_background_url'
      )
      .eq('slug', hotelSlug)
      .eq('is_active', true)
      .single();
    
    const hotelError = responseHotel.error;
    const hotel = responseHotel.data as any;

    if (hotelError || !hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    // 2. Look up room by hotel_id + room_code (server-side PIN check)
    const responseRoom = await supabase
      .from('rooms')
      .select(
        'id, room_code, pin, guest_name, guest_photo_url, background_url, custom_welcome_message'
      )
      .eq('hotel_id', hotel.id)
      .eq('room_code', roomCode)
      .single();
      
    const roomError = responseRoom.error;
    const room = responseRoom.data as any;

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // 3. Verify PIN — plain text (bcrypt upgrade in Phase 6)
    if (!room.pin || room.pin !== pin) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    // 4. Build and return session
    const session = {
      roomId: room.id,
      hotelId: hotel.id,
      roomCode: room.room_code,
      hotelSlug,
      guestName: room.guest_name,
      guestPhotoUrl: room.guest_photo_url,
      backgroundUrl: room.background_url ?? hotel.default_background_url,
      hotelName: hotel.name,
      hotelTimezone: hotel.timezone,
      hotelLocation: hotel.location,
      wifiSsid: hotel.wifi_ssid,
      wifiPassword: hotel.wifi_password,
      wifiUsername: hotel.wifi_username,
      clockTimezone1: hotel.clock_timezone_1,
      clockLabel1: hotel.clock_label_1,
      clockTimezone2: hotel.clock_timezone_2,
      clockLabel2: hotel.clock_label_2,
      clockTimezone3: hotel.clock_timezone_3,
      clockLabel3: hotel.clock_label_3,
      airportIataCode: hotel.airport_iata_code,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      customWelcomeMessage: room.custom_welcome_message,
    };

    return NextResponse.json({ session }, { status: 200 });
  } catch (err) {
    console.error('Room login error:', err);
    return NextResponse.json({ error: 'Room not found' }, { status: 500 });
  }
}
