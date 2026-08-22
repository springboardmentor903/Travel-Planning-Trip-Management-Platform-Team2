import apiClient from "./apiClient";

export interface Itinerary {
    id: number;
    tripId: number;
    dayDate: string;
    notes: string | null;
}

export async function getItineraries(
    tripId: number
): Promise<Itinerary[]> {
    const response = await apiClient.get<Itinerary[]>(
        `/api/trips/${tripId}/itineraries`
    );

    return response.data;
}

export async function createItinerary(
    tripId: number,
    dayDate: string,
    notes?: string
): Promise<Itinerary> {
    const response = await apiClient.post<Itinerary>(
        `/api/trips/${tripId}/itineraries`,
        {
            dayDate,
            notes: notes || "",
        }
    );

    return response.data;
}