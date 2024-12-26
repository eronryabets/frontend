import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import api from "../../utils/api";
import {WordsResponse, WordsState, DictionaryResponse, Word, AddWordPayload, UpdateWordPayload} from "../../types";
import {GET_DICTIONARY_API_URL, GET_DICT_WORDS_URL} from "../../config/urls";

const initialState: WordsState = {
    words: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    dictionaryId: null,
    adding: false,
    addError: null,
};

// Асинхронный thunk для получения слова по его ID.
export const fetchWordById = createAsyncThunk<
    Word,
    string, // wordId
    { rejectValue: string }
>(
    'words/fetchWordById',
    async (wordId, thunkAPI) => {
        try {
            const response = await api.get<Word>(
                `${GET_DICT_WORDS_URL}${wordId}/`
            );
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return thunkAPI.rejectWithValue(error.response.data.detail || 'Ошибка при получении слова');
            }
            return thunkAPI.rejectWithValue(error.message || 'Ошибка при получении слова');
        }
    }
);

// Асинхронный thunk для получения слов из словаря по страницам.
export const fetchWords = createAsyncThunk<
    WordsResponse,
    { dictionaryId: string; page: number },
    { rejectValue: string }
>(
    'words/fetchWords',
    async ({dictionaryId, page}, thunkAPI) => {
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

// Асинхронный thunk для добавления нового слова
export const addWord = createAsyncThunk<
    Word,
    AddWordPayload,
    { rejectValue: string }
>(
    'words/addWord',
    async (payload, thunkAPI) => {
        const {
            dictionaryId,
            word,
            translation,
            tag_names,
            image_path
        } = payload;
        const formData = new FormData();
        formData.append('dictionary', dictionaryId);
        formData.append('word', word);
        formData.append('translation', translation);
        tag_names.forEach(tag => formData.append('tag_names', tag));
        if (image_path) {
            formData.append('image_path', image_path);
        }

        try {
            const response = await api.post<Word>(
                `${GET_DICT_WORDS_URL}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return thunkAPI.rejectWithValue(error.response.data.detail || 'Ошибка при добавлении слова');
            }
            return thunkAPI.rejectWithValue(error.message || 'Ошибка при добавлении слова');
        }
    }
);

// Thunk для обновления слова
export const updateWord = createAsyncThunk<
    Word,
    UpdateWordPayload,
    { rejectValue: string }
>(
    'words/updateWord',
    async (payload, thunkAPI) => {
        const {
            wordId,
            dictionaryId,
            word, translation,
            tag_names,
            image_path,
            progress,
        } = payload;
        const formData = new FormData();
        formData.append('dictionary', dictionaryId);
        formData.append('word', word);
        formData.append('translation', translation);
        tag_names.forEach(tag => formData.append('tag_names', tag));
        if (image_path) {
            formData.append('image_path', image_path);
        }
        formData.append('progress', progress.toString());

        try {
            // обновление слова по URL: /words/{wordId}/
            const response = await api.put<Word>(
                `${GET_DICT_WORDS_URL}${wordId}/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return thunkAPI.rejectWithValue(error.response.data.detail || 'Ошибка при обновлении слова');
            }
            return thunkAPI.rejectWithValue(error.message || 'Ошибка при обновлении слова');
        }
    }
);

// Thunk для удаления слова
export const deleteWord = createAsyncThunk<
    string, // возвращаем wordId удалённого слова
    { wordId: string },
    { rejectValue: string }
>(
    'words/deleteWord',
    async ({wordId}, thunkAPI) => {
        try {
            // удаление слова по URL: /words/{wordId}/, метод DELETE
            await api.delete(`${GET_DICT_WORDS_URL}${wordId}/`);
            return wordId;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Ошибка при удалении слова');
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
        resetAddWordState(state) {
            state.adding = false;
            state.addError = null;
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
                state.words = action.payload.results;
                state.totalPages = Math.ceil(action.payload.count / 50); //TODO пока что захардил под 50
            })
            .addCase(fetchWords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Неизвестная ошибка';
            })
            .addCase(addWord.pending, (state) => {
                state.adding = true;
                state.addError = null;
            })
            .addCase(addWord.fulfilled, (state, action) => {
                state.adding = false;
                // Добавляем новое слово в начало списка
                state.words.unshift(action.payload);
                // Увеличиваем счетчик слов и, возможно, количество страниц
                state.totalPages = Math.ceil((state.words.length + 1) / 50); //TODO пока что захардил под 50
            })
            .addCase(addWord.rejected, (state, action) => {
                state.adding = false;
                state.addError = action.payload || 'Неизвестная ошибка при добавлении слова';
            })
            .addCase(updateWord.fulfilled, (state, action) => {
                // Обновляем слово в списке words
                const index = state.words.findIndex(w => w.id === action.payload.id);
                if (index !== -1) {
                    state.words[index] = action.payload;
                }
            })
            .addCase(updateWord.rejected, (state, action) => {
                state.error = action.payload || 'Ошибка при обновлении слова';
            })
            .addCase(deleteWord.fulfilled, (state, action) => {
                // Удаляем слово из массива words
                state.words = state.words.filter(w => w.id !== action.payload);
                // Пересчитываем totalPages, если нужно
                state.totalPages = Math.ceil(state.words.length / 50);
            })
            .addCase(deleteWord.rejected, (state, action) => {
                state.error = action.payload || 'Ошибка при удалении слова';
            })
            // Обработка нового thunk fetchWordById
            .addCase(fetchWordById.pending, (state) => {
                // Можно добавить поле loadingWord или другое, если нужно
            })
            .addCase(fetchWordById.fulfilled, (state, action) => {
                // Проверяем, есть ли уже слово с таким id
                const existingIndex = state.words.findIndex(w => w.id === action.payload.id);
                if (existingIndex !== -1) {
                    // Если есть, обновляем его
                    state.words[existingIndex] = action.payload;
                } else {
                    // Иначе добавляем его
                    state.words.push(action.payload);
                    // Возможно, обновляем totalPages
                    state.totalPages = Math.ceil(state.words.length / 50);
                }
            })
            .addCase(fetchWordById.rejected, (state, action) => {
                state.error = action.payload || 'Ошибка при получении слова';
            });
    },
});

export const {
    setCurrentPage,
    setDictionaryId,
    resetAddWordState
} = wordsSlice.actions;
export default wordsSlice.reducer;
