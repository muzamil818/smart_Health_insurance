const API_URL = "http://localhost:5000/api/auth";

export interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "hospital" | "policyholder" | "officer";
}

export interface AuthResponse {
    message: string;
    token?: string;
    user?: User;
}



export const register = async (name: string, email: string, password: string, role: string): Promise<AuthResponse> => {

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ name, email, password, role }),
        });
        return response.json();
    } catch (error) {
        console.error("Registration failed", error);
        return error.response.data;
    }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {

        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ email, password }),
        });
        return response.json();
    } catch (error) {
        console.error("Login failed", error);
        return error.response.data;
    }
}