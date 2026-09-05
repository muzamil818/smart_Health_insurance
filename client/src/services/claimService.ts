const API_URL = "http://localhost:5000/api";

export interface UserRef {
    _id: string;
    name: string;
    email: string;
    role?: string;
}

export interface HospitalRef {
    _id: string;
    name: string;
    registrationNumber?: string;
    isEligible?: boolean;
}

export interface PolicyRef {
    _id: string;
    policyNumber: string;
    coverageLimit: number;
    coveredTreatments?: string[];
    status?: string;
}

export interface Claim {
    _id: string;
    policyholderId: UserRef | string;
    hospitalId: HospitalRef | string;
    policyId: PolicyRef | string;
    treatment: string;
    treatmentDate: string;
    claimAmount: number;
    description?: string;
    status: "pending" | "approved" | "rejected" | "more_information_required";
    submittedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ClaimDocument {
    _id: string;
    claimId: string;
    fileName: string;
    filePath: string;
    fileType?: string;
    uploadedAt?: string;
}

export interface FraudRiskFactor {
    factor: string;
    score: number;
    description: string;
}

export interface FraudScore {
    _id?: string;
    claimId?: string;
    overallRiskScore: number;
    riskLevel: "low" | "medium" | "high";
    anomalyFlags?: string[];
    riskFactors?: FraudRiskFactor[];
    evaluatedAt?: string;
}

export interface ApprovalRecord {
    _id: string;
    claimId: string;
    officerId?: UserRef;
    decision: "approved" | "rejected" | "more_information_required";
    remarks?: string;
    decidedAt?: string;
}

export interface ClaimDetailResponse {
    claim: Claim;
    documents: ClaimDocument[];
    fraudScore?: FraudScore | null;
    approvalRecords?: ApprovalRecord[];
}

export interface CreateClaimPayload {
    policyholderId: string;
    policyId: string;
    treatment: string;
    treatmentDate: string;
    claimAmount: number;
    description?: string;
}

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const getHospitalClaims = async (): Promise<Claim[]> => {
    try {
        const response = await fetch(`${API_URL}/claims`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch claims: ${response.statusText}`);
        }
        const data = await response.json();
        return data.claims || [];
    } catch (error) {
        console.error("Error fetching hospital claims:", error);
        return [];
    }
};

export const getClaimById = async (id: string): Promise<ClaimDetailResponse | null> => {
    try {
        const response = await fetch(`${API_URL}/claims/${id}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch claim details: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching claim ${id}:`, error);
        return null;
    }
};

export const createClaim = async (payload: CreateClaimPayload): Promise<{ message: string; claim?: Claim; error?: string }> => {
    try {
        const response = await fetch(`${API_URL}/claims`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
            return { message: data.message || "Failed to submit claim", error: data.message };
        }
        return data;
    } catch (error: any) {
        console.error("Error creating claim:", error);
        return { message: error.message || "Failed to submit claim", error: error.message };
    }
};

export const updateClaim = async (id: string, payload: Partial<CreateClaimPayload>): Promise<{ message: string; claim?: Claim; error?: string }> => {
    try {
        const response = await fetch(`${API_URL}/claims/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
            return { message: data.message || "Failed to update claim", error: data.message };
        }
        return data;
    } catch (error: any) {
        console.error("Error updating claim:", error);
        return { message: error.message || "Failed to update claim", error: error.message };
    }
};

export const uploadClaimDocument = async (claimId: string, file: File): Promise<{ message?: string; document?: ClaimDocument; error?: string }> => {
    try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("claimId", claimId);
        formData.append("documentType", "medical report");
        formData.append("file", file);

        const response = await fetch(`${API_URL}/documents`, {
            method: "POST",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
            return { error: data.message || "Document upload failed" };
        }
        return data;
    } catch (error: any) {
        console.error("Error uploading document:", error);
        return { error: error.message || "Document upload failed" };
    }
};
