import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import axios from 'axios';
import {Book, DownloadBooksState, FetchBooksResponse} from "../../types";
import {GET_BOOK_API_URL} from "../../config/urls";
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
    async (page: number, {rejectWithValue}) => {
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

// Асинхронный thunk для получения книги по ид
export const fetchBookDetails = createAsyncThunk<
    Book,
    string, // ID книги
    { rejectValue: string }
>(
    'books/fetchBookDetails',
    async (bookId: string, {rejectWithValue}) => {
        try {
            const response = await api.get<Book>(`${GET_BOOK_API_URL}${bookId}/`);
            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || 'Не удалось загрузить детали книги.');
            }
            return rejectWithValue('Не удалось загрузить детали книги.');
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
    async (bookId: string, {rejectWithValue}) => {
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

// Асинхронный thunk для обновления книги
export const updateBook = createAsyncThunk<
    Book, // Возвращает обновлённую книгу
    { bookId: string; updatedData: FormData }, // Принимает ID книги и FormData с обновлениями
    { rejectValue: string }
>(
    'books/updateBook',
    async ({bookId, updatedData}, {rejectWithValue}) => {
        try {
            const response = await api.patch<Book>(`${GET_BOOK_API_URL}${bookId}/`, updatedData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || 'Не удалось обновить книгу.');
            }
            return rejectWithValue('Не удалось обновить книгу.');
        }
    }
);

const bookSlice = createSlice({
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
            })
            // Обработка updateBook
            .addCase(updateBook.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBook.fulfilled, (state, action: PayloadAction<Book>) => {
                state.loading = false;
                const updatedBook = action.payload;
                state.books = state.books.map((book) =>
                    book.id === updatedBook.id ? updatedBook : book
                );
            })
            .addCase(updateBook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Не удалось обновить книгу.';
            })
             // fetchBookDetails
            .addCase(fetchBookDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBookDetails.fulfilled, (state, action: PayloadAction<Book>) => {
                const updatedBook = action.payload;
                const existingIndex = state.books.findIndex((book) => book.id === updatedBook.id);
                if (existingIndex !== -1) {
                    state.books[existingIndex] = updatedBook;
                } else {
                    state.books.push(updatedBook);
                }
                state.loading = false;
            })
            .addCase(fetchBookDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Не удалось загрузить детали книги.';
            })

    },
});

export const {setCurrentPage} = bookSlice.actions;

export default bookSlice.reducer;