import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { RootState, AppDispatch } from '@/redux/store.ts';
import { updateWord, deleteWord } from '@/redux/slices/wordsSlice.ts';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Avatar,
    IconButton,
    Alert,
    CircularProgress,
    Chip,
    Stack,
    Typography,
    Slider,
} from '@mui/material';
import {Close as CloseIcon, PhotoCamera} from '@mui/icons-material';

import defaultCover from '@/assets/default_word_image.jpg';
import progressColors from '@/utils/constants/progressColors.ts';
import {MyIconButton} from "@/components";


interface EditWordModalProps {
    open: boolean;
    onClose: () => void;
    onDeleteSuccess: () => void;
    dictionaryId: string;
    wordData: {
        id: string;
        word: string;
        translation: string;
        tags: { name: string }[];
        image_path: string | null;
        progress: number;
    }
}

export const EditWordModal: React.FC<EditWordModalProps> = ({open, onClose, onDeleteSuccess, dictionaryId, wordData}) => {
    const dispatch = useDispatch<AppDispatch>();
    const {loading, error} = useSelector((state: RootState) => state.words);

    const [currentWord, setCurrentWord] = useState(wordData.word);
    const [translation, setTranslation] = useState(wordData.translation);
    const [tagNames, setTagNames] = useState<string[]>(wordData.tags.map(t => t.name));
    const [tagInput, setTagInput] = useState('');
    const [imagePath, setImagePath] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(wordData.image_path || null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [progress, setProgress] = useState(wordData.progress);

    // Состояние для диалога подтверждения удаления
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    useEffect(() => {
        if (open) {
            // При открытии модалки обновляем состояние с данными слова
            setCurrentWord(wordData.word);
            setTranslation(wordData.translation);
            setTagNames(wordData.tags.map(t => t.name));
            setTagInput('');
            setImagePath(null);
            setImagePreview(wordData.image_path || null);
            setSubmitError(null);
            setProgress(wordData.progress);
        }
    }, [open, wordData]);

    const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentWord(e.target.value);
    };

    const handleTranslationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTranslation(e.target.value);
    };

    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tagNames.includes(newTag)) {
                setTagNames((prev) => [...prev, newTag]);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTagNames((prev) => prev.filter((tag) => tag !== tagToRemove));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {files} = e.target;
        if (files && files.length > 0) {
            const file = files[0];
            setImagePath(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleProgressChange = (_event: Event, newValue: number | number[]) => {
        if (typeof newValue === 'number') {
            setProgress(newValue);
        }
    };

    const handleSave = async () => {
        if (!currentWord || !translation) {
            setSubmitError('Пожалуйста, заполните все обязательные поля.');
            return;
        }
        setSubmitError(null);

        // На всякий случай ещё раз ограничим progress
        let safeProgress = progress;
        if (safeProgress < 0) safeProgress = 0;
        if (safeProgress > 10) safeProgress = 10;

        try {
            const resultAction = await dispatch(updateWord({
                wordId: wordData.id,
                dictionaryId,
                word: currentWord,
                translation,
                tag_names: tagNames,
                image_path: imagePath,
                progress: safeProgress // <-- Передаем progress
            }));
            if (updateWord.fulfilled.match(resultAction)) {
                onClose();
            } else {
                setSubmitError(resultAction.payload || 'Не удалось обновить слово.');
            }
        } catch (err) {
            setSubmitError('Не удалось обновить слово.');
        }
    };

    const handleDelete = () => {
        // Открываем диалог подтверждения удаления
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        setOpenDeleteDialog(false);
        try {
            const resultAction = await dispatch(deleteWord({wordId: wordData.id}));
            if (deleteWord.fulfilled.match(resultAction)) {
                onDeleteSuccess(); // Вызываем callback при успешном удалении
            } else {
                setSubmitError(resultAction.payload || 'Не удалось удалить слово.');
            }
        } catch (err) {
            setSubmitError('Не удалось удалить слово.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>

            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
            <DialogTitle>Редактировать слово</DialogTitle>
            <MyIconButton
                    color="secondary"
                    startIcon={<CloseIcon/>}
                    onClick={onClose}/>
            </Box>

            <DialogContent>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                    <Avatar
                        alt="Image Preview"
                        src={imagePreview || defaultCover}
                        sx={{
                            width: 160,
                            height: 160,
                            borderRadius: '8px',
                            mr: 2,
                        }}
                    />
                    <label htmlFor="word-image-upload">
                        <input
                            accept="image/*"
                            id="word-image-upload"
                            type="file"
                            name="image_path"
                            style={{display: 'none'}}
                            onChange={handleImageChange}
                        />
                        <IconButton color="primary" aria-label="upload image" component="span">
                            <PhotoCamera/>
                        </IconButton>
                    </label>
                </Box>

                <TextField
                    fullWidth
                    label="Слово"
                    name="word"
                    value={currentWord}
                    onChange={handleWordChange}
                    variant="outlined"
                    sx={{mb: 2}}
                    required
                    inputProps={{maxLength: 500}}
                    helperText={`${currentWord.length}/500`}
                />

                <TextField
                    fullWidth
                    label="Перевод"
                    name="translation"
                    value={translation}
                    onChange={handleTranslationChange}
                    variant="outlined"
                    sx={{mb: 2}}
                    required
                    inputProps={{maxLength: 500}}
                    helperText={`${translation.length}/500`}
                />

                {/* Поле ввода прогресса */}
                <Box data-name="progressSlider" sx={{mb: 4}}>
                    <Typography id="progress-slider" gutterBottom>
                        Прогресс изучения слова: {progress}
                    </Typography>
                    <Slider
                        value={progress}
                        min={0}
                        max={10}
                        step={1}
                        marks={[
                            { value: 0, label: '0' },
                            { value: 1, label: '1' },
                            { value: 2, label: '2' },
                            { value: 3, label: '3' },
                            { value: 4, label: '4' },
                            { value: 5, label: '5' },
                            { value: 6, label: '6' },
                            { value: 7, label: '7' },
                            { value: 8, label: '8' },
                            { value: 9, label: '9' },
                            { value: 10, label: '10' },
                        ]}
                        valueLabelDisplay="on"
                        onChange={handleProgressChange}
                        aria-labelledby="progress-slider"
                        sx={{
                            color: progressColors[progress], // Устанавливаем цвет трека
                            '& .MuiSlider-thumb': {
                                backgroundColor: progressColors[progress], // Устанавливаем цвет ползунка
                                border: '2px solid currentColor',
                            },
                            '& .MuiSlider-track': {
                                backgroundColor: progressColors[progress], // Устанавливаем цвет трека
                            },
                            '& .MuiSlider-rail': {
                                backgroundColor: 'rgba(0, 0, 0, 0.12)', // Цвет рельса
                            },
                        }}
                    />
                </Box>

                <TextField
                    fullWidth
                    label="Теги"
                    name="tags"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    variant="outlined"
                    sx={{mb: 2}}
                    placeholder="Введите теги через запятую и нажмите Enter"
                />

                {tagNames.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{mb: 2, flexWrap: 'wrap'}}>
                        {tagNames.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                onDelete={() => handleRemoveTag(tag)}
                                variant="outlined"
                            />
                        ))}
                    </Stack>
                )}

                {submitError && (
                    <Alert severity="error" sx={{width: '100%', mb: 2}}>
                        {submitError}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{width: '100%', mb: 2}}>
                        {error}
                    </Alert>
                )}

                {loading && (
                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                        <CircularProgress/>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDelete} color="error" disabled={loading}>
                    Удалить
                </Button>
                <Button onClick={onClose} color="primary" disabled={loading}>
                    Отмена
                </Button>
                <Button onClick={handleSave} color="primary" variant="contained" disabled={loading}>
                    Сохранить
                </Button>
            </DialogActions>

            {/* Диалог подтверждения удаления */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Подтверждение удаления</DialogTitle>
                <DialogContent>
                    <Typography>Вы уверены, что хотите удалить слово "{currentWord}"?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                        Отмена
                    </Button>
                    <Button onClick={confirmDelete} color="secondary">
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

export default EditWordModal;
