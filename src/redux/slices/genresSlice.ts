
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Genre, GenresState } from '../../types';
import { BOOK_GENRES_API_URL } from '../../config/urls';
import api from "../../utils/api"; // Убедитесь, что у вас есть соответствующая конфигурация

// Изначальное состояние для слайса
const initialState: GenresState = {
    genres: [],
    loading: false,
    error: null,
};

// Асинхронный thunk для загрузки жанров
export const fetchGenres = createAsyncThunk<
    Genre[],       // Тип возвращаемых данных при успехе
    void,          // Тип аргумента (нет аргументов)
    { rejectValue: string } // Тип rejectWithValue
>(
    'genres/fetchGenres',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<Genre[]>(BOOK_GENRES_API_URL);
            return response.data;
        } catch (error: any) {
            // Проверяем, является ли ошибка AxiosError
            if (axios.isAxiosError(error)) {
                // Возвращаем сообщение об ошибке от сервера, если доступно
                return rejectWithValue(error.response?.data?.message || 'Failed to fetch genres.');
            }
            return rejectWithValue('Failed to fetch genres.');
        }
    }
);

const genresSlice = createSlice({
    name: 'genres',
    initialState,
    reducers: {
        resetGenresState: (state) => {
            state.genres = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGenres.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGenres.fulfilled, (state, action: PayloadAction<Genre[]>) => {
                state.loading = false;
                state.genres = action.payload;
            })
            .addCase(fetchGenres.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch genres.';
            });
    },
});

export const { resetGenresState } = genresSlice.actions;
export default genresSlice.reducer;
