import React, {useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store";
import {registerUser} from "../../redux/slices/registrationSlice";

import {TextField, Button, Box, Typography, Avatar, IconButton} from '@mui/material';


export const RegistrationPage: React.FC = () => {
    // диспатч для отправки действий в Стор
    const dispatch = useDispatch<AppDispatch>();
    //Cостояние действия - pending, fulfilled, reject - для отображения на нашей страницы
    //Что бы отобразить на странице - Loading... \ Success! \ Error:"oops!"
    const {loading, success, error, responseData} = useSelector((state: RootState) => state.registration);


    //Создали локальный Стейт - где хранить данные заполеные в Форме
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Локальное состояние для ошибок формы
    const [localError, setLocalError] = useState<{ confirm_password?: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        //
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Проверка на совпадение паролей
        if (password !== confirmPassword) {
            setLocalError({confirm_password: `Passwords don't match!`});
            return;
        }

        //отправляем данные на регистрацию
        dispatch(registerUser({username, password, email}));
    };


    return (
        <Box component="form" onSubmit={handleSubmit}
             sx={{width: '300px', margin: 'auto', mt: 5}}>

            <Typography variant="h5" sx={{mb: 2, color: 'green'}}>
                {success ? `Success registration ${responseData?.username}!` : null}
            </Typography>

            <Typography variant="h5" sx={{mb: 2, color: 'red'}}>
                {typeof error === 'string' ? error : null}
            </Typography>


            <Typography variant="h5" sx={{mb: 2}}>
                Registration
            </Typography>

            <TextField
                label="Username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                fullWidth
                sx={{mb: 2}}
                autoComplete="username"
                error={!!error?.username}
                helperText={error?.username ? error.username.join(' ') : ''}
            />

            <TextField
                type="password"
                label="Password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                sx={{mb: 2}}
                autoComplete="new-password"
            />

            <TextField
                type="password"
                label="Password confirm"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
                sx={{mb: 2}}
                autoComplete="new-password"
                error={!!localError.confirm_password}
                helperText={localError.confirm_password}
            />

            <TextField
                type="email"
                label="Email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                sx={{mb: 2}}
                error={!!error?.email}
                helperText={error?.email ? error.email.join(' ') : ''}
            />


            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? 'Loading...' : 'Registration'}
            </Button>
        </Box>
    );

};
