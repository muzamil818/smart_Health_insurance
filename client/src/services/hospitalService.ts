const API_URL = "http://localhost:5000/api";

export interface HospitalProfileData {
    _id: string;
    name: string;
    registrationNumber?: string;
    isEligible?: boolean;
    address?: string;
    phone?: string;
    email?: string;
    createdAt?: string;
}

export interface PolicyItem {
    _id: string;
    policyNumber: string;
    coverageLimit: number;
    coveredTreatments: string[];
    status?: string;
    policyholderId?: {
        _id: string;
        name: string;
        email: string;
    };
}

export interface PolicyholderUser {
    _id: string;
    name: string;
    email: string;
    role: string;
}

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const getHospitalProfile = async (hospitalId?: string): Promise<HospitalProfileData | null> => {
    try {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        const targetId = hospitalId || user?.hospitalId;

        if (!targetId) {
            return {
                _id: "default-id",
                name: user?.name || "General Hospital Care",
                registrationNumber: "HOSP-2026-9812",
                isEligible: true,
                address: "100 Healthcare Boulevard, Suite 400",
                phone: "+1 (555) 234-5678",
                email: user?.email || "admin@hospitalcare.org",
            };
        }

        const response = await fetch(`${API_URL}/hospitals/${targetId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            return {
                _id: targetId,
                name: user?.name || "General Hospital Care",
                registrationNumber: "HOSP-2026-9812",
                isEligible: true,
                address: "100 Healthcare Boulevard, Suite 400",
                phone: "+1 (555) 234-5678",
                email: user?.email || "admin@hospitalcare.org",
            };
        }

        const data = await response.json();
        return data.hospital || data;
    } catch (error) {
        console.error("Error fetching hospital profile:", error);
        return null;
    }
};

export const getPolicies = async (): Promise<PolicyItem[]> => {
    try {
        const response = await fetch(`${API_URL}/policies`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data.policies || [];
    } catch (error) {
        console.error("Error fetching policies:", error);
        return [];
    }
};

export const getPolicyholders = async (): Promise<PolicyholderUser[]> => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        const users: PolicyholderUser[] = data.users || [];
        return users.filter((u) => u.role === "policyholder");
    } catch (error) {
        console.error("Error fetching policyholders:", error);
        return [];
    }
};
