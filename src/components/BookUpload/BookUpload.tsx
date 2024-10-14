import React, {useState} from "react";
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
    useTheme
} from "@mui/material";
import {PhotoCamera} from "@mui/icons-material";
import {uploadBook} from "../../redux/slices/uploadBookSlice"; // Импортируем экшен для загрузки книги

export const BookUpload: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userData = useSelector((state: RootState) => state.userInfo.userData);
    const {loading, success, error} = useSelector((state: RootState) => state.uploadBook);
    const theme = useTheme();

    const [formData, setFormData] = useState({
        user_id: userData?.id || '',  // Проверка на null
        title: '',
        genre: '',
        file: null as File | null,
        cover_image: null as File | null,
    });

    const {title, genre, file} = formData;

    // Локальное состояние для превью обложки книги
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

    // Обработка изменения в полях
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Отправка формы
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const bookFormData = new FormData();

        // Добавляем данные в formData, проверяя на наличие значений
        if (formData.user_id) {
            bookFormData.append("user_id", formData.user_id);
        }
        bookFormData.append("title", formData.title);
        bookFormData.append("genre", formData.genre);

        if (formData.file) {
            bookFormData.append("file", formData.file);
        }

        if (formData.cover_image) {
            bookFormData.append("cover_image", formData.cover_image);
        }

        // Отправляем данные через Redux action
        dispatch(uploadBook(bookFormData));
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: 2,
                margin: 6,
                backgroundColor: theme.palette.background.default,
            }}
        >
            {loading ? (
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
                        maxWidth: 400,
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                    }}
                >
                    <Typography variant="h5" component="div" sx={{mb: 2, alignSelf: 'center'}}>
                        Upload Book
                    </Typography>

                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <Avatar
                            alt="Cover Image Preview"
                            src={coverImagePreview || undefined}
                            sx={{
                                width: 120,
                                height: 160,
                                borderRadius: '16px', // Закругленные углы
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
                                onChange={handleChange}
                            />
                            <IconButton color="primary" aria-label="upload cover image" component="span">
                                <PhotoCamera/>
                            </IconButton>
                        </label>
                    </Box>

                    <TextField
                        fullWidth
                        label="Title"
                        name="title"
                        value={title}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{mb: 2}}
                    />

                    <TextField
                        fullWidth
                        label="Genre"
                        name="genre"
                        value={genre}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{mb: 2}}
                    />

                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <Button variant="contained" component="label">
                            Upload Book File
                            <input
                                hidden
                                accept=".pdf, .doc, .docx"
                                type="file"
                                name="file"
                                onChange={handleChange}
                            />
                        </Button>
                        {file && (
                            <Typography variant="body2" sx={{ml: 2}}>
                                {file.name}
                            </Typography>
                        )}
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{width: '100%', mb: 2}}>
                            {/*Ошибка: {error}*/}
                        </Alert>
                    )}

                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{mt: 2}}
                    >
                        Upload Book
                    </Button>

                    {success && (
                        <Snackbar open={success} autoHideDuration={6000}>
                            <Alert severity="success">Book uploaded and processed successfully!</Alert>
                        </Snackbar>
                    )}
                </Paper>
            )}
        </Box>
    );
};
