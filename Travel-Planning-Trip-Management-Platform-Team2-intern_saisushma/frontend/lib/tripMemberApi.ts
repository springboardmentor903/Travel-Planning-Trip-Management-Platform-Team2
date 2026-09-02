import apiClient from "./apiClient";
import { AddMemberRequest, TripMemberResponse, UpdateMemberRoleRequest } from "./types";

export async function listTripMembers(tripId: number): Promise<TripMemberResponse[]> {
    const response = await apiClient.get<TripMemberResponse[]>(`/api/trips/${tripId}/members`);
    return response.data;
}

export async function addTripMember(tripId: number, data: AddMemberRequest): Promise<TripMemberResponse> {
    const response = await apiClient.post<TripMemberResponse>(`/api/trips/${tripId}/members`, data);
    return response.data;
}

export async function removeTripMember(tripId: number, memberId: number): Promise<void> {
    await apiClient.delete(`/api/trips/${tripId}/members/${memberId}`);
}

export async function updateTripMemberRole(
    tripId: number,
    memberId: number,
    data: UpdateMemberRoleRequest
): Promise<TripMemberResponse> {
    const response = await apiClient.put<TripMemberResponse>(
        `/api/trips/${tripId}/members/${memberId}/role`,
        data
    );
    return response.data;
}
