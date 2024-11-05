export interface TranslationRequest {
    word: string;
    source_lang: string;
    target_lang: string;
}

export interface TranslationResponse {
    word: string;
    translation: string;
}

export interface TranslationState {
    translation: string;
    loading: boolean;
    error: string | null;
}