// Lekkie ikony SVG jako stringi — brak zależności od zewnętrznych fontów ikon,
// więc strona nie migocze przy ładowaniu i działa w 100% offline od CDN ikon.
// Wszystkie używają currentColor, więc kolor sterowany jest przez CSS.

const svg = (inner, viewBox = '0 0 24 24') =>
  `<svg viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;

export const icons = {
  search: svg('<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),

  profile: svg('<circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c1.8-4 5-6 8-6s6.2 2 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),

  dots: svg('<circle cx="12" cy="5" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="19" r="1.8" fill="currentColor"/>'),

  play: svg('<path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor"/>'),
  pause: svg('<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>'),

  volumeHigh: svg('<path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor"/><path d="M17 8a6 6 0 010 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19.5 5.5a10 10 0 010 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  volumeMute: svg('<path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),

  settings: svg('<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M19.4 13.5a1.7 1.7 0 000 3l.1.1a1 1 0 010 1.7l-1 1.7a1 1 0 01-1.6.3l-.2-.1a1.7 1.7 0 00-2.6 1v.2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-.2a1.7 1.7 0 00-2.6-1l-.2.1a1 1 0 01-1.6-.3l-1-1.7a1 1 0 010-1.7l.1-.1a1.7 1.7 0 000-3l-.1-.1a1 1 0 010-1.7l1-1.7a1 1 0 011.6-.3l.2.1a1.7 1.7 0 002.6-1V6a1 1 0 011-1h2a1 1 0 011 1v.2a1.7 1.7 0 002.6 1l.2-.1a1 1 0 011.6.3l1 1.7a1 1 0 010 1.7l-.1.1z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>'),

  subtitles: svg('<rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"/><path d="M6.5 14.5h4M13 14.5h4.5M6.5 10.5h11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),

  fullscreenEnter: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
  fullscreenExit: svg('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),

  chevronRight: svg('<path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
  check: svg('<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),

  share: svg('<circle cx="18" cy="5" r="2.4" stroke="currentColor" stroke-width="1.8"/><circle cx="6" cy="12" r="2.4" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="19" r="2.4" stroke="currentColor" stroke-width="1.8"/><path d="M8.1 10.8l7.8-4.1M8.1 13.2l7.8 4.1" stroke="currentColor" stroke-width="1.8"/>'),
  flag: svg('<path d="M6 4v16M6 5h11l-2.5 3L17 11H6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'),
  pencil: svg('<path d="M4 20l1-4L16.5 4.5a2 2 0 012.8 0l.7.7a2 2 0 010 2.8L8.5 19.5 4 20z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'),
  chart: svg('<path d="M4 20V10M11 20V4M18 20v-7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),

  thumbUp: svg('<path d="M7 11v9H4v-9h3zm2 9h8.5a2 2 0 001.9-1.4L21 13a2 2 0 00-1.9-2.6H14l.7-4.3A1.7 1.7 0 0013 4l-4 5.5V20z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'),
  copy: svg('<rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M5 15V5a2 2 0 012-2h10" stroke="currentColor" stroke-width="1.8"/>'),
  embed: svg('<path d="M9 8l-5 4 5 4M15 8l5 4-5 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),

  sphere: svg('<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" stroke="currentColor" stroke-width="1.6"/><path d="M12 3v18" stroke="currentColor" stroke-width="1.6"/>'),

  login: svg('<path d="M11 8V6a2 2 0 012-2h4a2 2 0 012 2v12a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 12h11m0 0l-3.5-3.5M14 12l-3.5 3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  userPlus: svg('<circle cx="9" cy="8" r="3.5" stroke="currentColor" stroke-width="1.8"/><path d="M2.5 20c1.3-3.6 4-5.4 6.5-5.4s5.2 1.8 6.5 5.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18.5 8v6M21.5 11h-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
};