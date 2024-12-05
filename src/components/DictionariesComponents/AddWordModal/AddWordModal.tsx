
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
    Autocomplete,
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

export const AddWordModal: React.FC<AddWordModalProps> = ({ open, onClose, dictionaryId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { adding, addError } = useSelector((state: RootState) => state.words);

    const [formData, setFormData] = useState({
        word: '',
        translation: '',
        tag_names: [] as string[],
        image_path: null as File | null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { word, translation, tag_names, image_path } = formData;

    // Обработка изменений в форме
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;

        if (name === 'image_path' && files && files.length > 0) {
            const file = files[0];
            setFormData((prev) => ({
                ...prev,
                image_path: file,
            }));
            setImagePreview(URL.createObjectURL(file));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleTagsChange = (event: any, value: string[]) => {
        setFormData((prev) => ({
            ...prev,
            tag_names: value,
        }));
    };

    // Обработка отправки формы
    const handleSubmit = async () => {
        if (!word || !translation) {
            setSubmitError('Пожалуйста, заполните все обязательные поля.');
            return;
        }
        setSubmitError(null);
        try {
            const resultAction = await dispatch(addWord({
                dictionaryId,
                word,
                translation,
                tag_names,
                image_path,
            }));
            if (addWord.fulfilled.match(resultAction)) {
                // Очистка формы и закрытие модалки
                setFormData({
                    word: '',
                    translation: '',
                    tag_names: [],
                    image_path: null,
                });
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
            setFormData({
                word: '',
                translation: '',
                tag_names: [],
                image_path: null,
            });
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
                            onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    required
                />

                {/* Поле ввода тегов */}
                <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={tag_names}
                    onChange={handleTagsChange}
                    renderTags={(value: string[], getTagProps) =>
                        value.map((option: string, index: number) => (
                            <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option + index} />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label="Теги"
                            placeholder="Введите теги"
                            sx={{ mb: 2 }}
                        />
                    )}
                />

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
