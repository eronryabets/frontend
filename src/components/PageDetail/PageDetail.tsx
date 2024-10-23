import React, { useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Container,
    Typography,
    CircularProgress,
    Alert,
    Box,
    Button,
    IconButton,
    useTheme,
    Pagination,
    Tooltip,
} from '@mui/material';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchPageByNumber } from '../../redux/slices/pageSlice';
import { fetchBookDetails } from '../../redux/slices/bookSlice';

export const PageDetail: React.FC = () => {
    const { bookId, chapterId, pageNumber } = useParams<{
        bookId: string;
        chapterId: string;
        pageNumber: string;
    }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const theme = useTheme();

    const { page, loading, error } = useSelector((state: RootState) => state.page);
    const { books } = useSelector((state: RootState) => state.books);

    const currentPageNumber = Number(pageNumber);

    // Найти книгу из состояния
    const book = books.find((b) => b.id === bookId);

    // Функция для определения главы по номеру страницы
    const findChapterByPageNumber = (pageNumber: number) => {
        return book?.chapters.find((c) => {
            return pageNumber >= c.start_page_number && pageNumber <= c.end_page_number;
        });
    };

    // Определяем текущую главу
    const chapter = findChapterByPageNumber(currentPageNumber);

    useEffect(() => {
        // Если книга не найдена, загрузить детали книги
        if (!book) {
            dispatch(fetchBookDetails(bookId!));
        }
    }, [dispatch, bookId, book]);

    useEffect(() => {
        if (book && chapter) {
            dispatch(fetchPageByNumber({ chapterId: chapter.id, pageNumber: currentPageNumber }));
        } else if (book) {
            // Если глава не найдена для текущей страницы, попробуем найти её
            const newChapter = findChapterByPageNumber(currentPageNumber);
            if (newChapter) {
                navigate(`/books/${bookId}/chapters/${newChapter.id}/pages/${currentPageNumber}`);
            } else {
                console.error('Chapter not found for page number:', currentPageNumber);
            }
        }
    }, [dispatch, book, chapter, currentPageNumber, navigate, bookId]);

    // Расчёт общего количества страниц в книге
    const totalPagesInBook = book?.total_pages || 0;

    //Пагинация
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        const newPageNumber = value;
        const newChapter = findChapterByPageNumber(newPageNumber);

        if (newChapter) {
            navigate(`/books/${bookId}/chapters/${newChapter.id}/pages/${newPageNumber}`);
        } else {
            console.error('Chapter not found for page number:', newPageNumber);
        }
    };

    const handlePreviousPage = () => {
        if (currentPageNumber > 1) {
            const newPageNumber = currentPageNumber - 1;
            const newChapter = findChapterByPageNumber(newPageNumber);

            if (newChapter) {
                navigate(`/books/${bookId}/chapters/${newChapter.id}/pages/${newPageNumber}`);
            } else {
                console.error('Chapter not found for page number:', newPageNumber);
            }
        }
    };

    const handleNextPage = () => {
        if (currentPageNumber < totalPagesInBook) {
            const newPageNumber = currentPageNumber + 1;
            const newChapter = findChapterByPageNumber(newPageNumber);

            if (newChapter) {
                navigate(`/books/${bookId}/chapters/${newChapter.id}/pages/${newPageNumber}`);
            } else {
                console.error('Chapter not found for page number:', newPageNumber);
            }
        }
    };

    if (loading || !book) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!page) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="warning">Страница не найдена.</Alert>
                <Button
                    component={RouterLink}
                    to={`/book/${bookId}`}
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                >
                    Вернуться к книге
                </Button>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            {/* Заголовок и Кнопка Перехода к Книге */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                    {chapter && (
                        <Typography variant="h5" gutterBottom>
                            Глава: {chapter.chapter_title}
                        </Typography>
                    )}
                    <Box ml={2}>
                        <Typography variant="h6" gutterBottom>
                            Страница: {page.page_number}
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="outlined"
                    color="primary"
                    component={RouterLink}
                    to={`/book/${bookId}`}
                >
                    Вернуться к книге
                </Button>
            </Box>

            {/* Контент страницы */}
            <Box
                sx={{
                    p: 3,
                    background: theme.customBackground.paperGradient,
                    boxShadow: 3,
                    borderRadius: 2,
                    mb: 4,
                    whiteSpace: 'pre-wrap',
                }}
            >
                <Typography variant="body1">{page.content}</Typography>
            </Box>

            {/* Пагинация по всей книге */}
            <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
                <Pagination
                    count={totalPagesInBook}
                    page={currentPageNumber}
                    onChange={handlePageChange}
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                />
            </Box>
        </Container>
    );
};
