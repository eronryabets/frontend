import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { removeWordFromTraining, clearTrainingWords } from '@/redux/slices/trainingSlice';

export const TrainingPage: React.FC = () => {
  const dispatch = useDispatch();
  const trainingWords = useSelector((state: RootState) => state.training.words);

  return (
    <div>
      <h2>Тренировка слов</h2>
      <button onClick={() => dispatch(clearTrainingWords())}>
        Очистить список тренировки
      </button>
      <ul>
        {trainingWords.map((word) => (
          <li key={word.id}>
            {word.word} - {word.translation}
            <button onClick={() => dispatch(removeWordFromTraining(word.id))}>
              Удалить
            </button>
          </li>
        ))}
      </ul>
      {/* ожно придумать любую логику с карточками, вопрос-ответ, и т. д. */}
    </div>
  );
};

export default TrainingPage;
