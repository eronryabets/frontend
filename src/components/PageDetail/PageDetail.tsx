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
    Pagination,
    Tooltip, useMediaQuery,
} from '@mui/material';
import {Book} from '@mui/icons-material';
import {RootState, AppDispatch} from '../../redux/store';
import {fetchPageByNumber} from '../../redux/slices/pageSlice';
import {fetchBookDetails} from '../../redux/slices/bookSlice';
import TextToSpeech from "../TextToSpeech/TextToSpeech";

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

    // Найти книгу из состояния
    const book = books.find((b) => b.id === bookId);

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Функция для определения главы по номеру страницы
    const findChapterByPageNumber = (pageNumber: number) => {
        return book?.chapters.find((c) => {
            return pageNumber >= c.start_page_number && pageNumber <= c.end_page_number;
        });
    };

    // Определяем текущую главу
    const chapter = findChapterByPageNumber(currentPageNumber);

    useEffect(() => {
        // Если книга не найдена, загрузить детали книги
        if (!book) {
            dispatch(fetchBookDetails(bookId!));
        }
    }, [dispatch, bookId, book]);

    useEffect(() => {
        if (book && chapter) {
            dispatch(fetchPageByNumber({chapterId: chapter.id, pageNumber: currentPageNumber}));
        } else if (book) {
            // Если глава не найдена для текущей страницы, попробуем найти её
            const newChapter = findChapterByPageNumber(currentPageNumber);
            if (newChapter) {
                navigate(`/books/${bookId}/chapters/${newChapter.id}/pages/${currentPageNumber}`);
            } else {
                console.error('Chapter not found for page number:', currentPageNumber);
            }
        }
    }, [dispatch, book, chapter, currentPageNumber, navigate, bookId]);

    // Расчёт общего количества страниц в книге
    const totalPagesInBook = book?.total_pages || 0;

    //Пагинация
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        const newPageNumber = value;
        const newChapter = findChapterByPageNumber(newPageNumber);

        if (newChapter) {
            navigate(`/books/${bookId}/chapters/${newChapter.id}/pages/${newPageNumber}`);
        } else {
            console.error('Chapter not found for page number:', newPageNumber);
        }
    };

    const handlePreviousPage = () => {
        if (currentPageNumber > 1) {
            const newPageNumber = currentPageNumber - 1;
            const newChapter = findChapterByPageNumber(newPageNumber);

            if (newChapter) {
                navigate(`/books/${bookId}/chapters/${newChapter.id}/pages/${newPageNumber}`);
            } else {
                console.error('Chapter not found for page number:', newPageNumber);
            }
        }
    };

    const handleNextPage = () => {
        if (currentPageNumber < totalPagesInBook) {
            const newPageNumber = currentPageNumber + 1;
            const newChapter = findChapterByPageNumber(newPageNumber);

            if (newChapter) {
                navigate(`/books/${bookId}/chapters/${newChapter.id}/pages/${newPageNumber}`);
            } else {
                console.error('Chapter not found for page number:', newPageNumber);
            }
        }
    };

    if (loading || !book) {
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
                <Button
                    component={RouterLink}
                    to={`/book/${bookId}`}
                    variant="contained"
                    color="primary"
                    sx={{mt: 2}}
                >
                    Вернуться к книге
                </Button>
            </Container>
        );
    }

    return (
        <Container sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            // overflow: 'hidden', // Предотвращает переполнение
            overflowY: 'auto', // Добавляет вертикальную прокрутку при переполнении
            position: 'relative',
            paddingTop: '30px',
            paddingBottom: isMobile ? '0px' : '80px', // Отступ для пагинации
        }}
        >
            {/* Заголовок и Кнопка Перехода к Книге */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                    {chapter && (
                        <Typography variant="h5" gutterBottom>
                            {chapter.chapter_title}
                        </Typography>
                    )}
                </Box>
                <Tooltip title="Вернуться к книге">
                    <IconButton
                        color="primary"
                        component={RouterLink}
                        to={`/book/${bookId}`}
                        aria-label="Вернуться к книге"
                    >
                        <Book/>
                    </IconButton>
                </Tooltip>

                {/*<Tooltip title="Озвучивание текста">*/}
                {/*    <TextToSpeech text={page.content}/>*/}
                {/*</Tooltip>*/}

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
                    flexGrow: 1, // Занимает всё доступное пространство
                    overflowY: 'auto', // Добавляет вертикальную прокрутку при переполнении
                    // paddingBottom: '80px', // Добавляем нижний отступ, равный высоте пагинации
                    // minHeight: '80vh',
                }}
            >
                <Typography variant="body1">{page.content}</Typography>
            </Box>

            {/* Пагинация по всей книге */}
            <Box display="flex"
                 sx={{
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                     mb: isMobile ? 4 : 0, // Margin bottom for mobile
                     [theme.breakpoints.up('sm')]: {
                         position: 'fixed',
                         bottom: 20,
                         left: 0,
                         right: 0,
                         padding: '16px',
                         // background: 'rgba(255, 255, 255, 0.8)',
                         zIndex: 1000,
                     },
                 }}
            >
                <Pagination
                    count={totalPagesInBook}
                    page={currentPageNumber}
                    onChange={handlePageChange}
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                />
            </Box>
        </Container>
    );
};
