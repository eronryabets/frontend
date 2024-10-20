import React, { useEffect, useMemo } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Typography,
    CircularProgress,
    Alert,
    Box,
    Button,
    Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { clearChapter, fetchChapter } from "../../redux/slices/chapterSlice";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { Chapter } from "../../types";
import TextToSpeech from '../TextToSpeech/TextToSpeech'; // Импортируем новый компонент

const ChapterDetail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const bookId = searchParams.get('book_id');
    const chapterId = searchParams.get('chapter_id');

    const dispatch = useAppDispatch();

    // Получение состояния из Redux
    const { data: chapter, loading, error } = useAppSelector((state) => state.chapter);
    const books = useAppSelector((state) => state.books.books); // Предполагаем, что книги хранятся здесь

    // Найти книгу по bookId
    const book = useMemo(() => {
        if (!bookId) return null;
        return books.find((b) => b.id === bookId);
    }, [books, bookId]);

    // Мемоизируем список глав
    const memoizedChapters = useMemo(() => {
        if (!book) return [];
        return book.chapters;
    }, [book]);

    // useEffect для загрузки главы
    useEffect(() => {
        if (bookId && chapterId) {
            dispatch(fetchChapter({ bookId, chapterId }));
        }

        // Очистка состояния при размонтировании компонента
        return () => {
            dispatch(clearChapter());
        };
    }, [dispatch, bookId, chapterId]);

    // Обработка состояния загрузки
    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="80vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    // Обработка ошибок
    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    // Обработка случая, когда книга не найдена
    if (!book) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="warning">Книга не найдена.</Alert>
                <Button
                    component={RouterLink}
                    to="/booklist"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                >
                    Вернуться к списку книг
                </Button>
            </Container>
        );
    }

    if (!chapter) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="warning">Глава не найдена.</Alert>
            </Container>
        );
    }

    // Определение индекса текущей главы
    const currentIndex = memoizedChapters.findIndex((c: Chapter) => c.id === chapterId);

    // Определение предыдущей и следующей главы
    const prevChapter = currentIndex > 0 ? memoizedChapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < memoizedChapters.length - 1 ? memoizedChapters[currentIndex + 1] : null;

    return (
        <Container sx={{ mt: 10, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                {chapter.chapter_title}
            </Typography>
            <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                {chapter.chapter_text}
            </Typography>

            {/* Компонент TextToSpeech */}
            <Box sx={{ mt: 4 }}>
                <TextToSpeech text={chapter.chapter_text} />
            </Box>

            {/* Кнопки навигации */}
            <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 4 }}>
                {prevChapter ? (
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<ArrowBackIcon />}
                        component={RouterLink}
                        to={`/chapters/get_chapter/?book_id=${book.id}&chapter_id=${prevChapter.id}`}
                    >
                        Предыдущая глава: {prevChapter.chapter_title}
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<ArrowBackIcon />}
                        disabled
                    >
                        Предыдущая глава
                    </Button>
                )}

                {nextChapter ? (
                    <Button
                        variant="outlined"
                        color="primary"
                        endIcon={<ArrowForwardIcon />}
                        component={RouterLink}
                        to={`/chapters/get_chapter/?book_id=${book.id}&chapter_id=${nextChapter.id}`}
                    >
                        Следующая глава: {nextChapter.chapter_title}
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        color="primary"
                        endIcon={<ArrowForwardIcon />}
                        disabled
                    >
                        Следующая глава
                    </Button>
                )}
            </Stack>
        </Container>
    );

};

export default ChapterDetail;
