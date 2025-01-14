import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Локальное хранилище браузера

import rootReducer from './rootReducer';


// Конфигурация для Redux Persist
const persistConfig: { storage: any; whitelist: string[]; key: string } = {
    key: 'root', // ключ для хранения
    storage, // используем storage из redux-persist
    whitelist: [
        'authorization',
        'userInfo',
        'theme',
        'books',
        'dictionaries',
        'wordsProgress'
    ], // массив редюсеров, которые нужно сохранять (например, авторизация), а blacklist для исключения
};


// Создаем персистентный редюсер
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Создаем store с использованием rootReducer
export const store = configureStore({
    reducer: persistedReducer,
    // добавляем thunk, он нужен для асинхронных действий
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }), //если нужно добавить middleware самописный - .contact(logger),
});

// Создаем persistor для использования в приложении
export const persistor = persistStore(store);

// Экспортируем типы для использования в компонентах
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

// export const useAppDispatch = () => useDispatch<AppDispatch>();
