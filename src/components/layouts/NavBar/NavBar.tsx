import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAppDispatch } from '@/redux/hooks.ts';

import { RootState } from "@/redux/store.ts";
import { toggleTheme } from "@/redux/slices/themeSlice.ts";
import { logout } from "@/redux/slices/authorizationSlice.ts";

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
    Fade,
    useTheme,
    useMediaQuery
} from '@mui/material';

import {
    Brightness7 as Brightness7Icon,
    Brightness4 as Brightness4Icon,
    Menu as MenuIcon
} from '@mui/icons-material';

import { USER_API_MEDIA_URL } from "@/config/urls.ts";

export const NavBar = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();

    // Текущее состояние темы и данные юзера
    const themeMode = useSelector((state: RootState) => state.theme.mode);
    const userData = useSelector((state: RootState) => state.userInfo.userData);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // *** Состояния для меню user'а
    const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const isUserMenuOpen = Boolean(userMenuAnchorEl);

    // *** Состояние для «мобильного» меню (бургер) ***
    const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);

    // === Обработчики для user-menu ===
    const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setUserMenuAnchorEl(event.currentTarget);
    };
    const handleUserMenuClose = () => {
        setUserMenuAnchorEl(null);
    };

    // === Обработчики для mobile-menu (бургер) ===
    const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMobileMenuAnchorEl(event.currentTarget);
    };
    const handleMobileMenuClose = () => {
        setMobileMenuAnchorEl(null);
    };

    // Функция переключения темы
    const handleThemeToggle = () => {
        dispatch(toggleTheme());
    };

    // Logout Handler
    const handleLogout = () => {
        handleUserMenuClose();
        dispatch(logout()).then((result) => {
            if (logout.fulfilled.match(result)) {
                console.log("Logout successful");
            } else if (logout.rejected.match(result)) {
                console.error("Logout failed:", result.error.message);
            }
        });
    };

    // Подсветка кнопок
    const isActive = (paths: string[] | string) => {
        if (Array.isArray(paths)) {
            return paths.some((p) => location.pathname.startsWith(p));
        }
        return location.pathname.startsWith(paths);
    };
    const vocabularyActive = isActive(['/dictionaries', '/dictionary']);
    const trainingActive = isActive('/training');
    const booksActive = isActive(['/books', '/book']);

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    component={Link}
                    to="/books"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                    }}
                >
                    Reader
                    <Box
                        component="span"
                        sx={{
                            fontFamily: 'inherit',
                            fontSize: '1.0em',
                            color: 'orange',
                        }}
                    >
                        i
                    </Box>
                </Typography>

                {/* Если НЕ мобильное устройство, показываем кнопки. Иначе — иконку меню */}
                {isMobile ? (
                    <>
                        {/* Кнопка-иконка «бургер», по клику открываем меню (Menu) */}
                        <IconButton color="inherit" onClick={handleMobileMenuOpen}>
                            <MenuIcon/>
                        </IconButton>
                    </>
                ) : (
                    <>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/dictionaries"
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: vocabularyActive
                                        ? 'rgba(255,255,255,0.2)'
                                        : 'transparent',
                                    borderRadius: 1,
                                    mr: 2,
                                    transition: 'background-color 0.3s',
                                    '&:hover': {
                                        backgroundColor: vocabularyActive
                                            ? 'rgba(255,255,255,0.3)'
                                            : 'rgba(255,255,255,0.1)',
                                    },
                                }}
                            >
                                Vocabulary
                            </Button>

                            <Button
                                color="inherit"
                                component={Link}
                                to="/training"
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: trainingActive
                                        ? 'rgba(255,255,255,0.2)'
                                        : 'transparent',
                                    borderRadius: 1,
                                    mr: 2,
                                    transition: 'background-color 0.3s',
                                    '&:hover': {
                                        backgroundColor: trainingActive
                                            ? 'rgba(255,255,255,0.3)'
                                            : 'rgba(255,255,255,0.1)',
                                    },
                                }}
                            >
                                Training
                            </Button>

                            <Button
                                color="inherit"
                                component={Link}
                                to="/books"
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: booksActive
                                        ? 'rgba(255,255,255,0.2)'
                                        : 'transparent',
                                    borderRadius: 1,
                                    mr: 2,
                                    transition: 'background-color 0.3s',
                                    '&:hover': {
                                        backgroundColor: booksActive
                                            ? 'rgba(255,255,255,0.3)'
                                            : 'rgba(255,255,255,0.1)',
                                    },
                                }}
                            >
                                Books
                            </Button>
                        </Box>
                    </>
                )}

                {/* Кнопка переключения темы */}
                <IconButton onClick={handleThemeToggle} color="inherit" sx={{mr: 1}}>
                    {themeMode === 'dark' ? <Brightness7Icon/> : <Brightness4Icon/>}
                </IconButton>

                {/* Кнопка-аватар пользователя */}
                <Tooltip title="Открыть меню">
                    <IconButton onClick={handleUserMenuOpen} sx={{p: 0}}>
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
                    <MenuItem component={Link} to="/settings" onClick={handleUserMenuClose}>
                        Settings
                    </MenuItem>
                    <MenuItem component={Link} to="/dictionaries" onClick={handleUserMenuClose}>
                        Dictionaries
                    </MenuItem>
                    <MenuItem component={Link} to="/books" onClick={handleUserMenuClose}>
                        Books
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>

                {/* Мобильное меню (Menu), вместо PC меню */}
                <Menu
                    id="mobile-menu"
                    anchorEl={mobileMenuAnchorEl}
                    open={isMobileMenuOpen}
                    onClose={handleMobileMenuClose}
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
                    <MenuItem
                        component={Link}
                        to="/dictionaries"
                        onClick={handleMobileMenuClose}
                        sx={{
                            backgroundColor: vocabularyActive
                                ? 'rgba(255,255,255,0.2)'
                                : 'transparent',
                        }}
                    >
                        Vocabulary
                    </MenuItem>
                    <MenuItem
                        component={Link}
                        to="/training"
                        onClick={handleMobileMenuClose}
                        sx={{
                            backgroundColor: trainingActive
                                ? 'rgba(255,255,255,0.2)'
                                : 'transparent',
                        }}
                    >
                        Training
                    </MenuItem>
                    <MenuItem
                        component={Link}
                        to="/books"
                        onClick={handleMobileMenuClose}
                        sx={{
                            backgroundColor: booksActive
                                ? 'rgba(255,255,255,0.2)'
                                : 'transparent',
                        }}
                    >
                        Books
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;
