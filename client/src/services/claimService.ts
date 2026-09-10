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

export type ClaimStatus =
    | "pending"
    | "under_review"
    | "approved"
    | "rejected"
    | "more_information_required";

/** One rule evaluated by the server-side validation engine (claimValidation.js). */
export interface ValidationCheck {
    check: string;
    passed: boolean;
    details?: {
        required?: string[];
        uploaded?: string[];
    };
}

export interface ValidationResults {
    isValid: boolean;
    checks: ValidationCheck[];
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
    status: ClaimStatus;
    validationResults?: ValidationResults | null;
    submittedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

/** Document types accepted by ClaimDocument.documentType on the server. */
export const DOCUMENT_TYPES = [
    "medical report",
    "prescription",
    "hospital bill",
    "treatment record",
    "other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

/** Types the validation engine requires before a claim can pass (REQUIRED_DOCUMENT_TYPES). */
export const REQUIRED_DOCUMENT_TYPES: DocumentType[] = [
    "medical report",
    "hospital bill",
];

export interface ClaimDocument {
    _id: string;
    claimId: string;
    documentType: DocumentType;
    /** Server-relative path, e.g. "/uploads/1712345-987.pdf" */
    fileUrl: string;
    uploadedAt?: string;
    createdAt?: string;
}

/** Absolute URL for a stored document, for use in an href. */
export const documentUrl = (doc: ClaimDocument) =>
    `http://localhost:5000${doc.fileUrl}`;

export interface TriggeredRule {
    rule: string;
    points: number;
}

export type RiskLevel = "low" | "medium" | "high";

export interface FraudScore {
    _id?: string;
    claimId?: string;
    /** 0-100, capped. */
    score: number;
    riskLevel: RiskLevel;
    triggeredRules?: TriggeredRule[];
    calculatedAt?: string;
    createdAt?: string;
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
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to submit claim";
        console.error("Error creating claim:", error);
        return { message, error: message };
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
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update claim";
        console.error("Error updating claim:", error);
        return { message, error: message };
    }
};

/**
 * Uploads one supporting document. `documentType` matters: the validation engine
 * only passes the "Required documents are uploaded" check once both a
 * "medical report" and a "hospital bill" exist for the claim.
 */
export const uploadClaimDocument = async (
    claimId: string,
    file: File,
    documentType: DocumentType = "medical report"
): Promise<{ message?: string; document?: ClaimDocument; error?: string }> => {
    try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("claimId", claimId);
        formData.append("documentType", documentType);
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
    } catch (error) {
        const message = error instanceof Error ? error.message : "Document upload failed";
        console.error("Error uploading document:", error);
        return { error: message };
    }
};

export const getClaimFraudScore = async (claimId: string): Promise<FraudScore | null> => {
    try {
        const response = await fetch(`${API_URL}/claims/${claimId}/fraud-score`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.fraudScore || null;
    } catch (error) {
        console.error(`Error fetching fraud score for claim ${claimId}:`, error);
        return null;
    }
};
