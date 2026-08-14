import { AuthResponse, LoginRequest, RegisterRequest } from "./types";

const BASE_URL = "http://localhost:8081";

async function request<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    // Backend returns a message field on errors — surface it
    const msg =
      data?.message ||
      data?.error ||
      `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

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
};
