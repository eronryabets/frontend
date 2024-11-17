import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Box, Button, DialogActions,
} from '@mui/material';
import { VolumeUp as VolumeUpIcon, Stop as StopIcon, Close as CloseIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
// import { addWordToDictionary } from '../../redux/slices/dictionarySlice';

interface TranslationDialogProps {
    open: boolean;
    onClose: () => void;
    selectedText: string;
    translation: string;
    translationLoading: boolean;
    translationError: string | null;
    sourceLanguage: string;
}

export const TranslationDialog: React.FC<TranslationDialogProps> = ({
    open,
    onClose,
    selectedText,
    translation,
    translationLoading,
    translationError,
    sourceLanguage,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

    useEffect(() => {
        // Останавливаем озвучку при закрытии диалога
        if (!open && isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [open, isSpeaking]);

    const handleAddToDictionary = () => {
        if (selectedText && translation) {
            // dispatch(addWordToDictionary({ word: selectedText, translation })); // TODO
            onClose();
        }
    };

    const handleSpeak = () => {
        if (!isSpeaking) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(selectedText);
                utterance.lang = sourceLanguage;

                utterance.onstart = () => {
                    setIsSpeaking(true);
                };

                utterance.onend = () => {
                    setIsSpeaking(false);
                };

                utterance.onerror = () => {
                    setIsSpeaking(false);
                };

                window.speechSynthesis.speak(utterance);
            } else {
                alert('Ваш браузер не поддерживает Web Speech API.');
            }
        } else {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="translation-dialog-title"
            aria-describedby="translation-dialog-description"
            maxWidth="sm"
            fullWidth
            // Добавляем onMouseUp с stopPropagation для предотвращения всплытия
            onMouseUp={(e) => e.stopPropagation()}
        >
            {/* Заголовок с кнопкой озвучивания и крестиком для закрытия */}
            <DialogTitle
                id="translation-dialog-title"
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box display="flex" alignItems="center">
                    <Typography variant="h6" component="div">
                        Перевод
                    </Typography>
                    <Tooltip title={isSpeaking ? "Остановить озвучивание" : "Озвучить текст"}>
                        <IconButton
                            onClick={handleSpeak}
                            color={isSpeaking ? "secondary" : "primary"}
                            aria-label="speak text"
                            sx={{ ml: 1 }}
                        >
                            {isSpeaking ? <StopIcon /> : <VolumeUpIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>
                <Tooltip title="Закрыть">
                    <IconButton onClick={onClose} aria-label="close" size="large">
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
            </DialogTitle>

            <DialogContent dividers>
                {translationLoading && (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
                        <CircularProgress />
                    </Box>
                )}
                {translationError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {translationError}
                    </Alert>
                )}
                {translation && (
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            {selectedText}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {translation}
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>

                <Button onClick={handleAddToDictionary} color="primary" variant="contained">
                    Добавить в словарь
                </Button>

                {/*<Button onClick={onClose} color="primary" variant="outlined">*/}
                {/*    Закрыть*/}
                {/*</Button>*/}

            </DialogActions>
        </Dialog>
    );
};

export default TranslationDialog;
