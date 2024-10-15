
export interface ProfileData {
    first_name?: string;
    last_name?: string;
    avatar?: string | File;
}

interface Settings {
    theme: string;
    language: string;

    [key: string]: any;
}

export interface UserInfoState {
    userData: {
        id: string | null;
        username: string | null;
        email: string | null;
        first_name?: string | null;
        last_name?: string | null;
        avatar?: string | null;
        settings?: Settings | null;
    };
    status: {
        loading: boolean;
        success: boolean;
        error: Record<string, any> | string | null;
    };
    updateStatus: {
        updateLoading: boolean;
        updateSuccess: boolean;
        updateError: Record<string, any> | string | null;
    };
}

export interface ResponseData {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    settings?: string;
}