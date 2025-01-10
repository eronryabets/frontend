import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';

import { RootState, AppDispatch } from '@/redux/store.ts';
import {
    fetchWords,
    setCurrentPage,
    setDictionaryId,
    setSearchTerm,
    setFilters,
} from '@/redux/slices/wordsSlice.ts';

import {
    Pagination,
    CircularProgress,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Box,
    Avatar,
    Button,
    Chip,
    Snackbar,
    Alert,
    TextField,
    Tooltip,
    IconButton,
    Stack,
} from '@mui/material';

import {
    Close as CloseIcon,
    MapsUgc as MapsUgcIcon,
    Edit as EditIcon,
} from '@mui/icons-material';

import {
    AddWordModal,
    EditWordModal,
    MyIconButton,
    SpeechButton
} from '@/components';
import defaultCover from '@/assets/default_word_image.jpg';

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    return dateStr.substring(0, 10); // или любая другая логика форматирования
}

/**
 * Компонент отображения списка слов в словаре с поиском и фильтрами.
 */
export const WordsList: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Получение ID словаря из URL
    const dispatch = useDispatch<AppDispatch>();

    const {
        words,
        loading,
        error,
        currentPage,
        totalPages,
        dictionaryId,
        search,
        filters, // <-- обратите внимание, что в стейте уже есть filters
    } = useSelector((state: RootState) => state.words);

    const [searchParams, setSearchParams] = useSearchParams();

    // Локальное состояние для ввода поиска
    const [searchInput, setSearchInput] = useState(search || '');

    // ------------------------------------------------
    // 1. Локальные состояния для фильтра тегов (множественный ввод)
    // ------------------------------------------------
    const [tagInput, setTagInput] = useState<string>('');
    const [tagNames, setTagNames] = useState<string[]>(filters.tags || []);

    // Обработчик изменения поля ввода тегов (для "ручного" ввода)
    const handleTagInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setTagInput(event.target.value);
    }, []);

    // Обработчик нажатия Enter или запятой для добавления нового тега в список
    const handleTagKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        // Например, Enter или запятая
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tagNames.includes(newTag)) {
                setTagNames([...tagNames, newTag]);
            }
            setTagInput('');
        }
    }, [tagInput, tagNames]);

    // Удаление тега
    const handleRemoveTag = useCallback((tag: string) => {
        setTagNames((prev) => prev.filter((t) => t !== tag));
    }, []);

    // ------------------------------------------------
    // 2. Локальные состояния для фильтров по прогрессу, count, дате
    // ------------------------------------------------
    const [progressMin, setProgressMin] = useState<string>(filters.progress_min?.toString() || '');
    const [progressMax, setProgressMax] = useState<string>(filters.progress_max?.toString() || '');

    const [countMin, setCountMin] = useState<string>(filters.count_min?.toString() || '');
    const [countMax, setCountMax] = useState<string>(filters.count_max?.toString() || '');

    // Для дат можно использовать DatePicker из MUI или просто текстовые поля в формате YYYY-MM-DD
    const [createdAtAfter, setCreatedAtAfter] = useState<string>(filters.created_at_after || '');
    const [createdAtBefore, setCreatedAtBefore] = useState<string>(filters.created_at_before || '');

    // ------------------------------------------------
    // Обработчик "Применить фильтры"
    // ------------------------------------------------
    const handleApplyFilters = useCallback(() => {
        dispatch(
            setFilters({
                tags: tagNames,
                progress_min: progressMin ? Number(progressMin) : null,
                progress_max: progressMax ? Number(progressMax) : null,
                count_min: countMin ? Number(countMin) : null,
                count_max: countMax ? Number(countMax) : null,
                created_at_after: createdAtAfter || null,
                created_at_before: createdAtBefore || null,
            })
        );
        // При желании здесь же можно сбросить текущую страницу на 1,
        // но это уже по вашему желанию (или внутри редьюсера).
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

    // ------------------------------------------------
    // Обработчик "Сбросить фильтры"
    // ------------------------------------------------
    const handleResetFilters = useCallback(() => {
        setTagInput('');
        setTagNames([]);
        setProgressMin('');
        setProgressMax('');
        setCountMin('');
        setCountMax('');
        setCreatedAtAfter('');
        setCreatedAtBefore('');
        // Сбрасываем в Redux:
        dispatch(
            setFilters({
                tags: [],
                progress_min: null,
                progress_max: null,
                count_min: null,
                count_max: null,
                created_at_after: null,
                created_at_before: null,
            })
        );
    }, [dispatch]);

    // ------------------------------------------------
    // Состояния модальных окон
    // ------------------------------------------------
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

    // Состояния для Snackbar уведомлений
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Эффект для установки ID словаря и текущей страницы при изменении URL
    useEffect(() => {
        if (id) {
            if (dictionaryId !== id) {
                dispatch(setDictionaryId(id));
            }
            const page = parseInt(searchParams.get('page') || '1', 10);
            dispatch(setCurrentPage(page));
            const searchTerm = searchParams.get('search') || '';
            dispatch(setSearchTerm(searchTerm));
            setSearchInput(searchTerm);
        }
    }, [dispatch, id, searchParams, dictionaryId]);

    // Эффект для загрузки слов при изменении ID словаря, страницы, поиска или filters
    useEffect(() => {
        if (id && dictionaryId) {
            dispatch(
                fetchWords({
                    dictionaryId: id,
                    page: currentPage,
                    search,
                    filters, // <-- обязательно передаём filters
                })
            );
            // Обновление параметров URL (примерно как раньше)
            const params: any = { page: currentPage.toString() };
            if (search) {
                params.search = search;
            }
            setSearchParams(params);
        }
    }, [dispatch, id, dictionaryId, currentPage, search, filters, setSearchParams]);

    /**
     * Обработчик смены страницы пагинации.
     */
    const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, value: number) => {
        dispatch(setCurrentPage(value));
    }, [dispatch]);

    // ---- работа с модалками далее ----
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
            progress: word.progress,
        });
        setIsEditModalOpen(true);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setIsEditModalOpen(false);
        setEditWordData(null);
    }, []);

    // Получение текущего языка словаря из состояния Redux
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

    const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    }, []);

    const handleSearch = useCallback(() => {
        dispatch(setSearchTerm(searchInput.trim()));
    }, [dispatch, searchInput]);

    const handleSearchKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    const handleResetSearch = useCallback(() => {
        setSearchInput('');
        dispatch(setSearchTerm(''));
    }, [dispatch]);

    // Отображение индикатора загрузки
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress/>
            </Box>
        );
    }
    // Отображение ошибки
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

            {/* -----------------------------
                Блок с кнопкой "Добавить слово" и поиском
            ----------------------------- */}
            <Box
                sx={{ pl: 2, pb: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<MapsUgcIcon/>}
                    sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
                    onClick={handleOpenAddModal}
                >
                    Добавить слово
                </Button>

                <TextField
                    label="Поиск слов"
                    variant="outlined"
                    size="small"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onKeyPress={handleSearchKeyPress}
                    sx={{ mr: 2, width: '300px', mb: { xs: 2, sm: 0 } }}
                    InputProps={{
                        endAdornment: search && (
                            <Tooltip title="Очистить поиск" arrow>
                                <IconButton
                                    onClick={handleResetSearch}
                                    size="small"
                                    sx={{ ml: 1 }}
                                    aria-label="Очистить поиск"
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        ),
                    }}
                />
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSearch}
                    sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Поиск'}
                </Button>
            </Box>

            {/* -----------------------------
                Блок ФИЛЬТРОВ
            ----------------------------- */}
            <Box
                sx={{
                    pl: 2,
                    pb: 2,
                    mt: 2,
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    p: 2
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
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mb: 2, flexWrap: 'wrap' }}
                    >
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
                    />
                    <TextField
                        type="number"
                        label="Progress max"
                        value={progressMax}
                        onChange={(e) => setProgressMax(e.target.value)}
                        sx={{ width: 150 }}
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
                    />
                    <TextField
                        type="number"
                        label="Count max"
                        value={countMax}
                        onChange={(e) => setCountMax(e.target.value)}
                        sx={{ width: 150 }}
                    />
                </Box>

                {/* Дата добавления От и До */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <TextField
                        label="Дата от (YYYY-MM-DD)"
                        placeholder="2023-01-01"
                        value={createdAtAfter}
                        onChange={(e) => setCreatedAtAfter(e.target.value)}
                        sx={{ width: 200 }}
                    />
                    <TextField
                        label="Дата до (YYYY-MM-DD)"
                        placeholder="2023-12-31"
                        value={createdAtBefore}
                        onChange={(e) => setCreatedAtBefore(e.target.value)}
                        sx={{ width: 200 }}
                    />
                </Box>

                {/* Кнопки Применить / Сбросить */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleApplyFilters}
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

            {/* -----------------------------
                Таблица слов
            ----------------------------- */}
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
                                            boxShadow: '0px 4px 20px rgba(0, 0, 255, 0.1)',
                                        },
                                        '&:hover img': {
                                            transform: 'scale(1.05)',
                                            boxShadow: '0 0 20px rgba(0, 0, 255, 0.5)',
                                            filter: 'brightness(1.1) contrast(1.1)',
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
                                            <SpeechButton
                                                text={word.word}
                                                lang={language}
                                            />
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
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 1,
                                                mt: 1,
                                            }}
                                        >
                                            {word.tags.length > 0 ? (
                                                word.tags.slice(0, 3).map((tag) => (
                                                    <Chip
                                                        key={tag.id}
                                                        label={tag.name}
                                                        variant="outlined"
                                                        color="primary"
                                                        size="small"
                                                    />
                                                ))
                                            ) : (
                                                '—'
                                            )}
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
                                        {/* обрезаем до года-месяца-дня */}
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
