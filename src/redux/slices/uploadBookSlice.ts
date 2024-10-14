import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {BOOK_API_URL} from "../../config";
import api from "../../utils/api";

// Интерфейс для данных необходимых для выгрузки книги (ТИПИЗАЦИЯ)
interface BookData {
    user_id: string;
    title: string;
    genre: string;
    file: File;
    cover_image?: File | null;
}

// Интерфейс состояния загрузки (ТИПИЗАЦИЯ)
interface UploadBookState {
    loading: boolean;
    success: boolean;
    error: Record<string, string[]> | null;
    responseMessage: Record<string, string[]> | null;
}

const initialState: UploadBookState = {
    loading: false,
    success: false,
    error: null,
    responseMessage: null,
};

// Асинхронный thunk для загрузки книги
export const uploadBook = createAsyncThunk(
    'books/uploadBook',
    async (formData: FormData, {rejectWithValue}) => {
        try {
            const response = await api.post(`${BOOK_API_URL}books/upload/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

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
      .addCase(uploadBook.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(uploadBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as Record<string, string[]>;
      });
  },
});

export const { resetState } = uploadBookSlice.actions;
export default uploadBookSlice.reducer;