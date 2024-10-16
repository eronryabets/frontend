
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
    chapters: string[];
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