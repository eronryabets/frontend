import React, {useEffect, useState, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useParams, useSearchParams} from 'react-router-dom';

// MUI
import {
    Box,
    Button,
    IconButton,
    TextField,
    Tooltip,
    Chip,
    Stack,
    Typography,
    Collapse,
    CircularProgress,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Snackbar,
    Alert,
    Pagination,
    Avatar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TableSortLabel, debounce
} from '@mui/material';
import {SelectChangeEvent} from '@mui/material/Select';
import {
    Close as CloseIcon,
    MapsUgc as MapsUgcIcon,
    Edit as EditIcon
} from '@mui/icons-material';

// DatePicker, Dayjs и адаптер
import dayjs, {Dayjs} from 'dayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';

// lodash.debounce для дебаунсинга при вводе
// import debounce from 'lodash.debounce' -> '@mui/material';

// Импортируем useTheme для определения темы
import {useTheme} from '@mui/material/styles';

// Остальные компоненты и Redux
import {
    fetchWords,
    setCurrentPage,
    setDictionaryId,
    setSearchTerm,
    setFilters,
    setOrdering
} from '@/redux/slices/wordsSlice.ts';
import {RootState, AppDispatch} from '@/redux/store.ts';

import {
    AddWordModal,
    EditWordModal,
    MyIconButton,
    SpeechButton
} from '@/components';
import defaultCover from '@/assets/default_word_image.jpg';

// Импорт функции для подсветки progress
import {getBackgroundColorByProgress} from '@/utils/getBackgroundColorByProgress';

import {getLanguageName} from '@/utils/getLanguageName';

/** Хелпер для форматирования даты (обрезаем до "yyyy-mm-dd") */
function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
}

const sortingOptions = [
    {label: 'Без сортировки', value: ''},
    {label: 'Termin (A → Z)', value: 'word'},
    {label: 'Termin (Z → A)', value: '-word'},
    {label: 'Count (меньше → больше)', value: 'count'},
    {label: 'Count (больше → меньше)', value: '-count'},
    {label: 'Progress (меньше → больше)', value: 'progress'},
    {label: 'Progress (больше → меньше)', value: '-progress'},
    {label: 'Added (старые → новые)', value: 'created_at'},
    {label: 'Added (новые → старые)', value: '-created_at'}
];

export const WordsList: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const [searchParams, setSearchParams] = useSearchParams();

    const {
        words,
        loading,
        error,
        currentPage,
        totalPages,
        dictionaryId,
        search,
        filters,
        ordering
    } = useSelector((state: RootState) => state.words);

    // Подключаем тему
    const theme = useTheme();

    const [searchInput, setSearchInput] = useState(search || '');
    const [isFilterOpen, setFilterOpen] = useState<boolean>(false);

    // Теги
    const [tagInput, setTagInput] = useState<string>('');
    const [tagNames, setTagNames] = useState<string[]>(filters.tags || []);

    const handleTagInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setTagInput(event.target.value);
    }, []);

    const handleTagKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tagNames.includes(newTag)) {
                setTagNames([...tagNames, newTag]);
            }
            setTagInput('');
        }
    }, [tagInput, tagNames]);

    const handleRemoveTag = useCallback((tag: string) => {
        setTagNames((prev) => prev.filter((t) => t !== tag));
    }, []);

    // Прогресс и count
    const [progressMin, setProgressMin] = useState<string>(filters.progress_min?.toString() || '');
    const [progressMax, setProgressMax] = useState<string>(filters.progress_max?.toString() || '');
    const [countMin, setCountMin] = useState<string>(filters.count_min?.toString() || '');
    const [countMax, setCountMax] = useState<string>(filters.count_max?.toString() || '');

    // Даты
    const [createdAtAfter, setCreatedAtAfter] = useState<Dayjs | null>(
        filters.created_at_after ? dayjs(filters.created_at_after) : null
    );
    const [createdAtBefore, setCreatedAtBefore] = useState<Dayjs | null>(
        filters.created_at_before ? dayjs(filters.created_at_before) : null
    );

    // Применить и Сбросить фильтры
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
        dispatch(setCurrentPage(1));
    }, [dispatch]);

    // Модалки
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

    // При смене словаря
    useEffect(() => {
        if (id && dictionaryId !== id) {
            dispatch(setDictionaryId(id));
        }
    }, [id, dictionaryId, dispatch]);

    // Берём page и search из URL
    useEffect(() => {
        const page = parseInt(searchParams.get('page') || '1', 10);
        dispatch(setCurrentPage(page));

        const searchTerm = searchParams.get('search') || '';
        dispatch(setSearchTerm(searchTerm));
        setSearchInput(searchTerm);
    }, [dispatch, searchParams]);

    // Загрузка слов
    useEffect(() => {
        if (id && dictionaryId) {
            dispatch(
                fetchWords({
                    dictionaryId: id,
                    page: currentPage,
                    search,
                    filters,
                    ordering
                })
            );

            const params: any = {page: currentPage.toString()};
            if (search) {
                params.search = search;
            }
            if (ordering) {
                params.ordering = ordering;
            }
            setSearchParams(params);
        }
    }, [dispatch, id, dictionaryId, currentPage, search, filters, ordering, setSearchParams]);

    // Пагинация
    const handlePageChange = useCallback(
        (_event: React.ChangeEvent<unknown>, value: number) => {
            dispatch(setCurrentPage(value));
        },
        [dispatch]
    );

    // Модалки Add/Edit
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

    // Достаём все словари из Redux, чтобы найти текущий
    const allDictionaries = useSelector((state: RootState) => state.dictionaries.dictionaries);
    // Находим текущий словарь, исходя из dictionaryId
    const currentDict = allDictionaries.find((dict) => dict.id === dictionaryId);
    const language = currentDict?.language || 'en-US';

    const handleDeleteSuccess = useCallback(() => {
        handleCloseEditModal();
        setSnackbarMessage('Слово успешно удалено.');
        setSnackbarOpen(true);
    }, [handleCloseEditModal]);

    const handleSnackbarClose = useCallback(() => {
        setSnackbarOpen(false);
    }, []);

    // Дебаунсинг для поля поиска
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            dispatch(setSearchTerm(value.trim()));
            dispatch(setCurrentPage(1));
        }, 500),
        [dispatch]
    );

    const handleSearchInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setSearchInput(event.target.value);
            debouncedSearch(event.target.value);
        },
        [debouncedSearch]
    );

    // Если оставляем кнопку "Поиск"
    const handleSearch = useCallback(() => {
        dispatch(setSearchTerm(searchInput.trim()));
        dispatch(setCurrentPage(1));
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
        dispatch(setCurrentPage(1));
    }, [dispatch]);

    // Валидация count
    const countMinNum = Number(countMin);
    const countMaxNum = Number(countMax);
    const countMinError =
        countMin !== '' && (countMinNum < 0 || (countMax !== '' && countMinNum > countMaxNum));
    const countMaxError =
        countMax !== '' && (countMaxNum < 0 || (countMin !== '' && countMaxNum < countMinNum));

    // Валидация progress
    const progressMinNum = Number(progressMin);
    const progressMaxNum = Number(progressMax);
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

    const hasAnyFilter =
        tagNames.length > 0 ||
        progressMin !== '' ||
        progressMax !== '' ||
        countMin !== '' ||
        countMax !== '' ||
        createdAtAfter !== null ||
        createdAtBefore !== null;

    const isApplyFiltersDisabled =
        !hasAnyFilter ||
        countMinError ||
        countMaxError ||
        progressMinError ||
        progressMaxError;

    // Обработчик изменения сортировки (через Select)
    const handleOrderingChange = useCallback(
        (event: SelectChangeEvent<string>) => {
            const newOrder = event.target.value;
            dispatch(setOrdering(newOrder));
        },
        [dispatch]
    );

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
            {/* Если текущий словарь нашёлся, выводим его обложку, название, язык и кол-во слов */}
            {currentDict && (
                <Box display="flex" alignItems="center" gap={1} mb={2} ml={2}>
                    {/* Обложка словаря (20x20) */}
                    <Avatar
                        src={currentDict.cover_image ?? defaultCover}
                        alt={currentDict.name}
                        sx={{width: 30, height: 30, borderRadius: 1}}
                    />
                    {/* Название словаря, язык и количество слов */}
                    <Typography variant="h6" component="div">
                        <strong>{currentDict.name}</strong>{'  '}
                        {'  '}
                        {` - ${getLanguageName(currentDict.language)}`}{'  '}
                        {/*(<strong>{currentDict.language}</strong>){'  '}*/}
                        - {currentDict.word_count} слов
                    </Typography>
                </Box>
            )}

            {/* --- Блок с кнопками: Добавить слово, Поиск, Фильтр, Сортировка --- */}
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
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<MapsUgcIcon/>}
                    onClick={handleOpenAddModal}
                >
                    Добавить слово
                </Button>

                {/* Поле поиска с дебаунсом */}
                <TextField
                    label="Поиск слов"
                    variant="outlined"
                    size="small"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onKeyPress={handleSearchKeyPress}
                    sx={{width: '300px'}}
                    InputProps={{
                        endAdornment: search && (
                            <Tooltip title="Очистить поиск" arrow>
                                <IconButton
                                    onClick={handleResetSearch}
                                    size="small"
                                    sx={{ml: 1}}
                                    aria-label="Очистить поиск"
                                >
                                    <CloseIcon fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                        )
                    }}
                />
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSearch}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24}/> : 'Поиск'}
                </Button>

                <Button
                    variant="contained"
                    color={isFilterOpen ? 'warning' : 'info'}
                    onClick={() => setFilterOpen(!isFilterOpen)}
                >
                    {isFilterOpen ? 'Свернуть фильтр' : 'Показать фильтр'}
                </Button>

                {/* Select для сортировки */}
                <FormControl size="small" sx={{minWidth: 200}}>
                    <InputLabel id="sorting-label">Сортировка</InputLabel>
                    <Select
                        labelId="sorting-label"
                        label="Сортировка"
                        value={ordering}
                        onChange={handleOrderingChange}
                    >
                        {sortingOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* --- ФИЛЬТРЫ (свертываемые) --- */}
            <Collapse in={isFilterOpen}>
                <Box
                    sx={{
                        border: '1px solid #ccc',
                        borderRadius: 2,
                        p: 2,
                        mt: 1,
                        mb: 2,
                        maxWidth: '350px'
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
                        sx={{mb: 2, maxWidth: '315px'}}
                        placeholder="Введите тег и нажмите Enter или запятую"
                    />
                    {tagNames.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{mb: 2, flexWrap: 'wrap'}}>
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

                    {/* Прогресс От/До */}
                    <Box sx={{display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap'}}>
                        <TextField
                            type="number"
                            label="Progress min"
                            value={progressMin}
                            onChange={(e) => setProgressMin(e.target.value)}
                            sx={{width: 150}}
                            inputProps={{min: 0, max: 10}}
                            error={progressMinError}
                            helperText={
                                progressMinError
                                    ? progressMinNum < 0
                                        ? 'Значение не может быть меньше 0'
                                        : progressMinNum > 10
                                            ? 'Значение не может быть больше 10'
                                            : 'Минимальное не может превышать максимальное'
                                    : ''
                            }
                        />
                        <TextField
                            type="number"
                            label="Progress max"
                            value={progressMax}
                            onChange={(e) => setProgressMax(e.target.value)}
                            sx={{width: 150}}
                            inputProps={{min: 0, max: 10}}
                            error={progressMaxError}
                            helperText={
                                progressMaxError
                                    ? progressMaxNum < 0
                                        ? 'Значение не может быть меньше 0'
                                        : progressMaxNum > 10
                                            ? 'Значение не может быть больше 10'
                                            : 'Максимальное не может быть меньше минимального'
                                    : ''
                            }
                        />
                    </Box>

                    {/* Count От/До */}
                    <Box sx={{display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap'}}>
                        <TextField
                            type="number"
                            label="Count min"
                            value={countMin}
                            onChange={(e) => setCountMin(e.target.value)}
                            sx={{width: 150}}
                            inputProps={{min: 0}}
                            error={countMinError}
                            helperText={
                                countMinError
                                    ? countMinNum < 0
                                        ? 'Минимальное значение не может быть меньше 0'
                                        : 'Минимальное не может превышать максимальное'
                                    : ''
                            }
                        />
                        <TextField
                            type="number"
                            label="Count max"
                            value={countMax}
                            onChange={(e) => setCountMax(e.target.value)}
                            sx={{width: 150}}
                            inputProps={{min: 0}}
                            error={countMaxError}
                            helperText={
                                countMaxError
                                    ? countMaxNum < 0
                                        ? 'Максимальное значение не может быть меньше 0'
                                        : 'Максимальное не может быть меньше минимального'
                                    : ''
                            }
                        />
                    </Box>

                    {/* Даты */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mb: 2, maxWidth: '315px'}}>
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

                    {/* Кнопки Применить/Сбросить */}
                    <Box sx={{display: 'flex', gap: 4.6}}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleApplyFilters}
                            disabled={isApplyFiltersDisabled}
                        >
                            Применить
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleResetFilters}
                        >
                            Сбросить
                        </Button>
                    </Box>
                </Box>
            </Collapse>

            {/* Таблица слов */}
            {words && words.length > 0 ? (
                <Box mt={2}>
                    <Table
                        sx={{
                            minWidth: 650,
                            // tableLayout: 'fixed'
                        }}
                        aria-label="words table">
                        <TableHead>
                            <TableRow>
                                <TableCell><strong></strong></TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={ordering === 'word' || ordering === '-word'}
                                        direction={ordering === 'word' ? 'asc' : 'desc'}
                                        onClick={() => {
                                            let newOrder = 'word';
                                            if (ordering === 'word') {
                                                newOrder = '-word';
                                            } else if (ordering === '-word') {
                                                newOrder = 'word';
                                            }
                                            dispatch(setOrdering(newOrder));
                                        }}
                                    >
                                        <strong>Termin</strong>
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell><strong>Translate</strong></TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={ordering === 'count' || ordering === '-count'}
                                        direction={ordering === 'count' ? 'asc' : 'desc'}
                                        onClick={() => {
                                            let newOrder = 'count';
                                            if (ordering === 'count') {
                                                newOrder = '-count';
                                            } else if (ordering === '-count') {
                                                newOrder = 'count';
                                            }
                                            dispatch(setOrdering(newOrder));
                                        }}
                                    >
                                        <strong>Views</strong>
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={ordering === 'progress' || ordering === '-progress'}
                                        direction={ordering === 'progress' ? 'asc' : 'desc'}
                                        onClick={() => {
                                            let newOrder = 'progress';
                                            if (ordering === 'progress') {
                                                newOrder = '-progress';
                                            } else if (ordering === '-progress') {
                                                newOrder = 'progress';
                                            }
                                            dispatch(setOrdering(newOrder));
                                        }}
                                    >
                                        <strong>Progress</strong>
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell><strong>Tags</strong></TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={ordering === 'created_at' || ordering === '-created_at'}
                                        direction={ordering === 'created_at' ? 'asc' : 'desc'}
                                        onClick={() => {
                                            let newOrder = 'created_at';
                                            if (ordering === 'created_at') {
                                                newOrder = '-created_at';
                                            } else if (ordering === '-created_at') {
                                                newOrder = 'created_at';
                                            }
                                            dispatch(setOrdering(newOrder));
                                        }}
                                    >
                                        <strong>Added</strong>
                                    </TableSortLabel>
                                </TableCell>
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

                                    {/*WORD IMAGE*/}
                                    <TableCell sx={{maxWidth: 70}}>
                                        <Avatar
                                            src={word.image_path ? word.image_path : defaultCover}
                                            alt={word.word}
                                            sx={{width: 60, height: 60, borderRadius: 4}}
                                        />
                                    </TableCell>

                                    {/*WORD TERMIN*/}
                                    <TableCell
                                        sx={{
                                            minWidth: {xs: 'auto', md: 450},
                                            maxWidth: {xs: 'none', md: 450}
                                        }}
                                    >
                                        <Box display="flex" alignItems="center">
                                            <SpeechButton text={word.word} lang={language}/>
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

                                    {/*WORD TRANSLATE*/}
                                    <TableCell
                                        sx={{
                                            minWidth: {xs: 'auto', md: 450},
                                            maxWidth: {xs: 'none', md: 450}
                                        }}
                                    >
                                        <Box display="flex" alignItems="center">
                                            <MyIconButton
                                                color="primary"
                                                startIcon={<EditIcon/>}
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

                                    {/*WORD VIEWS COUNT*/}
                                    <TableCell>
                                        <Typography variant="body2">{word.count}</Typography>
                                    </TableCell>

                                    {/* WORD PROGRESS - highlight */}
                                    <TableCell>
                                        <Box
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem',
                                                // Динамический фон
                                                backgroundColor: getBackgroundColorByProgress(word.progress),
                                                // Цвет текста в зависимости от темы (dark/light)
                                                color: theme.palette.mode === 'dark' ? '#fff' : '#000'
                                            }}
                                        >
                                            {word.progress}
                                        </Box>
                                    </TableCell>

                                    {/*WORD TAGS*/}
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1,
                                                maxWidth: {xs: 'none', md: 150}
                                            }}>
                                            {word.tags.length > 0
                                                ? word.tags.slice(0, 2).map((tag) => (
                                                    <Chip
                                                        key={tag.id}
                                                        label={tag.name}
                                                        variant="outlined"
                                                        color="primary"
                                                        size="small"
                                                    />
                                                ))
                                                : '—'}
                                            {word.tags.length > 2 && (
                                                <Chip
                                                    label={`+${word.tags.length - 2}`}
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                    </TableCell>

                                    {/*WORD ADDED*/}
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
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            >
                <Alert severity="success" sx={{width: '100%'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default WordsList;
