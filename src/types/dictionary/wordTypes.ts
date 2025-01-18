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
    count: number;
    progress: number;
    created_at: string;
    updated_at: string;
    highlight_disabled: boolean;
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
    search: string;
    ordering: string;
    adding: boolean;
    addError: string | null;
    filters: {
        tags: string[];
        progress_min: number | null;
        progress_max: number | null;
        count_min: number | null;
        count_max: number | null;
        created_at_after: string | null;
        created_at_before: string | null;
    };
}

export interface AddWordPayload {
    dictionaryId: string;
    word: string;
    translation: string;
    tag_names: string[];
    image_path?: File | null;
}

export interface UpdateWordPayload {
    wordId: string;
    dictionaryId: string;
    word: string;
    translation: string;
    tag_names: string[];
    image_path?: File | null;
    progress: number;
}

export interface WordProgress {
    id: string;
    word: string;
    progress: number; // 0 до 10
    highlight_disabled: boolean;
}

export interface WordsProgressState {
    words: WordProgress[];
    loading: boolean;
    error: string | null;
}

export interface PartialUpdateWordPayload {
    wordId: string;
    dictionaryId: string;
    word?: string;
    translation?: string;
    tag_names?: string[];
    image_path?: File | null;
    progress?: number;
    count?: number;
    highlight_disabled?: boolean;
}
