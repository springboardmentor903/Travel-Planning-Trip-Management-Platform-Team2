import apiClient from "./apiClient";
import { TripJoinRequestDto, TripJoinResponse, TripSearchResultResponse } from "./types";

export async function searchTrips(name: string = ""): Promise<TripSearchResultResponse[]> {
    const response = await apiClient.get<TripSearchResultResponse[]>("/api/trips/search", {
        params: { name }
    });
    return response.data;
}

export async function requestToJoinTrip(tripId: number, data?: TripJoinRequestDto): Promise<TripJoinResponse> {
    const response = await apiClient.post<TripJoinResponse>(`/api/trips/${tripId}/join-requests`, data || {});
    return response.data;
}

export async function listTripJoinRequests(tripId: number): Promise<TripJoinResponse[]> {
    const response = await apiClient.get<TripJoinResponse[]>(`/api/trips/${tripId}/join-requests`);
    return response.data;
}

export async function acceptTripJoinRequest(tripId: number, requestId: number): Promise<TripJoinResponse> {
    const response = await apiClient.put<TripJoinResponse>(`/api/trips/${tripId}/join-requests/${requestId}/accept`);
    return response.data;
}

export async function rejectTripJoinRequest(tripId: number, requestId: number): Promise<TripJoinResponse> {
    const response = await apiClient.put<TripJoinResponse>(`/api/trips/${tripId}/join-requests/${requestId}/reject`);
    return response.data;
}

export async function getMyJoinRequests(): Promise<TripJoinResponse[]> {
    const response = await apiClient.get<TripJoinResponse[]>("/api/trips/join-requests/my");
    return response.data;
}
