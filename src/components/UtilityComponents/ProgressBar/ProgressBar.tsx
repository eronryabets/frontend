// ProgressBar.tsx
import React from 'react';
import { Box } from '@mui/material';

interface ProgressBar10Props {
    progressAmount: number; //ячейки шкалы
    value: number; // Значение прогресса от 0 до 10
}

const ProgressBar: React.FC<ProgressBar10Props> = ({progressAmount, value }) => {
    // Ограничиваем значение между 0 и 10
    const clampedValue = Math.max(0, Math.min(progressAmount, value));

    return (
        <Box display="flex" alignItems="center">
            {[...Array(progressAmount)].map((_, index) => (
                <Box
                    key={index}
                    sx={{
                        width: 20, // Ширина каждого пункта
                        height: 10, // Высота каждого пункта
                        borderRadius: 2,
                        backgroundColor: index < clampedValue ? 'primary.main' : 'grey.300',
                        marginRight: 0.5, // Отступ справа между пунктами
                        transition: 'background-color 0.3s',
                    }}
                />
            ))}
        </Box>
    );
};

export default ProgressBar;
