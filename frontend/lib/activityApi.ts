import apiClient from "./apiClient";

export interface Activity {
    id: number;
    title: string;
    description: string | null;
    startTime: string | null;
    endTime: string | null;
    location: string | null;
    type: string | null;
}

export interface ActivityRequest {
    title: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    type?: string;
}

export async function getActivities(
    itineraryId: number
): Promise<Activity[]> {
    const response = await apiClient.get<Activity[]>(
        `/api/itineraries/${itineraryId}/activities`
    );

    return response.data;
}

export async function createActivity(
    itineraryId: number,
    data: ActivityRequest
): Promise<Activity> {
    const response = await apiClient.post<Activity>(
        `/api/itineraries/${itineraryId}/activities`,
        data
    );

    return response.data;
}

export async function updateActivity(
    itineraryId: number,
    activityId: number,
    data: ActivityRequest
): Promise<Activity> {
    const response = await apiClient.put<Activity>(
        `/api/itineraries/${itineraryId}/activities/${activityId}`,
        data
    );

    return response.data;
}

export async function deleteActivity(
    itineraryId: number,
    activityId: number
): Promise<void> {
    await apiClient.delete(
        `/api/itineraries/${itineraryId}/activities/${activityId}`
    );
}