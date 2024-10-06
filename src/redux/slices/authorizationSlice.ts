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
        avatar?: string | null;
    };
    status: {
        loading: boolean;
        success: boolean;
        error: string | null;
    };
}

interface ResponseData {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string; // Если аватар — это URL или строка
    [key: string]: any; // Для дополнительных полей, если они есть
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


export const authorizationUser = createAsyncThunk(
    'authorization/authorizationUser',
    async (formData: AuthorizationData, { rejectWithValue }) => {
        try {
            // Aвторизация в первом auth сервисе
            const authResponse = await axios.post('http://auth.drunar.space/auth/login/', formData, {
                withCredentials: true,
            });
            console.log(authResponse.data); // Данные из Auth Service

            if (authResponse.status === 200) {
                // Получение данных пользователя из User Service
                const profileResponse = await axios.get('http://user.drunar.space/user/profile/', {
                    withCredentials: true,
                });
                console.log(profileResponse.data); // Данные из User Service

                // Объединяем данные из двух сервисов
                const combinedData = {
                    ...authResponse.data,
                    ...profileResponse.data,
                };

                // Возвращаем объединённые данные
                return combinedData;
            } else {
                // Если статус не 200, отклоняем с сообщением об ошибке
                return rejectWithValue('Authorization failed');
            }
        } catch (error: any) {
            console.log(error.response.data);
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error.message); // Network Error
            }
        }
    }
);

const authorizationSlice = createSlice({
    name: 'authorization',
    initialState,
    reducers: {
        // ваши редюсеры
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
                state.isAuthenticated = true;

                // Записываем данные пользователя из объединённого ответа
                const userData = action.payload;
                state.userData.id = userData.id;
                state.userData.username = userData.username;
                state.userData.email = userData.email;
                state.userData.first_name = userData.first_name || null;
                state.userData.last_name = userData.last_name || null;
                state.userData.avatar = userData.avatar || null;
            })
            .addCase(authorizationUser.rejected, (state, action: PayloadAction<any>) => {
                state.status.loading = false;
                state.isAuthenticated = false;
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