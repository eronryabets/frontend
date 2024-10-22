import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Page, PageState } from '../../types';
import api from '../../utils/api';
import {BOOK_PAGE_API_URL} from "../../config/urls";

const initialState: PageState = {
    page: null,
    loading: false,
    error: null,
};

export const fetchPageByNumber = createAsyncThunk<
    Page,
    { chapterId: string; pageNumber: number },
    { rejectValue: string }
>(
    'page/fetchPageByNumber',
    async ({ chapterId, pageNumber }, { rejectWithValue }) => {
        try {
            const response = await api.get<Page>(`${BOOK_PAGE_API_URL}get_page_by_number/`, {
                params: {
                    chapter_id: chapterId,
                    page_number: pageNumber,
                },
            });
            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || 'Не удалось загрузить страницу.');
            }
            return rejectWithValue('Не удалось загрузить страницу.');
        }
    }
);

const pageSlice = createSlice({
    name: 'page',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPageByNumber.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.page = null;
            })
            .addCase(fetchPageByNumber.fulfilled, (state, action: PayloadAction<Page>) => {
                state.loading = false;
                state.page = action.payload;
            })
            .addCase(fetchPageByNumber.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Не удалось загрузить страницу.';
            });
    },
});

export default pageSlice.reducer;