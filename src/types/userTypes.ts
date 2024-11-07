
// Типы для регистрации registrationSlice
export interface RegistrationData {
    username: string;
    password: string;
    email: string;
    first_name?: string;
    last_name?: string;
    native_language: string;
    avatar?: File | null;
}

export interface RegistrationState {
    loading: boolean;
    success: boolean;
    error: Record<string, string[]> | null;
    responseData: RegistrationResponseData | null;
}

// Типы для авторизации authorizationSlice
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

// Типы для информации о пользователе - userInfoSlice
export interface ProfileData {
    first_name?: string;
    last_name?: string;
    avatar?: string | File;
    native_language: string;
}

export interface Settings {
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
        native_language: string | null;
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

// Типы ответов от API
export interface RegistrationResponseData {
    id: string;
    username: string;
    email: string;

    [key: string]: any; // Опционально, для дополнительных полей
}

export interface UserInfoResponseData {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    native_language: string;
    avatar?: string;
    settings?: string;
}
