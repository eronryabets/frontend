import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    CircularProgress,
    Alert, Container, Box, Pagination, Chip, CardActionArea,
} from '@mui/material';
import defaultCover from '../../assets/default_cover.png';
import {fetchBooks, setCurrentPage} from "../../redux/slices/downloadBookSlice";
import {RootState, useAppDispatch} from "../../redux/store";
import {Link} from "react-router-dom";

export const BooksList: React.FC = () => {
    const dispatch = useAppDispatch();
    const {books, loading, error, currentPage, totalPages} = useSelector((state: RootState) => state.books);

    useEffect(() => {
        dispatch(fetchBooks(currentPage));
    }, [dispatch, currentPage]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
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
        <Container sx={{mt: 4, mb: 4}}>
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
                        style={{textDecoration: 'none', color: 'inherit'}} // Убираем подчёркивание и наследуем цвет
                    >
                        <Card
                            key={book.id}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                transition: 'background-color 0.3s, box-shadow 0.3s', // Плавный переход
                                '&:hover': {
                                    // backgroundColor: 'rgba(0, 0, 255, 0.1)', // Светло-синий фон при наведении
                                    boxShadow: '0px 4px 20px rgba(0, 0, 255, 0.2)', // Усиление тени при наведении
                                    transform: 'scale(1.01)', //чуть увеличиваем
                                },
                                cursor: 'pointer',
                                '&:focus': {
                                    outline: '2px solid rgba(0, 0, 255, 0.5)', // Обводка при фокусе
                                },
                                // transition: 'background-color 0.3s, box-shadow 0.3s, transform 0.3s',
                            }}
                        >
                            {/* Доп эффекти внутрянки - увеличиваем картинку */}
                            <CardActionArea
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    transition: 'background-color 0.3s, box-shadow 0.3s, transform 0.3s',
                                    '&:hover img': {
                                        boxShadow: '0 0 20px rgba(0, 0, 255, 0.5)', // Свечение вокруг изображения
                                        // transform: 'rotateY(20deg) scale(1.05)', // Поворот вокруг оси Y и масштабирование
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
                                <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
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
                                            e.currentTarget.src = defaultCover;
                                        }}
                                    />
                                </Box>
                                {/* Контент Карточки */}
                                <CardContent sx={{flexGrow: 1, textAlign: 'center'}}>
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
                                        {book.genre_details.map((genre) => (
                                            <Chip
                                                key={genre.id}
                                                label={genre.name}
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                            />
                                        ))}
                                    </Box>
                                    {/* Дополнительная Информация */}
                                    <Box sx={{mt: 2}}>
                                        <Typography variant="body2" color="text.secondary">
                                            Количество глав: {book.chapters.length}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Link>
                ))}
            </Box>
            {/* Пагинация */}
            <Box display="flex" justifyContent="center" mt={4}>
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
