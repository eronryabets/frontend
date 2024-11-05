import React from 'react';
import { Popover, Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { clearTranslation } from '../../redux/slices/translationSlice';

interface TranslationPopoverProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    selectedText: string;
}

const TranslationPopover: React.FC<TranslationPopoverProps> = ({ anchorEl, open, onClose, selectedText }) => {
    const { translation, loading, error } = useSelector((state: RootState) => state.translation);


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
                {loading && <CircularProgress size={24} />}
                {error && <Alert severity="error">{error}</Alert>}
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
            </Box>
        </Popover>
    );
};

export default TranslationPopover;
