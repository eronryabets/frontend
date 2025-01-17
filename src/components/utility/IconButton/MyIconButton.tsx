import React from 'react';

import {Button, ButtonProps, Tooltip} from '@mui/material';
import {SxProps, Theme} from '@mui/system';

// Определяем интерфейс пропсов, наследуем от стандартных ButtonProps
interface MyIconButtonProps extends Omit<ButtonProps, 'color' | 'startIcon' | 'onClick'> {
    color?: 'primary' | 'secondary' | 'inherit' | 'success' | 'error' | 'info' | 'warning';
    startIcon: React.ReactNode;
    onClick: () => void;
    sx?: SxProps<Theme>; // Для дополнительных стилей, если необходимо
    tooltipTitle?: string;
}

export const MyIconButton: React.FC<MyIconButtonProps> = ({
       color = 'primary',
       startIcon,
       onClick,
       sx,
       tooltipTitle,
       ...rest
}) => {

    // Сначала готовим саму кнопку
  const buttonContent = (
    <Button
      color={color}
      startIcon={startIcon}
      onClick={onClick}
      sx={{
        borderRadius: 10,    // круглые углы
        width: 40,           // Фиксированная ширина
        height: 40,          // Фиксированная высота
        minWidth: 40,        // Минимальная ширина
        padding: 0,          // Убираем внутренние отступы
        mr: 2,               // Отступ справа
        '& .MuiButton-startIcon': {
          margin: 0,         // Убираем отступ между иконкой и текстом
        },
        ...sx,
      }}
      {...rest}
    >
      {/* Тут только иконка, текст не нужен */}
    </Button>
  );

  // Если tooltipTitle задан, рендерим <Tooltip>, иначе — саму кнопку
  if (tooltipTitle) {
    return (
      <Tooltip title={tooltipTitle} arrow>
        {buttonContent}
      </Tooltip>
    );
  }

  // Если tooltipTitle нет, возвращаем кнопку без тултипа
  return buttonContent;
};