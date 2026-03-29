-- Phase 5 Migrations: Super Admin Panel Tables

-- 1. Create service_icon_presets table
CREATE TABLE IF NOT EXISTS public.service_icon_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emoji TEXT NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.service_icon_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users to read active presets" ON public.service_icon_presets
  FOR SELECT USING (is_active = true);
-- To allow Super Admin bypassing RLS, we use the service_role_key in the backend.

-- Seed with initial default presets
INSERT INTO public.service_icon_presets (emoji, label, sort_order) VALUES
('🍽️', 'Room Service', 1),
('🍴', 'Restaurant', 2),
('🚗', 'Car Rental', 3),
('🛵', 'Scooter', 4),
('💆', 'Spa', 5),
('👕', 'Laundry', 6),
('🧹', 'Housekeeping', 7),
('🏊', 'Pool', 8),
('📞', 'Concierge', 9),
('🧴', 'Toiletries', 10),
('🅿️', 'Parking', 11),
('✈️', 'Airport Transfer', 12)
ON CONFLICT DO NOTHING;

-- 2. Create platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id INT PRIMARY KEY DEFAULT 1,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT DEFAULT 'We are currently under maintenance.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one row can ever exist (id=1)
ALTER TABLE public.platform_settings ADD CONSTRAINT platform_settings_single_row CHECK (id = 1);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all to read platform settings" ON public.platform_settings
  FOR SELECT USING (true);

-- Seed defaults
INSERT INTO public.platform_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 3. Create activity_log table for Super Admin tracking
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES auth.users(id),
  actor_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
