"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { destinationApi } from "@/lib/api";
import { Destination } from "@/lib/types";

interface NominatimResult {
    place_id: number;
    lat: string;
    lon: string;
    name: string;
    display_name: string;
    type?: string;
}

interface WeatherData {
    main?: {
        temp?: number;
        humidity?: number;
    };

    weather?: {
        description?: string;
        icon?: string;
    }[];

    wind?: {
        speed?: number;
    };
}

export default function DestinationsPage() {

    const router = useRouter();

    const [destinations, setDestinations] =
        useState<Destination[]>([]);

    const [search, setSearch] = useState("");

    const [searchResults, setSearchResults] =
        useState<NominatimResult[]>([]);

    const [searching, setSearching] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // =========================
    // WEATHER STATE
    // =========================

    const [weather, setWeather] =
        useState<Record<number, WeatherData>>({});

    const [weatherLoading, setWeatherLoading] =
        useState<number | null>(null);

    const [weatherError, setWeatherError] =
        useState<Record<number, string>>({});


    // =========================
    // LOAD DATABASE DESTINATIONS
    // =========================

    useEffect(() => {

        async function loadDestinations() {

            try {

                const data =
                    await destinationApi.getAll();

                setDestinations(data);

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load destinations"
                );

            } finally {

                setLoading(false);
            }
        }

        loadDestinations();

    }, []);


    // =========================
    // SEARCH OPENSTREETMAP
    // =========================

    useEffect(() => {

        if (!search.trim()) {

            setSearchResults([]);

            return;
        }

        const timer = setTimeout(async () => {

            try {

                setSearching(true);

                const results =
                    await destinationApi.search(
                        search.trim()
                    );

                setSearchResults(
                    results as NominatimResult[]
                );

            } catch (err) {

                console.error(
                    "OpenStreetMap search failed:",
                    err
                );

                setSearchResults([]);

            } finally {

                setSearching(false);
            }

        }, 500);

        return () => clearTimeout(timer);

    }, [search]);


    // =========================
    // GET WEATHER FOR OSM RESULT
    // =========================

    async function loadWeather(
        result: NominatimResult
    ) {

        try {

            setWeatherLoading(result.place_id);

            setWeatherError((previous) => ({
                ...previous,
                [result.place_id]: ""
            }));

            const latitude =
                parseFloat(result.lat);

            const longitude =
                parseFloat(result.lon);

            const data =
                await destinationApi.getWeatherByCoordinates(
                    latitude,
                    longitude
                );

            setWeather((previous) => ({
                ...previous,
                [result.place_id]:
                    data as WeatherData
            }));

        } catch (err) {

            console.error(
                "Weather loading failed:",
                err
            );

            setWeatherError((previous) => ({
                ...previous,
                [result.place_id]:
                    err instanceof Error
                        ? err.message
                        : "Unable to load weather"
            }));

        } finally {

            setWeatherLoading(null);
        }
    }


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="min-h-screen flex items-center justify-center">

                <p className="text-gray-500">
                    Loading destinations...
                </p>

            </div>
        );
    }


    // =========================
    // ERROR
    // =========================

    if (error) {

        return (
            <div className="min-h-screen flex items-center justify-center">

                <div className="text-center">

                    <h2 className="text-xl font-bold text-red-500">
                        Failed to load destinations
                    </h2>

                    <p className="text-gray-500 mt-2">
                        {error}
                    </p>

                </div>

            </div>
        );
    }


    // =========================
    // PAGE
    // =========================

    return (

        <div className="min-h-screen bg-[#f0f2f5]">


            {/* =========================
                NAVBAR
            ========================= */}

            <nav className="bg-white border-b border-gray-200 px-8 py-4">

                <div className="max-w-6xl mx-auto">

                    <button
                        onClick={() =>
                            router.push("/dashboard")
                        }
                        className="text-xl font-bold text-gray-900"
                    >
                        TripNest
                        <span className="text-orange-500">
                            .
                        </span>
                    </button>

                </div>

            </nav>


            {/* =========================
                MAIN
            ========================= */}

            <main className="max-w-6xl mx-auto px-6 py-10">


                <h1 className="text-3xl font-bold text-gray-900">
                    Destinations
                </h1>


                <p className="text-gray-500 mt-2">
                    Explore destinations for your next trip.
                </p>


                {/* =========================
                    SEARCH
                ========================= */}

                <div className="mt-6 mb-10">

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search destinations, cities or countries..."
                        className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-900 outline-none focus:border-orange-500"
                    />

                </div>


                {/* =========================
                    OPENSTREETMAP RESULTS
                ========================= */}

                {search.trim() && (

                    <section className="mb-10">


                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Search Results
                        </h2>


                        {searching ? (

                            <div className="bg-white rounded-xl p-6 text-center">

                                <p className="text-gray-500">
                                    Searching OpenStreetMap...
                                </p>

                            </div>

                        ) : searchResults.length === 0 ? (

                            <div className="bg-white rounded-xl p-6 text-center">

                                <p className="text-gray-500">
                                    No locations found.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-4">


                                {searchResults.map(
                                    (result) => {

                                        const currentWeather =
                                            weather[
                                                result.place_id
                                                ];

                                        const currentWeatherError =
                                            weatherError[
                                                result.place_id
                                                ];

                                        return (

                                            <div
                                                key={
                                                    result.place_id
                                                }
                                                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
                                            >


                                                {/* LOCATION */}

                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {result.name ||
                                                        "Unknown location"}
                                                </h3>


                                                <p className="text-sm text-gray-500 mt-1">
                                                    {result.display_name}
                                                </p>


                                                {/* COORDINATES */}

                                                <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">

                                                    <span>
                                                        Latitude:{" "}
                                                        {
                                                            result.lat
                                                        }
                                                    </span>

                                                    <span>
                                                        Longitude:{" "}
                                                        {
                                                            result.lon
                                                        }
                                                    </span>

                                                </div>


                                                {/* WEATHER BUTTON */}

                                                <button
                                                    onClick={() =>
                                                        loadWeather(
                                                            result
                                                        )
                                                    }
                                                    disabled={
                                                        weatherLoading ===
                                                        result.place_id
                                                    }
                                                    className="mt-4 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
                                                >

                                                    {weatherLoading ===
                                                    result.place_id
                                                        ? "Loading Weather..."
                                                        : currentWeather
                                                            ? "Refresh Weather"
                                                            : "View Live Weather"}

                                                </button>


                                                {/* WEATHER ERROR */}

                                                {currentWeatherError && (

                                                    <p className="mt-3 text-sm text-red-500">
                                                        {
                                                            currentWeatherError
                                                        }
                                                    </p>

                                                )}


                                                {/* WEATHER RESULT */}

                                                {currentWeather && (

                                                    <div className="mt-5 rounded-xl bg-orange-50 border border-orange-100 p-5">


                                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                            Live Weather
                                                        </h4>


                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


                                                            {/* TEMPERATURE */}

                                                            <div className="bg-white rounded-lg p-4">

                                                                <p className="text-sm text-gray-500">
                                                                    Temperature
                                                                </p>

                                                                <p className="text-2xl font-bold text-gray-900 mt-1">

                                                                    {currentWeather.main?.temp !==
                                                                    undefined
                                                                        ? `${currentWeather.main.temp.toFixed(
                                                                            1
                                                                        )}°C`
                                                                        : "N/A"}

                                                                </p>

                                                            </div>


                                                            {/* CONDITION */}

                                                            <div className="bg-white rounded-lg p-4">

                                                                <p className="text-sm text-gray-500">
                                                                    Conditions
                                                                </p>

                                                                <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">

                                                                    {
                                                                        currentWeather
                                                                            .weather?.[0]
                                                                            ?.description ||
                                                                        "N/A"
                                                                    }

                                                                </p>

                                                            </div>


                                                            {/* HUMIDITY */}

                                                            <div className="bg-white rounded-lg p-4">

                                                                <p className="text-sm text-gray-500">
                                                                    Humidity
                                                                </p>

                                                                <p className="text-2xl font-bold text-gray-900 mt-1">

                                                                    {currentWeather.main?.humidity !==
                                                                    undefined
                                                                        ? `${currentWeather.main.humidity}%`
                                                                        : "N/A"}

                                                                </p>

                                                            </div>


                                                            {/* WIND */}

                                                            <div className="bg-white rounded-lg p-4">

                                                                <p className="text-sm text-gray-500">
                                                                    Wind Speed
                                                                </p>

                                                                <p className="text-2xl font-bold text-gray-900 mt-1">

                                                                    {currentWeather.wind?.speed !==
                                                                    undefined
                                                                        ? `${currentWeather.wind.speed} m/s`
                                                                        : "N/A"}

                                                                </p>

                                                            </div>

                                                        </div>

                                                    </div>

                                                )}

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </section>

                )}


                {/* =========================
                    DATABASE DESTINATIONS
                ========================= */}

                <section>


                    <h2 className="text-xl font-semibold text-gray-900 mb-4">

                        {search.trim()
                            ? "Saved Destinations"
                            : "Popular Destinations"}

                    </h2>


                    {destinations.length === 0 ? (

                        <div className="bg-white rounded-xl p-8 text-center">

                            <p className="text-gray-500">
                                No destinations found.
                            </p>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">


                            {destinations.map(
                                (destination) => (

                                    <div
                                        key={
                                            destination.id
                                        }
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                    >


                                        {/* IMAGE */}

                                        {destination.imageUrl ? (

                                            <img
                                                src={
                                                    destination.imageUrl
                                                }
                                                alt={
                                                    destination.name
                                                }
                                                className="w-full h-48 object-cover"
                                            />

                                        ) : (

                                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">

                                                <span className="text-gray-400">
                                                    No image
                                                </span>

                                            </div>

                                        )}


                                        {/* CONTENT */}

                                        <div className="p-5">


                                            <h2 className="text-xl font-bold text-gray-900">
                                                {
                                                    destination.name
                                                }
                                            </h2>


                                            <p className="text-sm text-gray-500 mt-1">

                                                {
                                                    destination.city
                                                }

                                                {destination.city &&
                                                destination.country
                                                    ? ", "
                                                    : ""}

                                                {
                                                    destination.country
                                                }

                                            </p>


                                            <p className="text-sm text-gray-600 mt-4 line-clamp-3">
                                                {
                                                    destination.description
                                                }
                                            </p>


                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/destinations/${destination.id}`
                                                    )
                                                }
                                                className="mt-5 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                                            >
                                                View Details
                                            </button>


                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


            </main>

        </div>
    );
}