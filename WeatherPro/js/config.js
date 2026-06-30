let localConfig = {};

try {
  const module = await import('./config.local.js');
  localConfig = module?.CONFIG || module?.default || module || {};
} catch {
  localConfig = {};
}

export const CONFIG = {
  apiBaseV25: 'https://api.openweathermap.org/data/2.5',
  oneCallBase: 'https://api.openweathermap.org/data/3.0/onecall',
  geoBase: 'https://api.openweathermap.org/geo/1.0',
  apiKey: localConfig.apiKey || 'YOUR_OPENWEATHERMAP_API_KEY',
  defaultUnits: 'metric',
  defaultLang: 'en',
  suggestionLimit: 5,
  oneCallExclude: 'minutely,alerts',
};
