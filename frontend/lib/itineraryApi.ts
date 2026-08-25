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
