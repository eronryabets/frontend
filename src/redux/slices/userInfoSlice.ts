import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import api from "../../utils/api";
import axios from "axios";

interface ProfileData {
    first_name?: string;
    last_name?: string;
    avatar?: string | File;
}

interface Settings {
    theme: string;
    language: string;

    [key: string]: any;
}

interface UserInfoState {
    userData: {
        id: string | null;
        username: string | null;
        email: string | null;
        first_name?: string | null;
        last_name?: string | null;
        avatar?: string | null;
        settings?: Settings | null;
    };
    status: {
        loading: boolean;
        success: boolean;
        error: string | null;
    };
    updateStatus: {
        updateLoading: boolean;
        updateSuccess: boolean;
        updateError: string | null;
    };
}

interface ResponseData {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    settings?: string;
}

// Изначальное состояние
const initialState: UserInfoState = {
    userData: {
        id: null,
        username: null,
        email: null,
        first_name: null,
        last_name: null,
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
            const authServiceResponse = await api.get('http://auth.drunar.space/auth/profile/');
            console.log("getUserInfo aut_api: authServiceResponse.data : "); // Данные из Auth Service
            console.log(authServiceResponse.data);

            if (authServiceResponse.status === 200) {
                const profileResponse = await api.get('http://user.drunar.space/user/profile/');
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
            const authServiceResponse = await api.patch('http://auth.drunar.space/auth/profile/', formData);
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
            const profileResponse = await api.patch('http://user.drunar.space/user/profile/', formData);
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
            .addCase(getUserInfo.fulfilled, (state, action: PayloadAction<ResponseData>) => {
                state.status.loading = false;
                state.status.success = true;

                const userData = action.payload;

                state.userData = {
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    first_name: userData.first_name || null,
                    last_name: userData.last_name || null,
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
                state.status.error = action.payload || 'Error fetching user info';
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
                state.updateStatus.updateError = action.payload || 'Ошибка при обновлении информации авторизации';
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
                state.updateStatus.updateError = action.payload || 'Ошибка при обновлении информации профиля';
            });
    },
});

// Экспортируем действие для очистки данных профиля
export const {clearUserInfo, resetUpdateState} = userInfoSlice.actions;
export default userInfoSlice.reducer;
