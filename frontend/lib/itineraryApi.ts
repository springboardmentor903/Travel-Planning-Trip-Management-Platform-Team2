import apiClient from "./apiClient";
import { ItineraryResponse } from "./types";

export type { ItineraryResponse };

export async function getItineraries(tripId: number): Promise<ItineraryResponse[]> {
  const res = await apiClient.get<ItineraryResponse[]>(`/api/trips/${tripId}/itineraries`);
  return res.data;
}

export async function createItinerary(tripId: number, dayDate: string, notes?: string): Promise<ItineraryResponse> {
  const res = await apiClient.post<ItineraryResponse>(`/api/trips/${tripId}/itineraries`, { dayDate, notes: notes ?? "" });
  return res.data;
}

export async function updateItinerary(tripId: number, itineraryId: number, dayDate: string, notes?: string): Promise<ItineraryResponse> {
  const res = await apiClient.put<ItineraryResponse>(`/api/trips/${tripId}/itineraries/${itineraryId}`, { dayDate, notes: notes ?? "" });
  return res.data;
}

export async function deleteItinerary(tripId: number, itineraryId: number): Promise<void> {
  await apiClient.delete(`/api/trips/${tripId}/itineraries/${itineraryId}`);
}
