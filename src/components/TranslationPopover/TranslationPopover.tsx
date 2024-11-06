import React from 'react';
import { Popover, Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
// import { addWordToDictionary } from '../../redux/slices/dictionarySlice';

interface TranslationPopoverProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    selectedText: string;
    translation: string;
    translationLoading: boolean;
    translationError: string | null;
}

export const TranslationPopover: React.FC<TranslationPopoverProps> = ({
    anchorEl,
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
            // dispatch(addWordToDictionary({ word: selectedText, translation })); TODO
            onClose();
        }
    };

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <Box sx={{ p: 2, maxWidth: 300 }}>
                {translationLoading && <CircularProgress size={24} />}
                {translationError && <Alert severity="error">{translationError}</Alert>}
                {translation && (
                    <>
                        <Typography variant="subtitle1" gutterBottom>
                            {selectedText}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            {translation}
                        </Typography>
                        <Button variant="contained" color="primary" onClick={handleAddToDictionary}>
                            Добавить в словарь
                        </Button>
                    </>
                )}
            </Box>
        </Popover>
    );
};

export default TranslationPopover;
