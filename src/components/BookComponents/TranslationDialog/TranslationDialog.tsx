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

interface TranslationDialogProps {
    open: boolean;
    onClose: () => void;
    selectedText: string;
    translation: string;
    translationLoading: boolean;
    translationError: string | null;
    sourceLanguage: string;
    onAddToDictionaryClick: (word: string, translation: string) => void;
}

export const TranslationDialog: React.FC<TranslationDialogProps> = ({
    open,
    onClose,
    selectedText,
    translation,
    translationLoading,
    translationError,
    sourceLanguage,
    onAddToDictionaryClick, // <-- Добавлено
}) => {
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

    useEffect(() => {
        if (!open && isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [open, isSpeaking]);

    const handleAddToDictionary = () => {
        if (selectedText && translation) {
            // Вместо dispatch добавим вызов пропа:
            onAddToDictionaryClick(selectedText, translation);
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
            onMouseUp={(e) => e.stopPropagation()}
        >
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
            </DialogActions>
        </Dialog>
    );
};

export default TranslationDialog;
