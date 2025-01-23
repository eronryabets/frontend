import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { useAppDispatch } from '@/redux/hooks.ts';
import { fetchBooks, setCurrentPage } from '@/redux/slices/bookSlice.ts';
import { RootState } from '@/redux/store.ts';

import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Container,
    Box,
    Pagination,
    Chip,
    CardActionArea,
    useTheme,
    FormControl,
    Select, InputLabel,
    Tooltip,
    IconButton, Button, TextField, InputAdornment,
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

import defaultCover from '@/assets/default_cover.png';

export const BooksList: React.FC = () => {
    const dispatch = useAppDispatch();
    const {books, loading, error, currentPage, totalPages} = useSelector((state: RootState) => state.books);
    const theme = useTheme();

    useEffect(() => {
        dispatch(fetchBooks(currentPage));
    }, [dispatch, currentPage]);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        dispatch(setCurrentPage(value));
    };

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="80vh"
            >
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{mt: 4}}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

          return (
        <Container
            sx={{
                mt: 4, // верхний отступ
                mb: 4, // нижний отступ
                minHeight: '80vh', // Занимаем всю высоту окна просмотра
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* ========== ДЕМО (ЗАГЛУШКА) - ПАНЕЛИ ПОИСКА, ФИЛЬТРА и т.д. [START] ========== */}

            {/* ---НА основе WordList Блок с кнопками: Добавить слово, Поиск, Фильтр, Сортировка --- */}
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
                    startIcon={<MenuBook/>}
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
                    value={'test mock'}
                    onChange={()=>{}}
                    onKeyPress={()=>{}}
                    sx={{
                        width: '300px',
                        // backgroundColor: searchInput ? 'rgba(144,238,144,0.14)' : 'inherit',
                        borderRadius: 1,
                    }}
                    InputProps={{
                        // Если введён текст, показываем кнопку очистки слева
                        startAdornment: 1111 && (
                            <InputAdornment position="start">
                                <Tooltip title="Очистить поиск" arrow>
                                    <IconButton
                                        onClick={()=>{}}
                                        size="small"
                                        sx={{mr: 1}}
                                        color="secondary"
                                        aria-label="Очистить поиск"
                                    >
                                        <CloseIcon fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        ),
                        // В любом случае показываем иконку поиска справа
                        endAdornment: (
                            <InputAdornment position="end">
                                <SearchIcon
                                    color="primary"
                                    onClick={()=>{}}
                                    sx={{cursor: 'pointer'}}
                                />
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    variant="contained"
                    color={null ? 'warning' : 'info'}
                    onClick={()=>{}}
                    startIcon={
                        null
                            ? <ExpandLessOutlinedIcon/>
                            : <ExpandMoreOutlinedIcon/>
                    }
                >
                    {null ? 'Свернуть фильтр' : 'Показать фильтр'}
                </Button>

                {/* Иконка-индикатор фильтра */}
                <Tooltip
                    title={null ? 'Фильтр применён. Сбросить фильтр?' : 'Фильтр не активен'}
                    arrow
                >
                    <IconButton
                        onClick={() => {
                            // Если фильтр был активен, при клике сбросим его,
                            // или реализуйте другую логику переключения
                            // if (hasAnyFilter) {
                            //     handleResetFilters();
                            // }
                        }}
                    >
                        {null ? (
                            <FilterListOutlinedIcon sx={{color: 'green'}}/>
                        ) : (
                            <FilterListOffOutlinedIcon/>
                        )}
                    </IconButton>
                </Tooltip>

                {/* Select для сортировки */}
                <FormControl
                    size="small"
                    sx={{
                        minWidth: 200,
                        // Если ordering не пустой, фон становится зеленоватым, иначе inherit
                        // backgroundColor: ordering ? 'rgba(144,238,144,0.14)' : 'inherit',
                        borderRadius: 1, // опционально, чтобы применить скругление
                    }}
                >
                    <InputLabel id="sorting-label">Сортировка</InputLabel>
                    <Select
                        labelId="sorting-label"
                        label="Сортировка"
                        value={1111}
                        onChange={()=>{}}
                    >
                        {/*{sortingOptions.map((option) => (*/}
                        {/*    <MenuItem key={option.value} value={option.value}>*/}
                        {/*        {option.label}*/}
                        {/*    </MenuItem>*/}
                        {/*))}*/}
                    </Select>
                </FormControl>
            </Box>

            {/* ========== ДЕМО (ЗАГЛУШКА) - ПАНЕЛИ ПОИСКА, ФИЛЬТРА и т.д. [END] ========== */}

            {/* Обёртка с flexGrow */}
            <Box flexGrow={1} mt={2}>
                {/* Блок с книгами */}
                <Box
                    display="grid"
                    gap={4}
                    gridTemplateColumns={{
                        xs: 'repeat(1, 1fr)', // 1 колонка на экранах xs
                        sm: 'repeat(2, 1fr)', // 2 колонки на экранах sm
                        md: 'repeat(3, 1fr)', // 3 колонки на экранах md и выше
                    }}
                >
                    {books.map((book) => (
                        <Link
                            to={`/book/${book.id}`} // Путь к странице детали книги
                            key={book.id}
                            style={{ textDecoration: 'none', color: 'inherit' }} // Убираем подчёркивание и наследуем цвет
                        >
                            <Card
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'background-color 0.3s, box-shadow 0.3s', // Плавный переход
                                    '&:hover': {
                                        boxShadow: '0px 4px 20px rgba(0, 0, 255, 0.2)', // Усиление тени при наведении
                                        transform: 'scale(1.01)', // Чуть увеличиваем
                                    },
                                    cursor: 'pointer',
                                    '&:focus': {
                                        outline: '2px solid rgba(0, 0, 255, 0.5)', // Обводка при фокусе
                                    },
                                    background: theme.customBackground.paperGradient, // Градиент из темы
                                }}
                            >
                                {/* Доп эффекты внутренностей - увеличиваем картинку */}
                                <CardActionArea
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'background-color 0.3s, box-shadow 0.3s, transform 0.3s',
                                        '&:hover img': {
                                            boxShadow: '0 0 20px rgba(0, 0, 255, 0.5)', // Свечение вокруг изображения
                                            filter: 'brightness(1.1) contrast(1.1)', // Увеличение яркости и контраста
                                            animation: 'pulse 2.5s infinite',
                                        },
                                        '@keyframes pulse': {
                                            '0%': { transform: 'scale(1)' },
                                            '50%': { transform: 'scale(1.05)' },
                                            '100%': { transform: 'scale(1)' },
                                        },
                                    }}
                                >
                                    {/* Обложка Книги */}
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        <CardMedia
                                            component="img"
                                            image={book.cover_image || defaultCover}
                                            alt={book.title}
                                            sx={{
                                                width: 120, // Фиксированная ширина
                                                height: 160, // Фиксированная высота
                                                objectFit: 'cover',
                                                borderRadius: '16px',
                                                boxShadow: 3, // Добавление тени для эстетики
                                                transition: 'transform 0.3s', // Плавный переход для трансформаций
                                            }}
                                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                e.currentTarget.src = defaultCover as string;
                                            }}
                                        />
                                    </Box>
                                    {/* Контент Карточки */}
                                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                        <Typography variant="h6" component="div" gutterBottom>
                                            {book.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Добавлено: {new Date(book.created_at).toLocaleDateString()}
                                        </Typography>
                                        {/* Отображение Жанров */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                justifyContent: 'center',
                                                gap: 1, // Отступы между чипами
                                                mt: 1,
                                            }}
                                        >
                                            {book.genre_details.slice(0, 3).map((genre) => (
                                                <Chip
                                                    key={genre.id}
                                                    label={genre.name}
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                />
                                            ))}
                                            {book.genre_details.length > 3 && (
                                                <Chip
                                                    label={`+${book.genre_details.length - 3}`}
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                        {/* Дополнительная Информация */}
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Количество глав: {book.chapters.length}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Страниц : {book.total_pages}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Link>
                    ))}
                </Box>
            </Box>
            {/* Пагинация */}
            <Box
                display="flex"
                justifyContent="center"
                mt={2} // Небольшой отступ сверху для разделения
            >
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>
        </Container>
    );
};