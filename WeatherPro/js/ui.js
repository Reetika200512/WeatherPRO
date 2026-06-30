import { icon, weatherIcon, getWeatherCategory } from './icons.js';

/**
 * UI rendering helpers. This module owns DOM updates, not API calls.
 */

export const elements = {
  appView: document.getElementById('appView'),
  form: document.getElementById('searchForm'),
  searchInput: document.getElementById('searchInput'),
  searchCombobox: document.querySelector('.search-combobox'),
  searchSubmitButton: document.getElementById('searchSubmitButton'),
  currentLocationButton: document.getElementById('currentLocationButton'),
  suggestionsPanel: document.getElementById('suggestionsPanel'),
  suggestionsList: document.getElementById('suggestionsList'),
  unitToggle: document.getElementById('unitToggle'),
  themeModeToggle: document.getElementById('themeModeToggle'),
  lastUpdated: document.getElementById('lastUpdated'),
  weatherLocation: document.getElementById('weatherLocation'),
  currentHeading: document.getElementById('currentHeading'),
  conditionLabel: document.getElementById('conditionLabel'),
  heroSummary: document.getElementById('heroSummary'),
  weatherIcon: document.getElementById('weatherIcon'),
  feelsLike: document.getElementById('feelsLike'),
  humidity: document.getElementById('humidity'),
  windSpeed: document.getElementById('windSpeed'),
  pressure: document.getElementById('pressure'),
  statsGrid: document.getElementById('statsGrid'),
  hourlyForecast: document.getElementById('hourlyForecast'),
  forecastList: document.getElementById('forecastList'),
  sunCard: document.getElementById('sunCard'),
  sunArc: document.getElementById('sunArc'),
  uvCard: document.getElementById('uvCard'),
  uvContent: document.getElementById('uvContent'),
  aqiCard: document.getElementById('aqiCard'),
  aqiContent: document.getElementById('aqiContent'),
  toastRegion: document.getElementById('toastRegion'),
};

const unitSymbols = {
  metric: { temp: 'C', wind: 'm/s', distance: 'km' },
  imperial: { temp: 'F', wind: 'mph', distance: 'mi' },
};

const aqiScale = {
  1: ['Good', 'Air quality is satisfactory.'],
  2: ['Fair', 'Air quality is acceptable.'],
  3: ['Moderate', 'Sensitive groups may notice minor effects.'],
  4: ['Poor', 'Limit long outdoor activity if sensitive.'],
  5: ['Very poor', 'Outdoor activity may be unhealthy.'],
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatNumber(value, digits = 0) {
  if (value == null || Number.isNaN(Number(value))) return '--';
  return Number(value).toFixed(digits).replace(/\.0$/, '');
}

export function formatTemperature(value) {
  if (value == null || Number.isNaN(Number(value))) return '--';
  return `${Math.round(value)}\u00B0`;
}

export function formatLocalTime(timestamp, timezoneOffset = 0, options = {}) {
  if (!timestamp) return '--';
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleTimeString(undefined, {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
    ...options,
  });
}

function formatHour(timestamp, timezoneOffset = 0) {
  if (!timestamp) return '--';
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleTimeString(undefined, {
    timeZone: 'UTC',
    hour: 'numeric',
  });
}

function formatDay(timestamp, timezoneOffset = 0, index = 0) {
  if (index === 0) return 'Today';
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleDateString(undefined, {
    timeZone: 'UTC',
    weekday: 'short',
  });
}

function formatWind(speed, degrees, units) {
  if (speed == null || Number.isNaN(Number(speed))) return '--';
  const value = units === 'imperial' ? Math.round(speed) : formatNumber(speed, speed < 10 ? 1 : 0);
  const direction = getWindDirection(degrees);
  return `${value} ${unitSymbols[units].wind}${direction ? ` ${direction}` : ''}`;
}

function formatDistance(meters, units) {
  if (meters == null || Number.isNaN(Number(meters))) return '--';
  if (units === 'imperial') return `${formatNumber(meters / 1609.344, 1)} mi`;
  return `${formatNumber(meters / 1000, 1)} km`;
}

function getWindDirection(degrees) {
  if (degrees == null || Number.isNaN(Number(degrees))) return '';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % directions.length];
}

function getUvLabel(uvi) {
  if (uvi == null || Number.isNaN(Number(uvi))) return null;
  if (uvi <= 2) return 'Low';
  if (uvi <= 5) return 'Moderate';
  if (uvi <= 7) return 'High';
  if (uvi <= 10) return 'Very high';
  return 'Extreme';
}

function setPressedButtons(container, attribute, activeValue) {
  container.querySelectorAll('button').forEach((button) => {
    const isActive = button.dataset[attribute] === activeValue;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

export function renderStaticIcons() {
  const iconMap = {
    searchIcon: 'search',
    searchButtonIcon: 'search',
    locationButtonIcon: 'location',
    feelsIcon: 'thermometer',
    humidityIcon: 'humidity',
    windIcon: 'wind',
    pressureIcon: 'pressure',
    hourlyIcon: 'clock',
    dailyIcon: 'calendar',
    sunIcon: 'sunrise',
    uvIcon: 'uv',
    aqiIcon: 'aqi',
  };

  Object.entries(iconMap).forEach(([id, name]) => {
    const node = document.getElementById(id);
    if (node) node.innerHTML = icon(name, name === 'search' ? 20 : 22);
  });
}

export function setControls({ units, themeMode }) {
  setPressedButtons(elements.unitToggle, 'unit', units);
  setPressedButtons(elements.themeModeToggle, 'themeMode', themeMode);
  document.documentElement.dataset.themeMode = themeMode;
}

export function applyResolvedTheme(themeMode, isNight) {
  const resolvedTheme = themeMode === 'auto' ? (isNight ? 'dark' : 'light') : themeMode;
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themeMode = themeMode;
}

export function setBusy(isBusy) {
  elements.searchSubmitButton.disabled = isBusy;
  elements.currentLocationButton.disabled = isBusy;
  elements.searchInput.setAttribute('aria-busy', String(isBusy));
}

export function renderLoadingState() {
  elements.lastUpdated.textContent = 'Loading';
  elements.weatherLocation.innerHTML = skeletonLine('180px');
  elements.currentHeading.innerHTML = skeletonLine('210px', '84px');
  elements.conditionLabel.innerHTML = skeletonLine('220px');
  elements.heroSummary.innerHTML = skeletonLine('320px');
  elements.weatherIcon.innerHTML = `<span class="skeleton skeleton-icon" style="width:132px;height:132px;border-radius:50%;"></span>`;

  elements.statsGrid.querySelectorAll('.stat-card strong').forEach((node) => {
    node.innerHTML = skeletonLine('74px', '18px');
  });

  elements.hourlyForecast.innerHTML = Array.from({ length: 8 }, () => `
    <article class="hour-card">
      ${skeletonLine('42px')}
      <span class="skeleton skeleton-icon"></span>
      ${skeletonLine('38px')}
    </article>
  `).join('');

  elements.forecastList.innerHTML = Array.from({ length: 5 }, () => `
    <article class="forecast-row">
      ${skeletonLine('48px')}
      <span class="skeleton skeleton-icon" style="width:34px;height:34px;"></span>
      ${skeletonLine('90px')}
      ${skeletonLine('140px')}
    </article>
  `).join('');

  elements.sunCard.hidden = false;
  elements.uvCard.hidden = false;
  elements.aqiCard.hidden = false;
  elements.sunArc.innerHTML = skeletonBlock('100%', '144px');
  elements.uvContent.innerHTML = skeletonBlock('100%', '92px');
  elements.aqiContent.innerHTML = skeletonBlock('100%', '92px');
}

function skeletonLine(width, height = '14px') {
  return `<span class="skeleton skeleton-text" style="display:block;width:${width};height:${height};"></span>`;
}

function skeletonBlock(width, height) {
  return `<span class="skeleton" style="display:block;width:${width};height:${height};border-radius:8px;"></span>`;
}

export function renderInitialState() {
  elements.lastUpdated.textContent = 'Ready';
  elements.weatherLocation.textContent = 'Search for a city';
  elements.currentHeading.innerHTML = '--&deg;';
  elements.conditionLabel.textContent = 'Weather will appear here';
  elements.heroSummary.textContent = 'Use search or your current location.';
  elements.weatherIcon.innerHTML = weatherIcon({ id: 801, icon: '02d' }, false, 128);
  elements.feelsLike.textContent = '--';
  elements.humidity.textContent = '--';
  elements.windSpeed.textContent = '--';
  elements.pressure.textContent = '--';
  elements.hourlyForecast.innerHTML = `<div class="empty-state">Hourly forecast will load after a search.</div>`;
  elements.forecastList.innerHTML = `<div class="empty-state">Daily forecast will load after a search.</div>`;
  elements.sunArc.innerHTML = `<div class="empty-state">Sunrise and sunset will load after a search.</div>`;
  elements.uvCard.hidden = true;
  elements.aqiCard.hidden = true;
}

export function renderSuggestions(suggestions, activeIndex = -1) {
  const hasSuggestions = suggestions.length > 0;
  elements.suggestionsPanel.hidden = !hasSuggestions;
  elements.searchCombobox.setAttribute('aria-expanded', String(hasSuggestions));
  elements.searchInput.setAttribute('aria-expanded', String(hasSuggestions));

  elements.suggestionsList.innerHTML = suggestions.map((suggestion, index) => {
    const label = formatSuggestionLabel(suggestion);
    const meta = [suggestion.state, suggestion.country].filter(Boolean).join(', ');
    return `
      <li role="presentation">
        <button
          type="button"
          class="suggestion-option ${index === activeIndex ? 'is-active' : ''}"
          data-index="${index}"
          role="option"
          aria-selected="${index === activeIndex}"
        >
          <strong>${escapeHtml(label)}</strong>
          <span>${escapeHtml(meta)}</span>
        </button>
      </li>
    `;
  }).join('');
}

export function hideSuggestions() {
  elements.suggestionsPanel.hidden = true;
  elements.searchCombobox.setAttribute('aria-expanded', 'false');
  elements.searchInput.setAttribute('aria-expanded', 'false');
  elements.suggestionsList.innerHTML = '';
}

export function formatSuggestionLabel(suggestion) {
  return [suggestion.name, suggestion.state, suggestion.country].filter(Boolean).join(', ');
}

export function renderWeatherDashboard(model) {
  const units = model.units;
  const current = model.current;
  const weather = current.weather;

  document.documentElement.dataset.weather = getWeatherCategory(weather?.id);
  document.documentElement.dataset.time = model.isNight ? 'night' : 'day';

  elements.lastUpdated.textContent = `Updated ${formatLocalTime(model.updatedAt, model.timezoneOffset)}`;
  elements.weatherLocation.textContent = model.locationName;
  elements.currentHeading.innerHTML = `${formatTemperature(current.temp)}`;
  elements.conditionLabel.textContent = current.description || 'Clear';
  elements.heroSummary.textContent = buildHeroSummary(model);
  elements.weatherIcon.innerHTML = weatherIcon(weather, model.isNight, 150);

  elements.feelsLike.textContent = formatTemperature(current.feelsLike);
  elements.humidity.textContent = current.humidity == null ? '--' : `${Math.round(current.humidity)}%`;
  elements.windSpeed.textContent = formatWind(current.windSpeed, current.windDeg, units);
  elements.pressure.textContent = current.pressure == null ? '--' : `${Math.round(current.pressure)} hPa`;

  renderHourly(model.hourly, units, model.timezoneOffset, model.isNight);
  renderDaily(model.daily, units, model.timezoneOffset, model.isNight);
  renderSun(model.sun, model.timezoneOffset, model.now);
  renderUv(model.uvIndex);
  renderAqi(model.aqi);
}

function buildHeroSummary(model) {
  const high = model.daily[0]?.max ?? model.current.high;
  const low = model.daily[0]?.min ?? model.current.low;
  const visibility = formatDistance(model.current.visibility, model.units);
  const parts = [];

  if (high != null && low != null) parts.push(`High ${formatTemperature(high)} / Low ${formatTemperature(low)}`);
  if (visibility !== '--') parts.push(`Visibility ${visibility}`);

  return parts.join(' | ') || 'Current conditions';
}

function renderHourly(hourly, units, timezoneOffset, isNight) {
  if (!hourly.length) {
    elements.hourlyForecast.innerHTML = `<div class="empty-state">Hourly forecast is unavailable.</div>`;
    return;
  }

  elements.hourlyForecast.innerHTML = hourly.map((hour, index) => `
    <article class="hour-card">
      <time datetime="${new Date(hour.dt * 1000).toISOString()}">${index === 0 ? 'Now' : formatHour(hour.dt, timezoneOffset)}</time>
      ${weatherIcon(hour.weather, isNight, 42)}
      <strong>${formatTemperature(hour.temp)}</strong>
    </article>
  `).join('');
}

function renderDaily(daily, units, timezoneOffset, isNight) {
  if (!daily.length) {
    elements.forecastList.innerHTML = `<div class="empty-state">Daily forecast is unavailable.</div>`;
    return;
  }

  const lows = daily.map((day) => day.min).filter((value) => value != null);
  const highs = daily.map((day) => day.max).filter((value) => value != null);
  const globalLow = Math.min(...lows);
  const globalHigh = Math.max(...highs);
  const range = Math.max(globalHigh - globalLow, 1);

  elements.forecastList.innerHTML = daily.map((day, index) => {
    const start = ((day.min - globalLow) / range) * 100;
    const end = ((day.max - globalLow) / range) * 100;
    return `
      <article class="forecast-row">
        <span class="forecast-day">${formatDay(day.dt, timezoneOffset, index)}</span>
        ${weatherIcon(day.weather, isNight, 34)}
        <span class="forecast-condition">${escapeHtml(day.description || 'Clear')}</span>
        <div class="temp-range" aria-label="Low ${formatTemperature(day.min)}, high ${formatTemperature(day.max)}">
          <span>${formatTemperature(day.min)}</span>
          <span class="range-track">
            <span class="range-fill" style="--range-start:${start}%;--range-end:${end}%;"></span>
          </span>
          <span>${formatTemperature(day.max)}</span>
        </div>
      </article>
    `;
  }).join('');
}

function renderSun(sun, timezoneOffset, now) {
  if (!sun?.sunrise || !sun?.sunset) {
    elements.sunCard.hidden = true;
    return;
  }

  elements.sunCard.hidden = false;
  const dayLength = Math.max(sun.sunset - sun.sunrise, 1);
  const progress = Math.min(Math.max((now - sun.sunrise) / dayLength, 0), 1);
  const dash = 282;
  const x = 20 + (180 * progress);
  const y = 100 - (Math.sin(Math.PI * progress) * 78);

  elements.sunArc.innerHTML = `
    <svg viewBox="0 0 220 120" aria-hidden="true" focusable="false">
      <path class="sun-track" d="M20 100 A90 90 0 0 1 200 100"></path>
      <path class="sun-progress" d="M20 100 A90 90 0 0 1 200 100" style="stroke-dasharray:${dash};stroke-dashoffset:${dash - (dash * progress)};"></path>
    </svg>
    <span class="sun-dot" style="left:${(x / 220) * 100}%;top:${y}px;">${icon('sunrise', 16)}</span>
    <div class="sun-times">
      <div class="sun-time">
        <span>Sunrise</span>
        <strong>${formatLocalTime(sun.sunrise, timezoneOffset)}</strong>
      </div>
      <div class="sun-time">
        <span>Sunset</span>
        <strong>${formatLocalTime(sun.sunset, timezoneOffset)}</strong>
      </div>
    </div>
  `;
}

function renderUv(uvi) {
  const label = getUvLabel(uvi);
  if (!label) {
    elements.uvCard.hidden = true;
    return;
  }

  const width = Math.min((Number(uvi) / 11) * 100, 100);
  elements.uvCard.hidden = false;
  elements.uvContent.innerHTML = `
    <span class="index-label">${escapeHtml(label)}</span>
    <strong class="index-value">${formatNumber(uvi, 1)}</strong>
    <div class="index-meter" aria-hidden="true"><span style="--index-width:${width}%;"></span></div>
    <span class="index-note">${getUvAdvice(label)}</span>
  `;
}

function getUvAdvice(label) {
  if (label === 'Low') return 'Minimal protection needed.';
  if (label === 'Moderate') return 'Shade helps around midday.';
  if (label === 'High') return 'Use sun protection outside.';
  return 'Limit direct sun exposure.';
}

function renderAqi(aqi) {
  if (!aqi?.value) {
    elements.aqiCard.hidden = true;
    return;
  }

  const [label, note] = aqiScale[aqi.value] || ['Unknown', 'Air quality data is limited.'];
  const width = Math.min((Number(aqi.value) / 5) * 100, 100);
  elements.aqiCard.hidden = false;
  elements.aqiContent.innerHTML = `
    <span class="index-label">AQI ${escapeHtml(aqi.value)}</span>
    <strong class="index-value">${escapeHtml(label)}</strong>
    <div class="index-meter" aria-hidden="true"><span style="--index-width:${width}%;"></span></div>
    <span class="index-note">${escapeHtml(note)}</span>
  `;
}

export function showToast(message, type = 'info', title = type === 'error' ? 'Weather issue' : 'WeatherPro') {
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'is-error' : ''}`;
  toast.innerHTML = `
    <span aria-hidden="true">${icon(type === 'error' ? 'alert' : 'clearDay', 22)}</span>
    <div>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
    </div>
  `;

  elements.toastRegion.append(toast);
  window.setTimeout(() => {
    toast.remove();
  }, type === 'error' ? 7000 : 4200);
}
