import { CONFIG } from './config.js';

/**
 * OpenWeatherMap API client helpers.
 * Each function returns raw API data; app.js decides how to combine endpoints.
 */

function buildUrl(base, endpoint = '', params = {}) {
  const url = new URL(endpoint ? `${base}/${endpoint}` : base);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

function getUnits(units) {
  return units || CONFIG.defaultUnits;
}

function getApiErrorMessage(data, response) {
  const apiMessage = data && (data.message || data.error);
  if (response.status === 401) {
    return 'Invalid OpenWeatherMap API key or the requested endpoint is not enabled.';
  }
  if (response.status === 404) {
    return apiMessage || 'Location not found.';
  }
  if (response.status === 429) {
    return 'OpenWeatherMap rate limit reached. Try again later.';
  }
  return apiMessage || response.statusText || 'OpenWeatherMap request failed.';
}

async function safeFetchJson(url) {
  try {
    const response = await fetch(url);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(getApiErrorMessage(data, response));
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Network error. Check your connection and local server.');
    }
    throw error;
  }
}

export async function fetchOptional(request) {
  try {
    return { ok: true, data: await request() };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function fetchCitySuggestions(query, limit = CONFIG.suggestionLimit) {
  const city = query.trim();
  if (city.length < 2) return [];

  const apiUrl = buildUrl(CONFIG.geoBase, 'direct', {
    q: city,
    limit,
    appid: CONFIG.apiKey,
  });

  const data = await safeFetchJson(apiUrl);
  return Array.isArray(data) ? data : [];
}

export async function fetchReverseGeocode(lat, lon, limit = 1) {
  const apiUrl = buildUrl(CONFIG.geoBase, 'reverse', {
    lat,
    lon,
    limit,
    appid: CONFIG.apiKey,
  });

  const data = await safeFetchJson(apiUrl);
  return Array.isArray(data) ? data : [];
}

export async function fetchCurrentWeatherByCity(cityName, units) {
  if (!cityName) throw new Error('City name is required.');

  const apiUrl = buildUrl(CONFIG.apiBaseV25, 'weather', {
    q: cityName,
    appid: CONFIG.apiKey,
    units: getUnits(units),
    lang: CONFIG.defaultLang,
  });

  return safeFetchJson(apiUrl);
}

export async function fetchCurrentWeatherByCoords(lat, lon, units) {
  if (lat == null || lon == null) throw new Error('Latitude and longitude are required.');

  const apiUrl = buildUrl(CONFIG.apiBaseV25, 'weather', {
    lat,
    lon,
    appid: CONFIG.apiKey,
    units: getUnits(units),
    lang: CONFIG.defaultLang,
  });

  return safeFetchJson(apiUrl);
}

export async function fetchForecast5ByCoords(lat, lon, units) {
  if (lat == null || lon == null) throw new Error('Latitude and longitude are required.');

  const apiUrl = buildUrl(CONFIG.apiBaseV25, 'forecast', {
    lat,
    lon,
    appid: CONFIG.apiKey,
    units: getUnits(units),
    lang: CONFIG.defaultLang,
  });

  return safeFetchJson(apiUrl);
}

export async function fetchOneCallByCoords(lat, lon, units) {
  if (lat == null || lon == null) throw new Error('Latitude and longitude are required.');

  const apiUrl = buildUrl(CONFIG.oneCallBase, '', {
    lat,
    lon,
    appid: CONFIG.apiKey,
    units: getUnits(units),
    lang: CONFIG.defaultLang,
    exclude: CONFIG.oneCallExclude,
  });

  return safeFetchJson(apiUrl);
}

export async function fetchAirPollution(lat, lon) {
  if (lat == null || lon == null) throw new Error('Latitude and longitude are required.');

  const apiUrl = buildUrl(CONFIG.apiBaseV25, 'air_pollution', {
    lat,
    lon,
    appid: CONFIG.apiKey,
  });

  return safeFetchJson(apiUrl);
}

// Backward-compatible names from the original app.
export const fetchCurrentWeather = fetchCurrentWeatherByCity;
export const fetchForecastByCoords = fetchOneCallByCoords;

export async function fetchForecast(cityName, units) {
  const current = await fetchCurrentWeatherByCity(cityName, units);
  return fetchOneCallByCoords(current.coord.lat, current.coord.lon, units);
}
