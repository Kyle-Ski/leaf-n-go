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
import { useAppContext } from "@/lib/appContext";
import { WeatherData, WeatherPeriod } from "@/types/projectTypes";


interface WeatherProps {
    locationString: string;
    tripId: string;
}

const WeatherCard: React.FC<WeatherProps> = ({ locationString, tripId }) => {
    const { state, dispatch } = useAppContext();
    const [weatherData, setWeatherData] = useState<WeatherPeriod[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [detailedForecastUrl, setDetailedForecastUrl] = useState<string | null>(null);

    const trip = state.trips.find(t => t.id === tripId);
    const cachedWeather = trip?.weather_data;

    const isCacheValid = (lastFetched: string): boolean => {
        const fetchedTime = new Date(lastFetched).getTime();
        const currentTime = new Date().getTime();
        const hoursDifference = (currentTime - fetchedTime) / (1000 * 60 * 60);
        return hoursDifference < 8; // Cache is valid for 8 hours
    };

    useEffect(() => {
        const fetchWeatherData = async () => {
            // Check if we have valid cached data
            if (cachedWeather &&
                cachedWeather.location === locationString &&
                isCacheValid(cachedWeather.last_fetched)) {
                setWeatherData(cachedWeather.forecast)
                setDetailedForecastUrl(`https://www.google.com/search?q=weather+in+${encodeURIComponent(locationString)}`);
                return; // Use cached data
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `https://api.weatherapi.com/v1/forecast.json?key=${process.env.NEXT_PUBLIC_WEATHERAPI_KEY}&q=${encodeURIComponent(
                        locationString
                    )}&days=7`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch weather data");
                }

                const data = await response.json();

                // Format the weather data
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const forecast = data.forecast.forecastday.map((day: any) => ({
                    name: new Date(day.date).toLocaleDateString("en-US", { weekday: "long" }),
                    high: day.day.maxtemp_f,
                    low: day.day.mintemp_f,
                    temperatureUnit: "°F",
                    shortForecast: day.day.condition.text,
                }));

                const weatherData: WeatherData = {
                    forecast,
                    last_fetched: new Date().toISOString(),
                    location: locationString,
                };

                // Update trip with new weather data
                if (trip) {
                    const updatedTrip = {
                        ...trip,
                        weather_data: weatherData,
                    };
                    const saveWeatherData = async (weatherData: WeatherData) => {
                        try {
                            const response = await fetch(`/api/trips/${tripId}/weather`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ weatherData }),
                            });

                            if (response.ok) {
                                console.log("Weather data saved successfully");
                            } else {
                                console.error("Failed to save weather data");
                            }
                        } catch (error) {
                            console.error("Error saving weather data:", error);
                        }
                    };
                    setWeatherData(weatherData.forecast)
                    // Call saveWeatherData when dispatching the updated trip
                    dispatch({ type: "UPDATE_TRIP", payload: updatedTrip });
                    saveWeatherData(weatherData);
                }

                setDetailedForecastUrl(`https://www.google.com/search?q=weather+in+${encodeURIComponent(locationString)}`);
            } catch (err) {
                console.error("Error:", err);
                setError("An error occurred while fetching weather data");
            } finally {
                setLoading(false);
            }
        };

        if (locationString) {
            fetchWeatherData();
        }
    }, [locationString, tripId, dispatch]);

    const getWeatherIcon = (shortForecast: string) => {
        if (/sun|clear/i.test(shortForecast)) return <Sun className="w-8 h-8 text-yellow-500" />;
        if (/partly sunny|partly clear|partly cloudy/i.test(shortForecast)) return <CloudSun className="w-8 h-8 text-orange-400" />;
        if (/rain|shower/i.test(shortForecast)) return <CloudRain className="w-8 h-8 text-blue-500" />;
        if (/heavy rain|downpour/i.test(shortForecast)) return <CloudRainWind className="w-8 h-8 text-blue-700" />;
        if (/cloudy|overcast/i.test(shortForecast)) return <Cloud className="w-8 h-8 text-gray-500" />;
        if (/snow|flurries/i.test(shortForecast)) return <CloudSnow className="w-8 h-8 text-blue-300" />;
        if (/hail/i.test(shortForecast)) return <CloudHail className="w-8 h-8 text-gray-500" />;
        if (/windy|breezy/i.test(shortForecast)) return <Wind className="w-8 h-8 text-gray-400" />;
        if (/storm|thunder/i.test(shortForecast)) return <CloudLightning className="w-8 h-8 text-yellow-700" />;
        if (/fog|haze|mist/i.test(shortForecast)) return <CloudFog className="w-8 h-8 text-gray-400 opacity-70" />;
        if (/night/i.test(shortForecast)) return <Moon className="w-8 h-8 text-indigo-500" />;
        if (/drizzle/i.test(shortForecast)) return <CloudRain className="w-8 h-8 text-blue-300" />;
        if (/hot/i.test(shortForecast)) return <Sun className="w-8 h-8 text-red-500" />;
        if (/cold/i.test(shortForecast)) return <Snowflake className="w-8 h-8 text-cyan-500" />;
        return <CloudSun className="w-8 h-8 text-orange-400" />;
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
                                            className="flex flex-col items-center justify-center bg-gray-50 p-3 rounded-md shadow-md w-[100px] sm:w-[140px] flex-shrink-0"
                                        >
                                            <p className="font-semibold text-center text-sm">{period.name}</p>
                                            <div className="my-2">{getWeatherIcon(period.shortForecast)}</div>
                                            <p className="text-sm text-gray-500 text-center mb-2">{period.shortForecast}</p>
                                            <div className="text-center">
                                                <p className="text-sm">
                                                    <span className="font-medium text-black">High: </span>
                                                    {Math.round(period.high)} F
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-medium text-black">Low: </span>
                                                    {Math.round(period.low)} F
                                                </p>
                                            </div>
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
