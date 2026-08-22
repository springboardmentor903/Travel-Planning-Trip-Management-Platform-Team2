"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { destinationApi } from "@/lib/api";
import { Destination } from "@/lib/types";

export default function DestinationDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const [destination, setDestination] = useState<Destination | null>(null);
    const [weather, setWeather] = useState<Record<string, any> | null>(null);

    const [loading, setLoading] = useState(true);
    const [weatherLoading, setWeatherLoading] = useState(true);

    const [error, setError] = useState("");
    const [weatherError, setWeatherError] = useState("");

    useEffect(() => {
        async function loadDestination() {
            try {
                const id = Number(params.id);

                if (isNaN(id)) {
                    setError("Invalid destination ID.");
                    return;
                }

                const data = await destinationApi.getById(id);
                setDestination(data);

                try {
                    const weatherData = await destinationApi.getWeather(id);
                    setWeather(weatherData);
                } catch (err) {
                    console.error(err);
                    setWeatherError("Unable to load live weather.");
                } finally {
                    setWeatherLoading(false);
                }

            } catch (err) {
                console.error(err);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load destination."
                );
            } finally {
                setLoading(false);
            }
        }

        loadDestination();
    }, [params.id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
                <p className="text-gray-500">
                    Loading destination...
                </p>
            </main>
        );
    }

    if (error || !destination) {
        return (
            <main className="min-h-screen bg-[#f0f2f5] flex items-center justify-center px-6">
                <div className="bg-white rounded-2xl p-10 text-center">
                    <p className="text-red-500 mb-5">
                        {error || "Destination not found."}
                    </p>

                    <button
                        onClick={() => router.push("/destinations")}
                        className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                    >
                        Back to Destinations
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f0f2f5]">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="text-xl font-bold text-gray-900"
                    >
                        TripNest
                        <span className="text-orange-500">.</span>
                    </button>

                    <button
                        onClick={() => router.push("/destinations")}
                        className="text-sm font-medium text-gray-600 hover:text-orange-500"
                    >
                        ← Back to Destinations
                    </button>

                </div>
            </nav>

            {/* Main */}
            <div className="max-w-5xl mx-auto px-6 py-10">

                {/* Destination Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Image */}
                    {destination.imageUrl ? (
                        <img
                            src={destination.imageUrl}
                            alt={destination.name}
                            className="w-full h-72 object-cover"
                        />
                    ) : (
                        <div className="w-full h-72 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-lg">
                                No image available
                            </span>
                        </div>
                    )}

                    {/* Destination information */}
                    <div className="p-8">

                        <h1 className="text-4xl font-bold text-gray-900">
                            {destination.name}
                        </h1>

                        <p className="text-gray-500 mt-2 text-lg">
                            {destination.city}
                            {destination.city && destination.country
                                ? ", "
                                : ""}
                            {destination.country}
                        </p>

                        {destination.description && (
                            <div className="mt-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    About this destination
                                </h2>

                                <p className="mt-3 text-gray-600 leading-relaxed">
                                    {destination.description}
                                </p>
                            </div>
                        )}

                    </div>

                </div>

                {/* Weather */}
                <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                    <h2 className="text-2xl font-bold text-gray-900">
                        Live Weather
                    </h2>

                    <p className="text-gray-500 mt-1">
                        Current weather information for {destination.name}.
                    </p>

                    {weatherLoading && (
                        <div className="mt-6">
                            <p className="text-gray-500">
                                Loading live weather...
                            </p>
                        </div>
                    )}

                    {!weatherLoading && weatherError && (
                        <div className="mt-6">
                            <p className="text-red-500">
                                {weatherError}
                            </p>
                        </div>
                    )}

                    {!weatherLoading && !weatherError && weather && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

                            {/* Temperature */}
                            <div className="rounded-xl bg-orange-50 p-5">
                                <p className="text-sm text-gray-500">
                                    Temperature
                                </p>

                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {weather.temperature ??
                                        weather.temp ??
                                        weather.main?.temp ??
                                        "N/A"}
                                    {weather.temperature ||
                                    weather.temp ||
                                    weather.main?.temp
                                        ? "°C"
                                        : ""}
                                </p>
                            </div>

                            {/* Humidity */}
                            <div className="rounded-xl bg-orange-50 p-5">
                                <p className="text-sm text-gray-500">
                                    Humidity
                                </p>

                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {weather.humidity ??
                                        weather.main?.humidity ??
                                        "N/A"}
                                    {weather.humidity ||
                                    weather.main?.humidity
                                        ? "%"
                                        : ""}
                                </p>
                            </div>

                            {/* Wind */}
                            <div className="rounded-xl bg-orange-50 p-5">
                                <p className="text-sm text-gray-500">
                                    Wind Speed
                                </p>

                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {weather.windSpeed ??
                                        weather.wind?.speed ??
                                        "N/A"}
                                </p>
                            </div>

                            {/* Description */}
                            <div className="rounded-xl bg-orange-50 p-5">
                                <p className="text-sm text-gray-500">
                                    Conditions
                                </p>

                                <p className="text-lg font-semibold text-gray-900 mt-2">
                                    {weather.description ??
                                        weather.weather?.[0]?.description ??
                                        "N/A"}
                                </p>
                            </div>

                        </div>
                    )}

                </div>

            </div>

        </main>
    );
}