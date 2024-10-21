import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChapterData, ChapterState } from "../../types";
import api from "../../utils/api";
import {BOOK_CHAPTER_API_URL} from "../../config/urls";


const initialState: ChapterState = {
    data: null,
    loading: false,
    error: null,
};

// Асинхронный thunk для загрузки данных главы
export const fetchChapter = createAsyncThunk<
    ChapterData, // Тип возвращаемых данных при успешном выполнении
    { bookId: string; chapterId: string }, // Тип аргументов
    { rejectValue: string } // Тип значения при отклонении
>(
    'chapter/fetchChapter',
    async ({ bookId, chapterId }, { rejectWithValue }) => {
        try {
            const response = await api.get<ChapterData>(
                `${BOOK_CHAPTER_API_URL}get_chapter/`,
                {
                    params: { book_id: bookId, chapter_id: chapterId },
                }
            );
            return response.data;
        } catch (err: any) {
            // Обработка ошибок
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            }
            return rejectWithValue('Не удалось загрузить главу.');
        }
    }
);

const chapterSlice = createSlice({
    name: 'chapter',
    initialState,
    reducers: {
        clearChapter: (state) => {
            state.data = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChapter.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.data = null;
            })
            .addCase(fetchChapter.fulfilled, (state, action: PayloadAction<ChapterData>) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchChapter.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Не удалось загрузить главу.';
            });
    },
});

export const { clearChapter } = chapterSlice.actions;

export default chapterSlice.reducer;