import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/redux/hooks.ts';
import { fetchDictionaries, setCurrentPage } from '@/redux/slices/dictionarySlice.ts';
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
    CardActionArea,
    useTheme,
} from '@mui/material';

import defaultCover from '@/assets/default_cover.png'; // ПОСТАВИТЬ ПОТОМ ДРУГУЮ ЗАГЛУШКУ

export const DictionariesList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { dictionaries, loading, error, currentPage, totalPages } = useAppSelector(
        (state: RootState) => state.dictionaries
    );
    const theme = useTheme();

    useEffect(() => {
        dispatch(fetchDictionaries(currentPage));
    }, [dispatch, currentPage]);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        dispatch(setCurrentPage(value));
    };

    if (loading) {
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

    return (
        <Container
            sx={{
                mt: 4,
                mb: 4,
                minHeight: '80vh',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box flexGrow={1}>
                <Box
                    display="grid"
                    gap={4}
                    gridTemplateColumns={{
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                    }}
                >
                    {dictionaries.map((dict) => (
                        <Link
                            to={`/dictionary/${dict.id}`}
                            key={dict.id}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <Card
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'background-color 0.3s, box-shadow 0.3s',
                                    '&:hover': {
                                        boxShadow: '0px 4px 20px rgba(0, 0, 255, 0.2)',
                                        transform: 'scale(1.01)',
                                    },
                                    cursor: 'pointer',
                                    '&:focus': {
                                        outline: '2px solid rgba(0, 0, 255, 0.5)',
                                    },
                                    background: theme.palette.background.paper, // Используй тему MUI
                                }}
                            >
                                <CardActionArea
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'background-color 0.3s, box-shadow 0.3s, transform 0.3s',
                                        '&:hover img': {
                                            boxShadow: '0 0 20px rgba(0, 0, 255, 0.5)',
                                            filter: 'brightness(1.1) contrast(1.1)',
                                            animation: 'pulse 2.5s infinite',
                                        },
                                        '@keyframes pulse': {
                                            '0%': { transform: 'scale(1)' },
                                            '50%': { transform: 'scale(1.05)' },
                                            '100%': { transform: 'scale(1)' },
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        <CardMedia
                                            component="img"
                                            image={dict.cover_image || defaultCover}
                                            alt={dict.name}
                                            sx={{
                                                width: 120,
                                                height: 160,
                                                objectFit: 'cover',
                                                borderRadius: '16px',
                                                boxShadow: 3,
                                                transition: 'transform 0.3s',
                                            }}
                                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                e.currentTarget.src = defaultCover;
                                            }}
                                        />
                                    </Box>
                                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                        <Typography variant="h6" component="div" gutterBottom>
                                            {dict.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Язык: {dict.language}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Обнавлен: {new Date(dict.updated_at).toLocaleDateString()}
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Количество слов: {dict.word_count}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Link>
                    ))}
                </Box>
            </Box>
            <Box display="flex" justifyContent="center" mt={2}>
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

