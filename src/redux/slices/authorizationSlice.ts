import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import axios from 'axios';

// Интерфейс для данных авторизации (ТИПИЗАЦИЯ) хотя можно и без него.
interface AuthorizationData {
    username: string;
    password: string;
}

// Интерфейс состояния авторизованного юзера (ТИПИЗАЦИЯ)
interface AuthorizationState {
    isAuthenticated: boolean;
    userData: {
        id: string | null;
        username: string | null;
        email: string | null;
        first_name?: string | null;
        last_name?: string | null;
        avatar?: File | null;
    };
    status: {
        loading: boolean;
        success: boolean;
        error: string | null;
    };
}

//Интерфейс типизации данных ответа от сервера
interface ResponseData {
    id: string;
    username: string;
    email: string;

    [key: string]: any; // Опционально, для дополнительных полей, которые могут присутствовать
}

// Изначальное состояние не авторизованного юзера
const initialState: AuthorizationState = {
    isAuthenticated: false,
    userData: {
        id: null,
        username: null,
        email: null,
        first_name: null,
        last_name: null,
        avatar: null,
    },
    status: {
        loading: false,
        success: false,
        error: null,
    },
};

//Запрос на авторизацию
export const authorizationUser = createAsyncThunk(
    'authorization/authorizationUser',
    async (formData: AuthorizationData, {rejectWithValue}) => {
        try {
            //Aвторизация в первом auth сервисе
            const authResponse = await axios.post('http://auth.localhost/auth/login/', formData, {
                withCredentials: true,
            });
            //Получение данных юзера с User Service
            //... TODO

            console.log(authResponse.data);
            return authResponse.data;

        } catch (error: any) {
            console.log(error.response.data);
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error.message); //Network Error
            }
        }
    }
);

// Создание Слайса по авторизации - ОБРАБОТКА СОСТОЯНИЯ ЗАГРУЗКИ (в экстра редюсере)
const authorizationSlice = createSlice({
    name: 'authorization',
    initialState,
    reducers: {
        //экшены которые изменяют состояния
    },
    extraReducers: (builder) => {
        builder
            .addCase(authorizationUser.pending, (state) => {
                state.status.loading = true;
                state.status.success = false;
                state.status.error = null;
            })
            .addCase(authorizationUser.fulfilled, (state, action: PayloadAction<ResponseData>) => {
                state.status.loading = false;
                state.status.success = true;
                //Тут мне нужно из ответа записать данные в стейт - id, username, email TODO
                state.isAuthenticated = true;
                state.userData.id = action.payload.id;
                state.userData.username = action.payload.username;
                state.userData.email = action.payload.email;
            })
            .addCase(authorizationUser.rejected, (state, action: PayloadAction<any>) => {
                state.status.loading = false;
                if (action.payload && typeof action.payload === 'object' && 'detail' in action.payload) {
                    state.status.error = action.payload.detail; // Извлекаем строку из поля `detail`
                } else {
                    // В случае, если это простое сообщение об ошибке (например, `Network Error`)
                    state.status.error = action.payload;
                }
            });
    }
});

export default authorizationSlice.reducer;