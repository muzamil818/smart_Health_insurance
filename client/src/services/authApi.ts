const API_URL = "http://localhost:5000/api/auth";

export type Role = "admin" | "hospital" | "policyholder" | "officer";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    hospitalId?: string | null;
}

export interface AuthResponse {
    message: string;
    token?: string;
    user?: User;
}

/** Landing route for each role, used for the post-login redirect. */
export const homeRouteForRole = (role?: string): string => {
    switch (role) {
        case "admin":
            return "/admin";
        case "officer":
            return "/officer";
        case "hospital":
            return "/hospital";
        case "policyholder":
            return "/policyholder";
        default:
            return "/";
    }
};

export const register = async (
    name: string,
    email: string,
    password: string,
    role: string
): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password, role }),
        });
        return await response.json();
    } catch (error) {
        console.error("Registration failed", error);
        return {
            message:
                error instanceof Error
                    ? error.message
                    : "Could not reach the server. Is the API running on port 5000?",
        };
    }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });
        return await response.json();
    } catch (error) {
        console.error("Login failed", error);
        return {
            message:
                error instanceof Error
                    ? error.message
                    : "Could not reach the server. Is the API running on port 5000?",
        };
    }
};

/** Reads the logged-in user cached in localStorage. */
export const getStoredUser = (): User | null => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
        return JSON.parse(raw) as User;
    } catch {
        return null;
    }
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
