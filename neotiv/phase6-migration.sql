-- Phase 6 Migrations: Prepare tables for caching and advanced widgets

-- 1. Append mapping strings to the generic hotels tables
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS airport_iata_code TEXT;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Seed existing dummy data (Ngurah Rai, Bali location roughly) if they don't have it
UPDATE public.hotels 
SET airport_iata_code = 'DPS', latitude = -8.7481, longitude = 115.1670 
WHERE airport_iata_code IS NULL;

-- 2. Validate standard Realtime Publication channels
-- Supabase creates `supabase_realtime` by default
-- Verify these tables are tracked for live WebSocket events (safe to repeatedly add via DO blocks or just executing, but standard SQL relies on the dashboard UI mostly. This explicitly triggers it if not enabled.)

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'alarms') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.alarms;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'service_requests') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
  END IF;
END $$;
