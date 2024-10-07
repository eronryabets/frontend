import React from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import {
    Avatar,
    Box,
    Typography,
    Paper,
    useTheme,
} from '@mui/material';

export const ProfilePage: React.FC = () => {
    // Достаем данные пользователя из Redux
    const userData = useSelector((state: RootState) => state.authorization.userData);
    // Достаем текущую тему
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh', // Высота равна высоте экрана для центровки по вертикали
                padding: 2,
                backgroundColor: theme.palette.background.default, // Фон в зависимости от темы
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 400, // Максимальная ширина профиля
                    backgroundColor: theme.palette.background.paper, // Цвет карточки зависит от темы
                    color: theme.palette.text.primary, // Цвет текста зависит от темы
                }}
            >
                <Avatar
                    alt="User Avatar"
                    src={`http://user.drunar.space/${userData.avatar}`}
                    sx={{ width: 100, height: 100, mb: 2 }} // Размер аватара и нижний отступ
                />
                <Typography variant="h5" component="div" sx={{ mb: 2 }}>
                    {userData.username || 'Username не указан'}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Email: {userData.email || 'Email не указан'}
                </Typography>
                {userData.first_name && (
                    <Typography variant="body1" color="textSecondary">
                        Имя: {userData.first_name}
                    </Typography>
                )}
                {userData.last_name && (
                    <Typography variant="body1" color="textSecondary">
                        Фамилия: {userData.last_name}
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};
