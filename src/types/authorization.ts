
export interface AuthorizationData {
    username: string;
    password: string;
}

export interface AuthorizationState {
    isAuthenticated: boolean;
    status: {
        loading: boolean;
        success: boolean;
        error: Record<string, string[]> | null;
    };
}