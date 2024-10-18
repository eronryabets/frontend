import React, {useState} from 'react';
import {useParams, Link, useNavigate} from 'react-router-dom';
import {useSelector} from 'react-redux';
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
    Button, useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {RootState} from '../../redux/store';
import defaultCover from '../../assets/default_cover.png';
import {Dialog, DialogTitle, DialogContent, DialogActions} from '@mui/material';
import {useAppDispatch} from '../../redux/store';
import {deleteBook} from '../../redux/slices/downloadBookSlice';
import {EditBookModal} from "../EditBookModal";

export const BookDetail: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const {books, loading, error} = useSelector((state: RootState) => state.books);
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false); // Состояние для модалки редактирования

    // Проверяем, что id определён
    if (!id) {
        return (
            <Container sx={{mt: 4}}>
                <Alert severity="warning">Некорректный идентификатор книги.</Alert>
                <Button component={Link} to="/booklist" variant="contained" color="primary" sx={{mt: 2}}>
                    Вернуться к списку книг
                </Button>
            </Container>
        );
    }

    // Находим книгу по id
    const book = books.find((b) => b.id === id);

    // Обработка состояния загрузки
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

    // Обработка ошибок
    if (error) {
        return (
            <Container sx={{mt: 4}}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    // Обработка случая, когда книга не найдена
    if (!book) {
        return (
            <Container sx={{mt: 4}}>
                <Alert severity="warning">Книга не найдена.</Alert>
                <Button component={Link} to="/booklist" variant="contained" color="primary" sx={{mt: 2}}>
                    Вернуться к списку книг
                </Button>
            </Container>
        );
    }

    // Функции обработки удаления книги
    const handleDelete = () => {
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        setOpenDeleteDialog(false);
        const result = await dispatch(deleteBook(book.id));
        if (deleteBook.fulfilled.match(result)) {
            navigate('/booklist');
        } else if (deleteBook.rejected.match(result)) {
            setDeleteError(result.payload || 'Не удалось удалить книгу.');
        }
    };

    // Функция открытия модального окна редактирования
    const handleEdit = () => {
        setOpenEditDialog(true);
    };

    return (
        <Container sx={{mt: 10, mb: 4}}>
            {/* Карточка с информацией о книге */}
            <Card
                sx={{
                    display: 'flex',
                    flexDirection: {xs: 'column', md: 'row'},
                    p: 2,
                    background: theme.customBackground.paperGradient,
                    boxShadow: 3,
                    borderRadius: 2,
                    mb: 4,
                }}
            >
                {/* Левая часть: Информация о книге */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        pr: {md: 2},
                    }}
                >
                    <CardContent>
                        <Typography variant="h4" gutterBottom>
                            {book.title}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            Добавлено: {new Date(book.created_at).toLocaleDateString()}
                        </Typography>

                        {/* Описание Книги */}
                        {book.description && (
                            <Box sx={{mb: 2}}>
                                <Typography variant="h6">Описание:</Typography>
                                <Typography variant="body1" color="text.primary">
                                    {book.description}
                                </Typography>
                            </Box>
                        )}

                        {/* Жанры */}
                        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                Жанры:
                            </Typography>
                            {book.genre_details.slice(0, 4).map((genre) => (
                                <Chip key={genre.id} label={genre.name} variant="outlined" color="primary"/>
                            ))}
                            {book.genre_details.length > 4 && (
                                <Chip
                                    label={`+${book.genre_details.length - 4}`}
                                    variant="outlined"
                                    color="primary"
                                />
                            )}
                        </Box>
                    </CardContent>

                    {/* Кнопки управления */}
                    <Box sx={{pl: 2, pb: 2}}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon/>}
                            sx={{mr: 2}}
                            onClick={handleEdit} // Открытие модалки редактирования
                        >
                            Редактировать
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<DeleteIcon/>}
                            onClick={handleDelete}
                        >
                            Удалить
                        </Button>
                    </Box>
                </Box>

                {/* Правая часть: Обложка книги */}
                <Box
                    sx={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: {xs: 2, md: 0},
                    }}
                >
                    <CardMedia
                        component="img"
                        image={book.cover_image || defaultCover}
                        alt={book.title}
                        sx={{
                            width: {xs: '100%', md: 300},
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
            </Card>

            {/* Отображение ошибки удаления */}
            {deleteError && (
                <Alert severity="error" sx={{mb: 2}}>
                    {deleteError}
                </Alert>
            )}

            {/* Список глав */}
            <Box
                sx={{
                    mt: 4,
                    p: 2,
                    background: theme.customBackground.paperGradient,
                    boxShadow: 3,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Список Глав:
                </Typography>
                <List sx={{ maxHeight: 300, overflow: 'auto'}}>
                    {book.chapters.map((chapter, index) => (
                        <ListItem key={index} disableGutters>
                            <ListItemText primary={`${index + 1}. ${chapter}`}/>
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Кнопка Назад */}
            <Button component={Link} to="/booklist" variant="outlined" color="primary" sx={{mt: 4}}>
                Назад к списку книг
            </Button>

            {/* Диалог подтверждения удаления */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Подтверждение удаления</DialogTitle>
                <DialogContent>
                    <Typography>Вы уверены, что хотите удалить книгу "{book.title}"?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                        Отмена
                    </Button>
                    <Button onClick={confirmDelete} color="secondary">
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Модальное окно редактирования книги */}
            <EditBookModal
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                book={book}
            />
        </Container>
    );
};
