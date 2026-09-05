const API_URL = "http://localhost:5000/api";

import type { Claim, ClaimDetailResponse } from "./claimService";

export interface DecisionPayload {
    remarks?: string;
}

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const getOfficerClaims = async (): Promise<Claim[]> => {
    try {
        const response = await fetch(`${API_URL}/claims`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch officer claims: ${response.statusText}`);
        }
        const data = await response.json();
        return data.claims || [];
    } catch (error) {
        console.error("Error fetching officer claims:", error);
        return [];
    }
};

export const approveClaim = async (claimId: string, remarks?: string): Promise<{ message: string; claim?: Claim; error?: string }> => {
    try {
        const response = await fetch(`${API_URL}/claims/${claimId}/approve`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ remarks: remarks || "" }),
        });
        const data = await response.json();
        if (!response.ok) {
            return { message: data.message || "Failed to approve claim", error: data.message };
        }
        return data;
    } catch (error: any) {
        return { message: error.message || "Failed to approve claim", error: error.message };
    }
};

export const rejectClaim = async (claimId: string, remarks?: string): Promise<{ message: string; claim?: Claim; error?: string }> => {
    try {
        const response = await fetch(`${API_URL}/claims/${claimId}/reject`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ remarks: remarks || "" }),
        });
        const data = await response.json();
        if (!response.ok) {
            return { message: data.message || "Failed to reject claim", error: data.message };
        }
        return data;
    } catch (error: any) {
        return { message: error.message || "Failed to reject claim", error: error.message };
    }
};

export const requestInformation = async (claimId: string, remarks?: string): Promise<{ message: string; claim?: Claim; error?: string }> => {
    try {
        const response = await fetch(`${API_URL}/claims/${claimId}/request-information`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ remarks: remarks || "" }),
        });
        const data = await response.json();
        if (!response.ok) {
            return { message: data.message || "Failed to request information", error: data.message };
        }
        return data;
    } catch (error: any) {
        return { message: error.message || "Failed to request information", error: error.message };
    }
};

export const recalculateFraudScore = async (claimId: string): Promise<{ message: string; fraudScore?: any; error?: string }> => {
    try {
        const response = await fetch(`${API_URL}/claims/${claimId}/calculate-fraud-score`, {
            method: "POST",
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            return { message: data.message || "Failed to recalculate fraud score", error: data.message };
        }
        return data;
    } catch (error: any) {
        return { message: error.message || "Failed to recalculate fraud score", error: error.message };
    }
};
