
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from "../../utils/api";
import {WordProgress, WordsProgressState} from "../../types";
import {GET_DICTIONARY_API_URL} from "../../config/urls";

const initialState: WordsProgressState = {
    words: [],
    loading: false,
    error: null,
};

export const fetchWordsProgress = createAsyncThunk<
    WordProgress[],
    { dictionaryId: string },
    { rejectValue: string }
>(
    'wordsProgress/fetchWordsProgress',
    async ({ dictionaryId }, thunkAPI) => {
        try {
            const response = await api.get<WordProgress[]>
            (`${GET_DICTIONARY_API_URL}${dictionaryId}/words_progress/`);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Не удалось загрузить слова.');
        }
    }
);

const wordsProgressSlice = createSlice({
    name: 'wordsProgress',
    initialState,
    reducers: {
        setWordProgress(state, action: PayloadAction<{ word: string; progress: number }>) {
            const { word, progress } = action.payload;
            const index = state.words.findIndex((w) => w.word.toLowerCase()
                === word.toLowerCase());
            if (index !== -1) {
                state.words[index].progress = progress;
            }
        },
    addWordProgress(state, action: PayloadAction<{ id: string; word: string; progress: number }>) {
            const { id, word, progress } = action.payload;
            // Добавляем новое слово в массив words (wordsProgress)
            state.words.push({ id, word, progress });
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWordsProgress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWordsProgress.fulfilled, (state, action) => {
                state.loading = false;
                state.words = action.payload;
            })
            .addCase(fetchWordsProgress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Ошибка при загрузке слов.';
            });
    },
});

export const { setWordProgress, addWordProgress } = wordsProgressSlice.actions;
export default wordsProgressSlice.reducer;
