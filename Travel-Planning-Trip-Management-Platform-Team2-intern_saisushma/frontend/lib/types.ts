export interface RegisterRequest { name: string; email: string; password: string; }
export interface LoginRequest { email: string; password: string; }
export interface AuthResponse { id: number; name: string; email: string; role?: string; message: string; token: string | null; }
export interface AuthUser { id: number; name: string; email: string; role?: string; token: string; address?: string | null; profilePhotoUrl?: string | null; }

export interface TripRequest { title: string; destinationId?: number; startDate?: string; endDate?: string; description?: string; budget?: number; status?: string; }
export interface TripResponse { id: number; title: string; destinationName: string | null; ownerName: string; startDate: string | null; endDate: string | null; description: string | null; budget: number | null; status: string; createdAt: string; }

export interface Destination { id: number; name: string; country: string; city: string; description: string; imageUrl: string; }
export interface NominatimResult { place_id: number; lat: string; lon: string; display_name: string; name?: string; type?: string; address?: { city?: string; town?: string; village?: string; municipality?: string; state?: string; country?: string; }; }
export interface WeatherData { name?: string; main?: { temp: number; feels_like?: number; humidity: number; }; weather?: { description?: string; icon?: string; }[]; wind?: { speed?: number; }; }

export interface ItineraryResponse { id: number; tripId: number; dayDate: string; notes: string | null; }
export interface ItineraryRequest { dayDate: string; notes?: string; }

export interface ActivityResponse { id: number; itineraryId: number; title: string; description: string | null; startTime: string | null; endTime: string | null; location: string | null; type: string | null; }
export interface ActivityRequest { title: string; description?: string; startTime?: string; endTime?: string; location?: string; type?: string; }

export interface UserResponse { id: number; name: string; email: string; role?: string; address: string | null; profilePhotoUrl: string | null; createdAt: string | null; }
export interface UpdateUserRequest { name: string; email: string; address?: string | null; profilePhotoUrl?: string | null; }
export interface ResetPasswordRequest { currentPassword: string; newPassword: string; confirmPassword: string; }
export interface PhotoUploadResponse { profilePhotoUrl: string; message: string; }
export interface MessageResponse { message: string; }

// ===========================
// ADMIN
// ===========================
export interface UserSummaryResponse { id: number; name: string; email: string; role: string; }
export interface UpdateRoleRequest { roleName: string; }
export interface AdminStatsResponse {
    totalUsers: number;
    totalTrips: number;
    totalDestinations: number;
    totalExpenses: number;
    totalSpentAmount: number;
    usersByRole: Record<string, number>;
}

// ===========================
// BUDGET
// ===========================
export interface BudgetRequest { totalBudget: number; spentAmount?: number; currency?: string; notes?: string; }
export interface BudgetResponse { id: number; tripId: number; tripTitle: string; totalBudget: number; spentAmount: number; remainingBudget: number; overBudget: boolean; currency: string; notes: string | null; createdAt: string; updatedAt: string; }

// ===========================
// EXPENSE
// ===========================
export const EXPENSE_CATEGORIES = ["TRANSPORTATION", "HOTEL", "FOOD", "SHOPPING", "ENTERTAINMENT", "MISCELLANEOUS"] as const;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface ExpenseRequest { category: string; amount: number; expenseDate: string; description?: string; receiptUrl?: string; }
export interface ExpenseResponse { id: number; tripId: number; category: string; amount: number; expenseDate: string; description: string | null; receiptUrl: string | null; payerName: string; payerEmail: string; createdAt: string; }
export interface CategorySummary { category: string; totalAmount: number; }
export interface RemainingBudgetResponse { tripId: number; totalBudget: number; totalExpenses: number; remainingBudget: number; currency: string; overBudget: boolean; }

// ===========================
// TRIP MEMBERSHIP & JOIN
// ===========================
export type TripMemberRole = "GROUP_ADMIN" | "MEMBER";
export type TripJoinRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface TripMemberResponse {
    id: number | null;
    userId: number;
    name: string;
    email: string;
    role: "OWNER" | "GROUP_ADMIN" | "MEMBER";
    profilePhotoUrl: string | null;
    joinedAt: string | null;
    isOwner: boolean;
}

export interface AddMemberRequest {
    email: string;
    role?: TripMemberRole;
}

export interface UpdateMemberRoleRequest {
    role: TripMemberRole;
}

export interface TripJoinRequestDto {
    message?: string;
}

export interface TripJoinResponse {
    id: number;
    tripId: number;
    tripTitle: string;
    userId: number;
    userName: string;
    userEmail: string;
    userProfilePhotoUrl: string | null;
    status: TripJoinRequestStatus;
    message: string | null;
    createdAt: string;
    respondedAt: string | null;
}

export interface TripSearchResultResponse {
    id: number;
    title: string;
    description: string | null;
    destinationName: string | null;
    ownerName: string | null;
    startDate: string | null;
    endDate: string | null;
    budget: number | null;
    status: string;
    createdAt: string;
    userRelationship: "OWNER" | "GROUP_ADMIN" | "MEMBER" | "REQUEST_PENDING" | "NONE";
}


