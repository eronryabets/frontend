// PageDetail.tsx

import React, {useEffect} from 'react';
import {useParams, useNavigate, Link as RouterLink} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {
    Container,
    Typography,
    CircularProgress,
    Alert,
    Box,
    Button,
    IconButton,
    useTheme,
} from '@mui/material';
import {ArrowBack, ArrowForward} from '@mui/icons-material';
import {RootState, AppDispatch} from '../../redux/store';
import {fetchPageByNumber} from '../../redux/slices/pageSlice';
import {fetchBookDetails} from '../../redux/slices/bookSlice';

export const PageDetail: React.FC = () => {
    const {bookId, chapterId, pageNumber} = useParams<{
        bookId: string;
        chapterId: string;
        pageNumber: string;
    }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const theme = useTheme();

    const {page, loading, error} = useSelector((state: RootState) => state.page);
    const {books} = useSelector((state: RootState) => state.books);

    const currentPageNumber = Number(pageNumber);

    // Найти книгу и главу из состояния
    const book = books.find((b) => b.id === bookId);
    const chapter = book?.chapters.find((c) => c.id === chapterId);

    useEffect(() => {
        // Если книга или глава не найдены, загрузить детали книги
        if (!book) {
            dispatch(fetchBookDetails(bookId!));
        }
    }, [dispatch, bookId, book]);

    useEffect(() => {
        if (chapterId && pageNumber) {
            dispatch(fetchPageByNumber({chapterId, pageNumber: currentPageNumber}));
        }
    }, [dispatch, chapterId, pageNumber, currentPageNumber]);

    const handlePreviousPage = () => {
        if (currentPageNumber > (chapter?.start_page_number || 1)) {
            navigate(`/books/${bookId}/chapters/${chapterId}/pages/${currentPageNumber - 1}`);
        }
    };

    const handleNextPage = () => {
        if (currentPageNumber < (chapter?.end_page_number || Infinity)) {
            navigate(`/books/${bookId}/chapters/${chapterId}/pages/${currentPageNumber + 1}`);
        }
    };

    if (loading || !chapter) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
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

    if (!page) {
        return (
            <Container sx={{mt: 4}}>
                <Alert severity="warning">Страница не найдена.</Alert>
                <Button component={RouterLink} to={`/book/${bookId}`} variant="contained" color="primary" sx={{mt: 2}}>
                    Вернуться к книге
                </Button>
            </Container>
        );
    }

    return (
        <Container sx={{mt: 4}}>
            {/* Заголовок */}
            <Box display="flex" alignItems="center" justifyContent="flex-start " mb={2} >
                <Typography variant="h5" gutterBottom>
                    Глава: {chapter.chapter_title}
                </Typography>
                <Box ml={2}>
                    <Typography variant="h6" gutterBottom>
                    Страница: {page.page_number}
                </Typography>
                </Box>

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

            {/* Пагинация */}
            <Box display="flex" justifyContent="space-between">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ArrowBack/>}
                    onClick={handlePreviousPage}
                    disabled={currentPageNumber <= (chapter?.start_page_number || 1)}
                >
                    Предыдущая страница
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowForward/>}
                    onClick={handleNextPage}
                    disabled={currentPageNumber >= (chapter?.end_page_number || Infinity)}
                >
                    Следующая страница
                </Button>
            </Box>
        </Container>
    );
};
