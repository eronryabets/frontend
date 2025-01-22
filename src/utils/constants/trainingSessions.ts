
export interface TrainingSession {
  id: string;
  title: string;
  description: string;
  image: string;
  wordCount: number;
}

//TODO - сделать динамическое кол-во слов в wordCount - в зависимости от того, сколько слов осталось.
export const trainingSessions: TrainingSession[] = [
  {
    id: '1',
    title: 'Word - Translate',
    description: 'Перевод тренировки 1',
    image: 'src/assets/logo.jpg',
    wordCount: 13,
  },
  {
    id: '2',
    title: 'Translate - Word',
    description: 'Перевод тренировки 2',
    image: 'src/assets/logo.jpg',
    wordCount: 20,
  },
    {
    id: '3',
    title: 'True / False - Word - Translate',
    description: 'Перевод тренировки 2',
    image: 'src/assets/logo.jpg',
    wordCount: 20,
  },
    {
    id: '4',
    title: 'True / False - Translate2 - Word',
    description: 'Перевод тренировки 2',
    image: 'src/assets/logo.jpg',
    wordCount: 20,
  },
    {
    id: '5',
    title: 'Blitz - Word - Translate',
    description: 'Перевод тренировки 2',
    image: 'src/assets/logo.jpg',
    wordCount: 20,
  },
    {
    id: '6',
    title: 'Blitz - Translate - Word',
    description: 'Перевод тренировки 2',
    image: 'src/assets/logo.jpg',
    wordCount: 20,
  },

];
