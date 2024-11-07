import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    CircularProgress,
    Alert,
    Button,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
// import { addWordToDictionary } from '../../redux/slices/dictionarySlice';

interface TranslationDialogProps {
    open: boolean;
    onClose: () => void;
    selectedText: string;
    translation: string;
    translationLoading: boolean;
    translationError: string | null;
}

export const TranslationDialog: React.FC<TranslationDialogProps> = ({
    open,
    onClose,
    selectedText,
    translation,
    translationLoading,
    translationError,
}) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleAddToDictionary = () => {
        if (selectedText && translation) {
            // dispatch(addWordToDictionary({ word: selectedText, translation })); // TODO
            onClose();
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
        >
            <DialogTitle id="translation-dialog-title">Перевод</DialogTitle>
            <DialogContent dividers>
                {translationLoading && (
                    <CircularProgress />
                )}
                {translationError && (
                    <Alert severity="error">{translationError}</Alert>
                )}
                {translation && (
                    <>
                        <Typography variant="subtitle1" gutterBottom>
                            {selectedText}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            {translation}
                        </Typography>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                {/* <Button onClick={handleAddToDictionary} color="primary" variant="contained">
                    Добавить в словарь
                </Button> */}
                <Button onClick={onClose} color="primary" variant="outlined">
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TranslationDialog;