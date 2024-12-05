
import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { addWord, resetAddWordState } from '../../../redux/slices/wordsSlice';

interface AddWordModalProps {
    open: boolean;
    onClose: () => void;
    dictionaryId: string;
}

const AddWordModal: React.FC<AddWordModalProps> = ({ open, onClose, dictionaryId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { adding, addError } = useSelector((state: RootState) => state.words);

    const [word, setWord] = useState('');
    const [translation, setTranslation] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tagNames, setTagNames] = useState<string[]>([]);
    const [imagePath, setImagePath] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Обработка изменений в форме
    const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWord(e.target.value);
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
        const { files } = e.target;
        if (files && files.length > 0) {
            const file = files[0];
            setImagePath(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Обработка отправки формы
    const handleSubmit = async () => {
        if (!word || !translation) {
            setSubmitError('Пожалуйста, заполните все обязательные поля.');
            return;
        }
        setSubmitError(null);
        console.log('Submitting word with tags:', tagNames); // Логирование массива тегов
        try {
            const resultAction = await dispatch(addWord({
                dictionaryId,
                word,
                translation,
                tag_names: tagNames,
                image_path: imagePath,
            }));
            if (addWord.fulfilled.match(resultAction)) {
                // Очистка формы и закрытие модалки
                setWord('');
                setTranslation('');
                setTagNames([]);
                setImagePath(null);
                setImagePreview(null);
                onClose();
            } else {
                setSubmitError(resultAction.payload || 'Не удалось добавить слово.');
            }
        } catch (err) {
            setSubmitError('Не удалось добавить слово.');
        }
    };

    // Сброс состояния при закрытии модалки
    useEffect(() => {
        if (!open) {
            setWord('');
            setTranslation('');
            setTagNames([]);
            setTagInput('');
            setImagePath(null);
            setImagePreview(null);
            setSubmitError(null);
            dispatch(resetAddWordState());
        }
    }, [open, dispatch]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Добавить слово</DialogTitle>
            <DialogContent>
                {/* Превью изображения */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        alt="Image Preview"
                        src={imagePreview || undefined}
                        sx={{
                            width: 80,
                            height: 80,
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
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                        />
                        <IconButton color="primary" aria-label="upload image" component="span">
                            <PhotoCamera />
                        </IconButton>
                    </label>
                </Box>

                {/* Поле ввода слова */}
                <TextField
                    fullWidth
                    label="Слово"
                    name="word"
                    value={word}
                    onChange={handleWordChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    required
                />

                {/* Поле ввода перевода */}
                <TextField
                    fullWidth
                    label="Перевод"
                    name="translation"
                    value={translation}
                    onChange={handleTranslationChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    required
                />

                {/* Поле ввода тегов */}
                <TextField
                    fullWidth
                    label="Теги"
                    name="tags"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    placeholder="Введите теги через запятую и нажмите Enter"
                />

                {/* Отображение добавленных тегов */}
                {tagNames.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
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

                {/* Отображение ошибок при добавлении слова */}
                {addError && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                        {addError}
                    </Alert>
                )}

                {/* Отображение ошибок при заполнении формы */}
                {submitError && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                        {submitError}
                    </Alert>
                )}

                {/* Индикатор загрузки: спиннер */}
                {adding && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <CircularProgress />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" disabled={adding}>
                    Отмена
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained" disabled={adding}>
                    Добавить
                </Button>
            </DialogActions>
        </Dialog>
    );

};

export default AddWordModal;
