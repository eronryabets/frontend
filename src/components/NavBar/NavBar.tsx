import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Tooltip,
    Button,
    Box,
    Fade
} from '@mui/material';
import { toggleTheme } from "../../redux/slices/themeSlice";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../redux/store";

import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { logout } from "../../redux/slices/authorizationSlice";
import { Link } from "react-router-dom";
import { USER_API_MEDIA_URL } from "../../config";

export const NavBar = () => {
    const dispatch = useAppDispatch();
    const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const [booksMenuAnchorEl, setBooksMenuAnchorEl] = React.useState<null | HTMLElement>(null);


    const themeMode = useSelector((state: RootState) => state.theme.mode);
    const userData = useSelector((state: RootState) => state.userInfo.userData);

    // Handlers for User Menu
    const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setUserMenuAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchorEl(null);
    };

    // Handlers for Books Menu
    const handleBooksMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setBooksMenuAnchorEl(event.currentTarget);
    };

    const handleBooksMenuClose = () => {
        setBooksMenuAnchorEl(null);
    };

    const handleThemeToggle = () => {
        dispatch(toggleTheme());
    };

    // Logout Handler
    const handleLogout = () => {
        handleUserMenuClose(); // Сначала закрываем меню
        dispatch(logout()).then((result) => {
            if (logout.fulfilled.match(result)) {
                console.log("Logout successful");
            } else if (logout.rejected.match(result)) {
                console.error("Logout failed:", result.error.message);
            }
        });
    };

    // Проверка открытости меню
    const isUserMenuOpen = Boolean(userMenuAnchorEl);
    const isBooksMenuOpen = Boolean(booksMenuAnchorEl);

    return (
        <AppBar position="fixed">
            <Toolbar>
                {/* Название приложения */}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Smart Reader
                </Typography>

                {/* Основные кнопки навигации */}
                <Box sx={{display: 'flex', alignItems: 'center',}}>
                    <Button color="inherit">Vocabulary</Button>

                    {/* Кнопка "Books" с выпадающим меню */}
                    <Box
                        sx={{ position: 'relative' }}
                        onMouseEnter={handleBooksMenuOpen}
                        onMouseLeave={handleBooksMenuClose}
                    >
                        <Button
                            color="inherit"
                            aria-controls={isBooksMenuOpen ? 'books-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={isBooksMenuOpen ? 'true' : undefined}
                        >
                            Books
                        </Button>
                        <Menu
                            id="books-menu"
                            anchorEl={booksMenuAnchorEl}
                            open={isBooksMenuOpen}
                            onClose={handleBooksMenuClose}
                            MenuListProps={{
                                onMouseEnter: () => setBooksMenuAnchorEl(booksMenuAnchorEl),
                                onMouseLeave: handleBooksMenuClose,
                            }}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            TransitionComponent={Fade}
                        >
                            <MenuItem component={Link} to="/book" onClick={handleBooksMenuClose}>
                                Book Upload
                            </MenuItem>
                            <MenuItem component={Link} to="/booklist" onClick={handleBooksMenuClose}>
                                Book List
                            </MenuItem>
                        </Menu>
                    </Box>

                    {/* Кнопка переключения темы */}
                    <IconButton onClick={handleThemeToggle}
                                color="inherit"
                                sx={{mr: 1}}
                    >
                        {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>

                    {/* Аватар пользователя с меню */}
                    <Tooltip title="Открыть меню">
                        <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                            <Avatar
                                alt="User Avatar"
                                src={`${USER_API_MEDIA_URL}${userData.avatar}`}
                            />
                        </IconButton>
                    </Tooltip>

                    {/* Меню пользователя */}
                    <Menu
                        id="user-menu"
                        anchorEl={userMenuAnchorEl}
                        open={isUserMenuOpen}
                        onClose={handleUserMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        TransitionComponent={Fade}
                    >
                        <MenuItem component={Link} to="/profile" onClick={handleUserMenuClose}>
                            My Profile
                        </MenuItem>
                        <MenuItem component={Link} to="/vocabulary" onClick={handleUserMenuClose}>
                            Vocabulary
                        </MenuItem>
                        <MenuItem component={Link} to="/book" onClick={handleUserMenuClose}>
                            Books
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};
