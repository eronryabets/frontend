import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Container,
    Box,
    Chip,
    List,
    ListItem,
    ListItemText,
    Button,
} from '@mui/material';
import { RootState } from '../../redux/store';
import defaultCover from '../../assets/default_cover.png'; // Убедитесь, что путь верный

const BookDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { books, loading, error } = useSelector((state: RootState) => state.books);
    const book = books.find((b) => b.id === id);

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

    if (!book) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="warning">Книга не найдена.</Alert>
                <Button component={Link} to="/" variant="contained" color="primary" sx={{ mt: 2 }}>
                    Вернуться к списку книг
                </Button>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 10, mb: 4 }}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
                {/* Обложка Книги */}
                <Box flexShrink={0}>
                    <CardMedia
                        component="img"
                        image={book.cover_image || defaultCover}
                        alt={book.title}
                        sx={{
                            width: { xs: '100%', md: 300 },
                            height: 'auto',
                            objectFit: 'cover',
                            borderRadius: '16px',
                            boxShadow: 3,
                        }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            e.currentTarget.src = defaultCover;
                        }}
                    />
                </Box>

                {/* Информация о Книге */}
                <Box flexGrow={1}>
                    <CardContent>
                        <Typography variant="h4" gutterBottom>
                            {book.title}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            Добавлено: {new Date(book.created_at).toLocaleDateString()}
                        </Typography>

                        {/* Жанры */}
                        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                            {book.genre_details.map((genre) => (
                                <Chip key={genre.id} label={genre.name} variant="outlined" color="primary" />
                            ))}
                        </Box>

                        {/* Список Глав */}
                        <Typography variant="h6" gutterBottom>
                            Список Глав
                        </Typography>
                        <List>
                            {book.chapters.map((chapter, index) => (
                                <ListItem key={index} disableGutters>
                                    <ListItemText primary={chapter} />
                                </ListItem>
                            ))}
                        </List>

                        {/* Кнопка Назад */}
                        <Button component={Link} to="/booklist" variant="contained" color="primary" sx={{ mt: 2 }}>
                            Назад к списку книг
                        </Button>
                    </CardContent>
                </Box>
            </Box>
        </Container>
    );
};

export default BookDetail;
