export interface Chapter {
    id: string;
    chapter_title: string;
}

export interface ChapterData {
    chapter_title: string;
    chapter_text: string;
}

export interface ChapterState {
    data: ChapterData | null;
    loading: boolean;
    error: string | null;
}
