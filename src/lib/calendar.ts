import { COUPLE } from './i18n';

// Build a Google Calendar "add event" URL for the wedding.
// The event is pinned to the venue's wall-clock time (via ctz) so it shows as
// 18:00 in Skopje for every guest, regardless of their own timezone.
// Default duration: 5 hours from the ceremony start.
export const googleCalendarUrl = (): string => {
  // Parse the literal Y/M/D H:M from the ISO string (no UTC conversion) so the
  // calendar keeps the venue wall-clock time.
  const [datePart, timePart = '00:00:00'] = COUPLE.dateISO.split('T');
  const [y, mo, d] = datePart.split('-').map(Number);
  const [h, mi] = timePart.split(':').map(Number);

  const pad = (n: number) => String(n).padStart(2, '0');
  const basic = (hh: number) =>
    `${y}${pad(mo)}${pad(d)}T${pad(hh)}${pad(mi)}00`;

  const endH = h + 5; // 5-hour celebration window

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Dasma · ${COUPLE.partner1} & ${COUPLE.partner2}`,
    dates: `${basic(h)}/${basic(endH)}`,
    ctz: COUPLE.timezone,
    details: `Festa e dasmës së ${COUPLE.partner1} & ${COUPLE.partner2}.`,
    location: `${COUPLE.venue}, ${COUPLE.city}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
