
import {AUTH_API_URL} from "../config/urls";
import axios from 'axios';
import store from "../redux/store";
import {logout} from "../redux/slices/authorizationSlice";

const api = axios.create({
    baseURL: AUTH_API_URL,
    withCredentials: true, // Включаем cookie в запросах
});

// Interceptor для перехвата ошибок 401 (неавторизован)
api.interceptors.response.use(
    (response) => {
        console.log("Response received:", response);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            console.log("401 error detected, attempting token refresh");

            originalRequest._retry = true;

            // Попытка обновления access-токена через refresh-токен
            try {
                console.log("Sending request to refresh token");

                const response = await axios.post(`${AUTH_API_URL}token/refresh/`, null, {
                    withCredentials: true, // Отправляем cookies вместе с запросом
                });

                console.log("Token refresh successful:", response.data);

                const {access_token} = response.data;

                // Добавляем новый access-токен в заголовок оригинального запроса
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

                console.log("Retrying original request with new token");

                // Повторяем оригинальный запрос с новым токеном
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Refresh token expired or invalid', refreshError);
                store.dispatch({type: 'auth/logout'});
                // Выполняем логаут через store.dispatch
                store.dispatch(logout())
                    .then((result) => {
                        if (logout.fulfilled.match(result)) {
                            console.log("Logout successful");
                        } else if (logout.rejected.match(result)) {
                            console.error("Logout failed:", result.error.message);
                        }
                    })
                    .catch((dispatchError) => {
                        console.error("Error dispatching logout:", dispatchError);
                    });
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;