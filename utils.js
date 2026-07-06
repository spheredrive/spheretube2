// Odmiana polskich rzeczowników: 1 -> forms[0], 2-4 -> forms[1], 5+ -> forms[2]
// (z wyjątkiem 12-14, które zawsze biorą formę "wiele").
function pluralPL(n, forms) {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n === 1) return forms[0];
  if (n10 >= 2 && n10 <= 4 && !(n100 >= 12 && n100 <= 14)) return forms[1];
  return forms[2];
}

// Czas trwania -> "x:xx", "xx:xx", "x:xx:xx", "xx:xx:xx", "xxx:xx:xx"
// (godziny/minuty bez zera wiodącego, sekundy zawsze na 2 cyfrach).
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    const mm = String(minutes).padStart(2, '0');
    return `${hours}:${mm}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

function trimNumber(v) {
  return (Math.round(v * 10) / 10).toString().replace('.', ',');
}

// Liczba wyświetleń -> "3 wyświetlenia", "128 tys. wyświetleń", "2,3 mln wyświetleń"
export function formatViews(count) {
  const n = Number(count) || 0;
  if (n >= 1_000_000) return `${trimNumber(n / 1_000_000)} mln wyświetleń`;
  if (n >= 1000) return `${trimNumber(n / 1000)} tys. wyświetleń`;
  return `${n} ${pluralPL(n, ['wyświetlenie', 'wyświetlenia', 'wyświetleń'])}`;
}

// D1 zwraca daty jako "YYYY-MM-DD HH:MM:SS" w UTC (bez strefy) — doprecyzowujemy
// format, żeby Date() parsował je poprawnie w każdej przeglądarce.
function parseSqliteDate(value) {
  if (!value) return new Date();
  const iso = value.includes('T') ? value : value.replace(' ', 'T');
  return new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
}

const RELATIVE_UNITS = [
  { limitSeconds: 60, divisor: 1, forms: ['sekunda', 'sekundy', 'sekund'] },
  { limitSeconds: 3600, divisor: 60, forms: ['minuta', 'minuty', 'minut'] },
  { limitSeconds: 86400, divisor: 3600, forms: ['godzina', 'godziny', 'godzin'] },
  { limitSeconds: 7 * 86400, divisor: 86400, forms: ['dzień', 'dni', 'dni'] },
  { limitSeconds: 30 * 86400, divisor: 7 * 86400, forms: ['tydzień', 'tygodnie', 'tygodni'] },
  { limitSeconds: 365 * 86400, divisor: 30 * 86400, forms: ['miesiąc', 'miesiące', 'miesięcy'] },
  { limitSeconds: Infinity, divisor: 365 * 86400, forms: ['rok', 'lata', 'lat'] },
];

// Czas publikacji -> "x sekund/minut/godzin/dni/tygodni/miesięcy/lat temu"
export function formatRelativeTime(dateValue) {
  const then = parseSqliteDate(dateValue);
  const diffSeconds = Math.max(0, Math.floor((Date.now() - then.getTime()) / 1000));
  if (diffSeconds < 10) return 'przed chwilą';

  for (const unit of RELATIVE_UNITS) {
    if (diffSeconds < unit.limitSeconds) {
      const value = Math.max(1, Math.floor(diffSeconds / unit.divisor));
      return `${value} ${pluralPL(value, unit.forms)} temu`;
    }
  }
  return '';
}

// Zwraca etykietę premiery do wyświetlenia zamiast czasu trwania (albo null,
// jeśli film jest już zwykłą, opublikowaną treścią).
export function premiereLabel(video) {
  if (video.status === 'premiere_scheduled') return 'Wkrótce';
  if (video.status === 'premiere_live') return 'Premiera';
  return null;
}

// Prosty debounce pod pole wyszukiwania.
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}