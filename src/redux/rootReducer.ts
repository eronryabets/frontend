import { combineReducers } from '@reduxjs/toolkit';
import registrationReducer from './slices/registrationSlice';
import authorizationReducer from './slices/authorizationSlice';
import userInfoReducer from './slices/userInfoSlice';
import themeReducer from './slices/themeSlice';
import uploadBookReducer from "./slices/uploadBookSlice";
import genresReducer from "./slices/genresSlice";
import booksReducer from "./slices/bookSlice";
import pageReducer from './slices/pageSlice';

// Объединяем все редьюсеры в один root reducer
const rootReducer = combineReducers({
  registration: registrationReducer,
  authorization: authorizationReducer,
  userInfo: userInfoReducer,
  theme: themeReducer,
  uploadBook: uploadBookReducer,
  genres: genresReducer,
  books: booksReducer,
  page: pageReducer,
});

export default rootReducer;