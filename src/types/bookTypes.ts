import { Genre } from "./genresTypes";
import { Chapter } from "./chapterTypes";

export interface BookFormState {
    user_id: string;
    title: string;
    genres: number[];
    file: File | null;
    cover_image: File | null;
    description: string;
    language: string;
}

export interface BookData {
    user_id: string;
    title: string;
    genres: number[];
    file: File;
    cover_image?: File | null;
    description: string;
    language: string;
}

export interface UploadBookState {
    loading: boolean;
    success: boolean;
    error: Record<string, string[]> | null;
    responseMessage: Record<string, string[]> | null;
}

export interface BookResponseData {
    id: string;
    title: string;
    genres: Genre[];
    description: string | null;
    language: string;
    total_chapters: number;
    total_pages: number;
}

export interface GenreDetail {
    id: number;
    name: string;
}

export interface Book {
    id: string;
    title: string;
    file_path: string;
    created_at: string;
    updated_at: string;
    cover_image: string | null;
    genre_details: GenreDetail[];
    chapters: Chapter[];
    description: string | null;
    language: string;
    total_chapters: number;
    total_pages: number;
}

export interface FetchBooksResponse {
    results: Book[];
    count: number;
    next: string | null;
    previous: string | null;
}

export interface DownloadBooksState {
    books: Book[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
}
