import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {BOOK_API_URL} from "../../config";
import api from "../../utils/api";

// Интерфейс для данных необходимых для выгрузки книги (ТИПИЗАЦИЯ)
import { BookData, UploadBookState, ResponseData } from '../../types/book';
import axios from "axios";

// Изначальное состояние для слайса
const initialState: UploadBookState = {
    loading: false,
    success: false,
    error: null,
    responseMessage: null,
};

// Функция для нормализации ошибок
const normalizeErrors = (data: any): Record<string, string[]> => {
    const normalizedErrors: Record<string, string[]> = {};

    for (const key in data) {
        if (Array.isArray(data[key])) {
            normalizedErrors[key] = data[key];
        } else if (typeof data[key] === 'string') {
            normalizedErrors[key] = [data[key]];
        } else {
            normalizedErrors[key] = ['Unknown error'];
        }
    }

    return normalizedErrors;
};

// Асинхронный thunk для загрузки книги
export const uploadBook = createAsyncThunk<
    ResponseData, // Тип возвращаемых данных при успехе
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
            formData.append("genre", bookData.genre);
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
            return response.data as ResponseData;
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                // Нормализация ошибок
                const normalizedErrors = normalizeErrors(error.response.data);
                return rejectWithValue(normalizedErrors);
            } else {
                return rejectWithValue(error.message);
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
            .addCase(uploadBook.fulfilled, (state, action: PayloadAction<ResponseData>) => {
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