/**
 * Слайс для загрузки укороченного списка слово - ид - прогресс.
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import api from "../../utils/api";
import {WordProgress, WordsProgressState} from "../../types";
import {GET_DICTIONARY_API_URL} from "../../config/urls";
import {updateWord, deleteWord, addWord} from './wordsSlice';

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
    async ({dictionaryId}, thunkAPI) => {
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
            const {word, progress} = action.payload;
            const index = state.words.findIndex((w) => w.word.toLowerCase()
                === word.toLowerCase());
            if (index !== -1) {
                state.words[index].progress = progress;
            }
        },
        addWordProgress(state, action: PayloadAction<{ id: string; word: string; progress: number }>) {
            const {id, word, progress} = action.payload;
            // Добавляем новое слово в массив words (wordsProgress)
            state.words.push({id, word, progress});
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
            })
            // Доп Обработка при fulfilled действия updateWord.
            //Когда мы на бекенд успешно добавили слова - тогда мы записали изменения и в локал.
            .addCase(updateWord.fulfilled, (state, action) => {
                const updatedWord = action.payload;
                const index = state.words.findIndex(
                    (w) => w.id === updatedWord.id
                );
                if (index !== -1) {
                    state.words[index].progress = updatedWord.progress;
                }
            })
            //доп обработка при удалении слова deleteWord.fulfilled - удаляем и с Ворд Прогресса.
            .addCase(deleteWord.fulfilled, (state, action) => {
                state.words = state.words.filter(w => w.id !== action.payload);
                //оставили в списке только те слова которые не наше слово с ид
            })
            //доп обработка при добавлении слова addWord.fulfilled - добавляем в  Ворд Прогресса.
            .addCase(addWord.fulfilled, (state, action) => {
                const {id, word, progress} = action.payload;
                state.words.push({id, word, progress});
                // addWordProgress({id, word, progress});
            })

    },
});

export const {setWordProgress, addWordProgress} = wordsProgressSlice.actions;
export default wordsProgressSlice.reducer;
