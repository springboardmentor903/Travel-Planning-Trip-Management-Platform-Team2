import apiClient from "./apiClient";
import {
    TripMemberResponse,
    AddMemberRequest,
    TripSearchResultResponse,
    TripJoinResponse,
    TripJoinRequestDto,
} from "./types";

export async function getTripMembers(tripId: number): Promise<TripMemberResponse[]> {
    const res = await apiClient.get<TripMemberResponse[]>(`/api/trips/${tripId}/members`);
    return res.data;
}

export async function addTripMember(
    tripId: number,
    data: AddMemberRequest
): Promise<TripMemberResponse> {
    const res = await apiClient.post<TripMemberResponse>(`/api/trips/${tripId}/members`, data);
    return res.data;
}

export async function removeTripMember(tripId: number, memberId: number): Promise<void> {
    await apiClient.delete(`/api/trips/${tripId}/members/${memberId}`);
}

export async function changeMemberRole(
    tripId: number,
    memberId: number,
    role: "MEMBER" | "GROUP_ADMIN"
): Promise<TripMemberResponse> {
    const res = await apiClient.put<TripMemberResponse>(
        `/api/trips/${tripId}/members/${memberId}/role`,
        { role }
    );
    return res.data;
}

export async function searchTrips(name: string = ""): Promise<TripSearchResultResponse[]> {
    const res = await apiClient.get<TripSearchResultResponse[]>(
        `/api/trips/search?name=${encodeURIComponent(name)}`
    );
    return res.data;
}

export async function requestToJoinTrip(
    tripId: number,
    data?: TripJoinRequestDto
): Promise<TripJoinResponse> {
    const res = await apiClient.post<TripJoinResponse>(
        `/api/trips/${tripId}/join-requests`,
        data || {}
    );
    return res.data;
}

export async function getTripJoinRequests(tripId: number): Promise<TripJoinResponse[]> {
    const res = await apiClient.get<TripJoinResponse[]>(`/api/trips/${tripId}/join-requests`);
    return res.data;
}

export async function acceptJoinRequest(
    tripId: number,
    requestId: number
): Promise<TripJoinResponse> {
    const res = await apiClient.put<TripJoinResponse>(
        `/api/trips/${tripId}/join-requests/${requestId}/accept`
    );
    return res.data;
}

export async function rejectJoinRequest(
    tripId: number,
    requestId: number
): Promise<TripJoinResponse> {
    const res = await apiClient.put<TripJoinResponse>(
        `/api/trips/${tripId}/join-requests/${requestId}/reject`
    );
    return res.data;
}

export async function getMyJoinRequests(): Promise<TripJoinResponse[]> {
    const res = await apiClient.get<TripJoinResponse[]>("/api/trips/join-requests/my");
    return res.data;
}
