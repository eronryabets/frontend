import {TextField, Button, Box, Typography} from '@mui/material';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store";
import React, {useEffect, useState} from "react";
import {authorizationUser} from "../../redux/slices/authorizationSlice";
import {getUserInfo} from "../../redux/slices/userInfoSlice";
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
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(authorizationUser(formData));
        // dispatch(getUserInfo());
    };

     // Редирект после успешного логина
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/profile');
        }
    }, [isAuthenticated, navigate]);

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{width: '300px', margin: 'auto', mt: 5}}>
            <Typography variant="h5" sx={{mb: 2}}>
                Login
            </Typography>

            <Typography variant="h5" sx={{mb: 2, color: 'red'}}>
                {error ? error : null}
            </Typography>

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
    );

};
