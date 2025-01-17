import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface ThemeState {
  mode: 'light' | 'dark';
}

// Получаем сохранённое значение из localStorage
const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;

const initialState: ThemeState = {
  mode: savedMode || 'light',  // если в localStorage нет значения, используем 'light'
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      // Переключаем тему
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      state.mode = newMode;
      // Сохраняем новое значение в localStorage
      localStorage.setItem('themeMode', newMode);
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.mode = action.payload;
      localStorage.setItem('themeMode', action.payload);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

export default themeSlice.reducer;