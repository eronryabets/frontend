
interface Genre {
    id: number;
    name: string;
}

export interface GenresState {
    genres: Genre[];
    loading: boolean;
    error: string | null;
}