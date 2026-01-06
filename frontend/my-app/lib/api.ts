import { API_URL } from "./config";

interface FetchOptions extends RequestInit {
    token?: string;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options;

    const defaultHeaders: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    } else {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        if (storedToken) {
            defaultHeaders["Authorization"] = `Bearer ${storedToken}`;
        }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { ...defaultHeaders, ...headers } as HeadersInit,
        ...rest,
    });

    if (!response.ok) {
        if (response.status === 401 && typeof window !== 'undefined') {
            // Optional: Redirect to login or clear token
            // window.location.href = "/auth";
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.statusText}`);
    }

    return response.json();
}
