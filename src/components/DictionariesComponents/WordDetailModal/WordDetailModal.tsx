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
    Alert,
    IconButton, Tooltip
} from '@mui/material';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../../../redux/store';
import {fetchWordById} from '../../../redux/slices/wordsSlice';
import EditWordModal from '../EditWordModal/EditWordModal';
import StopIcon from "@mui/icons-material/Stop";
import VolumeUpIcon from "@mui/icons-material/VolumeUp"; // Предположим, у вас уже есть компонент для редактирования слова

interface WordDetailModalProps {
    open: boolean;
    onClose: () => void;
    wordId: string | null; // Если слова нет, передаём null
}

const WordDetailModal: React.FC<WordDetailModalProps> = ({open, onClose, wordId}) => {
    const dispatch = useDispatch<AppDispatch>();
    const {words, loading, error} = useSelector((state: RootState) => state.words); // или сделайте отдельные поля loadingWord, wordError, если нужно

    // Состояние для открытия/закрытия окна редактирования
    const [isEditOpen, setIsEditOpen] = React.useState(false);

    // Находим слово в стейте
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

    // Озвучка слова :
    const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);

    const handleSpeak = (wordId: string, text: string) => {
        if (!speakingWordId) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-US'; //TODO language from books

                utterance.onstart = () => {
                    setSpeakingWordId(wordId);
                };

                utterance.onend = () => {
                    setSpeakingWordId(null);
                };

                utterance.onerror = () => {
                    setSpeakingWordId(null);
                };

                window.speechSynthesis.speak(utterance);
            } else {
                alert('Ваш браузер не поддерживает Web Speech API.');
            }
        } else {
            // Если уже есть звучащее слово, останавливаем его
            window.speechSynthesis.cancel();
            setSpeakingWordId(null);
        }
    };

    if (!open) {
        return null; // Модалка закрыта — ничего не рендерим
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Информация о слове</DialogTitle>

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
                            <Tooltip
                                title={speakingWordId === word.id ? "Остановить озвучивание" : "Озвучить слово"}>
                                <IconButton
                                    onClick={() => handleSpeak(word.id, word.word)}
                                    color={speakingWordId === word.id ? "secondary" : "primary"}
                                    aria-label="speak text"
                                    sx={{mr: 1}}
                                >
                                    {speakingWordId === word.id ? <StopIcon/> : <VolumeUpIcon/>}
                                </IconButton>
                            </Tooltip>
                        </Box>


                        <Typography variant="subtitle1" sx={{mb: 2}}>
                            Перевод: {word.translation}
                        </Typography>

                        {/* Можно добавить картинку, теги, прогресс и т.д. */}

                        {word.image_path && (
                            <Box sx={{display: 'flex', justifyContent: 'center', mb: 2}}>
                                <img
                                    src={word.image_path}
                                    alt={word.word}
                                    style={{maxWidth: '200px', borderRadius: '8px'}}
                                />
                            </Box>
                        )}

                        {/* Кнопка для редактирования */}
                        <Button variant="outlined" onClick={handleOpenEditModal}>
                            Редактировать
                        </Button>
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Закрыть
                </Button>
            </DialogActions>

            {/* Окно редактирования */}
            {word && (
                <EditWordModal
                    open={isEditOpen}
                    onClose={handleCloseEditModal}
                    dictionaryId={word.dictionary} // если у вас слово содержит .dictionary
                    wordData={{
                        id: word.id,
                        word: word.word,
                        translation: word.translation,
                        tags: word.tags,           // нужно убедиться, что у вас это поле есть
                        image_path: word.image_path,
                        progress: word.progress || 0,
                    }}
                />
            )}
        </Dialog>
    );
};

export default WordDetailModal;
