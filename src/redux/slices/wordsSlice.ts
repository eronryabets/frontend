
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import api from '../../utils/api';

import {
    WordsResponse,
    WordsState,
    Word,
    AddWordPayload,
    PartialUpdateWordPayload,
} from '@/types';

import { PAGE_SIZE } from '@/utils/constants/constants.ts';
import { GET_DICT_WORDS_URL } from '@/config/urls.ts';


const initialState: WordsState = {
    words: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    dictionaryId: null,
    adding: false,
    addError: null,
    search: '',
     filters: {
        tags: [] as string[], // Массив названий тегов
        progress_min: null as number | null,
        progress_max: null as number | null,
        count_min: null as number | null,
        count_max: null as number | null,
        created_at_after: null as string | null, // ISO строка даты
        created_at_before: null as string | null, // ISO строка даты
    },
};

/**
 * Thunk для получения слов из словаря по страницам с опциональным поиском.
 */
export const fetchWords = createAsyncThunk<
    WordsResponse,
    { dictionaryId: string; page: number; search?: string; filters?: WordsState['filters'] }, // Добавлен filters
    { rejectValue: string }
>(
    'words/fetchWords',
    async ({ dictionaryId, page, search, filters }, thunkAPI) => {
        try {
            // Построение параметров запроса
            const params = new URLSearchParams();
            params.append('dictionary', dictionaryId);
            params.append('page', page.toString());
            if (search) {
                params.append('search', search);
            }
            if (filters) {
                if (filters.tags.length > 0) {
                    filters.tags.forEach(tag => params.append('tags', tag));
                }
                if (filters.progress_min !== null) {
                    params.append('progress_min', filters.progress_min.toString());
                }
                if (filters.progress_max !== null) {
                    params.append('progress_max', filters.progress_max.toString());
                }
                if (filters.count_min !== null) {
                    params.append('count_min', filters.count_min.toString());
                }
                if (filters.count_max !== null) {
                    params.append('count_max', filters.count_max.toString());
                }
                if (filters.created_at_after) {
                    params.append('created_at_after', filters.created_at_after);
                }
                if (filters.created_at_before) {
                    params.append('created_at_before', filters.created_at_before);
                }
            }

            const response = await api.get<WordsResponse>(
                `${GET_DICT_WORDS_URL}?${params.toString()}`
            );
            return response.data; // Возвращаем весь ответ
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Ошибка при загрузке слов');
        }
    }
);

/**
 * Thunk для получения слова по его ID.
 */
export const fetchWordById = createAsyncThunk<
    Word,
    string,
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

/**
 * Thunk для добавления нового слова.
 */
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

/**
 * Thunk для обновления слова.
 */
export const updateWord = createAsyncThunk<
    Word,
    PartialUpdateWordPayload,
    { rejectValue: string }
>(
    'words/updateWord',
    async (payload, thunkAPI) => {
        const {
            wordId,
            dictionaryId,
            word,
            translation,
            tag_names,
            image_path,
            progress,
            count
        } = payload;
        const formData = new FormData();
        formData.append('dictionary', dictionaryId);

        if (word !== undefined) formData.append('word', word);
        if (translation !== undefined) formData.append('translation', translation);
        if (tag_names !== undefined) {
            tag_names.forEach(tag => formData.append('tag_names', tag));
        }
        if (image_path !== undefined && image_path !== null) {
            formData.append('image_path', image_path);
        }
        if (progress !== undefined) formData.append('progress', progress.toString());
        if (count !== undefined) formData.append('count', count.toString());

        try {
            // Используем PATCH для частичных обновлений
            const response = await api.patch<Word>(
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

/**
 * Thunk для удаления слова.
 */
export const deleteWord = createAsyncThunk<
    string, // возвращаем wordId удалённого слова
    { wordId: string },
    { rejectValue: string }
>(
    'words/deleteWord',
    async ({ wordId }, thunkAPI) => {
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
        /**
         * Устанавливает текущую страницу пагинации.
         */
        setCurrentPage(state, action: PayloadAction<number>) {
            state.currentPage = action.payload;
        },
        /**
         * Устанавливает ID текущего словаря и сбрасывает текущую страницу.
         */
        setDictionaryId(state, action: PayloadAction<string>) {
            state.dictionaryId = action.payload;
            state.currentPage = 1; // Сбрасываем текущую страницу при смене словаря
            state.search = ''; // Сбрасываем поиск при смене словаря
            state.filters = {
                tags: [],
                progress_min: null,
                progress_max: null,
                count_min: null,
                count_max: null,
                created_at_after: null,
                created_at_before: null,
            };
        },
        /**
         * Устанавливает поисковый запрос и сбрасывает текущую страницу.
         */
        setSearchTerm(state, action: PayloadAction<string>) {
            state.search = action.payload;
            state.currentPage = 1; // Сбрасываем страницу при новом поиске
        },
        /**
         * Устанавливает значения фильтров и сбрасывает текущую страницу.
         */
        setFilters(state, action: PayloadAction<WordsState['filters']>) {
            state.filters = action.payload;
            state.currentPage = 1; // Сбрасываем страницу при изменении фильтров
        },
        /**
         * Сбрасывает состояние добавления слова.
         */
        resetAddWordState(state) {
            state.adding = false;
            state.addError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Обработка fetchWords
            .addCase(fetchWords.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWords.fulfilled, (state, action) => {
                state.loading = false;
                state.words = action.payload.results;
                state.totalPages = Math.ceil(action.payload.count / PAGE_SIZE); // TODO: захардить под 50
            })
            .addCase(fetchWords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Неизвестная ошибка';
            })
            // Обработка addWord
            .addCase(addWord.pending, (state) => {
                state.adding = true;
                state.addError = null;
            })
            .addCase(addWord.fulfilled, (state, action) => {
                state.adding = false;
                // Добавляем новое слово в начало списка
                state.words.unshift(action.payload);
                 // Пересчитываем totalPages исходя из нового количества слов
                 state.totalPages = Math.ceil((state.words.length) / PAGE_SIZE); // TODO: захардить под 50
            })
            .addCase(addWord.rejected, (state, action) => {
                state.adding = false;
                state.addError = action.payload || 'Неизвестная ошибка при добавлении слова';
            })
            // Обработка updateWord
            .addCase(updateWord.fulfilled, (state, action) => {
                /// Обновляем слово в списке words
                const index = state.words.findIndex(w => w.id === action.payload.id);
                if (index !== -1) {
                    state.words[index] = action.payload;
                } else {
                    // Если слова нет в списке, добавляем его
                    state.words.push(action.payload);
                }
            })
            .addCase(updateWord.rejected, (state, action) => {
                state.error = action.payload || 'Ошибка при обновлении слова';
            })
             // Обработка deleteWord
            .addCase(deleteWord.fulfilled, (state, action) => {
                // Удаляем слово из массива words
                state.words = state.words.filter(w => w.id !== action.payload);
                // Пересчитываем totalPages, если нужно
                state.totalPages = Math.ceil(state.words.length / PAGE_SIZE);
            })
            .addCase(deleteWord.rejected, (state, action) => {
                state.error = action.payload || 'Ошибка при удалении слова';
            })
            // Обработка fetchWordById
            .addCase(fetchWordById.pending, () => {
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
                    state.totalPages = Math.ceil(state.words.length / PAGE_SIZE);
                }
            })
            .addCase(fetchWordById.rejected, (state, action) => {
                state.error = action.payload || 'Ошибка при получении слова';
            });
    },
});

// Экспортируем экшены и редьюсер
export const {
    setCurrentPage,
    setDictionaryId,
    setSearchTerm,
    setFilters,
    resetAddWordState
} = wordsSlice.actions;
export default wordsSlice.reducer;
