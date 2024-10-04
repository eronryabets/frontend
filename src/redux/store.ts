import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

// Создаем store с использованием rootReducer
const store = configureStore({
  reducer: rootReducer,
});

// Экспортируем типы для использования в компонентах
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
