import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store.ts';
import { deleteBook, fetchBookDetails } from '@/redux/slices/bookSlice.ts';

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
    Button,
    useTheme,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItemButton,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    IconButton,
} from '@mui/material';

import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

import { EditBookModal } from '@/components';
import { generatePageNumbers } from '@/utils/generatePageNumbers.ts';
import defaultCover from '../../../assets/default_cover.png';

export const BookDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { books, loading, error } = useSelector((state: RootState) => state.books);
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false); // Добавлено состояние удаления

    // Найти книгу по id
    const book = useMemo(() => {
        if (!id) return null;
        return books.find((b) => b.id === id);
    }, [books, id]);

    // Загрузка деталей книги при монтировании
    useEffect(() => {
        if (!book || !book.chapters) {
            if (!isDeleting) { // Проверяем, что не происходит удаление
                dispatch(fetchBookDetails(id!));
            }
        }
    }, [dispatch, id, book, isDeleting]);

    // Мемоизируем список глав с отображением страниц
    const memoizedChapters = useMemo(() => {
        if (!book) return null;
        return book.chapters.map((chapter) => (
            <Accordion
                sx={{ background: theme.customBackground.gradient}}
                key={chapter.id}
                expanded={expandedChapters.has(chapter.id)}
                onChange={(_event, isExpanded) => handleToggleChapter(chapter.id, isExpanded)}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{`${chapter.chapter_title}`}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        {generatePageNumbers(chapter.start_page_number, chapter.end_page_number).map((pageNumber) => (
                            <ListItemButton
                                key={pageNumber}
                                component={RouterLink}
                                to={`/books/${book.id}/chapters/${chapter.id}/pages/${pageNumber}`}
                            >
                                <ListItemText primary={`Страница ${pageNumber}`} />
                            </ListItemButton>
                        ))}
                    </List>
                </AccordionDetails>
            </Accordion>
        ));
    }, [book, expandedChapters, theme]);

    // Проверяем, что id определён
    if (!id) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="warning">Некорректный идентификатор книги.</Alert>
                <Button component={RouterLink} to="/booklist" variant="contained" color="primary" sx={{ mt: 2 }}>
                    Вернуться к списку книг
                </Button>
            </Container>
        );
    }

    // Обработка состояния загрузки
    if (loading && !isDeleting) { // Не показываем загрузку при удалении
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
    if (error && !isDeleting) { // Не показываем ошибку при удалении
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    // Обработка случая, когда книга не найдена
    if (!book && !isDeleting) { // Не показываем предупреждение при удалении
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="warning">Книга не найдена.</Alert>
                <Button component={RouterLink} to="/booklist" variant="contained" color="primary" sx={{ mt: 2 }}>
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
        setIsDeleting(true); // Устанавливаем флаг удаления
        const result = await dispatch(deleteBook(book!.id));
        if (deleteBook.fulfilled.match(result)) {
            navigate('/booklist');
        } else if (deleteBook.rejected.match(result)) {
            setDeleteError(result.payload || 'Не удалось удалить книгу.');
            setIsDeleting(false); // Сбрасываем флаг при ошибке
        }
    };

    // Функция открытия модального окна редактирования
    const handleEdit = () => {
        setOpenEditDialog(true);
    };

    // Функции для развертывания и сворачивания всех глав
    const handleExpandAll = () => {
        if (book) {
            const allChapterIds = book.chapters.map((chapter) => chapter.id);
            setExpandedChapters(new Set(allChapterIds));
        }
    };

    const handleCollapseAll = () => {
        setExpandedChapters(new Set());
    };

    // Новый «тоггл» для всех глав: если все открыты → свернуть, иначе открыть
    const allChaptersExpanded = book && expandedChapters.size === book.chapters.length;
    const handleToggleAll = () => {
        if (!book) return;
        if (allChaptersExpanded) {
            handleCollapseAll();
        } else {
            handleExpandAll();
        }
    };

    // Функция для переключения состояния конкретной главы
    const handleToggleChapter = (chapterId: string, isExpanded: boolean) => {
        setExpandedChapters((prev) => {
            const newSet = new Set(prev);
            if (isExpanded) {
                newSet.add(chapterId);
            } else {
                newSet.delete(chapterId);
            }
            return newSet;
        });
    };

    // Получение длины жанров с безопасным доступом
    const genreLength = book?.genre_details?.length ?? 0;

    // Добавляем проверку наличия книги перед рендерингом основного контента
    if (!book && isDeleting) {
        // Во время удаления и перенаправления не рендерим ничего
        return null;
    }

    return (
        <Container sx={{ mt: 6, mb: 4 }}>
            {book && (
                <>
                    {/* Карточка с информацией о книге */}
                    <Card
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
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
                                pr: { md: 2 },
                            }}
                        >
                            <CardContent>
                                <Typography variant="h4" gutterBottom>
                                    {book.title}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                    Добавлено: {book.created_at ? new Date(book.created_at).toLocaleDateString() : 'Неизвестно'}
                                </Typography>
                                {/* Дополнительная Информация */}
                                <Typography variant="body2" color="text.secondary">
                                    Язык: {book.language}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Количество глав: {book.chapters.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Страниц: {book.total_pages}
                                </Typography>

                                {/* Описание Книги */}
                                {book.description && (
                                    <Box sx={{ mb: 2 }}>
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
                                    {book.genre_details.slice(0, 10).map((genre) => (
                                        <Chip key={genre.id} label={genre.name} variant="outlined" color="primary" />
                                    ))}
                                    {genreLength > 10 && (
                                        <Chip
                                            label={`+${genreLength - 10}`}
                                            variant="outlined"
                                            color="primary"
                                        />
                                    )}
                                </Box>
                            </CardContent>

                            {/* Кнопки управления */}
                            <Box sx={{ pl: 2, pb: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<EditIcon />}
                                    sx={{ mr: 2 }}
                                    onClick={handleEdit} // Открытие модалки редактирования
                                >
                                    Редактировать
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<DeleteIcon />}
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
                                mt: { xs: 2, md: 0 },
                            }}
                        >
                            <CardMedia
                                component="img"
                                image={book.cover_image || defaultCover}
                                alt={book.title}
                                sx={{
                                    width: 240, // Фиксированная ширина
                                    height: 320, // Фиксированная высота
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
                        <Alert severity="error" sx={{ mb: 2 }}>
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
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Typography variant="h6" gutterBottom>
                                Список Глав:
                            </Typography>
                            {/* ОДНА кнопка - в зависимости от состояния (все ли раскрыты) */}
                            <Tooltip title={allChaptersExpanded ? 'Свернуть все' : 'Развернуть все'}>
                                <IconButton onClick={handleToggleAll} aria-label="toggle all">
                                    {allChaptersExpanded ? (
                                        <ExpandLessIcon sx={{ borderRadius: 2, boxShadow: 6 }} />
                                    ) : (
                                        <ExpandMoreIcon sx={{ borderRadius: 2, boxShadow: 6 }} />
                                    )}
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <List sx={{ maxHeight: 350, overflow: 'auto' }}>
                            {memoizedChapters ? (
                                memoizedChapters
                            ) : (
                                <Typography>Главы отсутствуют.</Typography>
                            )}
                        </List>
                    </Box>

                    {/* Кнопка Назад */}
                    <Button component={RouterLink} to="/booklist" variant="outlined" color="primary" sx={{ mt: 2 }}>
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
                </>
            )}
        </Container>
    );
};
