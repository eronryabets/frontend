import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {BOOK_API_URL} from "../../config";
import api from "../../utils/api";

import {BookData, UploadBookState, BookResponseData} from '../../types';
import axios from "axios";
import normalizeAndLimitErrors from "../../utils/normalizeAndLimitErrors";

// Изначальное состояние для слайса
const initialState: UploadBookState = {
    loading: false,
    success: false,
    error: null,
    responseMessage: null,
};


// Асинхронный thunk для загрузки книги
export const uploadBook = createAsyncThunk<
    BookResponseData, // Тип возвращаемых данных при успехе
    BookData,     // Тип аргумента
    { rejectValue: Record<string, string[]> | string } // Тип rejectWithValue
>(
    'books/uploadBook',
    async (bookData: BookData, { rejectWithValue }) => {
        try {
            // Создание FormData из BookData
            const formData = new FormData();
            formData.append("user_id", bookData.user_id);
            formData.append("title", bookData.title);
            formData.append("description", bookData.description || "");
            // Добавление нескольких жанров
            bookData.genres.forEach((genreId) => {
                formData.append("genres", genreId.toString());
            });
            if (bookData.file) {
                formData.append("file", bookData.file);
            }
            if (bookData.cover_image) {
                formData.append("cover_image", bookData.cover_image);
            }

            // Отправка запроса
            const response = await api.post(`${BOOK_API_URL}books/upload/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Предполагаем, что сервер возвращает данные типа ResponseData
            return response.data as BookResponseData;
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                // Нормализация и ограничение длины ошибок
                const normalizedErrors = normalizeAndLimitErrors(error.response.data);
                if (Object.keys(normalizedErrors).length === 0) {
                    console.warn("Received unrecognized error format:", error.response.data);
                    return rejectWithValue('An unexpected error occurred.');
                }
                return rejectWithValue(normalizedErrors);
            } else {
                // Ограничение длины строки ошибки
                const errorMessage = typeof error.message === 'string' ?
                    (error.message.length > 500 ? error.message.slice(0, 500) + '...' : error.message) :
                    'Unknown error occurred.';
                return rejectWithValue(errorMessage);
            }
        }
    }
);

// Создание uploadBookSlice
const uploadBookSlice = createSlice({
    name: 'uploadBook',
    initialState,
    reducers: {
        resetState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
            state.responseMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadBook.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(uploadBook.fulfilled, (state, action: PayloadAction<BookResponseData>) => {
                state.loading = false;
                state.success = true;
                state.responseMessage = { general: ["Book uploaded successfully."] };
            })
            .addCase(uploadBook.rejected, (state, action) => {
                state.loading = false;
                if (action.payload) { // Проверяем, что payload существует
                    if (typeof action.payload === 'string') {
                        state.error = { general: [action.payload] };
                    } else {
                        state.error = action.payload;
                    }
                } else {
                    // Если payload отсутствует, устанавливаем общую ошибку
                    state.error = { general: ['Unknown error occurred.'] };
                }
            });
    },
});

export const { resetState } = uploadBookSlice.actions;
export default uploadBookSlice.reducer;