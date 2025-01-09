import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Chip,
    Tooltip,
    IconButton, Snackbar,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store.ts';
import { fetchWordById, updateWord, deleteWord } from '@/redux/slices/wordsSlice.ts';
import {EditWordModal} from '@/components';
import { MyIconButton, SpeechButton } from '@/components';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import { Stack } from '@mui/material';
import {ProgressBar} from '@/components';
import progressColors from "../../../utils/constants/progressColors.ts";
import {PartialUpdateWordPayload} from "@/types";

interface WordDetailModalProps {
    open: boolean;
    onClose: () => void;
    wordId: string | null; // Если слова нет, передаём null
    language: string;     // Новый проп для динамического языка
    onDeleteSuccess: () => void; // <-- Проброшен из родителя (PageDetail)
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({ open, onClose, wordId, language, onDeleteSuccess }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { words, loading, error } = useSelector((state: RootState) => state.words);

    // Состояние для открытия/закрытия окна редактирования
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Локальное состояние для прогресса и счётчика
    const [localProgress, setLocalProgress] = useState<number>(0);
    const [localCount, setLocalCount] = useState<number>(0);
    const [hasProgressChanged, setHasProgressChanged] = useState<boolean>(false);

    // Находим слово в стейте
    const word = words.find((w) => w.id === wordId);

    // Загружаем слово по ID, если его нет в стейте
    useEffect(() => {
        if (open && wordId && !word) {
            dispatch(fetchWordById(wordId));
        }
    }, [open, wordId, word, dispatch]);

    // Сброс локального состояния при открытии модалки и увеличение count на 1
    useEffect(() => {
        if (word && open) {
            setLocalProgress(word.progress);
            setLocalCount(word.count + 1); // Увеличиваем count на 1 при открытии
            setHasProgressChanged(false);
        }
    }, [word, open]);

    const handleOpenEditModal = () => {
        setIsEditOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditOpen(false);
    };

    // Функция для изменения прогресса и счётчика просмотров
    const handleChangeProgressAndCount = (delta: number) => {
        if (hasProgressChanged) return; // Уже было изменение

        const newProgress = localProgress + delta;
        const newCount = localCount + 1; // Увеличиваем count на 1 при любом изменении

        // Проверка границ
        if (newProgress < 0 || newProgress > 10) return;

        setLocalProgress(newProgress);
        setLocalCount(newCount);
        setHasProgressChanged(true);
    };

    // Функция для закрытия модалки с отправкой изменений
    const handleClose = async () => {
        if (wordId) {
            const updatePayload: PartialUpdateWordPayload = {
                wordId: wordId,
                dictionaryId: word?.dictionary || '',
                count: localCount, // Всегда отправляем обновлённый count
            };
            if (hasProgressChanged) {
                updatePayload.progress = localProgress; // Отправляем progress только если он изменён
            }

            try {
                const resultAction = await dispatch(updateWord(updatePayload));
                if (updateWord.fulfilled.match(resultAction)) {
                    // Успешно обновлено
                } else {
                    // Обработка ошибки обновления
                    console.error(resultAction.payload || 'Не удалось обновить прогресс и счётчик.');
                }
            } catch (err) {
                console.error('Не удалось обновить прогресс и счётчик.', err);
            }
        }
        onClose();
    };

     // Функция, вызываемая при успешном удалении слова
    const handleLocalDeleteSuccess  = () => {
        onClose(); // Закрываем WordDetailModal
        onDeleteSuccess(); // А заодно уведомляем родителя, чтобы он показал Snackbar
    };



    if (!open) {
        return null; // Модалка закрыта — ничего не рендерим
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <DialogTitle>Информация о слове</DialogTitle>
                <MyIconButton
                    color="secondary"
                    startIcon={<CloseIcon/>}
                    onClick={handleClose}/>
            </Box>
            <DialogContent dividers>
                {/* Если идёт загрузка или нет данных */}
                {(!word && loading) && (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
                        <CircularProgress/>
                    </Box>
                )}
                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}
                {/* Если слово загружено */}
                {word && (
                    <>
                        <Box display="flex" alignItems="center">
                            {/* Слово и Озвучка */}
                            <Typography variant="h6">Слово: {word.word}</Typography>
                            <SpeechButton
                                text={word.word}
                                lang={language} // Передаём динамический язык
                            />
                        </Box>

                        <Typography variant="subtitle1" sx={{mb: 2}}>
                            Перевод: {word.translation}
                        </Typography>

                        {/* ТЕГИ */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
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
                                        size="small"/>
                                ))
                                : '—'}
                            {word.tags.length > 3 && (
                                <Chip
                                    label={`+${word.tags.length - 3}`}
                                    variant="outlined"
                                    color="primary"
                                    size="small"/>
                            )}
                        </Box>

                        {/* IMAGE */}
                        {word.image_path && (
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mb: 2,
                                mt: 2
                            }}>
                                <img
                                    src={word.image_path}
                                    alt={word.word}
                                    style={{maxWidth: '200px', borderRadius: '8px'}}/>
                            </Box>
                        )}

                        {/* Кнопки для изменения прогресса и счётчика просмотров */}
                        <Box display="flex" alignItems="center" justifyContent="center" sx={{mb: 2}}>
                            <Tooltip title="Уменьшить прогресс и счётчик">
                                <span>
                                    <IconButton
                                        onClick={() => handleChangeProgressAndCount(-1)}
                                        disabled={hasProgressChanged || localProgress <= 0 || loading}
                                        color="primary"
                                        aria-label="Уменьшить прогресс и счётчик"
                                    >
                                        <ArrowCircleDownIcon/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Typography variant="body1" sx={{mx: 2, color: progressColors[localProgress]}}>
                                {localProgress}
                            </Typography>
                            <Tooltip title="Увеличить прогресс и счётчик">
                                <span>
                                    <IconButton
                                        onClick={() => handleChangeProgressAndCount(1)}
                                        disabled={hasProgressChanged || localProgress >= 10 || loading}
                                        color="primary"
                                        aria-label="Увеличить прогресс и счётчик"
                                    >
                                        <ArrowCircleUpIcon/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>

                        {/* Визуальная шкала прогресса с цветовой индикацией */}
                        <Box display="flex" alignItems="center" sx={{mb: 2, mt: 2}}>
                            <CastForEducationIcon sx={{mr: 1, color: 'action.active'}}/>
                            <ProgressBar
                                progressAmount={10}
                                value={localProgress}
                                size={'medium'}
                                spacing={0}/>
                        </Box>

                        <Box data-name="secondData"
                             sx={{
                                 display: 'flex',
                                 alignItems: 'center',
                             }}>
                            <Stack direction="row" spacing={3}>

                                {/* View */}
                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    <VisibilityIcon sx={{mr: 1, color: 'action.active'}}/>
                                    <Typography variant="body1">{localCount}</Typography>
                                </Box>

                                {/* Added */}
                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    <CalendarMonthIcon sx={{mr: 1, color: 'action.active'}}/>
                                    <Typography
                                        variant="body1">{new Date(word.created_at).toLocaleDateString()}</Typography>
                                </Box>

                            </Stack>
                        </Box>

                    </>
                )}
            </DialogContent>

            <DialogActions>
                {/* Кнопка для редактирования */}
                <Button variant="outlined" onClick={handleOpenEditModal} startIcon={<EditIcon/>}>
                    Редактировать
                </Button>
                <Button onClick={handleClose} color="primary">
                    Закрыть
                </Button>
            </DialogActions>

            {/* Окно редактирования */}
            {word && (
                <EditWordModal
                    open={isEditOpen}
                    onClose={handleCloseEditModal}
                    onDeleteSuccess={handleLocalDeleteSuccess} // Передаём callback //
                    dictionaryId={word.dictionary}
                    wordData={{
                        id: word.id,
                        word: word.word,
                        translation: word.translation,
                        tags: word.tags,
                        image_path: word.image_path,
                        progress: word.progress || 0,
                    }}/>
            )}
        </Dialog>
    );

};

export default WordDetailModal;
