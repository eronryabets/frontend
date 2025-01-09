import React, {useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../redux/store.ts";
import {registerUser} from "../../../redux/slices/registrationSlice.ts";

import {
    TextField,
    Button,
    Box,
    Typography,
    Avatar,
    IconButton,
    useTheme,
    FormControl,
    InputLabel,
    Select, MenuItem
} from '@mui/material';
import {PhotoCamera} from "@mui/icons-material";
import {v4 as uuidv4} from 'uuid';
import {languageOptions} from "../../../config/languageOptions.ts";
import {SelectChangeEvent} from "@mui/material/Select";

export const RegistrationPage: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();
    const {loading, success, error, responseData} = useSelector((state: RootState) => state.registration);
    const theme = useTheme();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        first_name: '',
        last_name: '',
        native_language: '',
        avatar: null as File | null,
    });

    const {username, password, confirmPassword, email, first_name, last_name, native_language} = formData;

    // Универсальное состояние для ошибок формы
    const [localError, setLocalError] = useState<Record<string, string>>({});

    // Локальное состояние для превью аватара
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, files} = e.target;

        if (name === 'avatar' && files && files.length > 0) {
            const file = files[0];
            const uniqueFileName = `${uuidv4()}-${file.name}`;
            const newFile = new File([file], uniqueFileName, {type: file.type});

            setFormData({
                ...formData,
                avatar: newFile,
            });
            setAvatarPreview(URL.createObjectURL(file));
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
            // Очистить ошибку для изменённого поля
            setLocalError((prev) => ({...prev, [name]: ''}));
        }
    };

    // Обработка выбора языка
    const handleLanguageChange = (e: SelectChangeEvent<string>) => {
        setFormData({
            ...formData,
            native_language: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const errors: Record<string, string> = {};

        if (password !== confirmPassword) {
            errors.confirmPassword = `Passwords don't match!`;
        }

        if (!native_language.trim()) {
            errors.native_language = `Please choose native language!`;
        }

        if (Object.keys(errors).length > 0) {
            setLocalError(errors);
            return;
        }

        dispatch(registerUser(formData));
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
                height: '90vh', // Покрывает всю высоту окна просмотра
                padding: 2,
                overflow: 'hidden', // Предотвращаем переполнение
                backgroundColor: theme.customBackground.gradient,
            }}
        >

            <Box
                sx={{
                    width: '300px',
                    margin: 'auto',
                    padding: 2,
                    borderRadius: 2,
                    boxShadow: 4,
                    backgroundColor: 'background.paper', // дефолтный
                }}
            >

                {/* Отображение успешной регистрации */}
                {success && (
                    <Typography variant="h6" sx={{mb: 2, color: 'green', textAlign: 'center'}}>
                        Success registration {responseData?.username}!
                    </Typography>
                )}

                {/* Отображение общих ошибок */}
                {error && typeof error !== 'string' && error.general && (
                    <Typography variant="h6" sx={{mb: 2, color: 'red', textAlign: 'center'}}>
                        {error.general.join(' ')}
                    </Typography>
                )}

                <Typography variant="h5" sx={{mb: 2, textAlign: 'center'}}>
                    Registration
                </Typography>

                <TextField
                    label="Username"
                    name="username"
                    value={username}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{mb: 2}}
                    autoComplete="username"
                    error={!!error?.username || !!localError.username}
                    helperText={localError.username || (error?.username ? error.username.join(' ') : '')}
                />

                <TextField
                    type="password"
                    label="Password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{mb: 2}}
                    autoComplete="new-password"
                    error={!!error?.password || !!localError.password}
                    helperText={localError.password || (error?.password ? error.password.join(' ') : '')}
                />

                <TextField
                    type="password"
                    label="Password Confirm"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{mb: 2}}
                    autoComplete="new-password"
                    error={!!localError.confirmPassword}
                    helperText={localError.confirmPassword}
                />

                <TextField
                    type="email"
                    label="Email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{mb: 2}}
                    error={!!error?.email || !!localError.email}
                    helperText={localError.email || (error?.email ? error.email.join(' ') : '')}
                />

                <TextField
                    label="First Name"
                    name="first_name"
                    value={first_name}
                    onChange={handleChange}
                    fullWidth
                    sx={{mb: 2}}
                    error={!!error?.first_name || !!localError.first_name}
                    helperText={localError.first_name || (error?.first_name ? error.first_name.join(' ') : '')}
                />

                <TextField
                    label="Last Name"
                    name="last_name"
                    value={last_name}
                    onChange={handleChange}
                    fullWidth
                    sx={{mb: 2}}
                    error={!!error?.last_name || !!localError.last_name}
                    helperText={localError.last_name || (error?.last_name ? error.last_name.join(' ') : '')}
                />

                {/* Native Language */}
                <FormControl fullWidth sx={{mb: 2}}>
                    <InputLabel id="native_language-select-label">Native Language</InputLabel>
                    <Select
                        labelId="native_language-select-label"
                        value={native_language}
                        label="Родной язык"
                        name="native_language"
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

                {/* Avatar Upload */}
                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                    <Avatar
                        alt="Avatar Preview"
                        src={avatarPreview || undefined}
                        sx={{width: 56, height: 56, mr: 2}}
                    />
                    <label htmlFor="avatar-upload">
                        <input
                            accept="image/*"
                            id="avatar-upload"
                            type="file"
                            name="avatar"
                            style={{display: 'none'}}
                            onChange={handleChange}
                        />
                        <IconButton color="primary" aria-label="upload picture" component="span">
                            <PhotoCamera/>
                        </IconButton>
                    </label>
                </Box>

                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                    {loading ? 'Loading...' : 'Register'}
                </Button>
            </Box>
        </Box>
    );

};

export default RegistrationPage;
