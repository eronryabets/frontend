import axios from 'axios';
import {AUTH_SERVICE_URL} from "../config";
import store from "../redux/store";


// Создаем экземпляр Axios
const api = axios.create({
    baseURL: AUTH_SERVICE_URL,
    withCredentials: true, // Включаем cookie в запросах
});

// Interceptor для перехвата ошибок 401 (неавторизован)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Попытка обновления access-токена через refresh-токен
            try {
                const response = await api.post('/accounts/token/refresh/', {
                    withCredentials: true, // Отправляем cookies вместе с запросом
                });

                const { access } = response.data;

                // Добавляем новый access-токен в заголовок
                originalRequest.headers['Authorization'] = `Bearer ${access}`;

                // Повторяем оригинальный запрос
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Refresh token expired or invalid', refreshError);
                store.dispatch({ type: 'auth/logout' });
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;