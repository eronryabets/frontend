import React, {useEffect, useState} from "react";
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store.ts';
import {useAppDispatch} from '../../../redux/hooks.ts';
import {getUserInfo, patchUserProfileInfo, resetUpdateState} from '../../../redux/slices/userInfoSlice.ts';
import {
    Box,
    Typography,
    Paper,
    Button,
    useTheme,
    Alert,
    Snackbar,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {Dictionary} from '../../../types';
import {SelectChangeEvent} from '@mui/material/Select';
import {setTheme} from "../../../redux/slices/themeSlice.ts";


// Предполагаем, что settings имеет форму:
// {
//   "theme": { "mode": "dark" },
//   "current_dictionary": { "dictionary_id": "...", "dictionary_name": "...", "dictionary_language": "..." }
// }

// Если settings или текущий словарь не заданы, используем дефолтные значения
// например, mode: "light", или первый словарь из списка.


export const UserSettingsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const userData = useSelector((state: RootState) => state.userInfo.userData);
    const {loading, error} = useSelector((state: RootState) => state.userInfo.status);
    const {updateSuccess, updateError} = useSelector((state: RootState) => state.userInfo.updateStatus);
    const {dictionaries} = useSelector((state: RootState) => state.dictionaries);

    const theme = useTheme();

    // Изначально загружаем информацию о пользователе, если не загружена
    useEffect(() => {
        if (!userData.id) {
            dispatch(getUserInfo());
        }
    }, [dispatch, userData.id]);

    // Парсим настройки пользователя
    const userSettings = userData.settings || {};

    const currentThemeMode = userSettings.theme?.mode || 'light';
    const currentDictionary = userSettings.current_dictionary || null;

    const [mode, setMode] = useState(currentThemeMode);
    const [selectedDictionaryId, setSelectedDictionaryId] = useState<string>(
        currentDictionary?.dictionary_id || ''
    );

    const [showSnackbar, setShowSnackbar] = useState(false);
    const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);

    // При успехе обновления показываем уведомление и обновляем данные
    useEffect(() => {
        if (updateSuccess) {
            setShowSnackbar(true);
            dispatch(getUserInfo());
            dispatch(setTheme(mode as 'light' | 'dark'))
            dispatch(resetUpdateState());
        }
    }, [updateSuccess, dispatch]);

    // При ошибке показываем уведомление об ошибке
    useEffect(() => {
        if (error || updateError) {
            setOpenErrorSnackbar(true);
        }
    }, [error, updateError]);
    const handleDictionaryChange = (event: SelectChangeEvent<string>) => {
    setSelectedDictionaryId(event.target.value as string);
};

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Находим выбранный словарь по selectedDictionaryId
        let chosenDict;
        if (selectedDictionaryId && dictionaries && dictionaries.length > 0) {
            chosenDict = dictionaries.find((d: Dictionary) => d.id === selectedDictionaryId);
        }

        const newSettings = {
            theme: {mode},
            current_dictionary: chosenDict ? {
                dictionary_id: chosenDict.id,
                dictionary_name: chosenDict.name,
                dictionary_language: chosenDict.language,
            } : currentDictionary
        };

        // Обновляем только settings
        dispatch(patchUserProfileInfo({settings: JSON.stringify(newSettings)}));
    };

    const handleSnackbarClose = () => {
        setShowSnackbar(false);
    };

    const handleErrorSnackbarClose = () => {
        setOpenErrorSnackbar(false);
        dispatch(resetUpdateState());
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
                height: '80vh',
                padding: 2,
                margin: 6,
                overflow: 'hidden',
                backgroundColor: theme.customBackground.gradient,
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
                        backgroundColor: theme.customBackground.paperGradient,
                        borderRadius: 2,
                        boxShadow: 4,
                        color: theme.palette.text.primary,
                    }}
                >
                    <Typography variant="h5" component="div" sx={{mb: 2, alignSelf: 'center'}}>
                        Настройки пользователя
                    </Typography>

                    {/* Выбор темы */}
                    <FormControl fullWidth sx={{mb: 2}}>
                        <InputLabel id="theme-mode-select-label">Тема</InputLabel>
                        <Select
                            labelId="theme-mode-select-label"
                            value={mode}
                            label="Тема"
                            onChange={(e) => setMode(e.target.value as string)}
                            required
                        >
                            <MenuItem value="light">Светлая</MenuItem>
                            <MenuItem value="dark">Тёмная</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Выбор текущего словаря */}
                    {dictionaries && dictionaries.length > 0 ? (
                        <FormControl fullWidth sx={{mb: 2}}>
                            <InputLabel id="dictionary-select-label">Текущий словарь</InputLabel>
                            <Select
                                labelId="dictionary-select-label"
                                value={selectedDictionaryId}
                                label="Текущий словарь"
                                onChange={handleDictionaryChange}
                                required
                            >
                                {dictionaries.map((dict) => (
                                    <MenuItem key={dict.id} value={dict.id}>
                                        {dict.name} ({dict.language})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : (
                        <Alert severity="warning" sx={{mb: 2}}>
                            У вас нет словарей. Создайте словарь прежде чем изменять настройки.
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" sx={{width: '100%', mb: 2}}>
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
                        Сохранить настройки
                    </Button>
                </Paper>
            )}

            {/* Snackbar для уведомления об успешном сохранении */}
            <Snackbar
                open={showSnackbar}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message="Настройки успешно сохранены"
            />

            {/* Snackbar для уведомления об ошибке */}
            <Snackbar
                open={openErrorSnackbar}
                autoHideDuration={10000}
                onClose={handleErrorSnackbarClose}
                message={`Ошибка: ${typeof updateError === 'object' ? updateError?.detail : updateError || error}`}
            />
        </Box>
    );
};
