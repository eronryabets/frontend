
import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const ChapterDetail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const bookId = searchParams.get('book_id');
    const chapterId = searchParams.get('chapter_id');

    const dispatch = useAppDispatch();

    // Получение состояния из Redux
    const { data: chapter, loading, error } = useAppSelector((state) => state.chapter);
    const books = useAppSelector((state) => state.books.books); // Предполагаем, что книги хранятся здесь

    // Хуки для управления озвучкой
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);

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
            handleStop(); // Остановить озвучку при размонтировании
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, bookId, chapterId]);

    // Функция для воспроизведения текста
    const handlePlay = () => {
        if ('speechSynthesis' in window) {
            // Остановить любую текущую озвучку
            window.speechSynthesis.cancel();

            // Создать новое Utterance
            const utterance = new SpeechSynthesisUtterance(chapter?.chapter_text || '');
            utterance.lang = 'en-EN'; // Установите нужный язык
            utterance.pitch = 1; // Высота тона (0-2)
            utterance.rate = 1;  // Скорость речи (0.1-10)
            utterance.volume = 1; // Громкость (0-1)

            // Обработчики событий
            utterance.onstart = () => {
                setIsSpeaking(true);
                setIsPaused(false);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };

            utterance.onerror = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };

            // Сохранить Utterance в ref
            utteranceRef.current = utterance;

            // Начать озвучивание
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Ваш браузер не поддерживает Web Speech API.');
        }
    };

    // Функция для паузы озвучивания
    const handlePause = () => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    // Функция для продолжения озвучивания
    const handleResume = () => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    };

    // Функция для остановки озвучивания
    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    // Автоматическое воспроизведение при загрузке главы
    useEffect(() => {
        if (chapter && chapter.chapter_text) {
            handlePlay();
        }

        // Остановить озвучку при размонтировании или смене главы
        return () => {
            handleStop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chapter]);

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

            {/* Кнопки управления озвучкой */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                {!isSpeaking && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handlePlay}
                    >
                        Воспроизвести
                    </Button>
                )}
                {isSpeaking && !isPaused && (
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handlePause}
                    >
                        Пауза
                    </Button>
                )}
                {isSpeaking && isPaused && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleResume}
                    >
                        Продолжить
                    </Button>
                )}
                {isSpeaking && (
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleStop}
                    >
                        Остановить
                    </Button>
                )}
            </Stack>

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
                        {prevChapter.chapter_title}
                    </Button>
                ) : (
                    <Button variant="outlined" color="primary" startIcon={<ArrowBackIcon />} disabled>

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
                        {nextChapter.chapter_title}
                    </Button>
                ) : (
                    <Button variant="outlined" color="primary" endIcon={<ArrowForwardIcon />} disabled>

                    </Button>
                )}
            </Stack>
        </Container>
    );
};

export default ChapterDetail;
