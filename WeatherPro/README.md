# WeatherPro

WeatherPro is a vanilla HTML/CSS/JavaScript weather app powered by OpenWeatherMap. The frontend has been rebuilt as a Google Weather-inspired dashboard with a large current-temperature hero, dynamic condition backgrounds, hourly and daily forecasts, sunrise/sunset, UV index, air quality, geolocation, autocomplete city search, loading skeletons, styled error toasts, unit switching, and auto/manual dark mode.

## What changed

- Rebuilt the page structure into weather-focused components: search, hero, stat cards, hourly strip, daily forecast, sun arc, UV card, AQI card, and toast region.
- Added responsive Google Weather-style styling with soft cards, dynamic day/night and weather-condition backgrounds, skeleton loading states, and smooth transitions.
- Kept OpenWeatherMap modular in `js/api.js`, adding helpers for geocoding, current weather, 5-day/3-hour forecast, One Call 3.0, and air pollution.
- Added `js/icons.js` for local inline SVG weather and UI icons, so no icon framework is required.
- Added graceful fallback behavior when One Call 3.0, UV, or AQI data is not available on the API plan.

## Folder structure

```text
WeatherPro/
  index.html
  css/
    variables.css
    style.css
    responsive.css
    animations.css
  js/
    config.js
    api.js
    icons.js
    ui.js
    app.js
  assets/
    icons/
      weatherpro.svg
  README.md
  manifest.json
  service-worker.js
```

## OpenWeatherMap API key

Open `js/config.js` and replace the `apiKey` value:

```js
export const CONFIG = {
  apiKey: 'YOUR_OPENWEATHERMAP_API_KEY',
};
```

The app uses these OpenWeatherMap endpoints:

- Current weather: `/data/2.5/weather`
- 5-day / 3-hour forecast fallback: `/data/2.5/forecast`
- City autocomplete: `/geo/1.0/direct`
- One Call 3.0: `/data/3.0/onecall`
- Air pollution: `/data/2.5/air_pollution`

One Call 3.0 may require a separate OpenWeatherMap subscription. If it is unavailable, WeatherPro still loads current weather and uses the 5-day/3-hour forecast as a fallback.

## Run locally

Serve the `WeatherPro` folder from a local server, such as VS Code Live Server at:

```text
http://127.0.0.1:5500/
```

Because the app uses ES modules, use a local server instead of opening `index.html` directly from the file system.

## Notes

- Unit preference, theme mode, and last location are stored in `localStorage`.
- Theme mode supports `Auto`, `Light`, and `Dark`; `Auto` uses sunrise/sunset or the searched location's local hour.
- AQI and UV cards hide automatically when their data is unavailable.
