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
    itemsPerPage: 6, // Предположим, что на каждой странице по 6 книг
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

// Асинхронный thunk для удаления книги
export const deleteBook = createAsyncThunk<
    string, // Возвращает ID удалённой книги
    string, // Принимает ID книги для удаления
    { rejectValue: string }
>(
    'books/deleteBook',
    async (bookId: string, { rejectWithValue }) => {
        try {
            await api.delete(`${GET_BOOK_API_URL}${bookId}/`);
            return bookId;
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || 'Не удалось удалить книгу.');
            }
            return rejectWithValue('Не удалось удалить книгу.');
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
            // Обработка fetchBooks
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
            })
            // Обработка deleteBook
            .addCase(deleteBook.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBook.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                const deletedBookId = action.payload;
                state.books = state.books.filter((book) => book.id !== deletedBookId);
            })
            .addCase(deleteBook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Не удалось удалить книгу.';
            });
    },
});

export const { setCurrentPage } = downloadBookSlice.actions;

export default downloadBookSlice.reducer;