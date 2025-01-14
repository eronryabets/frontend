import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import api from "@/utils/api";
import { AUTH_API_URL, USER_API_URL } from "@/config/urls.ts";

import { ProfileData, UserInfoResponseData, UserInfoState } from "@/types";

// Изначальное состояние
const initialState: UserInfoState = {
    userData: {
        id: null,
        username: null,
        email: null,
        first_name: null,
        last_name: null,
        native_language: null,
        avatar: null,
        settings: null,
    },
    status: {
        loading: false,
        success: false,
        error: null,
    },
    updateStatus: {
        updateLoading: false,
        updateSuccess: false,
        updateError: null,
    },
};

// Получение информации о пользователе
export const getUserInfo = createAsyncThunk(
    'userInfo/getUserInfo',
    async (_, {rejectWithValue}) => {
        try {
            const authServiceResponse = await api.get(`${AUTH_API_URL}profile/`);
            console.log("getUserInfo aut_api: authServiceResponse.data : "); // Данные из Auth Service
            console.log(authServiceResponse.data);

            if (authServiceResponse.status === 200) {
                const profileResponse = await api.get(`${USER_API_URL}profile/`);
                console.log("getUserInfo user_api: profileResponse.data: "); // Данные из User Service
                console.log(profileResponse.data);

                const combinedData = {
                    ...authServiceResponse.data,
                    ...profileResponse.data,
                };
                return combinedData;
            } else {
                return rejectWithValue('Response failed');
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Обновление информации в сервисе авторизации
export const patchUserAuthInfo = createAsyncThunk(
    'userInfo/patchUserAuthInfo',
    async (formData: Partial<{ password: string; email: string }>, {rejectWithValue}) => {
        try {
            const authServiceResponse = await api.patch(`${AUTH_API_URL}profile/`, formData);
            console.log("userInfo/patchUserAuthInfo : ");
            console.log(authServiceResponse.data);
            return authServiceResponse.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Обновление информации в пользовательском сервисе
export const patchUserProfileInfo = createAsyncThunk(
    'userInfo/patchUserProfileInfo',
    async (formData: Partial<ProfileData>, {rejectWithValue}) => {
        try {
            const profileResponse = await api.patch(`${USER_API_URL}profile/`, formData);
            console.log("userInfo/patchUserProfileInfo : ");
            console.log(profileResponse.data);
            return profileResponse.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
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
                native_language: null,
                avatar: null,
                settings: null,
            };
        },
        resetUpdateState: (state) => {
            state.updateStatus.updateSuccess = false;
            state.updateStatus.updateError = null;
            state.updateStatus.updateLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // getUserInfo:
            .addCase(getUserInfo.pending, (state) => {
                state.status.loading = true;
                state.status.success = false;
                state.status.error = null;
            })
            .addCase(getUserInfo.fulfilled, (state, action: PayloadAction<UserInfoResponseData>) => {
                state.status.loading = false;
                state.status.success = true;

                const userData = action.payload;

                state.userData = {
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    first_name: userData.first_name || null,
                    last_name: userData.last_name || null,
                    native_language: userData.native_language || null,
                    avatar: userData.avatar || null,
                    settings: null,
                };

                if (userData.settings) {
                    if (typeof userData.settings === 'string') {
                        try {
                            state.userData.settings = JSON.parse(userData.settings);
                        } catch (error) {
                            state.userData.settings = null;
                        }
                    } else {
                        state.userData.settings = userData.settings;
                    }
                }
            })
            .addCase(getUserInfo.rejected, (state, action: PayloadAction<any>) => {
                state.status.loading = false;
                // state.status.error = action.payload || 'Error fetching user info';
                if (typeof action.payload === 'string') {
                    state.status.error = {detail: action.payload}; // Преобразуем строку в объект с ключом detail
                } else if (action.payload && typeof action.payload === 'object') {
                    state.status.error = action.payload; // Оставляем объект, если он есть
                } else {
                    state.status.error = {detail: 'Произошла неизвестная ошибка'};
                }
            })
            // patchUserAuthInfo:
            .addCase(patchUserAuthInfo.pending, (state) => {
                state.updateStatus.updateLoading = true;
                state.updateStatus.updateSuccess = false;
                state.updateStatus.updateError = null;
            })
            .addCase(patchUserAuthInfo.fulfilled, (state) => {
                state.updateStatus.updateLoading = false;
                state.updateStatus.updateSuccess = true;
            })
            .addCase(patchUserAuthInfo.rejected, (state, action: PayloadAction<any>) => {
                state.updateStatus.updateLoading = false;
                // state.updateStatus.updateError = action.payload || 'Ошибка при обновлении информации авторизации';
                if (typeof action.payload === 'string') {
                    state.updateStatus.updateError = {detail: action.payload}; // Преобразуем строку в объект с ключом detail
                } else if (action.payload && typeof action.payload === 'object') {
                    state.updateStatus.updateError = action.payload; // Оставляем объект, если он есть
                } else {
                    state.updateStatus.updateError = {detail: 'Произошла неизвестная ошибка'};
                }
            })
            // patchUserProfileInfo:
            .addCase(patchUserProfileInfo.pending, (state) => {
                state.updateStatus.updateLoading = true;
                state.updateStatus.updateSuccess = false;
                state.updateStatus.updateError = null;
            })
            .addCase(patchUserProfileInfo.fulfilled, (state) => {
                state.updateStatus.updateLoading = false;
                state.updateStatus.updateSuccess = true;
            })
            .addCase(patchUserProfileInfo.rejected, (state, action: PayloadAction<any>) => {
                state.updateStatus.updateLoading = false;
                // state.updateStatus.updateError = action.payload || 'Ошибка при обновлении информации профиля';
                if (typeof action.payload === 'string') {
                    state.updateStatus.updateError = {detail: action.payload}; // Преобразуем строку в объект с ключом detail
                } else if (action.payload && typeof action.payload === 'object') {
                    state.updateStatus.updateError = action.payload; // Оставляем объект, если он есть
                } else {
                    state.updateStatus.updateError = {detail: 'Произошла неизвестная ошибка'};
                }
            });
    },
});

// Экспортируем действие для очистки данных профиля
export const {clearUserInfo, resetUpdateState} = userInfoSlice.actions;
export default userInfoSlice.reducer;
