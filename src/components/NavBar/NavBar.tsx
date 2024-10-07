import styles from './NavBar.module.scss';
import React from 'react';
import {
    AppBar, Toolbar, Typography, IconButton, Menu, MenuItem,
    Avatar, Tooltip, Button, Switch, Box
} from '@mui/material';
import {toggleTheme} from "../../redux/slices/themeSlice";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/store";

import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';

interface NavBarProps {
}

export const NavBar = () => {

    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const themeMode = useSelector((state: RootState) => state.theme.mode);
    const userData = useSelector((state: RootState) => state.authorization.userData);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleThemeToggle = () => {
        dispatch(toggleTheme());
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                    Smart Reader
                </Typography>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Button color="inherit">Test</Button>
                    <Button color="inherit">Vocabulary</Button>
                    <Button color="inherit">Books</Button>
                    <IconButton onClick={handleThemeToggle} color="inherit">
                        {themeMode === 'dark' ? <Brightness7Icon/> : <Brightness4Icon/>}
                    </IconButton>
                    <Tooltip title="Открыть меню">
                        <IconButton onClick={handleMenuOpen} sx={{p: 0}}>
                            <Avatar
                                alt="User Avatar"
                                src={`http://user.drunar.space/${userData.avatar}`}
                            />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={handleMenuClose}>My Profile</MenuItem>
                        <MenuItem onClick={handleMenuClose}>Vocabulary</MenuItem>
                        <MenuItem onClick={handleMenuClose}>Books</MenuItem>
                        <MenuItem onClick={() => {
                            handleMenuClose(); /* добавить логику для выхода */
                        }}>Выйти</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};