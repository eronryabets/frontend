import React, {useState, useMemo, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    Container,
    Box,
    Button,
    Typography,
    Snackbar,
    Alert,
    Collapse,
    IconButton,
    Checkbox,
    Dialog,
    DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
    Close as CloseIcon,
    ExpandLessOutlined as ExpandLessOutlinedIcon,
    ExpandMoreOutlined as ExpandMoreOutlinedIcon,
    DeleteForever as DeleteForeverIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';


import {clearTrainingWords, removeWordFromTraining} from '@/redux/slices/trainingSlice';
import {trainingSessions} from "@/utils/index.ts";
import {MyIconButton, TrainingCardGrid} from "@/components/index.ts";
import {RootState} from '@/redux/store';

// Импортируем функцию для подсветки
import {adjustAlpha, getBackgroundColorByProgress} from '@/utils/getBackgroundColorByProgress';

export const TrainingPage: React.FC = () => {
    const dispatch = useDispatch();
    // Получаем список слов, добавленных в тренировку из Redux
    const trainingWords = useSelector((state: RootState) => state.training.words);
    const wordsCount = trainingWords.length;

    // Локальное состояние для Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Локальное состояние для показа/скрытия списка слов
    const [isListOpen, setListOpen] = useState(false);
    // Новое состояние для хранения выбранных слов (по их id)
    const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
    // Состояние для сортировки (asc или desc)
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const [confirmOpen, setConfirmOpen] = useState(false);

    // Мемоизируем отсортированный список слов по прогрессу
    const sortedTrainingWords = useMemo(() => {
        return [...trainingWords].sort((a, b) => {
            return sortOrder === "asc" ? a.progress - b.progress : b.progress - a.progress;
        });
    }, [trainingWords, sortOrder]);

    const handleClearTraining = () => {
        const count = trainingWords.length;
        dispatch(clearTrainingWords());
        setSnackbarMessage(`Очистили ${count} слов(а) из тренировки`);
        setSnackbarOpen(true);
        setSelectedWordIds([]); // очищаем выделение
    };

    const handleSnackbarClose = (
        _event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    // Функция переключения показа списка
    const toggleWordList = () => {
        setListOpen((prev) => !prev);
    };

    // Хендлер для одиночного выбора слова
    const handleSelectWord = (wordId: string) => {
        setSelectedWordIds((prevSelected) => {
            if (prevSelected.includes(wordId)) {
                return prevSelected.filter((id) => id !== wordId);
            } else {
                return [...prevSelected, wordId];
            }
        });
    };

    // Обработчик для чекбокса "Select All"
    const handleSelectAll = () => {
        if (selectedWordIds.length === trainingWords.length) {
            setSelectedWordIds([]);
        } else {
            setSelectedWordIds(trainingWords.map((w) => w.id));
        }
    };

    // Удаление одного слова (по отдельности)
    const handleRemoveWord = (wordId: string) => {
        dispatch(removeWordFromTraining(wordId));
        setSelectedWordIds((prev) => prev.filter((id) => id !== wordId));
    };

    // Обработка bulk удаления выбранных слов
    const handleBulkRemove = async () => {
        selectedWordIds.forEach((id) => {
            dispatch(removeWordFromTraining(id));
        });
        setSnackbarMessage(`Удалили ${selectedWordIds.length} слов(а) из тренировки`);
        setSnackbarOpen(true);
        setSelectedWordIds([]);
        setConfirmOpen(false);
    };

    // Функция для переключения сортировки. При повторном клике меняем направление сортировки
    const toggleSortOrder = useCallback(() => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    }, []);

    // Ограничиваем длину отображаемого слова, если нужно
    const truncateText = (text: string, maxLength = 20) =>
        text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

    return (
        <Container
            sx={{
                mt: 4,
                mb: 4,
                minHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">
                    Тренировка слов: {wordsCount}
                </Typography>

                {/* Кнопка для открытия/закрытия списка слов */}
                <Button variant="contained" color="primary" onClick={toggleWordList}
                        startIcon={
                            isListOpen
                                ? <ExpandLessOutlinedIcon/>
                                : <ExpandMoreOutlinedIcon/>
                        }
                >
                    {isListOpen ? 'Скрыть список слов' : 'Показать список слов'}
                </Button>

                <Button variant="outlined" color="error" onClick={handleClearTraining}>
                    Очистить список тренировки
                </Button>

            </Box>


            {/* Свертывающийся СПИСОК СЛОВ */}
            <Collapse in={isListOpen}>
                <Box data-name="CollapseListWords"
                     sx={{
                         mb: 3,
                         p: 2,
                         border: '1px solid #ccc',
                         borderRadius: 2,
                         maxHeight: '800px',          // Ограничение по высоте
                         overflowY: 'auto',           // Добавление вертикальной прокрутки
                     }}
                >
                    {/* Шапка списка: "Select All" и Bulk кнопка */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        {/* Левая группа: чекбокс, текст, кнопка удаления */}
                        <Box display="flex" alignItems="center">
                            <Checkbox
                                color="primary"
                                onChange={handleSelectAll}
                                checked={selectedWordIds.length === trainingWords.length && trainingWords.length > 0}
                                indeterminate={
                                    selectedWordIds.length > 0 && selectedWordIds.length < trainingWords.length
                                }
                            />
                            <Typography variant="subtitle1">Выбрать все</Typography>
                            <Box ml={2}>
                                <MyIconButton color="primary" onClick={toggleSortOrder}>
                                    {sortOrder === "asc" ? (
                                        <ArrowUpwardIcon fontSize="small"/>
                                    ) : (
                                        <ArrowDownwardIcon fontSize="small"/>
                                    )}
                                </MyIconButton>
                            </Box>
                        </Box>

                        {/* Правая группа: кнопка сортировки */}
                        <Box display="flex" alignItems="center">
                            {selectedWordIds.length > 0 && (
                                <Box ml={2}>
                                    <MyIconButton
                                        color="error"
                                        startIcon={<DeleteForeverIcon/>}
                                        onClick={() => setConfirmOpen(true)}
                                        tooltipTitle="Удалить выбранные слова"
                                        size={"large"}
                                        bgColor="rgba(255,0,0,0.22)"
                                        hoverBgColor="rgba(255,0,0,0.33)"
                                    />
                                </Box>
                            )}
                        </Box>

                    </Box>


                    {trainingWords.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            Нет слов в тренировке.
                        </Typography>
                    ) : (
                        sortedTrainingWords.map((word, index) => (
                            <Box
                                key={word.id}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{
                                    mb: 1,
                                    borderBottom:
                                        index !== trainingWords.length - 1 ? '1px solid #ccc' : 'none',
                                    backgroundColor: adjustAlpha(getBackgroundColorByProgress(word.progress), 0.1),
                                    borderRadius: 1,
                                    p: 1,
                                    transition: 'background-color 0.3s',
                                }}
                            >
                                <Box display="flex" alignItems="center">
                                    <Checkbox
                                        checked={selectedWordIds.includes(word.id)}
                                        onChange={() => handleSelectWord(word.id)}
                                        color="primary"
                                    />
                                    <Typography
                                        variant="body1">
                                        {truncateText(word.word)} – {truncateText(word.translation)}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center">
                                    <Box
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '0.8rem',
                                            backgroundColor: getBackgroundColorByProgress(word.progress),
                                            border: '1px solid black',
                                            mr: 1,
                                        }}
                                    >
                                        {word.progress}
                                    </Box>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveWord(word.id)}
                                        aria-label="Удалить слово"
                                    >
                                        <CloseIcon/>
                                    </IconButton>
                                </Box>
                            </Box>
                        ))
                    )}
                    <Box data-name="CollapseListButton"
                         display="flex"
                         justifyContent="center"
                    >
                        <MyIconButton
                            color="primary"
                            startIcon={<ExpandLessOutlinedIcon/>}
                            onClick={toggleWordList}
                            tooltipTitle="Свернуть список"
                            bgColor="rgba(64,66,75,0.42)"
                            hoverBgColor="rgba(64,66,75,0.9)"
                        />
                    </Box>

                </Box>
            </Collapse>


            {/* КАРТОЧКИ тренировок (пример) */}
            <TrainingCardGrid sessions={trainingSessions}/>

            {/* Snackbar для уведомлений */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            >
                <Alert onClose={handleSnackbarClose} severity="success" sx={{width: '100%'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Диалог подтверждения bulk‑удаления */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Подтверждение удаления</DialogTitle>
                <DialogContent>
                    <Typography>
                        Вы уверены, что хотите удалить {selectedWordIds.length} слов(а)?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleBulkRemove}
                    >
                        Да
                    </Button>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => setConfirmOpen(false)}
                    >
                        Отмена
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default TrainingPage;
