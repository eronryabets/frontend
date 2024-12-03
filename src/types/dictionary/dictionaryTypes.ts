import {WordsResponse} from "./wordTypes";

export interface Dictionary {
    id: string;
    user_id: string;
    language: string;
    name: string;
    cover_image: string;
    word_count: number;
    created_at: string;
    updated_at: string;
}

export interface DictionariesResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Dictionary[];
}

export interface DictionaryResponse {
    id: string;
    user_id: string;
    language: string;
    name: string;
    cover_image: string;
    word_count: number;
    words: WordsResponse;
    created_at: string;
    updated_at: string;
}

export interface DictionaryState {
    dictionaries: Dictionary[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
}