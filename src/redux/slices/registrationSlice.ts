import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import axios from 'axios';

// Интерфейс для данных регистрации (ТИПИЗАЦИЯ)
interface RegistrationData {
    username: string;
    password: string;
    email: string;
}

// Интерфейс состояния регистрации (ТИПИЗАЦИЯ)
interface RegistrationState {
    loading: boolean;
    success: boolean;
    error: Record<string, string[]> | null;
    responseData: ResponseData | null; // Используем интерфейс для строгой типизации JSON данных
}

//Интерфейс типизации данных ответа от сервера
interface ResponseData {
    id: string;
    username: string;
    email: string;

    [key: string]: any; // Опционально, для дополнительных полей, которые могут присутствовать
}

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
            const response = await axios.post('http://auth.localhost/auth/register/', {
                username: formData.username,
                password: formData.password,
                email: formData.email,
            }, {
                withCredentials: true, //позже нужны будут для второго запроса на сервис2
            });
            return response.data; // Успешный результат возвращаем - ответ от сервера

        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data); //"custom user with this username already exists."
            } else {
                console.log(typeof (error.message)) //string
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
            .addCase(registerUser.fulfilled, (state, action: PayloadAction<ResponseData>) => {
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
