// Utility functions for time formatting without external dependencies
// (date-fns-tz optional — using Intl API for timezone support)

export function formatTimeInZone(timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(new Date()).replace(':', '.');
}

export function formatDateInZone(timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  }).format(new Date());
}

export function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export function getClockAngles(timezone: string): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  // Get current time parts in the target timezone
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    timeZone: timezone,
  }).formatToParts(now);

  const h = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10) % 12;
  const m = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
  const s = parseInt(parts.find((p) => p.type === 'second')?.value ?? '0', 10);

  return {
    hours: h * 30 + m * 0.5,
    minutes: m * 6 + s * 0.1,
    seconds: s * 6,
  };
}
