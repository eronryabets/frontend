import {createTheme} from '@mui/material/styles';
import {blue, grey, red} from '@mui/material/colors';


declare module '@mui/material/styles' {
    interface Theme {
        customBackground: {
            gradient: string;
            paperGradient: string;
        };
    }

    interface ThemeOptions {
        customBackground?: {
            gradient?: string;
            paperGradient?: string;
        };
    }
}

export const MuiTheme = (themeMode: 'light' | 'dark') => {
    const theme = createTheme({
        transitions: {
            create: (props, options) => {
                const {duration = '300ms', easing = 'ease-in-out', delay} = options || {};
                const propsString = Array.isArray(props) ? props.join(', ') : props;
                let transition = `${propsString} ${duration} ${easing}`;
                if (delay) {
                    transition += ` ${delay}`;
                }
                return transition;
            },
        },
        //Настройка Типографики
        palette: {
            mode: themeMode,
            primary: {
                main: blue[700],
            },
            secondary: {
                main: red[500],
            },
            //Настройка Фонов и Текста
            background: {
                default: themeMode === 'light' ? '#fafafa' : '#303030',
                paper: themeMode === 'light' ? '#ffffff' : '#424242',
            },
            text: {
                primary: themeMode === 'light' ? '#000000' : '#ffffff',
                secondary: themeMode === 'light' ? '#555555' : '#bbbbbb',
            },
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            // Настройка остальных уровней типографики
        },
        //Настройка Компонентов
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8, // Закругленные углы для кнопок
                        padding: '10px 20px',
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none', // Убираем стандартный фон для Paper
                    },
                },
            },
            // Настройка другие компонентов
        },
        //брейкпоинты для настройки стилей в зависимости от размера экрана
        breakpoints: {
            values: {
                xs: 0,
                sm: 600,
                md: 960,
                lg: 1280,
                xl: 1920,
            },
        },
        //Настройка заднего градиента (фона)
        customBackground: {
            gradient:
                themeMode === 'light'
                    ? 'linear-gradient(to bottom, #ffffff, #f0f0f0)'
                    : 'linear-gradient(to bottom, #2e2e2e, #1c1c1c)',
            paperGradient:
                themeMode === 'light'
                    ? 'linear-gradient(to bottom right, rgba(255,255,255,0.8), rgba(240,240,240,0.8))'
                    : 'linear-gradient(to bottom right, rgba(30,30,30,0.8), rgba(66,66,66,0.8))',

        },
    });

    return theme;
};