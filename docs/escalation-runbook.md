# Neotiv Engineering: Escalation & Infrastructure Runbook

## Core Triggers & Mitigations

### 1. Scaling to Supabase Pro
**Trigger**: Approaching 500 MAU, database size > 400MB, or storage exceeding 1GB.
**Action**: 
- Require no code changes.
- Access the Supabase UI (`app.supabase.com`) → Settings → Billing → Upgrade to Pro.
- This immediately unlocks 100k MAU and up to 8GB database hosting.

### 2. High Dashboard Latency (Enabling Read Replicas)
**Trigger**: Read queries from the TV Dashboard taking > 500ms during peak occupancy loads.
**Action**:
- Navigate to Supabase UI → Settings → Database → Read Replicas.
- Provision a closest-edge replica (e.g., Singapore for Asian hotels).
- Once active, no code change is explicitly required for `supabase-js` basic client since read replication can funnel directly via Supavisor edge pooling.

### 3. Exhausting External API Quotas
**Trigger**: AviationStack or OpenWeather quotas hitting limits before the billing cycle.
**Action**:
- Verified that Upstash Redis is active and buffering requests in `/lib/utils/cache.ts`.
- If Upstash free-tier (10k req/day) is also hit, increase Upstash billing or extend the caching TTL configurations inside `/api/flights/route.ts` and `/api/weather/route.ts` from `300` (5 mins) to `1800` (30 mins).

### 4. Connection Pooling Rejections
**Trigger**: Supabase throws `Too many open connections` errors under load.
**Action**:
- Switch PostgreSQL connections natively to Supavisor (Port 6543) instead of direct connection strings. Ensure Prisma/Vercel ENV strings read:
  `postgres://[db-user]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### 5. Media & Storage Throttling
**Trigger**: Image delivery of background templates slowing down TV load speeds heavily.
**Action**:
- Enforce the `next/image` standard across all UI elements reading `logo_url`.
- Apply forced Supabase `transform` queries on fetch paths.
- Setup Cloudflare R2 proxy cache if explicitly migrating off Supabase CDN endpoints.
