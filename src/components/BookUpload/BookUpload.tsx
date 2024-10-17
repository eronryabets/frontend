// src/components/BookUpload.tsx

import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store";
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    IconButton,
    Paper,
    Snackbar,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import {PhotoCamera} from "@mui/icons-material";
import {resetState, uploadBook} from "../../redux/slices/uploadBookSlice";
import {fetchGenres} from "../../redux/slices/genresSlice";
import {BookFormState, BookData} from '../../types';
import {GenreSelect} from '../GenreSelect';

export const BookUpload: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userData = useSelector((state: RootState) => state.userInfo.userData);
    const {loading, success, error} = useSelector((state: RootState) => state.uploadBook);
    const {genres, loading: genresLoading, error: genresError} = useSelector((state: RootState) => state.genres);
    const theme = useTheme();

    const [formData, setFormData] = useState<BookFormState>({
        user_id: userData?.id || '',
        title: '',
        genres: [],
        file: null,
        cover_image: null,
        description: '',
    });

    const {title, genres: selectedGenres, file, description} = formData;

    // Локальное состояние для превью обложки книги
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

    // Обработка изменений для полей ввода, кроме жанра
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, files} = e.target;

        if (name === "cover_image" && files && files.length > 0) {
            const file = files[0];
            setFormData({
                ...formData,
                cover_image: file,
            });
            setCoverImagePreview(URL.createObjectURL(file));
        } else if (name === "file" && files && files.length > 0) {
            const file = files[0];
            setFormData({
                ...formData,
                file: file,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    // Обработка изменения поля описания
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {value} = e.target;
        setFormData({
            ...formData,
            description: value,
        });
    };

    // Обработка выбора жанров
    const handleGenresChange = (selectedIds: number[]) => {
        setFormData({
            ...formData,
            genres: selectedIds,
        });
    };

    // Отправка формы
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Проверка обязательных полей
        if (!formData.file) {
            alert("Please select a file to upload.");
            return;
        }

        if (formData.genres.length === 0) {
            alert("Please select at least one genre.");
            return;
        }

        const bookData: BookData = {
            user_id: formData.user_id,
            title: formData.title,
            genres: formData.genres,
            file: formData.file,
            cover_image: formData.cover_image,
            description: formData.description,
        };

        dispatch(uploadBook(bookData));
    };

    // Загрузка жанров при монтировании компонента
    useEffect(() => {
        dispatch(fetchGenres());
    }, [dispatch]);

    // Установка жанра по умолчанию на "Another" (id: 1) после загрузки жанров
    useEffect(() => {
        if (genres.length > 0 && formData.genres.length === 0) {
            const anotherGenreId = 1; // ID "Another" genre
            const anotherGenre = genres.find((g) => g.id === anotherGenreId);

            if (anotherGenre) {
                setFormData((prev) => ({...prev, genres: [anotherGenre.id]}));
            } else {
                // Если "Another" не найден, выбрать первый жанр из списка
                setFormData((prev) => ({...prev, genres: [genres[0].id]}));
                console.warn(`Genre with id ${anotherGenreId} not found. Defaulting to the first genre.`);
            }
        }
    }, [genres, formData.genres.length]);

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                dispatch(resetState());
            }, 6000); // Закрытие Snackbar через 6 секунд

            return () => clearTimeout(timer);
        }
    }, [success, error, dispatch]);

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            gap={4}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '90vh', // Покрывает всю высоту окна просмотра
                padding: 2,
                overflow: 'hidden', // Предотвращаем переполнение
                backgroundColor: theme.customBackground.gradient,
            }}
        >
            {(loading || genresLoading) ? (
                <CircularProgress/>
            ) : (
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        width: '100%',
                        maxWidth: 600,
                        background: 'background.paper', // градиент из темы -> theme.customBackground.paperGradient
                        borderRadius: 2,
                        boxShadow: 4,
                    }}
                >
                    <Typography variant="h5" component="div"
                                sx={{mb: 2, alignSelf: 'center', color: theme.palette.text.primary}}>
                        Upload Book
                    </Typography>

                    {/* Превью обложки */}
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
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
                                style={{display: 'none'}}
                                onChange={handleInputChange}
                            />
                            <IconButton color="primary" aria-label="upload cover image" component="span">
                                <PhotoCamera/>
                            </IconButton>
                        </label>
                    </Box>

                    {/* Поле ввода описания */}
                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={description}
                        onChange={handleDescriptionChange}
                        variant="outlined"
                        multiline
                        rows={4}
                        sx={{mb: 2}}
                        placeholder="Enter a short description of the book"
                        inputProps={{maxLength: 500}}
                        helperText={`${description.length}/500`}
                        required
                    />

                    {/* Поле выбора жанров */}
                    <GenreSelect
                        values={selectedGenres}
                        onChange={handleGenresChange}
                        label="Genres"
                        required
                    />

                    {/* Поле ввода заголовка */}
                    <TextField
                        fullWidth
                        label="Title"
                        name="title"
                        value={title}
                        onChange={handleInputChange}
                        variant="outlined"
                        sx={{mb: 2}}
                        required
                    />

                    {/* Поле для загрузки файла книги */}
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <Button variant="contained" component="label">
                            Upload Book File
                            <input
                                hidden
                                accept=".pdf, .doc, .docx"
                                type="file"
                                name="file"
                                onChange={handleInputChange}
                            />
                        </Button>
                        {file && (
                            <Typography variant="body2" sx={{ml: 2, color: theme.palette.text.primary}}>
                                {file.name}
                            </Typography>
                        )}
                    </Box>

                    {/* Отображение ошибок при загрузке книги */}
                    {error && (
                        <Alert severity="error" sx={{width: '100%', mb: 2}}>
                            {error.general
                                ? error.general.join(' ')
                                : Object.entries(error).map(([key, messages]) => (
                                    <div key={key}>
                                        {key}: {Array.isArray(messages) ? messages.join(' ') : messages}
                                    </div>
                                ))}
                        </Alert>
                    )}

                    {/* Отображение ошибок при загрузке жанров */}
                    {genresError && (
                        <Alert severity="error" sx={{width: '100%', mb: 2}}>
                            {genresError}
                        </Alert>
                    )}

                    {/* Кнопка отправки формы */}
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{mt: 2}}
                        disabled={loading || genresLoading}
                    >
                        Upload Book
                    </Button>

                    {/* Уведомление об успешной загрузке */}
                    {success && (
                        <Snackbar open={success} autoHideDuration={6000} onClose={() => dispatch(resetState())}>
                            <Alert onClose={() => dispatch(resetState())} severity="success" sx={{width: '100%'}}>
                                Book uploaded and processed successfully!
                            </Alert>
                        </Snackbar>
                    )}
                </Paper>
            )}
        </Box>
    );
};
