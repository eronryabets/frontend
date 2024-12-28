
import React from 'react';
import { Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface ProgressBarProps {
    progressAmount: number; // Количество звезд
    value: number;          // Значение прогресса от 0 до progressAmount
    size?: 'small' | 'medium' | 'large' | 'inherit'; // Размер иконки
    spacing?: number;      // Отступ между иконками в пикселях
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    progressAmount,
    value,
    size = 'medium',
    spacing = 4,
}) => {
    // Ограничиваем значение между 0 и progressAmount
    const clampedValue = Math.max(0, Math.min(progressAmount, value));

    // Функция для определения цвета на основе значения прогресса
    const getFillColor = (currentValue: number): string => {
        if (currentValue <= 3) {
            return 'lightcoral';
        } else if (currentValue <= 7) {
            return 'orange';
        } else {
            return 'lightgreen';
        }
    };

    const fillColor = getFillColor(clampedValue);

    return (
        <Box display="flex" alignItems="center">
            {[...Array(progressAmount)].map((_, index) => (
                <Box
                    key={index}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: index < progressAmount - 1 ? spacing / 2 : 0,
                        marginLeft: index > 0 ? spacing / 2 : 0,
                        transition: 'color 0.3s, transform 0.3s',
                        // Удаляем условное масштабирование, чтобы иконки всегда были видимы
                        transform: 'scale(1)',
                    }}
                >
                    {index < clampedValue ? (
                        <StarIcon fontSize={size} sx={{ color: fillColor }} />
                    ) : (
                        <StarBorderIcon fontSize={size} sx={{ color: 'grey.300' }} />
                    )}
                </Box>
            ))}
        </Box>
    );
};

export default ProgressBar;
