import {TextField, Button, Box, Typography} from '@mui/material';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store";
import React, {useState} from "react";
import {authorizationUser} from "../../redux/slices/authorizationSlice";


export const LoginPage = () => {

    const dispatch = useDispatch<AppDispatch>();
    const {loading, success, error,} = useSelector((state: RootState) => state.authorization.status);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const {username, password} = formData;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        dispatch(authorizationUser(formData));
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{width: '300px', margin: 'auto', mt: 5}}>
            <Typography variant="h5" sx={{mb: 2}}>
                Вход
            </Typography>

            <Typography variant="h5" sx={{mb: 2, color: 'red'}}>
                {error ? error : null}
            </Typography>

            <Typography variant="h5" sx={{mb: 2, color: 'green'}}>
                {success ? 'Login successful' : null}
            </Typography>

            <TextField
                label="Имя пользователя"
                name="username"
                value={username}
                onChange={handleChange}
                required
                fullWidth
                sx={{mb: 2}}
                autoComplete="username"
            />

            <TextField
                type="password"
                label="Пароль"
                name="password"
                value={password}
                onChange={handleChange}
                required
                fullWidth
                sx={{mb: 2}}
                autoComplete="current-password"
            />

            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? 'Загрузка...' : 'Войти'}
            </Button>
        </Box>
    );

};
