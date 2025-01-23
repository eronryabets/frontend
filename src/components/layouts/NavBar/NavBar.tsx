import React from 'react';
import {Link, useLocation} from "react-router-dom";
import {useSelector} from "react-redux";
import {useAppDispatch} from '@/redux/hooks.ts';

import {RootState} from "@/redux/store.ts";
import {toggleTheme} from "@/redux/slices/themeSlice.ts";
import {logout} from "@/redux/slices/authorizationSlice.ts";

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
} from '@mui/material';

import {
    Brightness7 as Brightness7Icon,
    Brightness4 as Brightness4Icon,
} from '@mui/icons-material';

import {USER_API_MEDIA_URL} from "@/config/urls.ts";


export const NavBar = () => {
    const dispatch = useAppDispatch();
    const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    // const [booksMenuAnchorEl, setBooksMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const location = useLocation();

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
    // const handleBooksMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    //     setBooksMenuAnchorEl(event.currentTarget);
    // };

    // const handleBooksMenuClose = () => {
    //     setBooksMenuAnchorEl(null);
    // };

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
    // const isBooksMenuOpen = Boolean(booksMenuAnchorEl);

    // Функция для определения, является ли путь активным
    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <AppBar position="static">
            {/* заменил с fixed на static */}
            <Toolbar>
                {/* Название приложения */}
                {/* Кликабельная надпись "Smart Reader" */}
                <Typography
                    variant="h6"
                    component={Link}
                    to="/booklist"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'inherit', // остальной текст наследует цвет темы
                        cursor: 'pointer',
                    }}
                >
                    Reader
                    <Box
                        component="span"
                        sx={{
                            fontFamily: 'inherit',         // Наследуем шрифт основного текста
                            fontSize: '1.0em',               // делаем букву "i" чуть крупнее
                            color: 'orange',                 // устанавливаем оранжевый цвет для буквы "i"
                            // WebkitTextStroke: '1px black',   // добавляем обводку (контура) черного цвета
                        }}
                    >
                        i
                    </Box>
                </Typography>

                {/* Основные кнопки навигации */}
                <Box sx={{display: 'flex', alignItems: 'center',}}>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/dictionaries"
                            sx={{
                                textTransform: 'none',
                                backgroundColor: isActive('/dictionaries')
                                    ? 'rgba(255,255,255,0.2)'
                                    : 'transparent',
                                borderRadius: 1,
                                mr: 2,
                                transition: 'background-color 0.3s',
                                '&:hover': {
                                    backgroundColor: isActive('/dictionaries')
                                        ? 'rgba(255,255,255,0.3)'
                                        : 'rgba(255,255,255,0.1)',
                                },
                            }}
                        >
                            Vocabulary
                        </Button>
                    </Box>

                    <Button
                        color="inherit"
                        component={Link}
                        to="/training"
                        sx={{
                            textTransform: 'none', // убираем заглавные буквы
                            backgroundColor: isActive('/training')
                                ? 'rgba(255,255,255,0.2)' // затемнённый фон для активной вкладки
                                : 'transparent',
                            borderRadius: 1, // для аккуратного скругления углов
                            mr: 2,           // отступ справа
                            transition: 'background-color 0.3s', // плавный переход цвета
                            '&:hover': {
                                backgroundColor: isActive('/training')
                                    ? 'rgba(255,255,255,0.3)' // немного более тёмный при наведении, если активна
                                    : 'rgba(255,255,255,0.1)', // легкое затемнение при наведении, если не активна
                            },
                        }}
                    >
                        Training
                    </Button>

                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/books"
                            sx={{
                                textTransform: 'none',
                                backgroundColor: isActive('/dictionaries')
                                    ? 'rgba(255,255,255,0.2)'
                                    : 'transparent',
                                borderRadius: 1,
                                mr: 2,
                                transition: 'background-color 0.3s',
                                '&:hover': {
                                    backgroundColor: isActive('/dictionaries')
                                        ? 'rgba(255,255,255,0.3)'
                                        : 'rgba(255,255,255,0.1)',
                                },
                            }}
                        >
                            Books
                        </Button>
                    </Box>

                    {/* Кнопка "Books" с выпадающим меню */}
                    {/*<Box*/}
                    {/*    sx={{position: 'relative'}}*/}
                    {/*    onMouseEnter={handleBooksMenuOpen}*/}
                    {/*    onMouseLeave={handleBooksMenuClose}*/}
                    {/*>*/}
                    {/*    <Button*/}
                    {/*        color="inherit"*/}
                    {/*        aria-controls={isBooksMenuOpen ? 'books-menu' : undefined}*/}
                    {/*        aria-haspopup="true"*/}
                    {/*        aria-expanded={isBooksMenuOpen ? 'true' : undefined}*/}
                    {/*    >*/}
                    {/*        Books*/}
                    {/*    </Button>*/}
                    {/*    <Menu*/}
                    {/*        id="books-menu"*/}
                    {/*        anchorEl={booksMenuAnchorEl}*/}
                    {/*        open={isBooksMenuOpen}*/}
                    {/*        onClose={handleBooksMenuClose}*/}
                    {/*        MenuListProps={{*/}
                    {/*            onMouseEnter: () => setBooksMenuAnchorEl(booksMenuAnchorEl),*/}
                    {/*            onMouseLeave: handleBooksMenuClose,*/}
                    {/*        }}*/}
                    {/*        anchorOrigin={{*/}
                    {/*            vertical: 'bottom',*/}
                    {/*            horizontal: 'left',*/}
                    {/*        }}*/}
                    {/*        transformOrigin={{*/}
                    {/*            vertical: 'top',*/}
                    {/*            horizontal: 'left',*/}
                    {/*        }}*/}
                    {/*        TransitionComponent={Fade}*/}
                    {/*    >*/}
                    {/*        <MenuItem component={Link} to="/bookUpload" onClick={handleBooksMenuClose}>*/}
                    {/*            Book Upload*/}
                    {/*        </MenuItem>*/}
                    {/*        <MenuItem component={Link} to="/books" onClick={handleBooksMenuClose}>*/}
                    {/*            Book List*/}
                    {/*        </MenuItem>*/}
                    {/*    </Menu>*/}
                    {/*</Box>*/}

                    {/* Кнопка переключения темы */}
                    <IconButton onClick={handleThemeToggle}
                                color="inherit"
                                sx={{mr: 1}}
                    >
                        {themeMode === 'dark' ? <Brightness7Icon/> : <Brightness4Icon/>}
                    </IconButton>

                    {/* Аватар пользователя с меню */}
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
                </Box>
            </Toolbar>
        </AppBar>
    )
        ;
};
