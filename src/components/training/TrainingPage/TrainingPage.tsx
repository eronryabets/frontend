import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  Collapse,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

import { clearTrainingWords, removeWordFromTraining } from '@/redux/slices/trainingSlice';
import { trainingSessions } from "@/utils/index.ts";
import { TrainingCardGrid } from "@/components/index.ts";
import { RootState } from '@/redux/store';

export const TrainingPage: React.FC = () => {
  const dispatch = useDispatch();
  // Получаем список слов, добавленных в тренировку
  const trainingWords = useSelector((state: RootState) => state.training.words);
  const wordsCount = trainingWords.length;

  // Локальное состояние для Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Локальное состояние для показа/скрытия списка слов
  const [isListOpen, setListOpen] = useState(false);

  const handleClearTraining = () => {
    const count = trainingWords.length;
    dispatch(clearTrainingWords());
    setSnackbarMessage(`Очистили ${count} слов(а) из тренировки`);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Тoggling кнопки
  const toggleWordList = () => {
    setListOpen((prev) => !prev);
  };

  // Удаление одного слова
  const handleRemoveWord = (wordId: string) => {
    dispatch(removeWordFromTraining(wordId));
  };

  return (
    <Container
      sx={{
        mt: 4,
        mb: 4,
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Тренировка слов: {wordsCount}
        </Typography>
        <Button variant="outlined" color="error" onClick={handleClearTraining}>
          Очистить список тренировки
        </Button>
      </Box>

      {/* Кнопка для открытия/закрытия списка слов */}
      <Box mb={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={toggleWordList}
        >
          {isListOpen ? 'Скрыть список слов' : 'Показать список слов'}
        </Button>
      </Box>

      {/* Свертывающийся список слов */}
      <Collapse in={isListOpen}>
        <Box
          sx={{
            mb: 3,
            p: 2,
            border: '1px solid #ccc',
            borderRadius: 2,
          }}
        >
          {trainingWords.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Нет слов в тренировке.
            </Typography>
          ) : (
            trainingWords.map((word) => (
              <Box
                key={word.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="body1">
                  {word.word} – {word.translation}
                </Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveWord(word.id)}
                  aria-label="Удалить слово"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            ))
          )}
        </Box>
      </Collapse>

      {/* Карточки тренировок (пример) */}
      <TrainingCardGrid sessions={trainingSessions} />

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TrainingPage;
