
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from "../../utils/api";
import { WordsResponse, WordsState, DictionaryResponse } from "../../types";
import { GET_DICTIONARY_API_URL } from "../../config/urls";

const initialState: WordsState = {
    words: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    dictionaryId: null,
};

// Асинхронный thunk для получения слов из словаря
export const fetchWords = createAsyncThunk<
    WordsResponse,
    { dictionaryId: string; page: number },
    { rejectValue: string }
>(
    'words/fetchWords',
    async ({ dictionaryId, page }, thunkAPI) => {
        try {
            const response = await api.get<DictionaryResponse>(
                `${GET_DICTIONARY_API_URL}${dictionaryId}/?page=${page}`
            );
            console.log('fetchWords fulfilled:', response.data.words);
            return response.data.words; // Возвращаем только раздел words
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Ошибка при загрузке слов');
        }
    }
);

const wordsSlice = createSlice({
    name: 'words',
    initialState,
    reducers: {
        setCurrentPage(state, action: PayloadAction<number>) {
            state.currentPage = action.payload;
        },
        setDictionaryId(state, action: PayloadAction<string>) {
            state.dictionaryId = action.payload;
            state.currentPage = 1; // Сбрасываем текущую страницу при смене словаря
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWords.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWords.fulfilled, (state, action) => {
                state.loading = false;
                state.words = action.payload.results || []; // Защита от undefined
                state.totalPages = Math.ceil(action.payload.count / 50); // 50 слов на странице
            })
            .addCase(fetchWords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Неизвестная ошибка';
            });
    },
});

export const { setCurrentPage, setDictionaryId } = wordsSlice.actions;
export default wordsSlice.reducer;
