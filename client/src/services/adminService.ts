const API_URL = "http://localhost:5000/api";

import type { UserRef, HospitalRef, PolicyRef } from "./claimService";

export interface AdminReportData {
    users: number;
    hospitals: number;
    policies: number;
    claims: number;
    claimsByStatus: {
        pending: number;
        under_review: number;
        approved: number;
        rejected: number;
        more_information_required: number;
    };
    highRiskScores: number;
}

export interface AuditLogItem {
    _id: string;
    userId?: UserRef;
    action: string;
    claimId?: string;
    createdAt?: string;
}

export interface FraudRuleItem {
    rule: string;
    points: number;
}

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const getAdminReports = async (): Promise<AdminReportData | null> => {
    try {
        const response = await fetch(`${API_URL}/admin/reports`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.reports || null;
    } catch (error) {
        console.error("Error fetching admin reports:", error);
        return null;
    }
};

export const getAuditLogs = async (): Promise<AuditLogItem[]> => {
    try {
        const response = await fetch(`${API_URL}/admin/audit-logs`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.logs || [];
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return [];
    }
};

export const getFraudRules = async (): Promise<FraudRuleItem[]> => {
    try {
        const response = await fetch(`${API_URL}/admin/fraud-rules`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.rules || [];
    } catch (error) {
        console.error("Error fetching fraud rules:", error);
        return [];
    }
};

// User Management
export const getAllUsers = async (): Promise<UserRef[]> => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.users || [];
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

export const createUser = async (payload: { name: string; email: string; password: string; role: string; hospitalId?: string }): Promise<{ message?: string; user?: UserRef; error?: string }> => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) return { error: data.message || "Failed to create user" };
        return data;
    } catch (error: any) {
        return { error: error.message || "Failed to create user" };
    }
};

export const deleteUser = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        return response.ok;
    } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        return false;
    }
};

// Hospital Management
export const getAllHospitals = async (): Promise<HospitalRef[]> => {
    try {
        const response = await fetch(`${API_URL}/hospitals`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.hospitals || [];
    } catch (error) {
        console.error("Error fetching hospitals:", error);
        return [];
    }
};

export const createHospital = async (payload: { name: string; registrationNumber: string; address: string; contact: string; isEligible?: boolean }): Promise<{ message?: string; hospital?: HospitalRef; error?: string }> => {
    try {
        const response = await fetch(`${API_URL}/hospitals`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) return { error: data.message || "Failed to create hospital" };
        return data;
    } catch (error: any) {
        return { error: error.message || "Failed to create hospital" };
    }
};

// Policy Management
export const createPolicy = async (payload: { policyNumber: string; policyholderId: string; coverageLimit: number; coveredTreatments: string[]; startDate: string; expiryDate: string }): Promise<{ message?: string; policy?: PolicyRef; error?: string }> => {
    try {
        const response = await fetch(`${API_URL}/policies`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) return { error: data.message || "Failed to create policy" };
        return data;
    } catch (error: any) {
        return { error: error.message || "Failed to create policy" };
    }
};
