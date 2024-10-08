import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import api from "../../utils/api";
import axios from "axios";

interface ProfileData {
    first_name: string;
    last_name: string;
    avatar: string;
}

interface Settings {
    theme: string; // Например, светлая или темная тема
    language: string; // Настройки языка
    [key: string]: any; // Другие возможные настройки
}

interface UserInfoState {
    userData: {
        id: string | null;
        username: string | null;
        email: string | null;
        first_name?: string | null;
        last_name?: string | null;
        avatar?: string | null;
        settings?: Settings | null; // Настройки как объект
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
    avatar?: string;
    settings?: string; // Добавляем settings в типы ответа

    [key: string]: any;
}

// Изначальное состояние не авторизованного юзера
const initialState: UserInfoState = {
    userData: {
        id: null,
        username: null,
        email: null,
        first_name: null,
        last_name: null,
        avatar: null,
        settings: null, // Инициализируем поле settings
    },
    status: {
        loading: false,
        success: false,
        error: null,
    },
};

// Получение информации о пользователе
export const getUserInfo = createAsyncThunk(
    'userInfo/getUserInfo',
    async (_, {rejectWithValue}) => {
        try {
            // Получение Юзер Инфо с Сервиса Авторизации
            const authServiceResponse = await api.get('http://auth.drunar.space/auth/profile/', {});
            console.log("getUserInfo aut_api: authServiceResponse.data : "); // Данные из Auth Service
            console.log(authServiceResponse.data); // Данные из Auth Service

            if (authServiceResponse.status === 200) {
                // Получение данных пользователя из User Service
                const profileResponse = await api.get('http://user.drunar.space/user/profile/', {});
                console.log("getUserInfo user_api: profileResponse.data: "); // Данные из User Service
                console.log(profileResponse.data); // Данные из User Service

                // Объединяем данные из двух сервисов
                const combinedData = {
                    ...authServiceResponse.data,
                    ...profileResponse.data,
                };

                // Возвращаем объединённые данные
                return combinedData;
            } else {
                return rejectWithValue('Response failed');
            }
        } catch (error: any) {
            console.log(error.response.data);
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

// Обновление информации в сервисе авторизации
export const patchUserAuthInfo = createAsyncThunk(
    'userInfo/patchUserAuthInfo',
    async (formData: { password: string; email: string }, {rejectWithValue}) => {
        try {
            const authServiceResponse = await api.patch('http://auth.drunar.space/auth/profile/',
                formData, {});
            console.log(authServiceResponse.data);
            return authServiceResponse.data;

        } catch (error: any) {
            console.log(error.response.data);
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

// Обновление информации в пользовательском сервисе
export const patchUserProfileInfo = createAsyncThunk(
    'userInfo/patchUserProfileInfo',
    async (formData: ProfileData, {rejectWithValue}) => {
        try {
            const profileResponse = await api.patch('http://user.drunar.space/user/profile/',
                formData);
            console.log(profileResponse.data);
            return profileResponse.data;
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState,
    reducers: {
        clearUserInfo: (state) => {
           state.userData = {
                id: null,
                username: null,
                email: null,
                first_name: null,
                last_name: null,
                avatar: null,
                settings: null,
            };
        }
    },
    extraReducers: (builder) => {
        builder
            // getUserInfo:
            .addCase(getUserInfo.pending, (state) => {
                state.status.loading = true;
                state.status.success = false;
                state.status.error = null;
            })
            .addCase(getUserInfo.fulfilled, (state, action: PayloadAction<ResponseData>) => {
                state.status.loading = false;
                state.status.success = true;

                // Записываем данные пользователя из объединённого ответа
                const userData = action.payload;

                state.userData = {
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    first_name: userData.first_name || null,
                    last_name: userData.last_name || null,
                    avatar: userData.avatar || null,
                    // Если settings получены как JSON-строка, парсим её
                    settings: null, // Инициализируем settings как null
                }
                // Если settings получены как JSON-строка, парсим её
                if (userData.settings) {
                    if (typeof userData.settings === 'string') {
                        try {
                            state.userData.settings = JSON.parse(userData.settings);
                        } catch (error) {
                            console.error("Error parsing settings", error);
                            state.userData.settings = null;
                        }
                    } else {
                        // Если settings уже объект, просто сохраняем их
                        state.userData.settings = userData.settings;
                    }
                }

            })
            .addCase(getUserInfo.rejected, (state, action: PayloadAction<any>) => {
                state.status.loading = false;
                if (action.payload && typeof action.payload === 'object' && 'detail' in action.payload) {
                    state.status.error = action.payload.detail;
                } else {
                    state.status.error = action.payload;
                }
            })
            // patchUserAuthInfo:
            .addCase(patchUserAuthInfo.pending, (state) => {
                state.status.loading = true;
                state.status.success = false;
                state.status.error = null;
            })
            .addCase(patchUserAuthInfo.fulfilled, (state) => {
                state.status.loading = false;
                state.status.success = true;
            })
            .addCase(patchUserAuthInfo.rejected, (state, action: PayloadAction<any>) => {
                state.status.loading = false;
                if (action.payload && typeof action.payload === 'object' && 'detail' in action.payload) {
                    state.status.error = action.payload.detail;
                } else {
                    state.status.error = action.payload;
                }
            })
            // patchUserProfileInfo:
            .addCase(patchUserProfileInfo.pending, (state) => {
                state.status.loading = true;
                state.status.success = false;
                state.status.error = null;
            })
            .addCase(patchUserProfileInfo.fulfilled, (state) => {
                state.status.loading = false;
                state.status.success = true;
            })
            .addCase(patchUserProfileInfo.rejected, (state, action: PayloadAction<any>) => {
                state.status.loading = false;
                if (action.payload && typeof action.payload === 'object' && 'detail' in action.payload) {
                    state.status.error = action.payload.detail;
                } else {
                    state.status.error = action.payload;
                }
            });
    },
});

// Экспортируем действие для очистки данных профиля
export const { clearUserInfo} = userInfoSlice.actions;
export default userInfoSlice.reducer;
