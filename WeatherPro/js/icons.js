/**
 * Inline SVG icon helpers. Keeping icons local avoids external dependencies.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

function svg(content, size = 24, className = '') {
  return `
    <svg class="weather-svg ${className}" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="${SVG_NS}" aria-hidden="true" focusable="false">
      ${content}
    </svg>
  `;
}

const stroke = 'stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
const fillCurrent = 'fill="currentColor"';

const ICONS = {
  search: svg(`<circle cx="28" cy="28" r="14" ${stroke}/><path d="M39 39l11 11" ${stroke}/>`, 22),
  location: svg(`<path d="M32 56s18-17.3 18-33A18 18 0 0014 23c0 15.7 18 33 18 33z" ${stroke}/><circle cx="32" cy="23" r="6" ${stroke}/>`, 22),
  clock: svg(`<circle cx="32" cy="32" r="22" ${stroke}/><path d="M32 18v15l10 6" ${stroke}/>`, 22),
  calendar: svg(`<rect x="13" y="15" width="38" height="36" rx="5" ${stroke}/><path d="M20 10v10M44 10v10M13 26h38" ${stroke}/>`, 22),
  thermometer: svg(`<path d="M26 36V14a6 6 0 0112 0v22a13 13 0 11-12 0z" ${stroke}/><path d="M32 22v21" ${stroke}/>`, 24),
  humidity: svg(`<path d="M32 8s16 18 16 31a16 16 0 01-32 0C16 26 32 8 32 8z" ${stroke}/><path d="M24 40c2 5 9 7 14 3" ${stroke}/>`, 24),
  wind: svg(`<path d="M9 24h31a8 8 0 10-8-8" ${stroke}/><path d="M9 34h42a7 7 0 11-7 7" ${stroke}/><path d="M9 44h22" ${stroke}/>`, 24),
  pressure: svg(`<path d="M16 42a20 20 0 1132 0" ${stroke}/><path d="M32 32l11-11" ${stroke}/><path d="M22 46h20" ${stroke}/>`, 24),
  sunrise: svg(`<path d="M12 42h40M20 34a12 12 0 0124 0M32 10v12M17 20l7 7M47 20l-7 7" ${stroke}/>`, 24),
  sunset: svg(`<path d="M12 42h40M20 34a12 12 0 0124 0M32 26V14M17 20l7 7M47 20l-7 7" ${stroke}/>`, 24),
  uv: svg(`<circle cx="32" cy="32" r="10" ${stroke}/><path d="M32 6v10M32 48v10M6 32h10M48 32h10M13 13l7 7M44 44l7 7M51 13l-7 7M20 44l-7 7" ${stroke}/>`, 24),
  aqi: svg(`<path d="M15 42c5-10 12-15 21-15 6 0 10-3 13-9" ${stroke}/><path d="M15 30c7-7 15-10 24-9M15 50c9-5 18-7 29-6" ${stroke}/>`, 24),
  alert: svg(`<path d="M32 8l25 46H7L32 8z" ${stroke}/><path d="M32 24v13M32 46h.1" ${stroke}/>`, 22),
  clearDay: svg(`<circle class="sun-core" cx="32" cy="32" r="12" fill="#fbbc04"/><path d="M32 6v10M32 48v10M6 32h10M48 32h10M13 13l7 7M44 44l7 7M51 13l-7 7M20 44l-7 7" stroke="#fbbc04" stroke-width="4" stroke-linecap="round"/>`, 112, 'icon-clear'),
  clearNight: svg(`<path d="M43 48a21 21 0 01-26-26 20 20 0 0026 26z" fill="#aecbfa"/><path d="M46 16h.1M51 27h.1M36 10h.1" ${stroke}/>`, 112, 'icon-night'),
  clouds: svg(`<path class="cloud-shape" d="M20 44h27a10 10 0 001-20 16 16 0 00-30-5 12 12 0 002 25z" fill="#d7dee8"/><path d="M20 44h27a10 10 0 001-20 16 16 0 00-30-5 12 12 0 002 25z" stroke="#7a8697" stroke-width="3" stroke-linejoin="round"/>`, 112, 'icon-clouds'),
  partlyDay: svg(`<circle class="sun-core" cx="24" cy="24" r="10" fill="#fbbc04"/><path d="M24 6v7M24 35v7M6 24h7M35 24h7M11 11l5 5M32 32l5 5M37 11l-5 5" stroke="#fbbc04" stroke-width="3" stroke-linecap="round"/><path class="cloud-shape" d="M22 48h27a9 9 0 001-18 15 15 0 00-28-5 11 11 0 000 23z" fill="#dce3ec"/><path d="M22 48h27a9 9 0 001-18 15 15 0 00-28-5 11 11 0 000 23z" stroke="#7a8697" stroke-width="3" stroke-linejoin="round"/>`, 112, 'icon-partly'),
  partlyNight: svg(`<path d="M29 20a16 16 0 0018 20 19 19 0 01-25-25 16 16 0 007 5z" fill="#aecbfa"/><path class="cloud-shape" d="M20 48h28a9 9 0 001-18 15 15 0 00-28-5 11 11 0 00-1 23z" fill="#dce3ec"/><path d="M20 48h28a9 9 0 001-18 15 15 0 00-28-5 11 11 0 00-1 23z" stroke="#7a8697" stroke-width="3" stroke-linejoin="round"/>`, 112, 'icon-partly-night'),
  rain: svg(`<path class="cloud-shape" d="M18 34h30a9 9 0 001-18 15 15 0 00-28-5 11 11 0 00-3 23z" fill="#c8d6e6"/><path d="M18 34h30a9 9 0 001-18 15 15 0 00-28-5 11 11 0 00-3 23z" stroke="#60758e" stroke-width="3" stroke-linejoin="round"/><path class="rain-lines" d="M23 42l-4 10M35 42l-4 10M47 42l-4 10" stroke="#1a73e8" stroke-width="4" stroke-linecap="round"/>`, 112, 'icon-rain'),
  thunderstorm: svg(`<path class="cloud-shape" d="M18 34h30a9 9 0 001-18 15 15 0 00-28-5 11 11 0 00-3 23z" fill="#838da3"/><path d="M18 34h30a9 9 0 001-18 15 15 0 00-28-5 11 11 0 00-3 23z" stroke="#475569" stroke-width="3" stroke-linejoin="round"/><path d="M34 35l-9 14h9l-4 10 12-16h-9l1-8z" fill="#fbbc04"/>`, 112, 'icon-thunder'),
  snow: svg(`<path class="cloud-shape" d="M18 34h30a9 9 0 001-18 15 15 0 00-28-5 11 11 0 00-3 23z" fill="#e8eef7"/><path d="M18 34h30a9 9 0 001-18 15 15 0 00-28-5 11 11 0 00-3 23z" stroke="#91a4bd" stroke-width="3" stroke-linejoin="round"/><path d="M23 47h.1M34 51h.1M45 47h.1" ${stroke}/>`, 112, 'icon-snow'),
  mist: svg(`<path d="M12 24h40M18 34h34M12 44h40" stroke="#7a8697" stroke-width="4" stroke-linecap="round"/><path d="M18 54h28" stroke="#7a8697" stroke-width="4" stroke-linecap="round" opacity=".65"/>`, 112, 'icon-mist'),
};

export function icon(name, size) {
  if (!ICONS[name]) return ICONS.clouds;
  return size ? ICONS[name].replace(/width="[^"]+"/, `width="${size}"`).replace(/height="[^"]+"/, `height="${size}"`) : ICONS[name];
}

export function getWeatherCategory(weatherId) {
  const id = Number(weatherId);
  if (id >= 200 && id < 300) return 'thunderstorm';
  if (id >= 300 && id < 400) return 'drizzle';
  if (id >= 500 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id >= 700 && id < 800) return 'mist';
  if (id === 800) return 'clear';
  return 'clouds';
}

export function weatherIcon(weather, isNight = false, size) {
  const item = Array.isArray(weather) ? weather[0] : weather;
  const id = Number(item?.id);
  const iconCode = item?.icon || '';
  const night = isNight || iconCode.endsWith('n');

  if (id >= 200 && id < 300) return icon('thunderstorm', size);
  if (id >= 300 && id < 600) return icon('rain', size);
  if (id >= 600 && id < 700) return icon('snow', size);
  if (id >= 700 && id < 800) return icon('mist', size);
  if (id === 800) return icon(night ? 'clearNight' : 'clearDay', size);
  if (id === 801) return icon(night ? 'partlyNight' : 'partlyDay', size);
  return icon('clouds', size);
}
