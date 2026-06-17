import { useMemo } from 'react';

/**
 * Reads a personalized guest name from the invitation URL.
 * Supports /?ftesa=Sara (Albanian) or /?guest=Sara (English).
 *
 * Returns the trimmed, capitalized name, or '' if none was provided.
 * Example share link:  https://your-site/?ftesa=Sara%20Hoxha
 */
export function getGuestName(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('ftesa') ?? params.get('guest') ?? '';
  const name = raw.trim();
  if (!name) return '';
  // Title-case each word so "sara hoxha" → "Sara Hoxha".
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function useGuestName(): string {
  // The query string is read once on mount; it does not change at runtime.
  return useMemo(() => getGuestName(), []);
}
