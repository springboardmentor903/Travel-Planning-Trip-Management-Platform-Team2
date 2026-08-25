import apiClient from "./apiClient";
import { ActivityResponse, ActivityRequest } from "./types";

export type { ActivityResponse, ActivityRequest };

export async function getActivities(itineraryId: number): Promise<ActivityResponse[]> {
  const res = await apiClient.get<ActivityResponse[]>(`/api/itineraries/${itineraryId}/activities`);
  return res.data;
}

export async function createActivity(itineraryId: number, data: ActivityRequest): Promise<ActivityResponse> {
  const res = await apiClient.post<ActivityResponse>(`/api/itineraries/${itineraryId}/activities`, data);
  return res.data;
}

export async function updateActivity(itineraryId: number, activityId: number, data: ActivityRequest): Promise<ActivityResponse> {
  const res = await apiClient.put<ActivityResponse>(`/api/itineraries/${itineraryId}/activities/${activityId}`, data);
  return res.data;
}

export async function deleteActivity(itineraryId: number, activityId: number): Promise<void> {
  await apiClient.delete(`/api/itineraries/${itineraryId}/activities/${activityId}`);
}
