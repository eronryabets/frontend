
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Word } from '@/types';

interface TrainingState {
  words: Word[];
}

const initialState: TrainingState = {
  words: [],
};

export const trainingSlice = createSlice({
  name: 'training',
  initialState,
  reducers: {
    /**
     * Добавить массив слов в тренировку
     */
    addWordsToTraining(state, action: PayloadAction<Word[]>) {
      //склеить массивы, убирая дубли
      const newWords = action.payload;
      // Для исключения дублей по id
      const existingIds = new Set(state.words.map((w) => w.id));
      const merged = [...state.words];
      newWords.forEach((w) => {
        if (!existingIds.has(w.id)) {
          merged.push(w);
        }
      });
      state.words = merged;
    },

    /**
     * Удалить одно слово из списка
     */
    removeWordFromTraining(state, action: PayloadAction<string>) {
      const wordId = action.payload;
      state.words = state.words.filter((w) => w.id !== wordId);
    },

    /**
     * Очистить все слова
     */
    clearTrainingWords(state) {
      state.words = [];
    }
  },
});

export const {
  addWordsToTraining,
  removeWordFromTraining,
  clearTrainingWords
} = trainingSlice.actions;

export default trainingSlice.reducer;
