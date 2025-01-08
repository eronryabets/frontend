
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchWords, setCurrentPage, setDictionaryId, setSearchTerm } from '../../../redux/slices/wordsSlice';
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
    Avatar,
    Button,
    Chip,
    Snackbar,
    Alert,
    TextField,
} from '@mui/material';
import defaultCover from '../../../assets/default_word_image.jpg';
import MapsUgcIcon from '@mui/icons-material/MapsUgc';
import EditIcon from '@mui/icons-material/Edit';
import AddWordModal from "../AddWordModal/AddWordModal";
import EditWordModal from "../EditWordModal/EditWordModal";
import { MyIconButton, SpeechButton } from "../../UtilityComponents";

/**
 * Компонент отображения списка слов в словаре с поиском.
 */
const WordsList: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Получение ID словаря из URL
    const dispatch = useDispatch<AppDispatch>();
    const {
        words,
        loading,
        error,
        currentPage,
        totalPages,
        dictionaryId,
        search,
    } = useSelector((state: RootState) => state.words);
    const [searchParams, setSearchParams] = useSearchParams();

    // Локальное состояние для ввода поиска
    const [searchInput, setSearchInput] = useState(search || '');

    // Состояния модальных окон
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editWordData, setEditWordData] = useState<null | {
        id: string;
        word: string;
        translation: string;
        tags: { id: string; name: string }[]; // Убедись, что теги содержат id
        image_path: string | null;
        progress: number;
    }>(null);

    // Состояния для Snackbar уведомлений
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Эффект для установки ID словаря и текущей страницы при изменении URL
    useEffect(() => {
        if (id) {
            if (dictionaryId !== id) {
                dispatch(setDictionaryId(id));
            }
            const page = parseInt(searchParams.get('page') || '1', 10);
            dispatch(setCurrentPage(page));
            const searchTerm = searchParams.get('search') || '';
            dispatch(setSearchTerm(searchTerm));
            setSearchInput(searchTerm);
        }
    }, [dispatch, id, searchParams, dictionaryId]);

    // Эффект для загрузки слов при изменении ID словаря, страницы или поиска
    useEffect(() => {
        if (id && dictionaryId) {
            dispatch(fetchWords({ dictionaryId: id, page: currentPage, search }));
            // Обновление параметров URL
            const params: any = { page: currentPage.toString() };
            if (search) {
                params.search = search;
            }
            setSearchParams(params);
        }
    }, [dispatch, id, dictionaryId, currentPage, search, setSearchParams]);

    /**
     * Обработчик смены страницы пагинации.
     */
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        dispatch(setCurrentPage(value));
    };

    /**
     * Открывает модальное окно добавления слова.
     */
    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    /**
     * Закрывает модальное окно добавления слова.
     */
    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    };

    /**
     * Открывает модальное окно редактирования слова с данными выбранного слова.
     */
    const handleOpenEditModal = (word: any) => {
        setEditWordData({
            id: word.id,
            word: word.word,
            translation: word.translation,
            tags: word.tags,
            image_path: word.image_path,
            progress: word.progress,
        });
        setIsEditModalOpen(true);
    };

    /**
     * Закрывает модальное окно редактирования слова и сбрасывает данные.
     */
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditWordData(null);
    };

    // Получение текущего языка словаря из состояния Redux
    const currentDictionary = useSelector((state: RootState) =>
        state.dictionaries.dictionaries.find((dict) => dict.id === dictionaryId)
    );
    const language = currentDictionary?.language || 'en-US'; // Значение по умолчанию

    /**
     * Обработчик успешного удаления слова.
     */
    const handleDeleteSuccess = () => {
        handleCloseEditModal();
        // Отображение сообщения об успешном удалении
        setSnackbarMessage('Слово успешно удалено.');
        setSnackbarOpen(true);
    };

    /**
     * Закрывает Snackbar уведомление.
     */
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    /**
     * Обработчик изменения значения в поле поиска.
     */
    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    /**
     * Обработчик отправки поиска.
     */
    const handleSearch = () => {
        // Отправляем действие установки поискового запроса
        dispatch(setSearchTerm(searchInput.trim()));
    };

    /**
     * Обработчик нажатия Enter в поле поиска.
     */
    const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    // Отображение индикатора загрузки
    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    // Отображение ошибки
    if (error) return <Typography color="error" align="center" mt={4}>{error}</Typography>;

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Слова в словаре
            </Typography>
            <Box sx={{ pl: 2, pb: 2, display: 'flex', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<MapsUgcIcon />}
                    sx={{ mr: 2 }}
                    onClick={handleOpenAddModal}
                >
                    Добавить слово
                </Button>

                {/* Поле ввода поиска */}
                <TextField
                    label="Поиск слов"
                    variant="outlined"
                    size="small"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onKeyPress={handleSearchKeyPress}
                    sx={{ mr: 2, width: '300px' }}
                />
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSearch}
                >
                    Поиск
                </Button>
            </Box>
            {words && words.length > 0 ? (
                <Box>
                    <Table sx={{ minWidth: 650 }} aria-label="words table">
                        <TableHead>
                            <TableRow>
                                <TableCell><strong></strong></TableCell>
                                <TableCell><strong>Termin</strong></TableCell>
                                <TableCell><strong>Translate</strong></TableCell>
                                <TableCell><strong>Count</strong></TableCell>
                                <TableCell><strong>Progress</strong></TableCell>
                                <TableCell><strong>Теги</strong></TableCell>
                                <TableCell><strong>Added</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {words.map((word) => (
                                <TableRow
                                    key={word.id}
                                    sx={{
                                        transition: 'background-color 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 255, 0.05)', // Легкий синий оттенок
                                            boxShadow: '0px 4px 20px rgba(0, 0, 255, 0.1)',
                                        },
                                        // Плавный эффект для картинки при наведении на строку
                                        '&:hover img': {
                                            transform: 'scale(1.05)', // Увеличиваем картинку
                                            boxShadow: '0 0 20px rgba(0, 0, 255, 0.5)',
                                            filter: 'brightness(1.1) contrast(1.1)',
                                        }
                                    }}
                                >
                                    {/* Изображение слова */}
                                    <TableCell>
                                        <Avatar
                                            src={word.image_path ? word.image_path : defaultCover}
                                            alt={word.word}
                                            sx={{ width: 60, height: 60, borderRadius: 4 }}
                                        />
                                    </TableCell>

                                    {/* Название слова с кнопкой воспроизведения */}
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <SpeechButton
                                                text={word.word}
                                                lang={language} // Динамическое значение
                                            />
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    maxWidth: '50ch',
                                                    whiteSpace: 'normal',
                                                    overflowWrap: 'break-word'
                                                }}
                                            >
                                                {word.word}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* Перевод слова */}
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <MyIconButton
                                                color="primary"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOpenEditModal(word)}>
                                            </MyIconButton>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    maxWidth: '50ch',          // Примерно 50 символов в ширину
                                                    whiteSpace: 'normal',      // Разрешаем перенос на новую строку
                                                    overflowWrap: 'break-word' // Переносим слова, если не помещаются
                                                }}
                                            >
                                                {word.translation}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* Количество повторений */}
                                    <TableCell>
                                        <Typography variant="body2">{word.count}</Typography>
                                    </TableCell>

                                    {/* Прогресс */}
                                    <TableCell>
                                        <Typography variant="body2">{word.progress}</Typography>
                                    </TableCell>

                                    {/* Теги */}
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 1, // Отступы между чипами
                                                mt: 1,
                                            }}
                                        >
                                            {word.tags.length > 0 ?
                                                word.tags.slice(0, 3).map((tag) => (
                                                    <Chip
                                                        key={tag.id}
                                                        label={tag.name}
                                                        variant="outlined"
                                                        color="primary"
                                                        size="small"
                                                    />
                                                ))
                                                : '—'
                                            }
                                            {word.tags.length > 3 && (
                                                <Chip
                                                    label={`+${word.tags.length - 3}`}
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                    </TableCell>

                                    {/* Дата добавления */}
                                    <TableCell>
                                        <Typography variant="body2">{word.created_at.substring(0, 10)}</Typography>
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
            {id && (
                <AddWordModal
                    open={isAddModalOpen}
                    onClose={handleCloseAddModal}
                    dictionaryId={id}
                />
            )}
            {id && editWordData && (
                <EditWordModal
                    open={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    onDeleteSuccess={handleDeleteSuccess} // Передаём callback handleDeleteSuccess
                    dictionaryId={id}
                    wordData={editWordData}
                />
            )}

            {/* Snackbar уведомление */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );

};

export default WordsList;
