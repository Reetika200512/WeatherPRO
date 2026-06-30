const STORAGE_KEY = 'weatherpro-api-key';

function readStoredApiKey() {
  try {
    return window.localStorage?.getItem(STORAGE_KEY)?.trim() || '';
  } catch {
    return '';
  }
}

function saveApiKey(apiKey) {
  if (typeof window === 'undefined') {
    return '';
  }

  const trimmedKey = (apiKey || '').trim();
  if (!trimmedKey) {
    return '';
  }

  try {
    window.localStorage?.setItem(STORAGE_KEY, trimmedKey);
  } catch {
    // Ignore storage failures and continue with the in-memory value.
  }

  return trimmedKey;
}

function promptForApiKey() {
  if (typeof window === 'undefined' || !window.prompt) {
    return '';
  }

  const enteredKey = window.prompt('Enter your OpenWeatherMap API key', '')?.trim();
  return saveApiKey(enteredKey);
}

let localConfig = {};

try {
  const module = await import('./config.local.js');
  localConfig = module?.CONFIG || module?.default || module || {};
} catch {
  localConfig = {};
}

const configuredApiKey = (localConfig.apiKey || readStoredApiKey() || promptForApiKey() || '').trim();

if (configuredApiKey && !readStoredApiKey()) {
  saveApiKey(configuredApiKey);
}

export const CONFIG = {
  apiBaseV25: 'https://api.openweathermap.org/data/2.5',
  oneCallBase: 'https://api.openweathermap.org/data/3.0/onecall',
  geoBase: 'https://api.openweathermap.org/geo/1.0',
  apiKey: configuredApiKey || 'YOUR_OPENWEATHERMAP_API_KEY',
  defaultUnits: 'metric',
  defaultLang: 'en',
  suggestionLimit: 5,
  oneCallExclude: 'minutely,alerts',
};
