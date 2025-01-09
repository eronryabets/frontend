import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { TRANSLATE_API_URL } from '@/config/urls.ts';
import api from '@/utils/api';

import {
    TranslationRequest,
    TranslationResponse,
    TranslationState,
} from '@/types/translationTypes.ts';


const initialState: TranslationState = {
    translation: '',
    loading: false,
    error: null,
};

// Асинхронный thunk для запроса перевода
export const fetchTranslation = createAsyncThunk<
    TranslationResponse,
    TranslationRequest,
    { rejectValue: string }
>(
    'translation/fetchTranslation',
    async (request, { rejectWithValue }) => {
        try {
            const response = await api.post<TranslationResponse>(
                `${TRANSLATE_API_URL}`,
                request,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при переводе');
        }
    }
);

const translationSlice = createSlice({
    name: 'translation',
    initialState,
    reducers: {
        clearTranslation(state) {
            state.translation = '';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTranslation.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.translation = '';
            })
            .addCase(fetchTranslation.fulfilled, (state, action: PayloadAction<TranslationResponse>) => {
                state.loading = false;
                state.translation = action.payload.translation;
            })
            .addCase(fetchTranslation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Неизвестная ошибка';
            });
    },
});

export const { clearTranslation } = translationSlice.actions;

export default translationSlice.reducer;