import {createTheme} from '@mui/material/styles';
import {blue, red} from '@mui/material/colors';
import {getGradient} from "@/utils/getGradient.ts";

export const MuiTheme = (themeMode: 'light' | 'dark') => {
    const isLight = themeMode === 'light';

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
            //Настройка Фонов (элементов) и Текста
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
            fontFamily: '"Helvetica", "Arial", sans-serif', //"Roboto"
            // Настройка остальных уровней типографики
        },
        //Настройка Компонентов
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        //значение из темы:
                        backgroundColor: isLight ? '#b0b0b4' : '#424242',
                        color: isLight ? '#000000' : '#ffffff',
                    },
                },
            },
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
            gradient: getGradient(
                themeMode === 'light' ? '#eadfdf' : '#2e2e2e',
                themeMode === 'light' ? '#f0f0f0' : '#1c1c1c',
                'to bottom'
            ),
            paperGradient: getGradient(
                themeMode === 'light' ? 'rgb(176,176,180)' : 'rgba(30,30,30,0.8)',
                themeMode === 'light' ? 'rgba(240,240,240,0.8)' : 'rgba(66,66,66,0.8)',
                'to bottom right'
            ),
        },
    });

    return theme;
};