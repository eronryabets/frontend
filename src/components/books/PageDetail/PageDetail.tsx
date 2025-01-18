import React, {useEffect, useState, useMemo} from 'react';
import {useParams, useNavigate, Link as RouterLink} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';

import {RootState, AppDispatch} from '@/redux/store.ts';
import {fetchPageByNumber} from '@/redux/slices/pageSlice.ts';
import {fetchBookDetails} from '@/redux/slices/bookSlice.ts';

import {useTextSelection} from '../../../hooks';

import {
    TextToSpeech,
    TextRenderer,
    TranslationDialog,
    AddWordModal,
    WordDetailModal
} from '@/components';


import {getBackgroundColorByProgress} from '@/utils/getBackgroundColorByProgress.ts';

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
    Tooltip,
    Drawer,
    Slider,
    Snackbar,
} from '@mui/material';

import {
    Book,
    DisplaySettings as DisplaySettingsIcon
} from '@mui/icons-material';
import {INVISIBLE_COLOR} from "@/utils/constants/constants.ts";

export const PageDetail: React.FC = () => {
    const {bookId, pageNumber} = useParams<{
        bookId: string;
        chapterId: string;
        pageNumber: string;
    }>();

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const theme = useTheme();

    const {page, loading, error} = useSelector((state: RootState) => state.page);
    const {books} = useSelector((state: RootState) => state.books);
    const {
        translation,
        loading: translationLoading,
        error: translationError,
    } = useSelector((state: RootState) => state.translation);

    // Слова с прогрессом из wordsProgressSlice
    const {words: wordsProgress} = useSelector((state: RootState) => state.wordsProgress);

    const currentPageNumber = Number(pageNumber);
    const book = books.find((b) => b.id === bookId);
    // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const {
        selectedText,
        handleTextClick,
        handleWordClick,
        handlePopoverClose,
    } = useTextSelection(book ? book.language : 'en');

    const findChapterByPageNumber = (pageNumber: number) => {
        return book?.chapters.find((c) => {
            return pageNumber >= c.start_page_number && pageNumber <= c.end_page_number;
        });
    };

    const chapter = findChapterByPageNumber(currentPageNumber);

    useEffect(() => {
        if (!book) {
            dispatch(fetchBookDetails(bookId!));
        }
    }, [dispatch, bookId, book]);

    useEffect(() => {
        if (book && chapter) {
            dispatch(fetchPageByNumber({chapterId: chapter.id, pageNumber: currentPageNumber}));
        } else if (book) {
            const newChapter = findChapterByPageNumber(currentPageNumber);
            if (newChapter) {
                navigate(`/books/${bookId}/chapters/${newChapter.id}/pages/${currentPageNumber}`);
            } else {
                console.error('Chapter not found for page number:', currentPageNumber);
            }
        }
    }, [dispatch, book, chapter, currentPageNumber, navigate, bookId]);

    // Загружаем слова с прогрессом при первом заходе, если они не загружены
    // const dictionary_id = useSelector(
    //   (state: RootState) => state.userInfo.userData.settings?.current_dictionary?.dictionary_id
    // );

    // Это уже делает AuthListener
    // useEffect(() => {
    //   if (bookId && dictionary_id) {
    //     // Всегда вызываем fetchWordsProgress при смене dictionary_id
    //     dispatch(fetchWordsProgress({ dictionaryId: dictionary_id }));
    //   }
    // }, [dispatch, bookId, dictionary_id]);

    const totalPagesInBook = book?.total_pages || 0;

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        const newPageNumber = value;
        const newChapter = findChapterByPageNumber(newPageNumber);

        if (newChapter) {
            navigate(`/books/${bookId}/chapters/${newChapter.id}/pages/${newPageNumber}`);
        } else {
            console.error('Chapter not found for page number:', newPageNumber);
        }
    };

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedWordForModal, setSelectedWordForModal] = useState('');
    const [selectedTranslationForModal, setSelectedTranslationForModal] = useState('');

    const isDialogOpen = Boolean(selectedText && translation);

    const handleAddToDictionaryClick = (word: string, trans: string) => {
        handlePopoverClose();
        setSelectedWordForModal(word);
        setSelectedTranslationForModal(trans);
        setIsAddModalOpen(true);
    };

    // Создадим Map для быстрого доступа к progress и highlight_disabled по слову
    const wordsMap = useMemo(() => {
        const map = new Map<string, { progress: number; highlight_disabled: boolean }>();
        wordsProgress.forEach((w) => {
            map.set(w.word.toLowerCase(), {
                progress: w.progress,
                highlight_disabled: w.highlight_disabled,
            });
        });
        return map;
    }, [wordsProgress]);

    // Функция подсветки слова
    const highlightWord = (word: string): React.CSSProperties | undefined => {
        const wordData = wordsMap.get(word.toLowerCase());
        if (wordData !== undefined) {
            if (wordData.highlight_disabled) {
                // Если подсветка отключена, возвращаем нужный цвет (например, полупрозрачный фиолетовый)
                return {backgroundColor: INVISIBLE_COLOR};
            }
            // Иначе возвращаем цвет, рассчитанный по progress
            return {backgroundColor: getBackgroundColorByProgress(wordData.progress)};
        }
        return undefined;
    };

    // State для модального окна настроек и размера шрифта
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [fontSizeValue, setFontSizeValue] = useState(2); // Значение по умолчанию: 1.0 + (2-1)*0.1 = 1.1rem

    const handleSettingsOpen = () => setIsSettingsOpen(true);
    const handleSettingsClose = () => setIsSettingsOpen(false);

    const handleFontSizeChange = (_event: Event, newValue: number | number[]) => {
        if (typeof newValue === 'number') {
            setFontSizeValue(newValue);
        }
    };

    // Рассчитываем размер шрифта в rem
    const fontSizeRem = 1.0 + (fontSizeValue - 1) * 0.1;

    // Новые состояния для WordDetailModal
    const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
    const [isWordDetailOpen, setIsWordDetailOpen] = useState(false);

    // Новый обработчик клика по слову
    const handleWordClickNew = (event: React.MouseEvent<HTMLSpanElement>, word: string) => {
        // Находим слово в wordsProgress для получения его id
        const wordProgress = wordsProgress.find(w => w.word.toLowerCase() === word.toLowerCase());

        if (wordProgress) {
            // Если слово подсвечено, открываем WordDetailModal
            setSelectedWordId(wordProgress.id);
            setIsWordDetailOpen(true);
        } else {
            // Если слово не подсвечено, продолжаем с TranslationDialog
            handleWordClick(event, word);
        }
    };

    // Управление состоянием Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity]
        = useState<'success' | 'error' | 'info' | 'warning'>('success');

    // Обработчик успешного удаления слова
    const handleDeleteSuccess = (severity: 'success' | 'error') => {
        // setSnackbarMessage('Слово успешно удалено.');
        // setSnackbarOpen(true);
        // setIsWordDetailOpen(false); // Закрываем WordDetailModal

        // Можем поставить любое сообщение
        if (severity === 'success') {
            setSnackbarMessage('Слово успешно удалено.');
            setSnackbarSeverity('success');
        } else {
            // для ошибки другое сообщение:
            setSnackbarMessage('Не удалось удалить слово!');
            setSnackbarSeverity('error');
        }
        setSnackbarOpen(true);
    };

    // Закрытие Snackbar
    const handleSnackbarClose = (
        _event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    // ====== Для ограничения запроса на перевод выделенного текста 999 символов ======
    useEffect(() => {
        if (selectedText && selectedText.length > 999) {
            // Сбрасываем выделение/popover, чтобы не открывать TranslationDialog
            handlePopoverClose();

            // Показываем сообщение об ошибке
            setSnackbarMessage('Невозможно выделить более 999 символов для перевода.');
            setSnackbarSeverity('error');     // <-- Указываем что это ошибка, красный цвет или другой
            setSnackbarOpen(true);
        }
    }, [selectedText, handlePopoverClose]);


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
        <Container
            data-name="mainContainer"
            sx={{
                position: 'relative',
                paddingTop: '30px',
                paddingBottom: '30px',
            }}
            onMouseUp={handleTextClick}
        >
            {/* Заголовок и кнопки */}
            <Box
                data-name="wraperBox1"
                display="flex"
                alignItems="center"
                justifyContent="center" // можно изменить на 'space-between' при необходимости
                mb={2}
            >
                <Box data-name="chapterNameBox" display="flex" alignItems="center">
                    {chapter && (
                        <Typography variant="h5" gutterBottom>
                            {chapter.chapter_title}
                        </Typography>
                    )}
                </Box>
                <Box display="flex" alignItems="center">
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
                    <Tooltip title="Настройки отображения">
                        <IconButton
                            color="primary"
                            onClick={handleSettingsOpen}
                            aria-label="Настройки отображения"
                        >
                            <DisplaySettingsIcon/>
                        </IconButton>
                    </Tooltip>
                </Box>
                {/* Текст озвучивания */}
                <Tooltip title="Озвучивание текста">
                    <TextToSpeech text={page.content} bookLanguage={book.language}/>
                </Tooltip>
            </Box>

            {/* Обёрточный Box для центрирования pageContentBox */}
            <Box display="flex" justifyContent="center" mb={4}>
                <Box
                    data-name="pageContentBox"
                    sx={{
                        p: 3,
                        background: theme.customBackground.paperGradient,
                        boxShadow: 3,
                        borderRadius: 2,
                        mb: 4,
                        whiteSpace: 'pre-line',
                        display: 'block', // Блочный элемент
                        margin: '0 auto', // Центрирование по горизонтали
                        maxWidth: '800px', // Максимальная ширина
                        width: '100%', // Ширина до максимума
                        textAlign: 'left', // Выравнивание текста внутри по левому краю
                    }}
                >
                    <Typography
                        variant="body1"
                        sx={{
                            fontWeight: 350,
                            fontSize: `${fontSizeRem}rem`, // Применение динамического размера шрифта
                            lineHeight: 1.8,
                            textAlign: 'left',
                            whiteSpace: 'pre-wrap', //Теперь несколько пробелов в начале строки или табы не будут схлопываться.
                        }}
                    >
                        <TextRenderer
                            content={page.content}
                            onWordClick={handleWordClickNew} // Используем новый обработчик
                            highlightWord={highlightWord}
                        />
                    </Typography>
                </Box>
            </Box>

            {/* Пагинация внизу страницы */}
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                mb={4}
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

            {/* Остальной контент */}
            <TranslationDialog
                open={isDialogOpen}
                onClose={handlePopoverClose}
                selectedText={selectedText}
                translation={translation}
                translationLoading={translationLoading}
                translationError={translationError}
                sourceLanguage={book.language.slice(0, 2)}
                onAddToDictionaryClick={handleAddToDictionaryClick}
            />

            <AddWordModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                dictionaryId={bookId!}
                initialWord={selectedWordForModal}
                initialTranslation={selectedTranslationForModal}
            />

            {/* Drawer для настроек отображения */}
            <Drawer
                anchor="left"
                open={isSettingsOpen}
                onClose={handleSettingsClose}
            >
                <Box
                    sx={{
                        width: 250,
                        padding: theme.spacing(2),
                    }}
                    role="presentation"
                >
                    <Typography variant="h6" gutterBottom>
                        Настройки отображения
                    </Typography>
                    <Typography gutterBottom>
                        Размер текста
                    </Typography>
                    <Slider
                        value={fontSizeValue}
                        min={1}
                        max={7}
                        step={1}
                        marks={[
                            {value: 1, label: '1'},
                            {value: 2, label: '2'},
                            {value: 3, label: '3'},
                            {value: 4, label: '4'},
                            {value: 5, label: '5'},
                            {value: 6, label: '6'},
                            {value: 7, label: '7'},
                        ]}
                        valueLabelDisplay="on"
                        onChange={handleFontSizeChange}
                    />
                    <Typography variant="body2" sx={{mt: 2}}>
                        Текущий размер: {fontSizeRem.toFixed(1)}rem
                    </Typography>
                </Box>
            </Drawer>

            {/* WordDetailModal */}
            <WordDetailModal
                open={isWordDetailOpen}
                onClose={() => setIsWordDetailOpen(false)}
                wordId={selectedWordId}
                language={book.language} // Передаём язык книги
                onDeleteSuccess={handleDeleteSuccess}/>

            {/* Snackbar для уведомлений */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                // message={snackbarMessage}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
                <Alert severity={snackbarSeverity} sx={{width: '100%'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

        </Container>
    );
};

export default PageDetail;
