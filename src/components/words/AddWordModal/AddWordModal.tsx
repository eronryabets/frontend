import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { RootState, AppDispatch } from '@/redux/store.ts';
import { addWord, resetAddWordState } from '@/redux/slices/wordsSlice.ts';

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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

import defaultCover from '@/assets/default_word_image.jpg';



interface AddWordModalProps {
    open: boolean;
    onClose: () => void;
    dictionaryId?: string;
    initialWord?: string;
    initialTranslation?: string;
}

const LOCAL_STORAGE_KEY = 'lastSelectedDictionaryId'; // Ключ для localStorage

export const AddWordModal: React.FC<AddWordModalProps> = ({open, onClose, dictionaryId, initialWord, initialTranslation}) => {
    const dispatch = useDispatch<AppDispatch>();
    const {adding, addError} = useSelector((state: RootState) => state.words);
    const {dictionaries} = useSelector((state: RootState) => state.dictionaries);

    const [word, setWord] = useState('');
    const [translation, setTranslation] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tagNames, setTagNames] = useState<string[]>([]);
    const [imagePath, setImagePath] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Состояние для выбранного словаря
    const [selectedDictionaryId, setSelectedDictionaryId] = useState<string>('');

    useEffect(() => {
        if (open) {
            setWord(initialWord || '');
            setTranslation(initialTranslation || '');
            setTagNames([]);
            setTagInput('');
            setImagePath(null);
            setImagePreview(null);
            setSubmitError(null);
            dispatch(resetAddWordState());

            if (dictionaries && dictionaries.length > 0) {
                // Проверяем есть ли сохранённый словарь в localStorage
                const lastSelected = localStorage.getItem(LOCAL_STORAGE_KEY);

                if (lastSelected && dictionaries.find(d => d.id === lastSelected)) {
                    // Если сохранённый словарь существует в текущем списке словарей, используем его
                    setSelectedDictionaryId(lastSelected);
                } else if (dictionaryId && dictionaries.find(d => d.id === dictionaryId)) {
                    // Если есть переданный dictionaryId и он в списке словарей
                    setSelectedDictionaryId(dictionaryId);
                } else {
                    // Иначе выбираем первый словарь
                    setSelectedDictionaryId(dictionaries[0].id);
                }
            } else {
                setSelectedDictionaryId('');
            }
        }
    }, [open, initialWord, initialTranslation, dictionaryId, dictionaries, dispatch]);

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
        const {files} = e.target;
        if (files && files.length > 0) {
            const file = files[0];
            setImagePath(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!word || !translation) {
            setSubmitError('Пожалуйста, заполните все обязательные поля.');
            return;
        }

        if (!selectedDictionaryId) {
            setSubmitError('Пожалуйста, выберите словарь.');
            return;
        }

        setSubmitError(null);
        try {
            const resultAction = await dispatch(addWord({
                dictionaryId: selectedDictionaryId,
                word,
                translation,
                tag_names: tagNames,
                image_path: imagePath,
            }));
            if (addWord.fulfilled.match(resultAction)) {
                // Сохраняем выбранный словарь в localStorage
                localStorage.setItem(LOCAL_STORAGE_KEY, selectedDictionaryId);

                setWord('');
                setTranslation('');
                setTagNames([]);
                setImagePath(null);
                setImagePreview(null);
                onClose()
            } else {
                setSubmitError(resultAction.payload || 'Не удалось добавить слово.');
            }
        } catch (err) {
            setSubmitError('Не удалось добавить слово.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Добавить слово</DialogTitle>
            <DialogContent>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                    <Avatar
                        alt="Image Preview"
                        src={imagePreview || defaultCover}
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
                            style={{display: 'none'}}
                            onChange={handleImageChange}
                        />
                        <IconButton color="primary" aria-label="upload image" component="span">
                            <PhotoCamera/>
                        </IconButton>
                    </label>
                </Box>

                {dictionaries && dictionaries.length > 0 ? (
                    <FormControl fullWidth sx={{mb: 2}}>
                        <InputLabel id="dictionary-select-label">Словарь</InputLabel>
                        <Select
                            labelId="dictionary-select-label"
                            value={selectedDictionaryId}
                            label="Словарь"
                            onChange={(e) => setSelectedDictionaryId(e.target.value as string)}
                            required
                        >
                            {dictionaries.map((dict) => (
                                <MenuItem key={dict.id} value={dict.id}>
                                    {dict.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    <Alert severity="warning" sx={{mb: 2}}>
                        У вас нет словарей, пожалуйста, создайте словарь перед добавлением слов.
                    </Alert>
                )}

                <TextField
                    fullWidth
                    label="Слово"
                    name="word"
                    value={word}
                    onChange={handleWordChange}
                    variant="outlined"
                    sx={{mb: 2}}
                    required
                    inputProps={{maxLength: 500}}
                    helperText={`${word.length}/500`}
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

                {addError && (
                    <Alert severity="error" sx={{width: '100%', mb: 2}}>
                        {addError}
                    </Alert>
                )}

                {submitError && (
                    <Alert severity="error" sx={{width: '100%', mb: 2}}>
                        {submitError}
                    </Alert>
                )}

                {adding && (
                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                        <CircularProgress/>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" disabled={adding}>
                    Отмена
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained"
                        disabled={adding || !selectedDictionaryId}>
                    Добавить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddWordModal;
