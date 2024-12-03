
export interface Tag {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Word {
    id: string;
    dictionary: string;
    word: string;
    translation: string;
    image_path: string | null;
    tags: Tag[];
    created_at: string;
    updated_at: string;
}

export interface WordsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Word[];
}

export interface WordsState {
    words: Word[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    dictionaryId: string | null;
}



