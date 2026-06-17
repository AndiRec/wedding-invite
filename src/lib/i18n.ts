/**
 * Albanian-first string catalogue for the whole app.
 *
 * The app is single-language (Albanian), so this is a flat dictionary rather
 * than a full i18n framework. Centralising the strings here keeps copy
 * consistent and makes the couple/date easy to change in one place.
 *
 * Usage:  import { t, COUPLE } from '@/lib/i18n';  →  t.invite.rsvpTitle
 */

// --- The couple & the day (placeholders — change these two blocks only) ---
export const COUPLE = {
  partner1: 'Partneri 1',
  partner2: 'Partneri 2',
  // Wall-clock date/time of the ceremony start at the venue (no timezone
  // suffix → treated as local/venue time). Used by the countdown + calendar.
  dateISO: '2026-07-12T18:00:00',
  // IANA timezone of the venue, so the calendar event is pinned to venue time.
  timezone: 'Europe/Skopje',
  dateLabel: '12 Korrik 2026',
  timeLabel: '18:00',
  venue: 'Hotel Aleksandar Palace',
  city: 'Shkup',
  // Google Maps place link for the venue (replace with the real one).
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel+Aleksandar+Palace+Skopje',
};

export const t = {
  // ---- Public invitation ----
  invite: {
    eyebrow: 'Së bashku me familjet e tyre',
    presence: 'Kërkojnë nderin e pranisë suaj',
    introKicker: 'Një ftesë e veçantë',
    introTitle: 'Bashkohuni me ne për festën e dasmës sonë',
    introBody:
      'Me zemra plot gëzim, ju ftojmë të ndani me ne një ditë të mbushur me dashuri, ' +
      'të qeshura dhe kujtime të paharrueshme, ndërsa nisim udhëtimin tonë të ri së bashku.',

    countdownKicker: 'Numërimi mbrapsht',
    countdownTitle: 'Sa ditë na kanë mbetur',
    days: 'Ditë',
    hours: 'Orë',
    minutes: 'Minuta',
    seconds: 'Sekonda',
    theBigDay: 'Dita e madhe ka ardhur!',

    detailsKicker: 'Detajet e dasmës',
    detailsTitle: 'Festa',
    labelDate: 'Data',
    labelTime: 'Ora',
    labelVenue: 'Vendi',
    labelCity: 'Qyteti',
    addToCalendar: 'Shto në kalendar',

    planKicker: 'Ulëset',
    planTitle: 'Gjeni vendin tuaj',
    planBody:
      'Shikoni planin e ulëseve dhe gjeni tavolinën tuaj. Ose, nëse jeni nikoqir, ' +
      'hyni për të krijuar dhe ndryshuar planin.',
    viewMap: 'Shiko planin e ulëseve',
    createPlan: 'Krijo planin e dasmës',

    storyKicker: 'Historia jonë',
    storyTitle: 'Një ditë për t’u kujtuar',
    storyBody:
      'Të rrethuar nga njerëzit që na do më shumë, do të ishte nder për ne ' +
      'ta festojmë këtë moment të bukur së bashku. Prania juaj do ta bëjë ' +
      'ditën tonë edhe më kuptimplote.',

    galleryKicker: 'Galeria',
    galleryTitle: 'Momentet tona',

    scheduleKicker: 'Programi',
    scheduleTitle: 'Programi i ditës së dasmës',
    arrival: 'Mbërritja e mysafirëve',
    arrivalDesc: 'Pije mirëseardhjeje dhe përshëndetje.',
    ceremony: 'Fillon ceremonia',
    ceremonyDesc: 'Ceremonia zyrtare e dasmës.',
    dinner: 'Darka & festa',
    dinnerDesc: 'Muzikë, darkë, valle dhe festë.',

    locationKicker: 'Vendndodhja',
    locationBody:
      'Festa do të mbahet në Shkup, Maqedoni e Veriut. Shtypni më poshtë ' +
      'për të hapur vendndodhjen dhe planifikuar mbërritjen tuaj.',
    viewLocation: 'Shiko vendndodhjen',

    rsvpKicker: 'Konfirmimi',
    rsvpTitle: 'Ju lutemi konfirmoni pjesëmarrjen tuaj',
    rsvpBody: 'Na njoftoni nëse do të bashkoheni me ne deri më 1 Qershor 2026.',
    fullName: 'Emri i plotë',
    willAttend: 'A do të merrni pjesë?',
    yesAttend: 'Po, do të marr pjesë',
    noAttend: 'Fatkeqësisht, nuk mund të marr pjesë',
    numGuests: 'Numri i mysafirëve',
    guest: 'mysafir',
    guests: 'mysafirë',
    messagePlaceholder: 'Lini një mesazh për çiftin...',
    sendRsvp: 'Dërgo konfirmimin',
    sending: 'Duke dërguar...',
    rsvpError: 'Diçka shkoi keq. Ju lutemi provoni përsëri.',
    thankYou: 'Faleminderit',
    thankYouAttend: 'Jemi të gëzuar që do të bashkoheni me ne. Shihemi më 12 Korrik 2026!',
    thankYouDecline: 'Faleminderit që na njoftuat. Do të na mungoni.',
    footer: 'Me dashuri,',

    tapToOpen: 'Shtypni vulën për të hapur',
    inviteLetter: 'Ftesë dasme',
    forGuest: 'për mysafirin tonë të nderuar',
    playMusic: 'Luaj muzikën',
    pauseMusic: 'Ndalo muzikën',

    // Personalized greeting (when the invite is opened via /?ftesa=<emri>)
    greetingHi: 'Përshëndetje',
    greetingPersonal: 'Kjo ftesë është posaçërisht për ju.',
  },

  // ---- Seating / admin side ----
  admin: {
    seatingPlan: 'Plani i Ulëseve',
    // Couple + date subtitle shown in seating headers.
    subtitle: `Plani i Ulëseve · ${COUPLE.dateLabel}`,
    live: 'Live',
    adminLogin: 'Hyrja e Administratorit',
    name: 'Emri',
    password: 'Fjalëkalimi',
    login: 'Hyr',
    loggingIn: 'Duke hyrë...',
    viewPlanLink: 'Shiko planin e ulëseve →',
    wrongCredentials: 'Emri ose fjalëkalimi nuk është i saktë',
    notConfirmed: 'Llogaria nuk është konfirmuar. Aktivizo "Auto Confirm" në Supabase.',
  },

  // ---- Guest seat lookup (public) ----
  seat: {
    title: 'Gjej vendin tënd',
    subtitle: 'Shkruani emrin tuaj për të gjetur tavolinën ku jeni ulur.',
    placeholder: 'Shkruani emrin tuaj...',
    search: 'Kërko',
    youAreAt: 'Ju jeni në',
    table: 'Tavolina',
    seatNo: 'Ulësja',
    notFound: 'Nuk u gjet asnjë mysafir me këtë emër. Provoni një variant tjetër ose kontaktoni nikoqirët.',
    multiple: 'U gjetën disa përputhje:',
  },
};
