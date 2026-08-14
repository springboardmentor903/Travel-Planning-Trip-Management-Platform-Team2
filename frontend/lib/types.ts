// Auth API request/response types matching the Spring Boot backend exactly

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  message: string;
  token: string | null;
}

// Stored in localStorage after login
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  token: string;
}
