import apiClient from "./apiClient";

export interface Trip {
    id: number;
    title: string;
    destinationName: string | null;
    ownerName: string;
    startDate: string;
    endDate: string;
    description: string | null;
    budget: number | null;
    status: string;
    createdAt: string;
}

export async function getMyTrips(): Promise<Trip[]> {
    const response = await apiClient.get<Trip[]>("/api/trips");
    return response.data;
}
export async function getTripById(id: number): Promise<Trip> {
    const response = await apiClient.get<Trip>(`/api/trips/${id}`);
    return response.data;
}
export async function updateTrip(
    id: number,
    data: {
        title: string;
        destinationId?: number;
        startDate?: string;
        endDate?: string;
        description?: string;
        budget?: number;
        status?: string;
    }
): Promise<Trip> {
    const response = await apiClient.put<Trip>(
        `/api/trips/${id}`,
        data
    );

    return response.data;
}
export async function createTrip(trip: {
    title: string;
    destinationId?: number;
    startDate?: string;
    endDate?: string;
    description?: string;
    budget?: number;
    status?: string;
}): Promise<Trip> {
    const response = await apiClient.post<Trip>("/api/trips", trip);
    return response.data;
}
export async function deleteTrip(id: number): Promise<void> {
    await apiClient.delete(`/api/trips/${id}`);
}