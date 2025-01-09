import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store.ts';

import { fetchGenres } from '@/redux/slices/genresSlice.ts';
import { updateBook } from '@/redux/slices/bookSlice.ts';

import { Book } from '@/types';
import { languageOptions } from '@/config/languageOptions.ts';
import { GenreSelect } from '@/components';

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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';

import { PhotoCamera } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';

interface EditBookModalProps {
    open: boolean;
    onClose: () => void;
    book: Book;
}

export const EditBookModal: React.FC<EditBookModalProps> = ({ open, onClose, book }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { genres, loading: genresLoading, error: genresError } = useSelector((state: RootState) => state.genres);
    const { loading } = useSelector((state: RootState) => state.books);

    const [formData, setFormData] = useState({
        title: book.title,
        description: book.description || '',
        genres: book.genre_details.map((genre) => genre.id),
        cover_image: null as File | null,
        language: book.language || '', // Добавили язык
    });

    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(book.cover_image);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { title, description, genres: selectedGenres, language } = formData;

    // Загрузка жанров при монтировании компонента
    useEffect(() => {
        if (genres.length === 0 && !genresLoading) {
            dispatch(fetchGenres());
        }
    }, [dispatch, genres.length, genresLoading]);

    // Обработка изменений в форме
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;

        if (name === 'cover_image' && files && files.length > 0) {
            const file = files[0];
            setFormData((prev) => ({
                ...prev,
                cover_image: file,
            }));
            setCoverImagePreview(URL.createObjectURL(file));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            description: value,
        }));
    };

    const handleGenresChange = (selectedIds: number[]) => {
        setFormData((prev) => ({
            ...prev,
            genres: selectedIds,
        }));
    };

    const handleLanguageChange = (e: SelectChangeEvent<string>) => {
        setFormData((prev) => ({
            ...prev,
            language: e.target.value,
        }));
    };

    // Обработка отправки формы
    const handleSubmit = async () => {
        setSubmitError(null);
        const updatedData = new FormData();
        updatedData.append('title', formData.title);
        updatedData.append('description', formData.description);
        updatedData.append('language', formData.language); // Добавили язык
        formData.genres.forEach((genreId) => updatedData.append('genres', genreId.toString()));
        if (formData.cover_image) {
            updatedData.append('cover_image', formData.cover_image);
        }

        try {
            const result = await dispatch(updateBook({ bookId: book.id, updatedData }));
            if (updateBook.fulfilled.match(result)) {
                onClose();
            } else if (updateBook.rejected.match(result)) {
                setSubmitError(result.payload || 'Не удалось обновить книгу.');
            }
        } catch (err) {
            setSubmitError('Не удалось обновить книгу.');
        }
    };

    // Сброс формы при открытии модалки
    useEffect(() => {
        if (open) {
            setFormData({
                title: book.title,
                description: book.description || '',
                genres: book.genre_details.map((genre) => genre.id),
                cover_image: null,
                language: book.language || '', // Добавили язык
            });
            setCoverImagePreview(book.cover_image);
            setSubmitError(null);
        }
    }, [open, book]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Редактировать книгу</DialogTitle>
            <DialogContent>
                {/* Превью обложки */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        alt="Cover Image Preview"
                        src={coverImagePreview || undefined}
                        sx={{
                            width: 120,
                            height: 160,
                            borderRadius: '16px',
                            mr: 2,
                        }}
                    />
                    <label htmlFor="cover-image-upload">
                        <input
                            accept="image/*"
                            id="cover-image-upload"
                            type="file"
                            name="cover_image"
                            style={{ display: 'none' }}
                            onChange={handleInputChange}
                        />
                        <IconButton color="primary" aria-label="upload cover image" component="span">
                            <PhotoCamera />
                        </IconButton>
                    </label>
                </Box>

                {/* Поле выбора языка */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="book-language-select-label">Язык книги</InputLabel>
                    <Select
                        labelId="book-language-select-label"
                        value={language}
                        label="Язык книги"
                        name="language"
                        onChange={handleLanguageChange}
                        required
                    >
                        {languageOptions.map((lang) => (
                            <MenuItem key={lang.code} value={lang.code}>
                                {lang.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Поле ввода названия */}
                <TextField
                    fullWidth
                    label="Название"
                    name="title"
                    value={title}
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    required
                />

                {/* Поле ввода описания */}
                <TextField
                    fullWidth
                    label="Описание"
                    name="description"
                    value={description}
                    onChange={handleDescriptionChange}
                    variant="outlined"
                    multiline
                    rows={4}
                    sx={{ mb: 2 }}
                    placeholder="Введите описание книги"
                    inputProps={{ maxLength: 500 }}
                    helperText={`${description.length}/500`}
                />

                {/* Поле выбора жанров */}
                <GenreSelect
                    values={selectedGenres}
                    onChange={handleGenresChange}
                    label="Жанры"
                    required
                />

                {/* Отображение ошибок при загрузке жанров */}
                {genresError && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                        {genresError}
                    </Alert>
                )}

                {/* Отображение ошибок при обновлении книги */}
                {submitError && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                        {submitError}
                    </Alert>
                )}

                {/* Индикатор загрузки: спиннер */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <CircularProgress />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Отмена
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};
