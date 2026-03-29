-- ============================================================
-- NEOTIV — SUPABASE SQL MIGRATIONS
-- Run these in order in the Supabase SQL Editor
-- Project: https://ykyanayfwnkxxemdbwjh.supabase.co
-- ============================================================

-- ============================================================
-- MIGRATION 001 — Core Tables
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Hotels
create table if not exists hotels (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  logo_url text,
  location text,
  timezone text not null default 'Asia/Jakarta',
  default_background_url text,
  wifi_ssid text,
  wifi_password text,
  wifi_username text,
  clock_timezone_1 text default 'America/New_York',
  clock_label_1 text default 'New York',
  clock_timezone_2 text default 'Europe/Paris',
  clock_label_2 text default 'France',
  clock_timezone_3 text default 'Asia/Shanghai',
  clock_label_3 text default 'China',
  airport_iata_code text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Room Types
create table if not exists room_types (
  id uuid primary key default uuid_generate_v4(),
  hotel_id uuid references hotels(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Rooms
create table if not exists rooms (
  id uuid primary key default uuid_generate_v4(),
  hotel_id uuid references hotels(id) on delete cascade,
  room_type_id uuid references room_types(id) on delete set null,
  room_code text not null,
  is_occupied boolean default false,
  pin text,
  background_url text,
  guest_name text,
  guest_photo_url text,
  custom_welcome_message text,
  checkin_date date,
  checkout_date date,
  created_at timestamptz default now(),
  unique(hotel_id, room_code)
);

-- Staff
create table if not exists staff (
  id uuid primary key default uuid_generate_v4(),
  hotel_id uuid references hotels(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('frontoffice', 'manager')),
  name text,
  email text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  hotel_id uuid references hotels(id) on delete cascade,
  room_id uuid references rooms(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean default false,
  created_by uuid references staff(id) on delete set null,
  created_at timestamptz default now()
);

-- Chat Messages
create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  hotel_id uuid references hotels(id) on delete cascade,
  room_id uuid references rooms(id) on delete cascade,
  sender_role text not null check (sender_role in ('guest', 'frontoffice')),
  sender_name text,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Alarms
create table if not exists alarms (
  id uuid primary key default uuid_generate_v4(),
  hotel_id uuid references hotels(id) on delete cascade,
  room_id uuid references rooms(id) on delete cascade,
  scheduled_time timestamptz not null,
  note text,
  is_acknowledged boolean default false,
  created_at timestamptz default now()
);

-- Promos
create table if not exists promos (
  id uuid primary key default uuid_generate_v4(),
  hotel_id uuid references hotels(id) on delete cascade,
  title text not null,
  description text,
  poster_url text,
  valid_from date,
  valid_until date,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Services
create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  hotel_id uuid references hotels(id) on delete cascade,
  name text not null,
  icon text,
  description text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Service Requests
create table if not exists service_requests (
  id uuid primary key default uuid_generate_v4(),
  hotel_id uuid references hotels(id) on delete cascade,
  room_id uuid references rooms(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Announcements (marquee ticker)
create table if not exists announcements (
  id uuid primary key default uuid_generate_v4(),
  hotel_id uuid references hotels(id) on delete cascade,
  text text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Platform Settings (single row)
create table if not exists platform_settings (
  id int primary key default 1 check (id = 1),
  maintenance_mode boolean default false,
  maintenance_message text default 'Under maintenance.',
  updated_at timestamptz default now()
);
insert into platform_settings (id) values (1) on conflict do nothing;

-- Activity Log
create table if not exists activity_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  target_type text,
  target_id uuid,
  meta jsonb,
  created_at timestamptz default now()
);


-- ============================================================
-- MIGRATION 002 — Row Level Security
-- ============================================================

-- Enable RLS on all tables
alter table hotels enable row level security;
alter table room_types enable row level security;
alter table rooms enable row level security;
alter table staff enable row level security;
alter table notifications enable row level security;
alter table chat_messages enable row level security;
alter table alarms enable row level security;
alter table promos enable row level security;
alter table services enable row level security;
alter table service_requests enable row level security;
alter table announcements enable row level security;
alter table platform_settings enable row level security;

-- Helper function: get hotel_id for current auth user
create or replace function get_my_hotel_id()
returns uuid as $$
  select (raw_user_meta_data->>'hotel_id')::uuid
  from auth.users
  where id = auth.uid();
$$ language sql security definer stable;

-- Helper function: get role for current auth user
create or replace function get_my_role()
returns text as $$
  select raw_user_meta_data->>'role'
  from auth.users
  where id = auth.uid();
$$ language sql security definer stable;

-- HOTELS
create policy "superadmin_hotels_all" on hotels for all
  using (get_my_role() = 'superadmin');

create policy "manager_read_own_hotel" on hotels for select
  using (id = get_my_hotel_id());

create policy "manager_update_own_hotel" on hotels for update
  using (id = get_my_hotel_id());

-- Allow public read for active hotels (needed for hotel layout validation)
create policy "public_read_active_hotels" on hotels for select
  using (is_active = true);

-- ROOM TYPES
create policy "staff_room_types" on room_types for all
  using (hotel_id = get_my_hotel_id() or get_my_role() = 'superadmin');

-- ROOMS
create policy "staff_rooms" on rooms for all
  using (hotel_id = get_my_hotel_id() or get_my_role() = 'superadmin');

-- STAFF
create policy "manager_staff" on staff for all
  using (hotel_id = get_my_hotel_id() or get_my_role() = 'superadmin');

-- NOTIFICATIONS
create policy "staff_notifications" on notifications for all
  using (hotel_id = get_my_hotel_id() or get_my_role() = 'superadmin');

-- CHAT MESSAGES
create policy "staff_chat" on chat_messages for all
  using (hotel_id = get_my_hotel_id() or get_my_role() = 'superadmin');

-- ALARMS
create policy "staff_alarms" on alarms for all
  using (hotel_id = get_my_hotel_id() or get_my_role() = 'superadmin');

-- PROMOS
create policy "staff_promos" on promos for all
  using (hotel_id = get_my_hotel_id() or get_my_role() = 'superadmin');

-- SERVICES
create policy "staff_services" on services for all
  using (hotel_id = get_my_hotel_id() or get_my_role() = 'superadmin');

-- SERVICE REQUESTS
create policy "staff_service_requests" on service_requests for all
  using (hotel_id = get_my_hotel_id() or get_my_role() = 'superadmin');

-- ANNOUNCEMENTS
create policy "staff_announcements" on announcements for all
  using (hotel_id = get_my_hotel_id() or hotel_id is null or get_my_role() = 'superadmin');

-- PLATFORM SETTINGS (superadmin only)
create policy "superadmin_platform" on platform_settings for all
  using (get_my_role() = 'superadmin');

-- Allow service_role to bypass RLS (for PIN verification API)
-- This is automatic — service_role_key bypasses RLS by default

-- Realtime
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table alarms;
alter publication supabase_realtime add table service_requests;
alter publication supabase_realtime add table rooms;

-- Performance indexes
create index if not exists idx_rooms_hotel_id on rooms(hotel_id);
create index if not exists idx_notifications_room_id on notifications(room_id);
create index if not exists idx_notifications_hotel_created on notifications(hotel_id, created_at desc);
create index if not exists idx_chat_messages_room_created on chat_messages(room_id, created_at);
create index if not exists idx_service_requests_hotel_status on service_requests(hotel_id, status);
create index if not exists idx_alarms_hotel_time on alarms(hotel_id, scheduled_time) where is_acknowledged = false;
create index if not exists idx_staff_user_id on staff(user_id);


-- ============================================================
-- MIGRATION 003 — Seed Development Data
-- ============================================================

-- Sample hotel: Amartha Hotel
insert into hotels (
  slug, name, location, timezone,
  wifi_ssid, wifi_password, wifi_username,
  airport_iata_code,
  latitude, longitude,
  clock_timezone_1, clock_label_1,
  clock_timezone_2, clock_label_2,
  clock_timezone_3, clock_label_3
) values (
  'amartha-hotel', 'Amartha Hotel', 'Kuta, Bali', 'Asia/Jakarta',
  'HotelABC', 'stayinhereforwhile', 'Guest',
  'DPS',
  -8.7180, 115.1707,
  'America/New_York', 'New York',
  'Europe/Paris', 'France',
  'Asia/Shanghai', 'China'
) on conflict (slug) do nothing;

-- Room types
insert into room_types (hotel_id, name, description)
select id, 'Deluxe', 'Deluxe sea view room'
from hotels where slug = 'amartha-hotel'
on conflict do nothing;

insert into room_types (hotel_id, name, description)
select id, 'Suite', 'Premium suite with private terrace'
from hotels where slug = 'amartha-hotel'
on conflict do nothing;

-- Sample room (PIN: 1234)
insert into rooms (hotel_id, room_code, pin, guest_name, is_occupied, checkin_date, checkout_date)
select id, '417', '1234', 'Mr. Stephen Hawk', true, current_date, current_date + interval '5 days'
from hotels where slug = 'amartha-hotel'
on conflict (hotel_id, room_code) do nothing;

-- Default services
insert into services (hotel_id, name, icon, sort_order)
select h.id, s.name, s.icon, s.ord from hotels h,
(values
  ('Room Service', '🍽️', 1),
  ('Restaurant', '🍴', 2),
  ('Car Rental', '🚗', 3),
  ('Bike Rental', '🛵', 4),
  ('Spa', '💆', 5),
  ('Laundry', '👕', 6)
) as s(name, icon, ord)
where h.slug = 'amartha-hotel'
on conflict do nothing;

-- Sample announcement
insert into announcements (hotel_id, text)
select id, 'Welcome to Amartha Hotel Bali! Free breakfast served 06:00–10:00 at the Ocean Terrace Restaurant. Pool hours: 07:00–22:00. Need assistance? Call extension 0 anytime.'
from hotels where slug = 'amartha-hotel'
on conflict do nothing;

-- Sample promo
insert into promos (hotel_id, title, description, is_active, valid_from, valid_until)
select id, 'Crazy Lunch Special', 'Enjoy our signature lunch menu at 50% off every day from 12:00–14:00 at the Ocean Terrace.', true, current_date, current_date + interval '30 days'
from hotels where slug = 'amartha-hotel'
on conflict do nothing;

-- ============================================================
-- HOW TO CREATE A SUPER ADMIN ACCOUNT
-- After running these migrations, create a superadmin via:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Invite user" or "Add user"
-- 3. After user is created, run this SQL to set the role:
-- ============================================================
-- UPDATE auth.users 
-- SET raw_user_meta_data = raw_user_meta_data || '{"role": "superadmin"}'::jsonb
-- WHERE email = 'your-admin@email.com';
