import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {DownloadBooksState, FetchBooksResponse} from "../../types";
import {GET_BOOK_API_URL} from "../../config";
import api from "../../utils/api";

const initialState: DownloadBooksState = {
    books: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10, // Предположим, что на каждой странице по 10 книг
};

// Асинхронный thunk для получения книг с пагинацией
export const fetchBooks = createAsyncThunk<
    FetchBooksResponse,
    number, // Номер страницы
    { rejectValue: string }
>(
    'books/fetchBooks',
    async (page: number, { rejectWithValue }) => {
        try {
            const response = await api.get<FetchBooksResponse>(`${GET_BOOK_API_URL}?page=${page}`);
            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || 'Не удалось загрузить книги.');
            }
            return rejectWithValue('Не удалось загрузить книги.');
        }
    }
);

const downloadBookSlice = createSlice({
    name: 'books',
    initialState,
    reducers: {
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBooks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBooks.fulfilled, (state, action: PayloadAction<FetchBooksResponse>) => {
                state.loading = false;
                state.books = action.payload.results;
                state.totalPages = Math.ceil(action.payload.count / state.itemsPerPage);
            })
            .addCase(fetchBooks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Не удалось загрузить книги.';
            });
    },
});

export const { setCurrentPage } = downloadBookSlice.actions;

export default downloadBookSlice.reducer;