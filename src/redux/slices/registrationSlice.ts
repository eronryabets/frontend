import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import axios from 'axios';
import {AUTH_API_URL, USER_API_URL} from "../../config";
import api from "../../utils/api";
import {RegistrationData, RegistrationState, RegistrationResponseData} from "../../types";



// Изначальное состояние для слайса (для его кейса состояния)
const initialState: RegistrationState = {
    loading: false,
    success: false,
    error: null,
    responseData: null,
};

// Асинхронный thunk для регистрации пользователя с использованием axios
//(1,2) 1 - название действия, 2 - полезная нагрузка (успех или ошибка)
export const registerUser = createAsyncThunk(
    'registration/registerUser', // name/action
    // PayloadCreator //rejectWithValue - сообщение об ошибке в случае ошибки
    async (formData: RegistrationData, {rejectWithValue}) => {
        try {
            //Регистрация в 1-м сервисе AUTH
            const authResponse = await axios.post(`${AUTH_API_URL}register/`, {
                username: formData.username,
                password: formData.password,
                email: formData.email,
            }, {
                withCredentials: true,
            });

            //Регистрация в User Service :
            if (authResponse.status === 201) {

                //Установить задержку в 30 сек и проверить куки
                const {id} = authResponse.data;

                const userData = new FormData();
                userData.append('id', id);
                if (formData.first_name) userData.append('first_name', formData.first_name);
                if (formData.last_name) userData.append('last_name', formData.last_name);
                if (formData.avatar) userData.append('avatar', formData.avatar);

                await api.post(`${USER_API_URL}create/`, userData, {
                    withCredentials: true,
                });

                window.alert('Пользователь успешно зарегистрирован и добавлен в User Service.');
                return authResponse.data;
            }

        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue(error.message); //Network Error
            }
        }
    }
);

// Создание registrationSlice - ОБРАБОТКА СОСТОЯНИЯ ЗАГРУЗКИ (в экстра редюсере)
const registrationSlice = createSlice({
    name: 'registration', //имя слайса, идентификатор действия
    initialState,
    reducers: {
        //экшены которые изменяют состояния - но у меня нет нужды сейчас в них.
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action: PayloadAction<RegistrationResponseData>) => {
                state.loading = false;
                state.success = true;
                state.responseData = action.payload;
            })
            .addCase(registerUser.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload as Record<string, string[]>;

            });
    },
});

// Экспорт редьюсера для добавления в root reducer
export default registrationSlice.reducer;
