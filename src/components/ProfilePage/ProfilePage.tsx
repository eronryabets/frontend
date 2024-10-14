import React, {useEffect, useState} from "react";
import {useSelector} from 'react-redux';
import {RootState, useAppDispatch} from '../../redux/store';
import {getUserInfo, patchUserAuthInfo, patchUserProfileInfo, resetUpdateState} from '../../redux/slices/userInfoSlice'; // Обновляем thunk-и
import {
    Avatar,
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    IconButton,
    useTheme, Alert, Snackbar, CircularProgress,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import {v4 as uuidv4} from 'uuid';
import {USER_API_MEDIA_URL} from "../../config"; // Используем для уникальных имен файлов

export const ProfilePage: React.FC = () => {
    const dispatch = useAppDispatch();
    const userData = useSelector((state: RootState) => state.userInfo.userData);
    const {loading, success, error} = useSelector((state: RootState) => state.userInfo.status);
    const {updateSuccess, updateError} = useSelector((state: RootState) => state.userInfo.updateStatus);
    const theme = useTheme();

    const [email, setEmail] = useState(userData.email || '');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState(userData.first_name || '');
    const [lastName, setLastName] = useState(userData.last_name || '');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(`${USER_API_MEDIA_URL}${userData.avatar}` || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [showSnackbar, setShowSnackbar] = useState(false); // Для уведомления об успешной операции
    const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false); //для уведомления ошибок

    // Обновляем данные пользователя при загрузке страницы профиля
    useEffect(() => {
        dispatch(getUserInfo()); // Получаем данные при загрузке страницы
    }, [dispatch]);

    // Показ уведомления об успехе
    useEffect(() => {
        if (updateSuccess) {
            setShowSnackbar(true); // Показываем уведомление об успехе
            dispatch(getUserInfo()); // Обновляем данные профиля
            dispatch(resetUpdateState()); //Сбрасываем состояние успеха
        }
    }, [updateSuccess, dispatch]);


    // Обработка изменений в текстовых полях
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setter(event.target.value);
        };

    // Обработка загрузки аватара
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {files} = e.target;
        if (files && files.length > 0) {
            const file = files[0];
            const uniqueFileName = `${uuidv4()}-${file.name}`;
            const newFile = new File([file], uniqueFileName, {type: file.type});

            setAvatarFile(newFile);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // Функция для отправки изменений
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Предотвращаем перезагрузку страницы

        // Формируем объекты только с изменёнными полями
        const updatedDataAuth: Partial<{ email: string, password: string }> = {};
        const updatedDataUser: Partial<{ first_name: string, last_name: string, avatar: File | string }> = {};

        if (email !== userData.email) {
            updatedDataAuth.email = email;
        }
        if (password) {
            updatedDataAuth.password = password;
        }
        if (firstName !== userData.first_name) {
            updatedDataUser.first_name = firstName;
        }
        if (lastName !== userData.last_name) {
            updatedDataUser.last_name = lastName;
        }
        if (avatarFile) {
            updatedDataUser.avatar = avatarFile;
        }

        // Отправляем запросы только если есть данные для обновления
        if (Object.keys(updatedDataAuth).length > 0) {
            dispatch(patchUserAuthInfo(updatedDataAuth));
        }
        if (Object.keys(updatedDataUser).length > 0) {
            dispatch(patchUserProfileInfo(updatedDataUser));
        }
    };


    // Закрытие Snackbar
    const handleSnackbarClose = () => {
        setShowSnackbar(false);
    };

    // Показ уведомления об ошибке
    useEffect(() => {
        if (error || updateError) {
            setOpenErrorSnackbar(true);
        }
    }, [error, updateError]);

     // Закрытие Error Snackbar
    const handleErrorSnackbarClose = () => {
        setOpenErrorSnackbar(false);
        dispatch(resetUpdateState()); // Сбрасываем состояние ошибки после закрытия
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
                        Редактировать Профиль
                    </Typography>

                    {/* Avatar Loading */}
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <Avatar
                            alt="Avatar Preview"
                            src={avatarPreview || undefined}
                            sx={{width: 100, height: 100, mr: 2}}
                        />
                        <label htmlFor="avatar-upload">
                            <input
                                accept="image/*"
                                id="avatar-upload"
                                type="file"
                                name="avatar"
                                style={{display: 'none'}}
                                onChange={handleAvatarChange}
                            />
                            <IconButton color="primary" aria-label="upload picture" component="span">
                                <PhotoCamera/>
                            </IconButton>
                        </label>
                    </Box>

                    <TextField
                        fullWidth
                        type="email"
                        label="Email"
                        value={email}
                        onChange={handleInputChange(setEmail)}
                        variant="outlined"
                        sx={{mb: 2}}
                        autoComplete="email"
                    />
                    <TextField
                        fullWidth
                        label="Пароль"
                        value={password}
                        onChange={handleInputChange(setPassword)}
                        variant="outlined"
                        type="password"
                        sx={{mb: 2}}
                        autoComplete="new-password"
                    />
                    <TextField
                        fullWidth
                        label="Имя"
                        value={firstName}
                        onChange={handleInputChange(setFirstName)}
                        variant="outlined"
                        sx={{mb: 2}}
                        autoComplete="first_name"
                    />
                    <TextField
                        fullWidth
                        label="Фамилия"
                        value={lastName}
                        onChange={handleInputChange(setLastName)}
                        variant="outlined"
                        sx={{mb: 2}}
                    />

                    {error && (
                        <Alert severity="error" sx={{width: '100%', mb: 2}}>
                             {/*Ошибка: {typeof error === 'object' ? error.detail : error}*/}
                            Ошибка: {typeof error === 'object' && error.detail ? error.detail : error}
                        </Alert>
                    )}

                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{mt: 2}}
                    >
                        Сохранить изменения
                    </Button>
                </Paper>
            )}

            {/* Snackbar для уведомления об успешном сохранении */}
            <Snackbar
                open={showSnackbar}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message="Изменения успешно сохранены"
            />

            {/* Snackbar для уведомления об ошибке */}
            <Snackbar
                open={openErrorSnackbar}
                autoHideDuration={10000}
                onClose={handleErrorSnackbarClose}
                message={`Ошибка: ${typeof updateError === 'object' ? updateError?.detail : updateError || updateError}`}
            />

        </Box>
    );
};