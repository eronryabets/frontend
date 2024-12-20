import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import axios from 'axios';
import api from "../../utils/api";
import {AUTH_API_URL} from "../../config/urls";
import {clearUserInfo, getUserInfo} from "./userInfoSlice";
import {AuthorizationData, AuthorizationState} from "../../types";
import {persistor} from "../store";
import {setTheme} from "./themeSlice";
import {fetchDictionaries} from "./dictionarySlice";

// Изначальное состояние авторизации
const initialState: AuthorizationState = {
    isAuthenticated: false,
    status: {
        loading: false,
        success: false,
        error: null,
    },
};

// Авторизация пользователя
export const authorizationUser = createAsyncThunk(
    'authorization/authorizationUser',
    async (formData: AuthorizationData, {dispatch, rejectWithValue}) => {
        try {
            // Aвторизация на сервисе
            const authResponse = await axios.post(`${AUTH_API_URL}login/`, formData, {
                withCredentials: true,
            });
            console.log("authorizationUser auth_api: authResponse.data");
            console.log(authResponse.data);

            if (authResponse.status === 200) {
                // После успешной авторизации делаем запрос на получение данных пользователя
                console.log(`authorizationUser getUserInfo(): `);
                dispatch(getUserInfo());  // Получаем данные пользователя

                return authResponse.data;  // Возвращаем данные авторизации
            } else {
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

// Новый thunk для инициализации пользователя после авторизации
//Заменено на AuthLIstener!
// export const initializeUser = createAsyncThunk(
//     'authorization/initializeUser',
//     async (formData: AuthorizationData, { dispatch, rejectWithValue }) => {
//         try {
//             // Выполняем авторизацию
//             console.log("(!) initializeUser : ")
//             const authResult = await dispatch(authorizationUser(formData));
//
//             if (authorizationUser.fulfilled.match(authResult)) {
//                 console.log("(!) authorizationUser.fulfilled'");
//                 // Получаем userData из состояния
//                 const userData: any = (dispatch as any).getState().userInfo.userData;
//
//                 // Устанавливаем тему
//                 if (userData.settings?.theme?.mode) {
//                     console.log("(!) Загружаем тему юзера'");
//                     dispatch(setTheme(userData.settings.theme.mode as 'light' | 'dark'));
//                 }
//
//                 // Загружаем словари
//                 dispatch(fetchDictionaries(1));
//                 console.log("(!) Загружаем список словарей пользователя'");
//
//                 return authResult.payload;
//             } else {
//                 return rejectWithValue(authResult.payload);
//             }
//         } catch (error: any) {
//             return rejectWithValue(error.message || 'Initialization failed');
//         }
//     }
// );


// Логаут пользователя
export const logout = createAsyncThunk(
    'authorization/logout',
    async (_, {dispatch, rejectWithValue}) => {
        try {
            // Отправляем запрос на логаут (cookies автоматически отправятся)
            await api.post(`${AUTH_API_URL}logout/`, {}, {});

            // Очищаем persisted state
            await persistor.purge();

            // Дополнительно очищаем LocalStorage, что б наверняка
            localStorage.clear();

            // Сброс состояния пользователя в Redux
            dispatch(clearUserInfo());

        } catch (error: any) {
            return rejectWithValue('Logout failed.');
        }
    }
);

const authorizationSlice = createSlice({
    name: 'authorization',
    initialState,
    reducers: {
        resetState: (state) => {
            state.status.loading = false;
            state.status.success = false;
            state.status.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Authorization User Cases
            .addCase(authorizationUser.pending, (state) => {
                state.status.loading = true;
                state.status.success = false;
                state.status.error = null;
            })
            .addCase(authorizationUser.fulfilled, (state) => {
                state.status.loading = false;
                state.status.success = true;
                state.isAuthenticated = true;
            })
            .addCase(authorizationUser.rejected, (state, action: PayloadAction<any>) => {
                state.status.loading = false;
                state.isAuthenticated = false;
                // state.status.error = action.payload ?? 'Authorization failed';
                if (action.payload) { // Проверяем, что payload существует
                    if (typeof action.payload === 'string') {
                        state.status.error = {general: [action.payload]};
                    } else {
                        state.status.error = action.payload;
                    }
                } else {
                    // Если payload отсутствует, устанавливаем общую ошибку
                    state.status.error = {general: ['Unknown error occurred.']};
                }
            })
            // Logout Cases
            .addCase(logout.pending, (state) => {
                state.status.loading = true;
                state.status.success = false;
                state.status.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.status.loading = false;
                state.isAuthenticated = false;
            })
            .addCase(logout.rejected, (state, action: PayloadAction<any>) => {
                state.status.loading = false;
                state.status.error = action.payload ?? 'Logout failed';
            });
    },
});
export const {resetState} = authorizationSlice.actions;
export default authorizationSlice.reducer;
