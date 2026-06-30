import {
  fetchAirPollution,
  fetchCitySuggestions,
  fetchCurrentWeatherByCity,
  fetchCurrentWeatherByCoords,
  fetchForecast5ByCoords,
  fetchOneCallByCoords,
  fetchOptional,
} from './api.js';
import { CONFIG } from './config.js';
import {
  applyResolvedTheme,
  elements,
  formatSuggestionLabel,
  hideSuggestions,
  renderInitialState,
  renderLoadingState,
  renderStaticIcons,
  renderSuggestions,
  renderWeatherDashboard,
  setBusy,
  setControls,
  showToast,
} from './ui.js';

/**
 * Application state and orchestration.
 */

const STORAGE_KEYS = {
  units: 'weatherpro-units',
  themeMode: 'weatherpro-theme-mode',
  activeLocation: 'weatherpro-active-location',
};

const state = {
  units: localStorage.getItem(STORAGE_KEYS.units) || 'metric',
  themeMode: localStorage.getItem(STORAGE_KEYS.themeMode) || 'auto',
  activeLocation: readStoredLocation(),
  lastModel: null,
  suggestions: [],
  activeSuggestionIndex: -1,
  suggestionRequestId: 0,
  suggestionTimer: null,
};

function initializeApp() {
  renderStaticIcons();
  renderInitialState();
  setControls({ units: state.units, themeMode: state.themeMode });
  applyResolvedTheme(state.themeMode, false);

  if (!hasApiKeyConfigured()) {
    bindApiKeyModal();
    showApiKeyModal();
    return;
  }

  bindEvents();

  if (state.activeLocation) {
    loadWeather(state.activeLocation, { silent: true });
  }
}

function bindEvents() {
  elements.form.addEventListener('submit', handleSearchSubmit);
  elements.searchInput.addEventListener('input', handleSearchInput);
  elements.searchInput.addEventListener('keydown', handleSuggestionKeys);
  elements.suggestionsList.addEventListener('click', handleSuggestionClick);
  elements.currentLocationButton.addEventListener('click', handleCurrentLocation);
  elements.unitToggle.addEventListener('click', handleUnitToggle);
  elements.themeModeToggle.addEventListener('click', handleThemeModeToggle);

  document.addEventListener('click', (event) => {
    if (!elements.form.contains(event.target)) hideCitySuggestions();
  });
}

function hasApiKeyConfigured() {
  return Boolean(CONFIG.apiKey && CONFIG.apiKey !== 'YOUR_OPENWEATHERMAP_API_KEY');
}

function bindApiKeyModal() {
  const modal = document.getElementById('apiKeyModal');
  const input = document.getElementById('apiKeyInput');
  const saveButton = document.getElementById('apiKeySaveButton');

  if (!modal || !input || !saveButton) return;

  const saveKey = () => {
    const value = input.value.trim();
    if (!value) {
      input.focus();
      return;
    }

    localStorage.setItem('weatherpro-api-key', value);
    window.location.reload();
  };

  saveButton.addEventListener('click', saveKey);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveKey();
    }
  });
}

function showApiKeyModal() {
  const modal = document.getElementById('apiKeyModal');
  const input = document.getElementById('apiKeyInput');
  if (!modal || !input) return;

  modal.hidden = false;
  input.focus();
}

async function handleSearchSubmit(event) {
  event.preventDefault();
  const query = elements.searchInput.value.trim();

  if (!query) {
    showToast('Enter a city name to search.', 'error', 'Missing city');
    return;
  }

  if (state.activeSuggestionIndex >= 0 && state.suggestions[state.activeSuggestionIndex]) {
    selectSuggestion(state.suggestions[state.activeSuggestionIndex]);
    return;
  }

  hideCitySuggestions();
  await loadWeather({ type: 'city', city: query });
}

function handleSearchInput() {
  const query = elements.searchInput.value.trim();
  state.activeSuggestionIndex = -1;

  window.clearTimeout(state.suggestionTimer);
  if (query.length < 2) {
    hideCitySuggestions();
    return;
  }

  state.suggestionTimer = window.setTimeout(async () => {
    const requestId = ++state.suggestionRequestId;
    try {
      const suggestions = await fetchCitySuggestions(query);
      if (requestId !== state.suggestionRequestId) return;
      state.suggestions = suggestions;
      renderSuggestions(suggestions, state.activeSuggestionIndex);
    } catch {
      hideCitySuggestions();
    }
  }, 260);
}

function handleSuggestionKeys(event) {
  if (elements.suggestionsPanel.hidden || !state.suggestions.length) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    state.activeSuggestionIndex = (state.activeSuggestionIndex + 1) % state.suggestions.length;
    renderSuggestions(state.suggestions, state.activeSuggestionIndex);
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    state.activeSuggestionIndex = state.activeSuggestionIndex <= 0
      ? state.suggestions.length - 1
      : state.activeSuggestionIndex - 1;
    renderSuggestions(state.suggestions, state.activeSuggestionIndex);
  }

  if (event.key === 'Enter' && state.activeSuggestionIndex >= 0) {
    event.preventDefault();
    selectSuggestion(state.suggestions[state.activeSuggestionIndex]);
  }

  if (event.key === 'Escape') {
    hideCitySuggestions();
  }
}

function handleSuggestionClick(event) {
  const option = event.target.closest('.suggestion-option');
  if (!option) return;

  const suggestion = state.suggestions[Number(option.dataset.index)];
  if (suggestion) selectSuggestion(suggestion);
}

function selectSuggestion(suggestion) {
  const label = formatSuggestionLabel(suggestion);
  elements.searchInput.value = label;
  hideCitySuggestions();
  loadWeather({
    type: 'coords',
    lat: suggestion.lat,
    lon: suggestion.lon,
    label,
  });
}

function handleCurrentLocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported in this browser.', 'error', 'Location unavailable');
    return;
  }

  setBusy(true);
  renderLoadingState();
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      loadWeather({
        type: 'coords',
        lat: latitude,
        lon: longitude,
        label: 'Current location',
      });
    },
    () => {
      setBusy(false);
      restoreAfterFailedLoad();
      showToast('Location permission was denied or unavailable.', 'error', 'Location unavailable');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
  );
}

function handleUnitToggle(event) {
  const button = event.target.closest('[data-unit]');
  if (!button || button.dataset.unit === state.units) return;

  state.units = button.dataset.unit;
  localStorage.setItem(STORAGE_KEYS.units, state.units);
  setControls({ units: state.units, themeMode: state.themeMode });

  if (state.activeLocation) {
    loadWeather(state.activeLocation, { silent: true });
  }
}

function handleThemeModeToggle(event) {
  const button = event.target.closest('[data-theme-mode]');
  if (!button || button.dataset.themeMode === state.themeMode) return;

  state.themeMode = button.dataset.themeMode;
  localStorage.setItem(STORAGE_KEYS.themeMode, state.themeMode);
  setControls({ units: state.units, themeMode: state.themeMode });
  applyResolvedTheme(state.themeMode, state.lastModel?.isNight || false);
}

async function loadWeather(locationRequest, options = {}) {
  setBusy(true);
  renderLoadingState();

  try {
    const current = await fetchCurrentForLocation(locationRequest);
    const lat = current.coord?.lat ?? locationRequest.lat;
    const lon = current.coord?.lon ?? locationRequest.lon;

    const [oneCallResult, airResult] = await Promise.all([
      fetchOptional(() => fetchOneCallByCoords(lat, lon, state.units)),
      fetchOptional(() => fetchAirPollution(lat, lon)),
    ]);

    let forecast5Result = { ok: false, data: null };
    const oneCall = oneCallResult.ok && hasForecastPayload(oneCallResult.data)
      ? oneCallResult.data
      : null;

    if (!oneCall) {
      forecast5Result = await fetchOptional(() => fetchForecast5ByCoords(lat, lon, state.units));
    }

    const model = normalizeWeather({
      current,
      oneCall,
      forecast5: forecast5Result.ok ? forecast5Result.data : null,
      air: airResult.ok ? airResult.data : null,
      request: locationRequest,
      units: state.units,
    });

    state.activeLocation = {
      type: 'coords',
      lat,
      lon,
      label: model.locationName,
    };
    state.lastModel = model;
    localStorage.setItem(STORAGE_KEYS.activeLocation, JSON.stringify(state.activeLocation));

    renderWeatherDashboard(model);
    applyResolvedTheme(state.themeMode, model.isNight);

    if (!options.silent && !oneCall && forecast5Result.ok) {
      showToast('Showing 5-day forecast because One Call data is unavailable.', 'info', 'Forecast fallback');
    }
    if (!options.silent && oneCall) {
      showToast(`${model.locationName} updated.`, 'info', 'Weather loaded');
    }
  } catch (error) {
    restoreAfterFailedLoad();
    showToast(error.message || 'Unable to load weather.', 'error', 'Weather unavailable');
  } finally {
    setBusy(false);
  }
}

async function fetchCurrentForLocation(locationRequest) {
  if (locationRequest.type === 'coords') {
    return fetchCurrentWeatherByCoords(locationRequest.lat, locationRequest.lon, state.units);
  }
  return fetchCurrentWeatherByCity(locationRequest.city, state.units);
}

function restoreAfterFailedLoad() {
  if (state.lastModel) {
    renderWeatherDashboard(state.lastModel);
    applyResolvedTheme(state.themeMode, state.lastModel.isNight);
  } else {
    renderInitialState();
    applyResolvedTheme(state.themeMode, false);
  }
}

function hasForecastPayload(oneCall) {
  return Boolean(oneCall?.current || oneCall?.hourly?.length || oneCall?.daily?.length);
}

function normalizeWeather({ current, oneCall, forecast5, air, request, units }) {
  const timezoneOffset = oneCall?.timezone_offset ?? current.timezone ?? 0;
  const now = current.dt ?? oneCall?.current?.dt ?? Math.floor(Date.now() / 1000);
  const currentWeather = oneCall?.current?.weather?.[0] || current.weather?.[0] || {};
  const daily = normalizeDaily(oneCall, forecast5, current, timezoneOffset);
  const hourly = normalizeHourly(oneCall, forecast5, current);
  const sunrise = oneCall?.current?.sunrise ?? current.sys?.sunrise;
  const sunset = oneCall?.current?.sunset ?? current.sys?.sunset;
  const isNight = getIsNight(now, sunrise, sunset, timezoneOffset);

  return {
    units,
    now,
    timezoneOffset,
    updatedAt: now,
    isNight,
    forecastSource: oneCall ? 'onecall' : (forecast5 ? 'forecast5' : 'current'),
    locationName: buildLocationName(current, request.label),
    current: {
      temp: oneCall?.current?.temp ?? current.main?.temp,
      feelsLike: oneCall?.current?.feels_like ?? current.main?.feels_like,
      humidity: oneCall?.current?.humidity ?? current.main?.humidity,
      pressure: oneCall?.current?.pressure ?? current.main?.pressure,
      windSpeed: oneCall?.current?.wind_speed ?? current.wind?.speed,
      windDeg: oneCall?.current?.wind_deg ?? current.wind?.deg,
      visibility: oneCall?.current?.visibility ?? current.visibility,
      high: current.main?.temp_max,
      low: current.main?.temp_min,
      description: currentWeather.description || currentWeather.main || 'Clear',
      weather: currentWeather,
    },
    hourly,
    daily,
    sun: { sunrise, sunset },
    uvIndex: oneCall?.current?.uvi ?? oneCall?.daily?.[0]?.uvi ?? null,
    aqi: normalizeAqi(air),
  };
}

function buildLocationName(current, fallbackLabel) {
  const name = current.name || fallbackLabel || 'Current location';
  const country = current.sys?.country;
  return country && !String(name).includes(country) ? `${name}, ${country}` : name;
}

function normalizeHourly(oneCall, forecast5, current) {
  if (oneCall?.hourly?.length) {
    return oneCall.hourly.slice(0, 24).map((hour) => ({
      dt: hour.dt,
      temp: hour.temp,
      weather: hour.weather?.[0] || {},
    }));
  }

  if (forecast5?.list?.length) {
    return forecast5.list.slice(0, 8).map((item) => ({
      dt: item.dt,
      temp: item.main?.temp,
      weather: item.weather?.[0] || {},
    }));
  }

  return [{
    dt: current.dt ?? Math.floor(Date.now() / 1000),
    temp: current.main?.temp,
    weather: current.weather?.[0] || {},
  }];
}

function normalizeDaily(oneCall, forecast5, current, timezoneOffset) {
  if (oneCall?.daily?.length) {
    return oneCall.daily.slice(0, 7).map((day) => ({
      dt: day.dt,
      min: day.temp?.min,
      max: day.temp?.max,
      description: day.weather?.[0]?.description || day.summary || 'Clear',
      weather: day.weather?.[0] || {},
    }));
  }

  if (forecast5?.list?.length) {
    return aggregateForecast5(forecast5.list, timezoneOffset).slice(0, 7);
  }

  return [{
    dt: current.dt ?? Math.floor(Date.now() / 1000),
    min: current.main?.temp_min ?? current.main?.temp,
    max: current.main?.temp_max ?? current.main?.temp,
    description: current.weather?.[0]?.description || 'Clear',
    weather: current.weather?.[0] || {},
  }];
}

function aggregateForecast5(list, timezoneOffset) {
  const groups = new Map();

  list.forEach((item) => {
    const key = getLocalDateKey(item.dt, timezoneOffset);
    const group = groups.get(key) || {
      dt: item.dt,
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      items: [],
    };

    group.min = Math.min(group.min, item.main?.temp_min ?? item.main?.temp);
    group.max = Math.max(group.max, item.main?.temp_max ?? item.main?.temp);
    group.items.push(item);
    groups.set(key, group);
  });

  return [...groups.values()].map((group) => {
    const representative = findMiddayItem(group.items, timezoneOffset) || group.items[0];
    return {
      dt: group.dt,
      min: group.min,
      max: group.max,
      description: representative.weather?.[0]?.description || 'Clear',
      weather: representative.weather?.[0] || {},
    };
  });
}

function findMiddayItem(items, timezoneOffset) {
  return items.find((item) => {
    const hour = new Date((item.dt + timezoneOffset) * 1000).getUTCHours();
    return hour >= 11 && hour <= 14;
  });
}

function getLocalDateKey(timestamp, timezoneOffset) {
  return new Date((timestamp + timezoneOffset) * 1000).toISOString().slice(0, 10);
}

function getIsNight(now, sunrise, sunset, timezoneOffset) {
  if (sunrise && sunset) return now < sunrise || now >= sunset;
  const localHour = new Date((now + timezoneOffset) * 1000).getUTCHours();
  return localHour < 6 || localHour >= 18;
}

function normalizeAqi(air) {
  const value = air?.list?.[0]?.main?.aqi;
  return value ? { value } : null;
}

function hideCitySuggestions() {
  state.suggestions = [];
  state.activeSuggestionIndex = -1;
  hideSuggestions();
}

function readStoredLocation() {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.activeLocation);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

initializeApp();
