import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { SxProps, Theme } from '@mui/system';

// Определяем интерфейс пропсов, наследуем от стандартных ButtonProps
interface MyIconButtonProps extends Omit<ButtonProps, 'color' | 'startIcon' | 'onClick'> {
  color?: 'primary' | 'secondary' | 'inherit' | 'success' | 'error' | 'info' | 'warning';
  startIcon: React.ReactNode;
  onClick: () => void;
  sx?: SxProps<Theme>; // Для дополнительных стилей, если необходимо
}

export const MyIconButton: React.FC<MyIconButtonProps> = ({
  color = 'primary',
  startIcon,
  onClick,
  sx,
  ...rest
}) => {
  return (
    <Button
      color={color}
      startIcon={startIcon}
      onClick={onClick}
      sx={{
        borderRadius: 10,        // круглые углы
        width: 40,               // Фиксированная ширина
        height: 40,              // Фиксированная высота
        minWidth: 40,            // Минимальная ширина
        padding: 0,              // Убираем внутренние отступы
        mr: 2,                   // Отступ справа (можно убрать или настроить по необходимости)
        '& .MuiButton-startIcon': {
          margin: '0',           // Убираем отступ между иконкой и текстом
        },
        ...sx,                   // Дополнительные стили из пропсов
      }}
      {...rest} // Передаем остальные пропсы, если необходимо
    >
      {/* Если нужно отображать только иконку, можно оставить пустым */}
      {/* Если нужен текст, можно добавить его здесь */}
    </Button>
  );
};
