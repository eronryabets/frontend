import { combineReducers } from '@reduxjs/toolkit';
import registrationReducer from './slices/registrationSlice';

// Объединяем все редьюсеры в один root reducer
const rootReducer = combineReducers({
  registration: registrationReducer,
  // Здесь можно добавить другие редьюсеры по мере необходимости
});

export default rootReducer;
