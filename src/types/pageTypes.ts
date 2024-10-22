export interface Page {
    chapter: string; // ID главы
    page_number: number;
    content: string;
}

export interface PageState {
    page: Page | null;
    loading: boolean;
    error: string | null;
}