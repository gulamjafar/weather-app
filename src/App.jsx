import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // =========================
  // STATES
  // =========================

  const [city, setCity] = useState("");
  const [searchCity, setSearchCity] = useState("Siwan");

  const [weather, setWeather] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [darkMode, setDarkMode] = useState(false);

  // =========================
  // LOAD DEFAULT CITY
  // =========================

  useEffect(() => {
    fetchWeather(searchCity);
  }, [searchCity]);

  // =========================
  // WEATHER API FUNCTION
  // =========================

  const fetchWeather = async (cityName) => {
    if (!cityName || !cityName.trim()) {
      setError("Please enter a city name.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // -------------------------
      // STEP 1: CITY SEARCH
      // -------------------------

      const locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityName
        )}&count=1&language=en&format=json`
      );

      if (!locationResponse.ok) {
        throw new Error("Unable to find location.");
      }

      const locationData = await locationResponse.json();

      if (!locationData.results || locationData.results.length === 0) {
        throw new Error("City not found. Please try another city.");
      }

      const location = locationData.results[0];

      // -------------------------
      // STEP 2: WEATHER DATA
      // -------------------------

      await fetchWeatherByCoordinates(
        location.latitude,
        location.longitude,
        location
      );
    } catch (err) {
      setWeather(null);
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  // =========================
  // WEATHER BY COORDINATES
  // =========================

  const fetchWeatherByCoordinates = async (
    latitude,
    longitude,
    location = null
  ) => {
    try {
      setLoading(true);
      setError("");

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`
      );

      if (!weatherResponse.ok) {
        throw new Error("Weather data could not be loaded.");
      }

      const weatherData = await weatherResponse.json();

      setWeather({
        location: location || {
          name: "Current Location",
          country: "",
        },
        current: weatherData.current,
        daily: weatherData.daily,
      });
    } catch (err) {
      setWeather(null);
      setError(err.message || "Unable to load weather.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // WEATHER TEXT
  // =========================

  const getWeatherText = (code) => {
    if (code === 0) return "Clear Sky";

    if ([1, 2, 3].includes(code)) {
      return "Partly Cloudy";
    }

    if ([45, 48].includes(code)) {
      return "Fog";
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
      return "Drizzle";
    }

    if ([61, 63, 65, 66, 67].includes(code)) {
      return "Rain";
    }

    if ([71, 73, 75, 77].includes(code)) {
      return "Snow";
    }

    if ([80, 81, 82].includes(code)) {
      return "Rain Showers";
    }

    if ([95, 96, 99].includes(code)) {
      return "Thunderstorm";
    }

    return "Unknown Weather";
  };

  // =========================
  // WEATHER ICON
  // =========================

  const getWeatherIcon = (code) => {
    if (code === 0) return "☀️";

    if ([1, 2, 3].includes(code)) {
      return "⛅";
    }

    if ([45, 48].includes(code)) {
      return "🌫️";
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
      return "🌦️";
    }

    if ([61, 63, 65, 66, 67].includes(code)) {
      return "🌧️";
    }

    if ([71, 73, 75, 77].includes(code)) {
      return "❄️";
    }

    if ([80, 81, 82].includes(code)) {
      return "🌦️";
    }

    if ([95, 96, 99].includes(code)) {
      return "⛈️";
    }

    return "🌤️";
  };

  // =========================
  // SEARCH BUTTON
  // =========================

  const handleSearch = () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setSearchCity(city.trim());
  };

  // =========================
  // ENTER KEY SEARCH
  // =========================

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // =========================
  // REFRESH WEATHER
  // =========================

  const handleRefresh = () => {
    if (searchCity) {
      fetchWeather(searchCity);
    }
  };

  // =========================
  // CURRENT LOCATION
  // =========================

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        await fetchWeatherByCoordinates(
          latitude,
          longitude,
          {
            name: "Your Location",
            country: "",
          }
        );
      },
      () => {
        setLoading(false);
        setError(
          "Location permission denied. Please allow location access."
        );
      }
    );
  };

  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (date) => {
    const newDate = new Date(`${date}T00:00:00`);

    return newDate.toLocaleDateString("en-US", {
      weekday: "short",
    });
  };

  // =========================
  // MAIN UI
  // =========================

  return (
    <div className={darkMode ? "app dark" : "app"}>

      <div className="weather-card">

        {/* HEADER */}

        <div className="top-bar">

          <div>
            <h1>🌤️ Weather App</h1>

            <p className="subtitle">
              Check current weather of any city
            </p>
          </div>

          <button
            className="theme-button"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

        </div>

        {/* SEARCH */}

        <div className="search-box">

          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button onClick={handleSearch}>
            🔍 Search
          </button>

        </div>

        {/* EXTRA BUTTONS */}

        <div className="action-buttons">

          <button
            className="location-button"
            onClick={handleCurrentLocation}
          >
            📍 Current Location
          </button>

          <button
            className="refresh-button"
            onClick={handleRefresh}
          >
            🔄 Refresh
          </button>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading weather...</p>
          </div>
        )}

        {/* ERROR */}

        {error && !loading && (
          <div className="error">
            ❌ {error}
          </div>
        )}

        {/* WEATHER */}

        {weather && !loading && !error && (
          <>

            {/* CURRENT WEATHER */}

            <div className="weather-info">

              <h2>
                {weather.location.name}
                {weather.location.country
                  ? `, ${weather.location.country}`
                  : ""}
              </h2>

              <div className="main-weather">

                <div className="big-icon">
                  {getWeatherIcon(
                    weather.current.weather_code
                  )}
                </div>

                <div className="temperature">
                  {Math.round(
                    weather.current.temperature_2m
                  )}
                  °C
                </div>

              </div>

              <p className="condition">
                {getWeatherText(
                  weather.current.weather_code
                )}
              </p>

              {/* WEATHER DETAILS */}

              <div className="details">

                {/* Humidity */}

                <div className="detail-box">

                  <span className="detail-icon">
                    💧
                  </span>

                  <strong>
                    {weather.current.relative_humidity_2m}%
                  </strong>

                  <span className="detail-name">
                    Humidity
                  </span>

                </div>

                {/* Wind */}

                <div className="detail-box">

                  <span className="detail-icon">
                    💨
                  </span>

                  <strong>
                    {weather.current.wind_speed_10m} km/h
                  </strong>

                  <span className="detail-name">
                    Wind Speed
                  </span>

                </div>

                {/* Feels Like */}

                <div className="detail-box">

                  <span className="detail-icon">
                    🌡️
                  </span>

                  <strong>
                    {Math.round(
                      weather.current.apparent_temperature
                    )}
                    °C
                  </strong>

                  <span className="detail-name">
                    Feels Like
                  </span>

                </div>

                {/* Rain */}

                <div className="detail-box">

                  <span className="detail-icon">
                    🌧️
                  </span>

                  <strong>
                    {weather.current.precipitation} mm
                  </strong>

                  <span className="detail-name">
                    Precipitation
                  </span>

                </div>

              </div>

            </div>

            {/* FORECAST */}

            <h2 className="forecast-title">
              📅 5 Day Forecast
            </h2>

            <div className="forecast">

              {weather.daily.time.map((date, index) => (

                <div
                  className="day"
                  key={date}
                >

                  <strong>
                    {formatDate(date)}
                  </strong>

                  <span className="forecast-icon">
                    {getWeatherIcon(
                      weather.daily.weather_code[index]
                    )}
                  </span>

                  <b>
                    {Math.round(
                      weather.daily.temperature_2m_max[index]
                    )}
                    °C
                  </b>

                  <small>
                    Min{" "}
                    {Math.round(
                      weather.daily.temperature_2m_min[index]
                    )}
                    °C
                  </small>

                  <small className="rain-chance">
                    💧{" "}
                    {weather.daily
                      .precipitation_probability_max[
                        index
                      ] ?? 0}
                    % rain
                  </small>

                </div>

              ))}

            </div>

          </>
        )}

        {/* FOOTER */}

        <p className="footer">
          Weather data provided by Open-Meteo
        </p>

      </div>

    </div>
  );
}

export default App;