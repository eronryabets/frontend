// your_app/components/DictionariesComponents/WordsList/WordsList.tsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchWords, setCurrentPage, setDictionaryId } from '../../../redux/slices/wordsSlice';
import { useParams, useSearchParams } from 'react-router-dom';
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
    Avatar
} from '@mui/material';
import defaultCover from '../../../assets/default_cover.png';

const WordsList: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { words, loading, error, currentPage, totalPages, dictionaryId } = useSelector((state: RootState) => state.words);
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
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Слова в словаре
            </Typography>
            {words && words.length > 0 ? (
                <Box>
                    <Table sx={{ minWidth: 650 }} aria-label="words table">
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Изображение</strong></TableCell>
                                <TableCell><strong>Слово</strong></TableCell>
                                <TableCell><strong>Перевод</strong></TableCell>
                                <TableCell><strong>Теги</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {words.map((word) => (
                                <TableRow key={word.id}>
                                    <TableCell>
                                        <Avatar
                                            src={word.image_path ? word.image_path : defaultCover}
                                            alt={word.word}
                                            sx={{ width: 40, height: 40 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle1">{word.word}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{word.translation}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {word.tags.length > 0 ? word.tags.map(tag => tag.name).join(', ') : '—'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
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
