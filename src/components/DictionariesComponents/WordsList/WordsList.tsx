
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchWords, setCurrentPage, setDictionaryId } from '../../../redux/slices/wordsSlice';
import { useParams, useSearchParams } from 'react-router-dom';
import { Pagination, CircularProgress, Grid, Card, CardMedia, CardContent, Typography, Box } from '@mui/material';

// TODO this is simple demo version. (you should change visualizations, errors, pagination, grid -> box)

const WordsList: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { words, loading, error, currentPage, totalPages,
        dictionaryId } = useSelector((state: RootState) => state.words);
    const [searchParams, setSearchParams] = useSearchParams();

    // Установка dictionaryId и текущей страницы из URL при монтировании
    useEffect(() => {
        if (id) {
            if (dictionaryId !== id) {
                dispatch(setDictionaryId(id));
            }
            const page = parseInt(searchParams.get('page') || '1', 10);
            dispatch(setCurrentPage(page));
        }
    }, [dispatch, id, searchParams, dictionaryId]);

    // Фетчинг слов при изменении dictionaryId или currentPage
    useEffect(() => {
        if (id && dictionaryId) {
            dispatch(fetchWords({ dictionaryId: id, page: currentPage }));
            setSearchParams({ page: currentPage.toString() });
        }
    }, [dispatch, id, dictionaryId, currentPage, setSearchParams]);

    // Логирование состояния для отладки
    useEffect(() => {
        console.log('WordsList state:', { words, loading, error, currentPage, totalPages, dictionaryId });
    }, [words, loading, error, currentPage, totalPages, dictionaryId]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        dispatch(setCurrentPage(value));
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    if (error) return <Typography color="error" align="center" mt={4}>{error}</Typography>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Слова в словаре
            </Typography>
            {words && words.length > 0 ? (
                <Grid container spacing={2}>
                    {words.map((word) => (
                        <Grid item xs={12} sm={6} md={4} key={word.id}>
                            <Card>
                                {word.image_path && (
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={word.image_path}
                                        alt={word.word}
                                    />
                                )}
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        {word.word}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Перевод: {word.translation}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Теги: {word.tags.map(tag => tag.name).join(', ')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography variant="h6" align="center" mt={4}>
                    В этом словаре пока нет слов.
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
        </Box>
    );
};

export default WordsList;
