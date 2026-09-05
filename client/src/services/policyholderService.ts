const API_URL = "http://localhost:5000/api";

import type { Claim, PolicyRef } from "./claimService";

export interface PolicyholderPolicy {
    _id: string;
    policyNumber: string;
    coverageLimit: number;
    coveredTreatments: string[];
    startDate?: string;
    expiryDate?: string;
    status?: string;
}

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const getMyPolicy = async (): Promise<PolicyholderPolicy | null> => {
    try {
        const response = await fetch(`${API_URL}/policies/my-policy`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.policy || null;
    } catch (error) {
        console.error("Error fetching my policy:", error);
        return null;
    }
};

export const getMyClaims = async (): Promise<Claim[]> => {
    try {
        const response = await fetch(`${API_URL}/claims/my-claims`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.claims || [];
    } catch (error) {
        console.error("Error fetching my claims:", error);
        return [];
    }
};
