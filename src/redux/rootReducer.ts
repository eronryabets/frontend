import { combineReducers } from '@reduxjs/toolkit';

import registrationReducer from './slices/registrationSlice';
import authorizationReducer from './slices/authorizationSlice';
import userInfoReducer from './slices/userInfoSlice';
import themeReducer from './slices/themeSlice';
import uploadBookReducer from './slices/uploadBookSlice';
import genresReducer from './slices/genresSlice';
import booksReducer from './slices/bookSlice';
import pageReducer from './slices/pageSlice';
import translationReducer from './slices/translationSlice';
import dictionaryReducer from './slices/dictionarySlice';
import wordsReducer from './slices/wordsSlice';
import wordsProgressReducer from './slices/wordsProgressSlice';
import trainingSliceReducer from "./slices/trainingSlice.ts";


// Объединяем все редьюсеры в один appReducer
const appReducer = combineReducers({
  registration: registrationReducer,
  authorization: authorizationReducer,
  userInfo: userInfoReducer,
  theme: themeReducer,
  uploadBook: uploadBookReducer,
  genres: genresReducer,
  books: booksReducer,
  page: pageReducer,
  translation: translationReducer,
  dictionaries: dictionaryReducer,
  words: wordsReducer,
  wordsProgress: wordsProgressReducer,
  training: trainingSliceReducer,
});

// Определяем тип RootState
export type RootState = ReturnType<typeof appReducer>;

// Создаём корневой редюсер с логикой сброса состояния. (очищаем наш persist из local storage при логауте)
const rootReducer = (state: RootState | undefined, action: any): RootState => {
  if (action.type === 'authorization/logout/fulfilled') {
    // Возвращаем undefined, чтобы сбросить состояние до initial state
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
