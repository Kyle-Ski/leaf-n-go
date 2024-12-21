import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Cloud, CloudLightning, CloudRain, CloudSun, Loader2, Moon, Snowflake, Sun, Wind } from "lucide-react";

interface WeatherProps {
    location: { latitude: number; longitude: number };
}

interface WeatherPeriod {
    name: string;
    temperature: number;
    temperatureUnit: string;
    shortForecast: string;
    icon: string;
}

const WeatherCard: React.FC<WeatherProps> = ({ location }) => {
    const [weatherData, setWeatherData] = useState<WeatherPeriod[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeatherData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `https://api.weather.gov/points/${location.latitude},${location.longitude}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch location grid");
                }

                const { properties } = await response.json();
                const forecastUrl = properties.forecast;

                const forecastResponse = await fetch(forecastUrl);
                if (!forecastResponse.ok) {
                    throw new Error("Failed to fetch weather forecast");
                }

                const forecastData = await forecastResponse.json();
                setWeatherData(forecastData.properties.periods.slice(0, 7));
            } catch (err) {
                console.error("Error:", err)
                setError("An error occurred while fetching weather data");
            } finally {
                setLoading(false);
            }
        };

        fetchWeatherData();
    }, [location]);

    const getWeatherIcon = (shortForecast: string) => {
        if (/sun|clear/i.test(shortForecast)) return <Sun className="w-8 h-8 text-yellow-500" />;
        if (/rain|shower/i.test(shortForecast)) return <CloudRain className="w-8 h-8 text-blue-500" />;
        if (/cloud/i.test(shortForecast)) return <Cloud className="w-8 h-8 text-gray-500" />;
        if (/snow/i.test(shortForecast)) return <Snowflake className="w-8 h-8 text-blue-300" />;
        if (/wind/i.test(shortForecast)) return <Wind className="w-8 h-8 text-gray-400" />;
        if (/storm|thunder/i.test(shortForecast)) return <CloudLightning className="w-8 h-8 text-yellow-700" />;
        if (/night/i.test(shortForecast)) return <Moon className="w-8 h-8 text-indigo-500" />;
        return <CloudSun className="w-8 h-8 text-orange-400" />;
    };

    return (
        <div className="max-w-[350px] sm:max-w-full mx-auto">
            <Card className="w-full max-w-full overflow-hidden">
                <CardHeader>
                    <CardTitle>Weekly Weather Forecast</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
                        </div>
                    ) : error ? (
                        <p className="text-red-500 text-center">{error}</p>
                    ) : weatherData ? (
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
                    ) : (
                        <p className="text-center text-gray-500">No weather data available</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default WeatherCard;
