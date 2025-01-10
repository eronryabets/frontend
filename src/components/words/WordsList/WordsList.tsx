import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';

// Пакеты MUI
import {
  Box, Button, IconButton, TextField, Tooltip,
  Chip, Stack, Typography, Collapse, CircularProgress, Table,
  TableHead, TableRow, TableCell, TableBody, Snackbar, Alert, Pagination, Avatar
} from '@mui/material';

import {
  Close as CloseIcon,
  MapsUgc as MapsUgcIcon,
  Edit as EditIcon
} from '@mui/icons-material';

// DatePicker, Dayjs и адаптер:
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Остальные компоненты и Redux
import {
  fetchWords,
  setCurrentPage,
  setDictionaryId,
  setSearchTerm,
  setFilters
} from '@/redux/slices/wordsSlice.ts';
import { RootState, AppDispatch } from '@/redux/store.ts';

import {
  AddWordModal,
  EditWordModal,
  MyIconButton,
  SpeechButton
} from '@/components';
import defaultCover from '@/assets/default_word_image.jpg';

/** Хелпер для форматирования даты (обрезаем до "yyyy-mm-dd") */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
}

export const WordsList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Достаём данные из Redux
  const {
    words,
    loading,
    error,
    currentPage,
    totalPages,
    dictionaryId,
    search,
    filters
  } = useSelector((state: RootState) => state.words);

  // Локальное состояние для поля поиска
  const [searchInput, setSearchInput] = useState(search || '');

  //Состояние для показа/скрытия фильтров =====
  const [isFilterOpen, setFilterOpen] = useState<boolean>(false);

  //Состояния для тегов =====
  const [tagInput, setTagInput] = useState<string>('');
  const [tagNames, setTagNames] = useState<string[]>(filters.tags || []);

  const handleTagInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
  }, []);

  const handleTagKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        const newTag = tagInput.trim();
        if (newTag && !tagNames.includes(newTag)) {
          setTagNames([...tagNames, newTag]);
        }
        setTagInput('');
      }
    },
    [tagInput, tagNames]
  );

  const handleRemoveTag = useCallback((tag: string) => {
    setTagNames((prev) => prev.filter((t) => t !== tag));
  }, []);

  // ===== Прогресс и count max = 10, min = 0 =====
  const [progressMin, setProgressMin] = useState<string>(
    filters.progress_min?.toString() || ''
  );
  const [progressMax, setProgressMax] = useState<string>(
    filters.progress_max?.toString() || ''
  );

  const [countMin, setCountMin] = useState<string>(
    filters.count_min?.toString() || ''
  );
  const [countMax, setCountMax] = useState<string>(
    filters.count_max?.toString() || ''
  );

  // ===== Даты (DatePicker) =====
  const [createdAtAfter, setCreatedAtAfter] = useState<Dayjs | null>(
    filters.created_at_after ? dayjs(filters.created_at_after) : null
  );
  const [createdAtBefore, setCreatedAtBefore] = useState<Dayjs | null>(
    filters.created_at_before ? dayjs(filters.created_at_before) : null
  );

  // ===== Применение и сброс =====
  const handleApplyFilters = useCallback(() => {
    dispatch(
      setFilters({
        tags: tagNames,
        progress_min: progressMin ? Number(progressMin) : null,
        progress_max: progressMax ? Number(progressMax) : null,
        count_min: countMin ? Number(countMin) : null,
        count_max: countMax ? Number(countMax) : null,
        created_at_after: createdAtAfter ? createdAtAfter.format('YYYY-MM-DD') : null,
        created_at_before: createdAtBefore ? createdAtBefore.format('YYYY-MM-DD') : null
      })
    );
  }, [
    dispatch,
    tagNames,
    progressMin,
    progressMax,
    countMin,
    countMax,
    createdAtAfter,
    createdAtBefore
  ]);

  const handleResetFilters = useCallback(() => {
    setTagInput('');
    setTagNames([]);
    setProgressMin('');
    setProgressMax('');
    setCountMin('');
    setCountMax('');
    setCreatedAtAfter(null);
    setCreatedAtBefore(null);

    dispatch(
      setFilters({
        tags: [],
        progress_min: null,
        progress_max: null,
        count_min: null,
        count_max: null,
        created_at_after: null,
        created_at_before: null
      })
    );
  }, [dispatch]);

  // ===== Модалки и Snackbar =====
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editWordData, setEditWordData] = useState<null | {
    id: string;
    word: string;
    translation: string;
    tags: { id: string; name: string }[];
    image_path: string | null;
    progress: number;
  }>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // ===== useEffect для подгрузки слов =====
  // useEffect(() => {
  //   if (id) {
  //     if (dictionaryId !== id) {
  //       dispatch(setDictionaryId(id));
  //     }
  //     const page = parseInt(searchParams.get('page') || '1', 10);
  //     dispatch(setCurrentPage(page));
  //     const searchTerm = searchParams.get('search') || '';
  //     dispatch(setSearchTerm(searchTerm));
  //     setSearchInput(searchTerm);
  //   }
  // }, [dispatch, id, searchParams, dictionaryId]);

  // 1. Эффект для установки dictionaryId только при смене id
  useEffect(() => {
    if (id && dictionaryId !== id) {
      dispatch(setDictionaryId(id));
    }
  // убираем всю логику с currentPage и search отсюда
  }, [id, dictionaryId, dispatch]);

// 2. Эффект для установки текущей страницы и поиска из URL
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    dispatch(setCurrentPage(page));

    const searchTerm = searchParams.get('search') || '';
    dispatch(setSearchTerm(searchTerm));
    setSearchInput(searchTerm);

  // убираем dictionaryId из зависимостей, чтобы не триггерить повторно
  }, [dispatch, searchParams]);


  useEffect(() => {
    if (id && dictionaryId) {
      dispatch(
        fetchWords({
          dictionaryId: id,
          page: currentPage,
          search,
          filters
        })
      );
      const params: any = { page: currentPage.toString() };
      if (search) {
        params.search = search;
      }
      setSearchParams(params);
    }
  }, [dispatch, id, dictionaryId, currentPage, search, filters, setSearchParams]);

  // ===== Пагинация =====
  const handlePageChange = useCallback(
    (_event: React.ChangeEvent<unknown>, value: number) => {
      dispatch(setCurrentPage(value));
    },
    [dispatch]
  );

  // ===== Модалки (Add/Edit) =====
  const handleOpenAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handleOpenEditModal = useCallback((word: any) => {
    setEditWordData({
      id: word.id,
      word: word.word,
      translation: word.translation,
      tags: word.tags,
      image_path: word.image_path,
      progress: word.progress
    });
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditWordData(null);
  }, []);

  const currentDictionary = useSelector((state: RootState) =>
    state.dictionaries.dictionaries.find((dict) => dict.id === dictionaryId)
  );
  const language = currentDictionary?.language || 'en-US';

  const handleDeleteSuccess = useCallback(() => {
    handleCloseEditModal();
    setSnackbarMessage('Слово успешно удалено.');
    setSnackbarOpen(true);
  }, [handleCloseEditModal]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  // ===== Обработка поиска =====
  const handleSearchInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(event.target.value);
    },
    []
  );

  const handleSearch = useCallback(() => {
    dispatch(setSearchTerm(searchInput.trim()));
  }, [dispatch, searchInput]);

  const handleSearchKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleResetSearch = useCallback(() => {
    setSearchInput('');
    dispatch(setSearchTerm(''));
  }, [dispatch]);

  // ===== Валидация для Count min и Count max =====
  const countMinNum = Number(countMin);
  const countMaxNum = Number(countMax);

  const isCountMinValid =
    countMin === '' ||
    (countMinNum >= 0 &&
      (countMax === '' || countMinNum <= countMaxNum));

  const isCountMaxValid =
    countMax === '' ||
    (countMaxNum >= 0 &&
      (countMin === '' || countMaxNum >= countMinNum));

  const countMinError =
    countMin !== '' &&
    (countMinNum < 0 || (countMax !== '' && countMinNum > countMaxNum));

  const countMaxError =
    countMax !== '' &&
    (countMaxNum < 0 || (countMin !== '' && countMaxNum < countMinNum));

  // ===== [NEW] Валидация для Progress min и Progress max =====
  const progressMinNum = Number(progressMin);
  const progressMaxNum = Number(progressMax);

  // Минимальный прогресс не меньше 0, не больше 10, и не должен превышать progressMax
  const isProgressMinValid =
    progressMin === '' ||
    (progressMinNum >= 0 &&
      progressMinNum <= 10 &&
      (progressMax === '' || progressMinNum <= progressMaxNum));

  // Максимальный прогресс не меньше 0, не больше 10, и не должен быть меньше progressMin
  const isProgressMaxValid =
    progressMax === '' ||
    (progressMaxNum >= 0 &&
      progressMaxNum <= 10 &&
      (progressMin === '' || progressMaxNum >= progressMinNum));

  // Определим, есть ли ошибка
  const progressMinError =
    progressMin !== '' &&
    (
      progressMinNum < 0 ||
      progressMinNum > 10 ||
      (progressMax !== '' && progressMinNum > progressMaxNum)
    );

  const progressMaxError =
    progressMax !== '' &&
    (
      progressMaxNum < 0 ||
      progressMaxNum > 10 ||
      (progressMin !== '' && progressMaxNum < progressMinNum)
    );

  // ===== Проверка, что пользователь вообще задал какие-то фильтры
  const hasAnyFilter =
    tagNames.length > 0 ||
    progressMin !== '' ||
    progressMax !== '' ||
    countMin !== '' ||
    countMax !== '' ||
    createdAtAfter !== null ||
    createdAtBefore !== null;

  // Общая логика: кнопка «Применить фильтры» неактивна, если
  // 1) ни один фильтр не выбран
  // 2) есть ошибки в count или progress
  const isApplyFiltersDisabled = !hasAnyFilter ||
    !isCountMinValid ||
    !isCountMaxValid ||
    !isProgressMinValid ||
    !isProgressMaxValid;

  // ===== Отрисовка =====
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress/>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" mt={4}>
        {error}
      </Typography>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Слова в словаре
      </Typography>

      {/* --- Блок с кнопками: Добавить слово, Поиск, Фильтр --- */}
      <Box
        sx={{
          pl: 2,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        {/* Добавить слово */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<MapsUgcIcon/>}
          onClick={handleOpenAddModal}
        >
          Добавить слово
        </Button>

        {/* Поле поиска */}
        <TextField
          label="Поиск слов"
          variant="outlined"
          size="small"
          value={searchInput}
          onChange={handleSearchInputChange}
          onKeyPress={handleSearchKeyPress}
          sx={{ width: '300px' }}
          InputProps={{
            endAdornment: search && (
              <Tooltip title="Очистить поиск" arrow>
                <IconButton
                  onClick={handleResetSearch}
                  size="small"
                  sx={{ ml: 1 }}
                  aria-label="Очистить поиск"
                >
                  <CloseIcon fontSize="small"/>
                </IconButton>
              </Tooltip>
            )
          }}
        />
        {/* Кнопка Поиск */}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24}/> : 'Поиск'}
        </Button>

        {/* Кнопка показать/скрыть фильтр */}
        <Button
          variant="contained"
          color={isFilterOpen ? 'warning' : 'info'}
          onClick={() => setFilterOpen(!isFilterOpen)}
        >
          {isFilterOpen ? 'Свернуть фильтр' : 'Показать фильтр'}
        </Button>
      </Box>

      {/* --- Блок ФИЛЬТРОВ (свертываемый) --- */}
      <Collapse in={isFilterOpen}>
        <Box
          sx={{
            border: '1px solid #ccc',
            borderRadius: 2,
            p: 2,
            mt: 1,
            mb: 2
          }}
        >
          <Typography variant="h6" gutterBottom>
            Фильтры
          </Typography>

          {/* Теги */}
          <TextField
            fullWidth
            label="Теги (введите через запятую/Enter)"
            name="tags"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagKeyDown}
            variant="outlined"
            sx={{ mb: 2 }}
            placeholder="Введите тег и нажмите Enter или запятую"
          />
          {tagNames.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              {tagNames.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  variant="outlined"
                />
              ))}
            </Stack>
          )}

          {/* Progress От и До */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              type="number"
              label="Progress min"
              value={progressMin}
              onChange={(e) => setProgressMin(e.target.value)}
              sx={{ width: 150 }}
              inputProps={{ min: 0, max: 10 }} // [NEW] ограничиваем ввод
              error={progressMinError}
              helperText={
                progressMinError
                  ? progressMinNum < 0
                    ? 'Значение не может быть меньше 0'
                    : progressMinNum > 10
                      ? 'Значение не может быть больше 10'
                      : 'Минимальное значение не может превышать максимальноe'
                  : ''
              }
            />
            <TextField
              type="number"
              label="Progress max"
              value={progressMax}
              onChange={(e) => setProgressMax(e.target.value)}
              sx={{ width: 150 }}
              inputProps={{ min: 0, max: 10 }} // [NEW] ограничиваем ввод
              error={progressMaxError}
              helperText={
                progressMaxError
                  ? progressMaxNum < 0
                    ? 'Значение не может быть меньше 0'
                    : progressMaxNum > 10
                      ? 'Значение не может быть больше 10'
                      : 'Максимальное значение не может быть меньше минимального'
                  : ''
              }
            />
          </Box>

          {/* Count От и До */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              type="number"
              label="Count min"
              value={countMin}
              onChange={(e) => setCountMin(e.target.value)}
              sx={{ width: 150 }}
              inputProps={{ min: 0 }}
              error={countMinError}
              helperText={
                countMinError
                  ? countMinNum < 0
                    ? 'Минимальное значение не может быть меньше 0'
                    : 'Минимальное значение не может превышать максимальное'
                  : ''
              }
            />
            <TextField
              type="number"
              label="Count max"
              value={countMax}
              onChange={(e) => setCountMax(e.target.value)}
              sx={{ width: 150 }}
              inputProps={{ min: 0 }}
              error={countMaxError}
              helperText={
                countMaxError
                  ? countMaxNum < 0
                    ? 'Максимальное значение не может быть меньше 0'
                    : 'Максимальное значение не может быть меньше минимального'
                  : ''
              }
            />
          </Box>

          {/* Даты (DatePicker) */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <DatePicker
                label="Дата от"
                value={createdAtAfter}
                format="YYYY-MM-DD"
                onChange={(newValue) => setCreatedAtAfter(newValue)}
              />
              <DatePicker
                label="Дата до"
                value={createdAtBefore}
                format="YYYY-MM-DD"
                onChange={(newValue) => setCreatedAtBefore(newValue)}
              />
            </Box>
          </LocalizationProvider>

          {/* Кнопки "Применить" / "Сбросить" */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyFilters}
              //  выключаем кнопку, если нет фильтров или есть ошибки
              disabled={isApplyFiltersDisabled}
            >
              Применить фильтры
            </Button>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
            >
              Сбросить фильтры
            </Button>
          </Box>
        </Box>
      </Collapse>

      {/* --- Таблица слов --- */}
      {words && words.length > 0 ? (
        <Box mt={2}>
          <Table sx={{ minWidth: 650 }} aria-label="words table">
            <TableHead>
              <TableRow>
                <TableCell><strong></strong></TableCell>
                <TableCell><strong>Termin</strong></TableCell>
                <TableCell><strong>Translate</strong></TableCell>
                <TableCell><strong>Count</strong></TableCell>
                <TableCell><strong>Progress</strong></TableCell>
                <TableCell><strong>Теги</strong></TableCell>
                <TableCell><strong>Added</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {words.map((word) => (
                <TableRow
                  key={word.id}
                  sx={{
                    transition: 'background-color 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 255, 0.05)',
                      boxShadow: '0px 4px 20px rgba(0, 0, 255, 0.1)'
                    },
                    '&:hover img': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 20px rgba(0, 0, 255, 0.5)',
                      filter: 'brightness(1.1) contrast(1.1)'
                    }
                  }}
                >
                  <TableCell>
                    <Avatar
                      src={word.image_path ? word.image_path : defaultCover}
                      alt={word.word}
                      sx={{ width: 60, height: 60, borderRadius: 4 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <SpeechButton text={word.word} lang={language} />
                      <Typography
                        variant="subtitle1"
                        sx={{
                          maxWidth: '50ch',
                          whiteSpace: 'normal',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {word.word}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <MyIconButton
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEditModal(word)}
                      />
                      <Typography
                        variant="subtitle1"
                        sx={{
                          maxWidth: '50ch',
                          whiteSpace: 'normal',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {word.translation}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{word.count}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{word.progress}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {word.tags.length > 0
                        ? word.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag.id}
                              label={tag.name}
                              variant="outlined"
                              color="primary"
                              size="small"
                            />
                          ))
                        : '—'}
                      {word.tags.length > 3 && (
                        <Chip
                          label={`+${word.tags.length - 3}`}
                          variant="outlined"
                          color="primary"
                          size="small"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(word.created_at)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : (
        <Typography variant="h6" align="center" mt={4}>
          {search ? 'Нет слов, соответствующих поиску.' : 'В этом словаре пока нет слов.'}
        </Typography>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Модалки */}
      {id && (
        <AddWordModal
          open={isAddModalOpen}
          onClose={handleCloseAddModal}
          dictionaryId={id}
        />
      )}
      {id && editWordData && (
        <EditWordModal
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          onDeleteSuccess={handleDeleteSuccess}
          dictionaryId={id}
          wordData={editWordData}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WordsList;
