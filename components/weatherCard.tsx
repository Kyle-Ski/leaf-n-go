import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import {
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSun,
  Loader2,
  Moon,
  Snowflake,
  Sun,
  Wind,
  ExternalLink,
  CloudHail,
  CloudSnow,
  CloudRainWind,
  CloudFog,
} from "lucide-react";

interface WeatherProps {
  locationString: string; // The location string provided by the user
}

interface WeatherPeriod {
  name: string;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  icon: string;
}

const WeatherCard: React.FC<WeatherProps> = ({ locationString }) => {
  const [weatherData, setWeatherData] = useState<WeatherPeriod[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailedForecastUrl, setDetailedForecastUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoordinatesAndWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            locationString
          )}&format=json&limit=1`
        );

        if (!nominatimResponse.ok) {
          throw new Error("Failed to fetch location coordinates");
        }

        const nominatimData = await nominatimResponse.json();

        if (!nominatimData || nominatimData.length === 0) {
          throw new Error("Invalid location received from Nominatim");
        }

        const { lat, lon } = nominatimData[0];

        const weatherResponse = await fetch(
          `https://api.weather.gov/points/${lat},${lon}`
        );

        if (!weatherResponse.ok) {
          throw new Error("Failed to fetch location grid");
        }

        const { properties } = await weatherResponse.json();
        const forecastResponse = await fetch(properties.forecast);
        if (!forecastResponse.ok) {
          throw new Error("Failed to fetch weather forecast");
        }

        const forecastData = await forecastResponse.json();
        setWeatherData(forecastData.properties.periods.slice(0, 7)); // Get a week's worth of data

        setDetailedForecastUrl(
          `https://forecast.weather.gov/MapClick.php?lat=${lat}&lon=${lon}`
        );
      } catch (err) {
        console.error("Error:", err);
        setError("An error occurred while fetching weather data");
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinatesAndWeather();
  }, [locationString]);

  const getWeatherIcon = (shortForecast: string) => {
    if (/sun|clear/i.test(shortForecast)) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (/partly sunny|partly clear|partly cloudy/i.test(shortForecast)) return <CloudSun className="w-8 h-8 text-orange-400" />;
    if (/rain|shower/i.test(shortForecast)) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (/heavy rain|downpour/i.test(shortForecast)) return <CloudRainWind className="w-8 h-8 text-blue-700" />;
    if (/cloudy|overcast/i.test(shortForecast)) return <Cloud className="w-8 h-8 text-gray-500" />;
    if (/snow|flurries/i.test(shortForecast)) return <CloudSnow className="w-8 h-8 text-blue-300" />;
    if (/hail/i.test(shortForecast)) return <CloudHail className="w-8 h-8 text-gray-500" />; // You could add a hail-specific icon
    if (/windy|breezy/i.test(shortForecast)) return <Wind className="w-8 h-8 text-gray-400" />;
    if (/storm|thunder/i.test(shortForecast)) return <CloudLightning className="w-8 h-8 text-yellow-700" />;
    if (/fog|haze|mist/i.test(shortForecast)) return <CloudFog className="w-8 h-8 text-gray-400 opacity-70" />;
    if (/night/i.test(shortForecast)) return <Moon className="w-8 h-8 text-indigo-500" />;
    if (/drizzle/i.test(shortForecast)) return <CloudRain className="w-8 h-8 text-blue-300" />;
    if (/hot/i.test(shortForecast)) return <Sun className="w-8 h-8 text-red-500" />;
    if (/cold/i.test(shortForecast)) return <Snowflake className="w-8 h-8 text-cyan-500" />;
    return <CloudSun className="w-8 h-8 text-orange-400" />; // Default
};

  return (
    <div className="max-w-[350px] sm:max-w-full mx-auto">
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader>
          <div className="flex flex-col items-start">
            <CardTitle>Current Weather Forecast for: {locationString}</CardTitle>
            {detailedForecastUrl && (
              <a
                href={detailedForecastUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center mt-2"
              >
                <ExternalLink className="w-4 h-4 mr-1" /> View Full Forecast
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : weatherData ? (
            <div>
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 px-4">
                  {weatherData.map((period) => (
                    <div
                      key={period.name}
                      className="flex flex-col items-center justify-center bg-gray-50 p-3 rounded-md shadow-md w-[80px] sm:w-[120px] flex-shrink-0"
                    >
                      <p className="font-semibold text-center text-sm">{period.name}</p>
                      <div className="my-2">{getWeatherIcon(period.shortForecast)}</div>
                      <p className="text-lg font-bold">
                        {period.temperature}°{period.temperatureUnit}
                      </p>
                      <p className="text-sm text-gray-500 text-center">{period.shortForecast}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No weather data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherCard;
