import React, {useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store";
import {registerUser} from "../../redux/slices/registrationSlice";

import {TextField, Button, Box, Typography, Avatar, IconButton} from '@mui/material';
import {PhotoCamera} from "@mui/icons-material";
import { v4 as uuidv4 } from 'uuid';


export const RegistrationPage: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();
    const {loading, success, error, responseData} = useSelector((state: RootState) => state.registration);


    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        first_name: '',
        last_name: '',
        avatar: null as File | null,
    });

    const {username, password, confirmPassword, email, first_name, last_name} = formData;

    // Локальное состояние для ошибок формы
    const [localError, setLocalError] = useState<{ confirm_password?: string }>({});

    //Локальное состояние для превью аватара
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
            // Очистить ошибку при изменении поля "confirm_password"
            if (name === 'confirm_password') {
                setLocalError((prev) => ({...prev, confirm_password: undefined}));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setLocalError({confirm_password: `Passwords don't match!`});
            return;
        }

        dispatch(registerUser(formData));
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
                required
                fullWidth
                sx={{mb: 2}}
                error={!!error?.email}
                helperText={error?.email ? error.email.join(' ') : ''}
            />

            <TextField
                label="First name"
                name="first_name"
                value={first_name}
                onChange={handleChange}
                fullWidth
                sx={{mb: 2}}
            />

            <TextField
                label="Last name"
                name="last_name"
                value={last_name}
                onChange={handleChange}
                fullWidth
                sx={{mb: 2}}
            />

            {/* Avatar Loading */}
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
                {loading ? 'Loading...' : 'Registration'}
            </Button>
        </Box>
    );

};
