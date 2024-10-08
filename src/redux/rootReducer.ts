import { combineReducers } from '@reduxjs/toolkit';
import registrationReducer from './slices/registrationSlice';
import authorizationReducer from './slices/authorizationSlice';
import userInfoReducer from './slices/userInfoSlice';
import themeReducer from './slices/themeSlice';

// Объединяем все редьюсеры в один root reducer
const rootReducer = combineReducers({
  registration: registrationReducer,
  authorization: authorizationReducer,
  userInfo: userInfoReducer,
  theme: themeReducer,
  // Здесь можно добавить другие редьюсеры по мере необходимости
});

export default rootReducer;