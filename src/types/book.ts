import {Genre} from "./genres";

export interface BookFormState {
    user_id: string;
    title: string;
    genres: number[];
    file: File | null;
    cover_image: File | null;
}

export interface BookData {
    user_id: string;
    title: string;
    genres: number[];
    file: File;
    cover_image?: File | null;
}

export interface UploadBookState {
    loading: boolean;
    success: boolean;
    error: Record<string, string[]> | null;
    responseMessage: Record<string, string[]> | null;
}

export interface ResponseData {
    id: string;
    title: string;
    genres: Genre[];
}