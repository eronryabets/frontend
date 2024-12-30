import React, {useEffect, useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    CircularProgress,
    Alert, Chip, Tooltip,
} from '@mui/material';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../../../redux/store';
import {fetchWordById} from '../../../redux/slices/wordsSlice';
import EditWordModal from '../EditWordModal/EditWordModal';
import {MyIconButton, SpeechButton} from '../../UtilityComponents';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import {Stack} from '@mui/material';
import ProgressBar from "../../UtilityComponents/ProgressBar/ProgressBar";

interface WordDetailModalProps {
    open: boolean;
    onClose: () => void;
    wordId: string | null; // Если слова нет, передаём null
    language: string;     // Новый проп для динамического языка
}

const WordDetailModal: React.FC<WordDetailModalProps> = ({open, onClose, wordId, language}) => {
    const dispatch = useDispatch<AppDispatch>();
    const {words, loading, error} = useSelector((state: RootState) => state.words); // или сделайте отдельные поля loadingWord, wordError, если нужно

    // Состояние для открытия/закрытия окна редактирования
    const [isEditOpen, setIsEditOpen] = React.useState(false);

    // Находим слово в стейте TODO map?
    const word = words.find((w) => w.id === wordId);

    // Загружаем слово по ID, если его нет в стейте
    useEffect(() => {
        if (open && wordId && !word) {
            // Если модалка открылась, есть wordId, но слова нет в стейте — грузим
            dispatch(fetchWordById(wordId));
        }
    }, [open, wordId, word, dispatch]);

    const handleOpenEditModal = () => {
        setIsEditOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditOpen(false);
    };

    if (!open) {
        return null; // Модалка закрыта — ничего не рендерим
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <Box sx={{
                // m: 0,
                // p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <DialogTitle>Информация о слове : </DialogTitle>
                <MyIconButton
                    color="secondary"
                    startIcon={<CloseIcon/>}
                    onClick={onClose}>
                </MyIconButton>
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
                            {/*Слово и Озвучка*/}
                            <Typography variant="h6">Слово: {word.word}</Typography>
                            <SpeechButton
                                text={word.word}
                                lang={language} // Передаём динамический язык
                            />
                        </Box>


                        <Typography variant="subtitle1" sx={{mb: 2}}>
                            Перевод: {word.translation}
                        </Typography>

                        {/*ТЕГИ*/}
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                // justifyContent: 'center',
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

                        {/*IMAGE*/}
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
                                    style={{maxWidth: '200px', borderRadius: '8px'}}
                                />
                            </Box>
                        )}

                        {/* Визуальная шкала прогресса */}
                        {/*<Tooltip title={'Прогресс изучения'}>*/}
                        <Box display="flex" alignItems="center" sx={{ mb: 2, mt: 2 }}>
                            <CastForEducationIcon sx={{ mr: 1, color: 'action.active' }} />
                            <ProgressBar
                                progressAmount={10}
                                value={word.progress}
                                size={'medium'}
                                spacing={0}
                            />
                        </Box>
                            {/*</Tooltip>*/}

                        <Box data-name="secondData"
                             sx={{
                                 display: 'flex',
                                 alignItems: 'center',
                             }}>
                            <Stack direction="row" spacing={3}>

                                {/*View*/}
                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    <VisibilityIcon sx={{mr: 1, color: 'action.active'}}/>
                                    <Typography variant="body1">{word.count}</Typography>
                                </Box>

                                {/*Added*/}
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
                <Button onClick={onClose} color="primary">
                    Закрыть
                </Button>
            </DialogActions>

            {/* Окно редактирования */}
            {word && (
                <EditWordModal
                    open={isEditOpen}
                    onClose={handleCloseEditModal}
                    dictionaryId={word.dictionary}
                    wordData={{
                        id: word.id,
                        word: word.word,
                        translation: word.translation,
                        tags: word.tags,
                        image_path: word.image_path,
                        progress: word.progress || 0,
                    }}
                />
            )}
        </Dialog>
    );
};

export default WordDetailModal;
