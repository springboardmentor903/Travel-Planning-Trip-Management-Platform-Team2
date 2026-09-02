"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import {
    Destination,
    NominatimResult,
    WeatherData,
} from "@/lib/types";
import apiClient from "@/lib/apiClient";
import FadeIn from "@/components/ui/FadeIn";
import { StaggerList, StaggerItem } from "@/components/ui/StaggerList";

function Orbs() {
    return (
        <div className="glass-orbs pointer-events-none">
            <motion.div
                className="glass-orb glass-orb--orange"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{
                    duration: 16,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="glass-orb glass-orb--violet"
                animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="glass-orb glass-orb--cyan"
                animate={{ x: [0, 20, 0], y: [0, 25, 0] }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
}

function DestinationsContent() {
    const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
    const [popularDestinations, setPopularDestinations] = useState<
        Destination[]
    >([]);

    const [loadingDB, setLoadingDB] = useState(true);
    const [dbError, setDbError] = useState("");

    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
    const [searching, setSearching] = useState(false);

    const [weather, setWeather] = useState<
        Record<string | number, WeatherData>
    >({});

    const [weatherErrors, setWeatherErrors] = useState<
        Record<string | number, string>
    >({});

    // NEW:
    // Stores the database destination created from a searched result.
    const [savedSearchDestinations, setSavedSearchDestinations] =
        useState<Record<string | number, Destination>>({});

    // NEW:
    // Keeps track of which search result is currently being saved.
    const [savingDestination, setSavingDestination] = useState<
        string | number | null
    >(null);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    // ==========================================
    // LOAD DATABASE DESTINATIONS
    // ==========================================

    useEffect(() => {
        Promise.all([
            apiClient.get<Destination[]>("/api/destinations"),
            apiClient.get<Destination[]>("/api/destinations/popular"),
        ])
            .then(([all, popular]) => {
                setAllDestinations(all.data);
                setPopularDestinations(popular.data);
            })
            .catch(() => {
                setDbError("Failed to load destinations.");
            })
            .finally(() => {
                setLoadingDB(false);
            });
    }, []);

    // ==========================================
    // SEARCH DESTINATIONS
    // ==========================================

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                setSearching(true);

                const res = await apiClient.get<NominatimResult[]>(
                    "/api/destinations/search",
                    {
                        params: {
                            query: query.trim(),
                        },
                    }
                );

                const results = res.data || [];

                setSearchResults(results);

                // Load weather for every search result
                results.forEach((result) => {
                    apiClient
                        .get<WeatherData>("/api/destinations/weather", {
                            params: {
                                lat: parseFloat(result.lat),
                                lon: parseFloat(result.lon),
                            },
                        })
                        .then((wRes) => {
                            setWeather((prev) => ({
                                ...prev,
                                [result.place_id]: wRes.data,
                            }));
                        })
                        .catch(() => {
                            setWeatherErrors((prev) => ({
                                ...prev,
                                [result.place_id]: "Weather unavailable.",
                            }));
                        });
                });
            } catch (error) {
                console.error("Destination search failed:", error);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 500);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    // ==========================================
    // SAVE SEARCHED DESTINATION
    // ==========================================
    async function saveSearchDestination(
        result: NominatimResult
    ) {
        try {
            setSavingDestination(result.place_id);

            const address = result.address || {};

            const city =
                address.city ||
                address.town ||
                address.village ||
                address.municipality ||
                null;

            const country = address.country || null;

            const name =
                city ||
                result.name ||
                result.display_name?.split(",")[0] ||
                "Unknown Destination";

            const response = await apiClient.post<Destination>(
                "/api/destinations/from-search",
                {
                    name,
                    city,
                    country,
                    description: result.display_name || null,
                    imageUrl: null,

                    // IMPORTANT: Save the OpenStreetMap coordinates
                    latitude: parseFloat(result.lat),
                    longitude: parseFloat(result.lon),
                }
            );

            // Save the database destination against this Nominatim result
            setSavedSearchDestinations((prev) => ({
                ...prev,
                [result.place_id]: response.data,
            }));

            // Also add it to the database destination list
            setAllDestinations((prev) => {
                const alreadyExists = prev.some(
                    (d) => d.id === response.data.id
                );

                if (alreadyExists) {
                    return prev;
                }

                return [...prev, response.data];
            });

        } catch (error) {
            console.error(
                "Failed to save searched destination:",
                error
            );
        } finally {
            setSavingDestination(null);
        }
    }
    const showSearch = query.trim().length > 0;

    return (
        <div className="glass-canvas min-h-screen">
            <Orbs />
            <div className="glass-grain" />

            <Navbar />

            <main className="glass-content relative max-w-6xl mx-auto px-4 sm:px-6 py-10">

                {/* ==========================================
            PAGE HEADER
        ========================================== */}

                <FadeIn direction="down">
                    <div className="mb-8">
                        <h1 className="glass-h1">Destinations</h1>

                        <p className="glass-sub mt-1">
                            Browse our curated destinations or search anywhere in
                            the world.
                        </p>
                    </div>
                </FadeIn>

                {/* ==========================================
            SEARCH
        ========================================== */}

                <div className="relative mb-10">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
            🔍
          </span>

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search any city, country, or place…"
                        className="glass-input pl-11 pr-5 py-3.5"
                    />
                </div>

                {/* ==========================================
            SEARCH RESULTS
        ========================================== */}

                {showSearch && (
                    <section className="mb-12">

                        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                            Search Results{" "}
                            {!searching && searchResults.length > 0 && (
                                <span className="text-sm font-normal text-white/50 ml-1">
                  ({searchResults.length} found)
                </span>
                            )}
                        </h2>

                        {/* SEARCHING */}

                        {searching && (
                            <div className="glass-card p-10 text-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-orange-400 border-t-transparent mx-auto mb-3" />

                                <p className="text-white/60 text-sm">
                                    Searching OpenStreetMap…
                                </p>
                            </div>
                        )}

                        {/* NO RESULTS */}

                        {!searching && searchResults.length === 0 && (
                            <div className="glass-card p-10 text-center">
                                <p className="text-white/40 text-sm">
                                    No locations found. Try a different search term.
                                </p>
                            </div>
                        )}

                        {/* RESULTS */}

                        {!searching && searchResults.length > 0 && (
                            <StaggerList className="space-y-4">

                                {searchResults.map((result) => {
                                    const w = weather[result.place_id];

                                    const wErr =
                                        weatherErrors[result.place_id];

                                    const isLoadingW =
                                        !w && !wErr;

                                    // NEW:
                                    const savedDestination =
                                        savedSearchDestinations[
                                            result.place_id
                                            ];

                                    const isSaving =
                                        savingDestination === result.place_id;

                                    return (
                                        <StaggerItem
                                            key={result.place_id}
                                        >
                                            <div className="glass-card-md p-6">

                                                {/* LOCATION INFO */}

                                                <div className="flex items-start gap-3 mb-4">

                          <span className="text-2xl mt-0.5">
                            📍
                          </span>

                                                    <div className="flex-1 min-w-0">

                                                        <h3 className="font-semibold text-white">
                                                            {result.name ??
                                                                result.display_name.split(
                                                                    ","
                                                                )[0]}
                                                        </h3>

                                                        <p className="text-sm text-white/60 mt-0.5 line-clamp-1">
                                                            {result.display_name}
                                                        </p>

                                                        <div className="flex gap-4 mt-1 text-xs text-white/40">
                              <span>
                                Lat:{" "}
                                  {parseFloat(
                                      result.lat
                                  ).toFixed(4)}
                              </span>

                                                            <span>
                                Lon:{" "}
                                                                {parseFloat(
                                                                    result.lon
                                                                ).toFixed(4)}
                              </span>
                                                        </div>

                                                    </div>
                                                </div>

                                                {/* WEATHER */}

                                                {isLoadingW && !wErr && (
                                                    <div className="flex items-center gap-2 text-sm text-white/50 glass-form-sheet px-4 py-3">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />

                                                        Loading weather…
                                                    </div>
                                                )}

                                                {wErr && (
                                                    <div className="glass-banner glass-banner--error text-xs">
                                                        <span>⚠️</span>
                                                        <span>{wErr}</span>
                                                    </div>
                                                )}

                                                {w && (
                                                    <div>

                                                        {w.weather?.[0] && (
                                                            <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/15 to-amber-500/10 rounded-xl px-4 py-3 mb-3 border border-white/10 backdrop-blur-sm">

                                                                {w.weather[0].icon && (
                                                                    <img
                                                                        src={`https://openweathermap.org/img/wn/${w.weather[0].icon}.png`}
                                                                        alt=""
                                                                        className="w-10 h-10"
                                                                    />
                                                                )}

                                                                <div>
                                                                    <p className="font-bold text-white text-lg">
                                                                        {w.main?.temp != null
                                                                            ? `${w.main.temp.toFixed(
                                                                                1
                                                                            )}°C`
                                                                            : "N/A"}
                                                                    </p>

                                                                    <p className="text-sm text-white/70 capitalize">
                                                                        {w.weather[0]
                                                                            .description}
                                                                    </p>
                                                                </div>

                                                                <div className="ml-auto text-right text-xs text-white/60">
                                                                    <p>
                                                                        Humidity:{" "}
                                                                        {w.main?.humidity ??
                                                                            "N/A"}
                                                                        %
                                                                    </p>

                                                                    <p>
                                                                        Wind:{" "}
                                                                        {w.wind?.speed ??
                                                                            "N/A"}{" "}
                                                                        m/s
                                                                    </p>
                                                                </div>

                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                                                            <WeatherCard
                                                                label="Temperature"
                                                                value={
                                                                    w.main?.temp != null
                                                                        ? `${w.main.temp.toFixed(
                                                                            1
                                                                        )}°C`
                                                                        : "N/A"
                                                                }
                                                                icon="🌡️"
                                                            />

                                                            <WeatherCard
                                                                label="Feels Like"
                                                                value={
                                                                    w.main?.feels_like !=
                                                                    null
                                                                        ? `${w.main.feels_like.toFixed(
                                                                            1
                                                                        )}°C`
                                                                        : "N/A"
                                                                }
                                                                icon="🤔"
                                                            />

                                                            <WeatherCard
                                                                label="Humidity"
                                                                value={
                                                                    w.main?.humidity != null
                                                                        ? `${w.main.humidity}%`
                                                                        : "N/A"
                                                                }
                                                                icon="💧"
                                                            />

                                                            <WeatherCard
                                                                label="Wind"
                                                                value={
                                                                    w.wind?.speed != null
                                                                        ? `${w.wind.speed} m/s`
                                                                        : "N/A"
                                                                }
                                                                icon="💨"
                                                            />

                                                        </div>
                                                    </div>
                                                )}

                                                {/* ==========================================
                            VIEW DETAILS / SAVE BUTTON
                        ========================================== */}

                                                <div className="mt-5">

                                                    {savedDestination ? (

                                                        <Link
                                                            href={`/destinations/${savedDestination.id}`}
                                                            className="glass-btn-outline block w-full px-4 py-2.5 text-sm font-semibold text-center"
                                                        >
                                                            View Details
                                                        </Link>

                                                    ) : (

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                saveSearchDestination(
                                                                    result
                                                                )
                                                            }
                                                            disabled={isSaving}
                                                            className="glass-btn-outline block w-full px-4 py-2.5 text-sm font-semibold text-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isSaving
                                                                ? "Saving Destination…"
                                                                : "＋ Save & View Details"}
                                                        </button>

                                                    )}

                                                </div>

                                            </div>
                                        </StaggerItem>
                                    );
                                })}

                            </StaggerList>
                        )}
                    </section>
                )}

                {/* ==========================================
            POPULAR DESTINATIONS
        ========================================== */}

                {!showSearch && (
                    <section className="mb-12">

                        <div className="flex items-center gap-2 mb-5">
                            <div className="glass-icon-chip">
                                <span className="text-sm">⭐</span>

                                <span className="text-sm font-semibold text-white/90">
                  Popular Destinations
                </span>
                            </div>
                        </div>

                        {loadingDB ? (

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="glass-card-md h-64 animate-pulse"
                                    />
                                ))}
                            </div>

                        ) : dbError ? (

                            <p className="text-red-400 text-sm">
                                {dbError}
                            </p>

                        ) : popularDestinations.length === 0 ? (

                            <p className="text-white/40 text-sm">
                                No destinations in the database yet.
                            </p>

                        ) : (

                            <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                                {popularDestinations.map((d) => (
                                    <StaggerItem key={d.id}>
                                        <DestCard destination={d} />
                                    </StaggerItem>
                                ))}

                            </StaggerList>
                        )}

                    </section>
                )}

                {/* ==========================================
            SAVED / ALL DESTINATIONS
        ========================================== */}

                <section>

                    <div className="flex items-center gap-2 mb-5">

                        <div className="glass-icon-chip">

              <span className="text-sm">
                🌍
              </span>

                            <span className="text-sm font-semibold text-white/90">
                {showSearch
                    ? "Saved Destinations"
                    : "All Destinations"}
              </span>

                        </div>

                    </div>

                    {loadingDB ? (

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="glass-card-md h-64 animate-pulse"
                                />
                            ))}

                        </div>

                    ) : allDestinations.length === 0 ? (

                        <div className="glass-card p-10 text-center">
                            <p className="text-white/40 text-sm">
                                No destinations found in the database.
                            </p>
                        </div>

                    ) : (

                        <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                            {allDestinations.map((d) => (
                                <StaggerItem key={d.id}>
                                    <DestCard destination={d} />
                                </StaggerItem>
                            ))}

                        </StaggerList>

                    )}

                </section>

            </main>
        </div>
    );
}

// ======================================================
// DESTINATION CARD
// ======================================================

function DestCard({
                      destination,
                  }: {
    destination: Destination;
}) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);

    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="glass-card-md overflow-hidden flex flex-col group"
        >

            <div className="relative w-full h-44 overflow-hidden bg-gradient-to-br from-orange-500/15 to-amber-500/5 border-b border-white/10">

                {!imgLoaded && !imgError && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/[0.02] to-white/5 animate-pulse" />
                )}

                {!imgError && destination.imageUrl ? (

                    <img
                        src={destination.imageUrl}
                        alt={destination.name}
                        loading="lazy"
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgError(true)}
                        className={`w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500 ${
                            imgLoaded
                                ? "opacity-100"
                                : "opacity-0"
                        }`}
                    />

                ) : (

                    <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-80">
              🌍
            </span>
                    </div>

                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/70 via-transparent to-transparent pointer-events-none" />

            </div>

            <div className="p-5 flex flex-col flex-1">

                <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                    {destination.name}
                </h3>

                <p className="text-sm text-white/60 mt-0.5">
                    {destination.city}
                    {destination.city &&
                    destination.country
                        ? ", "
                        : ""}
                    {destination.country}
                </p>

                {destination.description && (
                    <p className="text-sm text-white/70 mt-3 line-clamp-2 flex-1 leading-relaxed">
                        {destination.description}
                    </p>
                )}

                <Link
                    href={`/destinations/${destination.id}`}
                    className="glass-btn-outline mt-4 px-4 py-2.5 text-sm font-semibold text-center"
                >
                    View Details
                </Link>

            </div>
        </motion.div>
    );
}

// ======================================================
// WEATHER CARD
// ======================================================

function WeatherCard({
                         label,
                         value,
                         icon,
                     }: {
    label: string;
    value: string;
    icon: string;
}) {
    return (
        <div className="glass-card-md p-3.5 text-center">

            <p className="text-lg">
                {icon}
            </p>

            <p className="text-xs text-white/60 mt-1 font-medium">
                {label}
            </p>

            <p className="text-sm font-bold text-white mt-0.5">
                {value}
            </p>

        </div>
    );
}

export default function DestinationsPage() {
    return (
        <ProtectedRoute>
            <DestinationsContent />
        </ProtectedRoute>
    );
}