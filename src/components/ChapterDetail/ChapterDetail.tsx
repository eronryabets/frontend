import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { clearChapter, fetchChapter } from "../../redux/slices/chapterSlice";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";


const ChapterDetail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const bookId = searchParams.get('book_id');
    const chapterId = searchParams.get('chapter_id');

    const dispatch = useAppDispatch();

    // Получение состояния из Redux
    const { data: chapter, loading, error } = useAppSelector((state) => state.chapter);

    useEffect(() => {
        if (bookId && chapterId) {
            dispatch(fetchChapter({ bookId, chapterId }));
        } else {
            // Если параметры отсутствуют, можно установить ошибку
            // Однако в нашем слайсе это уже обрабатывается
        }

        // Очистка данных при размонтировании компонента
        return () => {
            dispatch(clearChapter());
        };
    }, [dispatch, bookId, chapterId]);

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

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
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

    return (
        <Container sx={{ mt: 10, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                {chapter.chapter_title}
            </Typography>
            <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                {chapter.chapter_text}
            </Typography>
        </Container>
    );
};

export default ChapterDetail;
