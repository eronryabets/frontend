import React from 'react';

import {Button, ButtonProps, Tooltip} from '@mui/material';
import {SxProps, Theme} from '@mui/system';

// Определяем интерфейс пропсов, наследуем от стандартных ButtonProps
interface MyIconButtonProps
  extends Omit<ButtonProps, 'color' | 'startIcon' | 'onClick'> {
  color?: 'primary' | 'secondary' | 'inherit' | 'success' | 'error' | 'info' | 'warning';
  startIcon?: React.ReactNode;
  onClick: () => void;
  sx?: SxProps<Theme>;
  tooltipTitle?: string;    // Опциональный текст для тултипа
  bgColor?: string;         // Опциональный цвет фона кнопки
  hoverBgColor?: string;    // Опциональный цвет фона при ховере
}

export const MyIconButton: React.FC<MyIconButtonProps> = ({
  color = 'primary',
  startIcon,
  onClick,
  sx,
  tooltipTitle,
  bgColor,
  hoverBgColor,
  ...rest
}) => {
  // Формируем кнопку
  const buttonContent = (
    <Button
      color={color}
      startIcon={startIcon}
      onClick={onClick}
      sx={{
        borderRadius: 10,    // круглые углы
        width: 40,           // фиксированная ширина
        height: 40,          // фиксированная высота
        minWidth: 40,
        padding: 0,
        mr: 2,
        '& .MuiButton-startIcon': {
          margin: 0,         // убираем отступ между иконкой и текстом
        },
        // Ниже используем опциональные bgColor и hoverBgColor, если заданы
        ...(bgColor && {
          backgroundColor: bgColor,
          // Если не укажем own color, MUI может сам подмешать primary
          // поэтому можно указать variant="contained" где-то или просто переопределить:
          '&:hover': {
            backgroundColor: hoverBgColor || bgColor, // если hoverBgColor нет, берём bgColor
          },
        }),
        ...sx, // Подмешиваем остальные стили, если переданы
      }}
      {...rest}
    >
      {/* Никакого текста, только иконка */}
    </Button>
  );

  // Если tooltipTitle передан, оборачиваем в <Tooltip>, иначе возвращаем кнопку
  if (tooltipTitle) {
    return (
      <Tooltip title={tooltipTitle} arrow>
        {buttonContent}
      </Tooltip>
    );
  }

  return buttonContent;
};