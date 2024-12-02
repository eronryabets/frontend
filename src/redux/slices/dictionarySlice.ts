
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GET_DICTIONARY_API_URL } from "../../config/urls";
import api from "../../utils/api";
import {DictionariesResponse, DictionaryState} from "../../types/dictionary";

const initialState: DictionaryState = {
    dictionaries: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
};

// Асинхронный thunk для получения словарей
export const fetchDictionaries = createAsyncThunk<
    DictionariesResponse,
    number,
    { rejectValue: string }
>(
    'dictionaries/fetchDictionaries',
    async (page: number, thunkAPI) => {
        try {
            const response = await api.get<DictionariesResponse>(
                `${GET_DICTIONARY_API_URL}?page=${page}`
            );
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Ошибка при загрузке словарей');
        }
    }
);

const dictionarySlice = createSlice({
    name: 'dictionaries',
    initialState,
    reducers: {
        setCurrentPage(state, action: PayloadAction<number>) {
            state.currentPage = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDictionaries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDictionaries.fulfilled, (state, action) => {
                state.loading = false;
                state.dictionaries = action.payload.results;
                state.totalPages = Math.ceil(action.payload.count / 10); // Предполагаем, что по 10 на странице
            })
            .addCase(fetchDictionaries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Неизвестная ошибка';
            });
    },
});

export const { setCurrentPage } = dictionarySlice.actions;
export default dictionarySlice.reducer;
