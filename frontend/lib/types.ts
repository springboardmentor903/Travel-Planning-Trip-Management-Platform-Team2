// Auth
export interface RegisterRequest { name: string; email: string; password: string; }
export interface LoginRequest { email: string; password: string; }
export interface AuthResponse { id: number; name: string; email: string; message: string; token: string | null; }
export interface AuthUser { id: number; name: string; email: string; token: string; }

// Trips
export interface TripResponse {
  id: number;
  title: string;
  destinationName: string | null;
  ownerName: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  budget: number | null;
  status: string;
  createdAt: string;
}
export interface TripRequest {
  title: string;
  destinationId?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  budget?: number;
  status?: string;
}

export interface TripResponse {
  id: number;
  title: string;
  destinationName: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  description: string;
  budget: number;
  status: string;
  createdAt: string;
}
export interface Destination {
  id: number;
  name: string;
  country: string;
  city: string;
  description: string;
  imageUrl: string;
}
export interface UserResponse {
  id: number;
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
}