/**
 * цвет и заливка звездочек прогресса изучаеморого слова на основе уровня прогресса.
 * Уровень прогресса (0-10).
 */

import React from 'react';

import { Box } from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';

import progressColors from '@/utils/constants/progressColors.ts';



interface ProgressBarProps {
    progressAmount: number; // Количество звезд
    value: number;          // Значение прогресса от 0 до progressAmount
    size?: 'small' | 'medium' | 'large' | 'inherit'; // Размер иконки
    spacing?: number;      // Отступ между иконками в пикселях
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progressAmount,
    value,
    size = 'medium',
    spacing = 4,
}) => {
    // Ограничиваем значение между 0 и progressAmount
    const clampedValue = Math.max(0, Math.min(progressAmount, value));

    // Получаем цвет для текущего уровня прогресса
    const fillColor = progressColors[clampedValue] || 'grey.300';

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
                        transform: 'scale(1)', // Иконки всегда видимы
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
