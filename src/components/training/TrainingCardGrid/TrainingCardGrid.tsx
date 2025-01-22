
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  useTheme,
} from '@mui/material';
import defaultCover from '@/assets/default_cover.png';
import {TrainingSession} from "@/utils/constants/trainingSessions.ts";


interface TrainingCardGridProps {
  sessions: TrainingSession[];
}

export const TrainingCardGrid: React.FC<TrainingCardGridProps> = ({ sessions }) => {
  const theme = useTheme();

  return (
    <Box
      display="grid"
      gap={4}
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
      }}
    >
      {sessions.map((session) => (
        <Link
          to={`/training/${session.id}`} // Здесь можно сделать переход на страницу тренировки
          key={session.id}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              transition: 'background-color 0.3s, box-shadow 0.3s',
              '&:hover': {
                boxShadow: '0px 4px 20px rgba(0, 0, 255, 0.2)',
                transform: 'scale(1.01)',
              },
              cursor: 'pointer',
              '&:focus': {
                outline: '2px solid rgba(0, 0, 255, 0.5)',
              },
              background: theme.customBackground?.paperGradient || 'inherit',
            }}
          >
            <CardActionArea
              sx={{
                display: 'flex',
                flexDirection: 'column',
                transition: 'background-color 0.3s, box-shadow 0.3s, transform 0.3s',
                '&:hover img': {
                  boxShadow: '0 0 20px rgba(0, 0, 255, 0.5)',
                  filter: 'brightness(1.1) contrast(1.1)',
                  animation: 'pulse 2.5s infinite',
                },
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
            >
              {/* Обложка тренировки */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CardMedia
                  component="img"
                  image={session.image || defaultCover}
                  alt={session.title}
                  sx={{
                    width: 120,
                    height: 160,
                    objectFit: 'cover',
                    borderRadius: '16px',
                    boxShadow: 3,
                    transition: 'transform 0.3s',
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    e.currentTarget.src = defaultCover as string;
                  }}
                />
              </Box>
              {/* Контент карточки */}
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography variant="h6" component="div" gutterBottom>
                  {session.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {session.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Слов в тренировке: {session.wordCount}
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Link>
      ))}
    </Box>
  );
};

 export default TrainingCardGrid;
