<<<<<<< HEAD
import { AuthResponse, LoginRequest, RegisterRequest, TripResponse } from "./types";

const BASE_URL = "http://localhost:8081";

async function request<T>(endpoint: string, options: RequestInit, token?: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || data?.error || `Error ${res.status}`);
  return data as T;
}

export const authApi = {
  register: (body: RegisterRequest) =>
    request<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: LoginRequest) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
};

export const tripApi = {
  listMyTrips: (token: string) =>
    request<TripResponse[]>("/api/trips", { method: "GET" }, token),
=======
import {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    TripRequest,
    TripResponse,
    UserResponse,
    UpdateUserRequest,
} from "./types";
import { getUser } from "./auth";

const BASE_URL = "http://localhost:8081";

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {

    const user = getUser();

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    // Attach JWT token for protected backend APIs
    if (user?.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        const msg =
            data?.message ||
            data?.error ||
            `Request failed with status ${res.status}`;

        throw new Error(msg);
    }

    return data as T;
}


// =========================
// AUTH API
// =========================

export const authApi = {

    register: (body: RegisterRequest) =>
        request<AuthResponse>("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(body),
        }),

    login: (body: LoginRequest) =>
        request<AuthResponse>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify(body),
        }),
>>>>>>> origin/intern_saisushma
};


// =========================
// TRIP API
// =========================

export const tripApi = {

    getAll: () =>
        request<TripResponse[]>("/api/trips", {
            method: "GET",
        }),

    getById: (id: number) =>
        request<TripResponse>(`/api/trips/${id}`, {
            method: "GET",
        }),

    create: (body: TripRequest) =>
        request<TripResponse>("/api/trips", {
            method: "POST",
            body: JSON.stringify(body),
        }),

    update: (id: number, body: TripRequest) =>
        request<TripResponse>(`/api/trips/${id}`, {
            method: "PUT",
            body: JSON.stringify(body),
        }),

    delete: (id: number) =>
        request<void>(`/api/trips/${id}`, {
            method: "DELETE",
        }),
};

export const userApi = {
    getProfile: () =>
        request<UserResponse>("/api/users/me", {
            method: "GET",
        }),

    updateProfile: (body: UpdateUserRequest) =>
        request<UserResponse>("/api/users/me", {
            method: "PUT",
            body: JSON.stringify(body),
        }),
};
// =========================
// DESTINATION API
// =========================
// =========================
// DESTINATION API
// =========================

export const destinationApi = {

    // GET /api/destinations
    // Get destinations stored in database
    getAll: () =>
        request<Destination[]>("/api/destinations", {
            method: "GET",
        }),

    // GET /api/destinations/popular
    // Get popular destinations
    getPopular: () =>
        request<Destination[]>("/api/destinations/popular", {
            method: "GET",
        }),

    // GET /api/destinations/{id}
    // Get destination stored in database
    getById: (id: number) =>
        request<Destination>(`/api/destinations/${id}`, {
            method: "GET",
        }),

    // GET /api/destinations/search?query=goa
    // Search destinations using OpenStreetMap / Nominatim
    search: (query: string) =>
        request<any[]>(
            `/api/destinations/search?query=${encodeURIComponent(query)}`,
            {
                method: "GET",
            }
        ),

    // GET /api/destinations/{id}/weather
    // Weather for a database destination
    getWeather: (id: number) =>
        request<Record<string, any>>(
            `/api/destinations/${id}/weather`,
            {
                method: "GET",
            }
        ),

    // Weather for an OpenStreetMap search result
    getWeatherByCoordinates: (
        latitude: number,
        longitude: number
    ) =>
        request<Record<string, any>>(
            `/api/destinations/weather?lat=${latitude}&lon=${longitude}`,
            {
                method: "GET",
            }
        ),
};