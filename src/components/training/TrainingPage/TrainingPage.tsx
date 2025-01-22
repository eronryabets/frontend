
import React from 'react';
import { useDispatch } from 'react-redux';
import { Container, Box, Button, Typography } from '@mui/material';

import { clearTrainingWords } from '@/redux/slices/trainingSlice';
import {trainingSessions} from "@/utils/index.ts";
import {TrainingCardGrid} from "@/components/index.ts";


export const TrainingPage: React.FC = () => {
  const dispatch = useDispatch();

  // Здесь можно работать как с локальным состоянием (например, вручную созданным массивом)
  // или с состоянием из Redux (если пользователь добавляет свои слова на тренировку).
  // В данном случае используем заранее созданный массив.
  // const sessions = trainingSessions;

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
        <Typography variant="h4">Тренировка слов</Typography>
        <Button variant="outlined" color="error" onClick={() => dispatch(clearTrainingWords())}>
          Очистить список тренировки
        </Button>
      </Box>

      <TrainingCardGrid sessions={trainingSessions} />
    </Container>
  );
};

export default TrainingPage;
