

export interface RegistrationData {
    username: string;
    password: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: File | null;
}


export interface RegistrationState {
    loading: boolean;
    success: boolean;
    error: Record<string, string[]> | null;
    responseData: ResponseData | null; // Используем интерфейс для строгой типизации JSON данных
}


export interface ResponseData {
    id: string;
    username: string;
    email: string;

    [key: string]: any; // Опционально, для дополнительных полей, которые могут присутствовать
}