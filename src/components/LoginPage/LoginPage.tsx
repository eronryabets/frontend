import {TextField, Button, Box, Typography, Alert} from '@mui/material';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store";
import React, {useEffect, useState} from "react";
import {authorizationUser, resetState} from "../../redux/slices/authorizationSlice";
import {useNavigate} from "react-router-dom";


export const LoginPage = () => {

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const {loading, success, error,} = useSelector((state: RootState) => state.authorization.status);
    const userData = useSelector((state: RootState) => state.userInfo.userData);
    const isAuthenticated = useSelector((state: RootState) => state.authorization.isAuthenticated);

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
        //сбрасываем ошибку при вводе
        if (name === 'username') {
            dispatch(resetState());
        }
    };

    //сбрасываем ошибку при обновлении страницы
    useEffect(() => {
        dispatch(resetState());
    }, [dispatch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(authorizationUser(formData));
        // dispatch(getUserInfo());
    };

    // Редирект после успешного логина
    useEffect(() => {
        if (isAuthenticated) {
            // navigate('/profile');
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: 'background.default',
                padding: 2,
            }}
        >
            <Box component="form" onSubmit={handleSubmit}
                 sx={{
                     width: '100%',
                    maxWidth: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    padding: 4,
                    backgroundColor: 'background.paper',
                    boxShadow: 3,
                    borderRadius: 2,
                 }}>
                <Typography variant="h5" sx={{mb: 2}}>
                    Login
                </Typography>

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

                <Typography variant="h5" sx={{mb: 2, color: 'green'}}>
                    {success ? `${userData.username} - login successful!` : null}
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
                    autoComplete="current-password"
                />

                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                    {loading ? 'Loading...' : 'Login'}
                </Button>
            </Box>
        </Box>
    );

};
