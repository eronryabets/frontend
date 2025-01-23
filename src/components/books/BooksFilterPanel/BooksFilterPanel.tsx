
import React from 'react';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterListOutlined as FilterListOutlinedIcon,
  FilterListOffOutlined as FilterListOffOutlinedIcon,
  ExpandLessOutlined as ExpandLessOutlinedIcon,
  ExpandMoreOutlined as ExpandMoreOutlinedIcon,
  Search as SearchIcon,
  MenuBook as MenuBook,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

/**
 * Интерфейс пропсов:
 *  - searchValue, onSearchChange: для строки поиска
 *  - hasFilter, onToggleFilter, onResetFilter: для управления фильтром
 *  - sortingValue, onSortingChange: для сортировки
 *  - ...
 * В вашем случае пока всё заглушки
 */
interface BooksFilterPanelProps {
  searchValue?: string;
  onSearchChange?: (newValue: string) => void;
  hasFilter?: boolean;
  onToggleFilter?: () => void;
  onResetFilter?: () => void;
  sortingValue?: string;
  onSortingChange?: (newValue: string) => void;
}

//TODO - пока что это просто макет, после реализации общей библиотеки - реализовать.
export const BooksFilterPanel: React.FC<BooksFilterPanelProps> = ({
  searchValue = 'test mock',
  onSearchChange,
  hasFilter = false,
  onToggleFilter,
  onResetFilter,
  sortingValue = '',
  onSortingChange,
}) => {
  return (
    <Box
      sx={{
        pl: 2,
        pb: 2,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      {/* Кнопка "Добавить книгу" */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<MenuBook />}
        component={Link}
        to="/bookUpload"
      >
        Добавить книгу
      </Button>

      {/* Поле поиска */}
      <TextField
        label="Поиск слов"
        variant="outlined"
        size="small"
        value={searchValue}
        onChange={(e) => onSearchChange?.(e.target.value)}
        // onKeyPress={(...) => ...}
        sx={{
          width: '300px',
          borderRadius: 1,
        }}
        InputProps={{
          // Если введён текст, показываем кнопку очистки слева (условно)
          startAdornment: searchValue && (
            <InputAdornment position="start">
              <Tooltip title="Очистить поиск" arrow>
                <IconButton
                  onClick={() => onSearchChange?.('')}
                  size="small"
                  sx={{ mr: 1 }}
                  color="secondary"
                  aria-label="Очистить поиск"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
          // Иконка поиска справа
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon
                color="primary"
                onClick={() => console.log('Поиск по: ', searchValue)}
                sx={{ cursor: 'pointer' }}
              />
            </InputAdornment>
          ),
        }}
      />

      {/* Кнопка "Показать/Скрыть фильтр" */}
      <Button
        variant="contained"
        color={hasFilter ? 'warning' : 'info'}
        onClick={onToggleFilter}
        startIcon={hasFilter ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
      >
        {hasFilter ? 'Свернуть фильтр' : 'Показать фильтр'}
      </Button>

      {/* Иконка-индикатор фильтра */}
      <Tooltip title={hasFilter ? 'Фильтр применён. Сбросить?' : 'Фильтр не активен'} arrow>
        <IconButton
          onClick={() => {
            if (hasFilter) {
              onResetFilter?.();
            }
          }}
        >
          {hasFilter ? (
            <FilterListOutlinedIcon sx={{ color: 'green' }} />
          ) : (
            <FilterListOffOutlinedIcon />
          )}
        </IconButton>
      </Tooltip>

      {/* Select для сортировки */}
      <FormControl
        size="small"
        sx={{
          minWidth: 200,
          borderRadius: 1,
        }}
      >
        <InputLabel id="sorting-label">Сортировка</InputLabel>
        <Select
          labelId="sorting-label"
          label="Сортировка"
          value={sortingValue}
          onChange={(e) => onSortingChange?.(e.target.value as string)}
        >
          <MenuItem value="">Без сортировки</MenuItem>
          <MenuItem value="title_asc">Название (A-Z)</MenuItem>
          <MenuItem value="title_desc">Название (Z-A)</MenuItem>
          <MenuItem value="created_at_desc">Сначала новые</MenuItem>
          <MenuItem value="created_at_asc">Сначала старые</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default BooksFilterPanel;
