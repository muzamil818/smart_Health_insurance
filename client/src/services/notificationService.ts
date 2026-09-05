const API_URL = "http://localhost:5000/api";

export interface NotificationItem {
    _id: string;
    userId: string;
    claimId?: string;
    message: string;
    isRead: boolean;
    createdAt?: string;
}

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const getNotifications = async (): Promise<NotificationItem[]> => {
    try {
        const response = await fetch(`${API_URL}/notifications`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data.notifications || [];
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
};

export const markNotificationRead = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/notifications/${id}/read`, {
            method: "PUT",
            headers: getAuthHeaders(),
        });
        return response.ok;
    } catch (error) {
        console.error(`Error marking notification ${id} as read:`, error);
        return false;
    }
};
