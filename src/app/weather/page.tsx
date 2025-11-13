'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { FaCloudSun, FaSearch, FaMapMarkerAlt, FaWind, FaTint, FaEye } from 'react-icons/fa';

interface WeatherData {
  name: string;
  sys: { country: string };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
  clouds: { all: number };
}

export default function WeatherPage() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (searchCity?: string) => {
    const cityToSearch = searchCity || city;
    if (!cityToSearch) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(cityToSearch)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch weather');
      }

      setWeather(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather data');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch weather');
          }

          setWeather(data);
          setCity(data.name);
        } catch (err: any) {
          setError(err.message || 'Failed to fetch weather data');
          setWeather(null);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather();
  };

  const popularCities = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Mumbai', 'Dubai', 'Singapore'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <FaCloudSun className="text-yellow-300" />
            Weather Dashboard
          </h1>
          <p className="text-blue-100">Get real-time weather information for any city</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-2xl p-6 mb-6">
          <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !city}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={fetchWeatherByLocation}
              disabled={loading}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              title="Use my location"
            >
              <FaMapMarkerAlt />
            </button>
          </form>

          {/* Popular Cities */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">Popular:</span>
            {popularCities.map((popularCity) => (
              <button
                key={popularCity}
                onClick={() => {
                  setCity(popularCity);
                  fetchWeather(popularCity);
                }}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
              >
                {popularCity}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
            <p className="font-medium">Error: {error}</p>
            <p className="text-sm mt-1">Please check your internet connection and try again.</p>
          </div>
        )}

        {/* Weather Display */}
        {weather && (
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Main Weather Info */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-1">
                    {weather.name}, {weather.sys.country}
                  </h2>
                  <p className="text-blue-100 capitalize">{weather.weather[0].description}</p>
                </div>
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                  alt={weather.weather[0].description}
                  className="w-32 h-32"
                />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold">
                  {Math.round(weather.main.temp)}°C
                </span>
                <span className="text-2xl text-blue-100">
                  Feels like {Math.round(weather.main.feels_like)}°C
                </span>
              </div>
            </div>

            {/* Detailed Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <FaWind className="text-xl" />
                  <span className="text-sm font-medium">Wind Speed</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(weather.wind.speed * 3.6)} km/h
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <FaTint className="text-xl" />
                  <span className="text-sm font-medium">Humidity</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {weather.main.humidity}%
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <FaEye className="text-xl" />
                  <span className="text-sm font-medium">Visibility</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(weather.visibility / 1000)} km
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <FaCloudSun className="text-xl" />
                  <span className="text-sm font-medium">Pressure</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {weather.main.pressure} hPa
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!weather && !error && !loading && (
          <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
            <FaCloudSun className="text-6xl text-blue-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Check the Weather
            </h3>
            <p className="text-gray-600 mb-6">
              Enter a city name or use your location to get started
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={fetchWeatherByLocation}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
              >
                <FaMapMarkerAlt />
                Use My Location
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !weather && (
          <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Fetching weather data...</p>
          </div>
        )}

        {/* Info Note */}
        <div className="mt-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
          <p className="font-medium mb-1">📡 Note: This feature requires an internet connection</p>
          <p className="text-blue-100">
            Weather data is provided by OpenWeatherMap and updates in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
