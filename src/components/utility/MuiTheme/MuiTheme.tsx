import {createTheme} from '@mui/material/styles';
import {blue, red} from '@mui/material/colors';

import {getGradient} from "@/utils/getGradient.ts";

declare module '@mui/material/styles' {
    interface Theme {
        customBackground: {
            gradient: string;
            paperGradient: string;
        };
        customColors: {
            gradientStart: string;
            gradientEnd: string;
            paperGradientStart: string;
            paperGradientEnd: string;
        };
    }

    interface ThemeOptions {
        customBackground?: {
            gradient?: string;
            paperGradient?: string;
        };
        customColors?: {
            gradientStart?: string;
            gradientEnd?: string;
            paperGradientStart?: string;
            paperGradientEnd?: string;
        }
    }
}

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
            divider: isLight ? '#000000' : 'rgba(255, 255, 255, 0.12)',
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
            //изменение разделителя в таблицах
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderBottom: isLight
                            ? '1px solid rgba(47,47,45,0.42)'   // при светлой теме
                            : '1px solid rgba(255, 255, 255, 0.12)', // при тёмной
                    },
                },
            },
            //  Указываем стили по умолчанию для Drawer
            MuiDrawer: {
                defaultProps: {
                    PaperProps: {
                        sx: {
                            backgroundColor: 'rgba(255, 255, 255, 0.11)',   // Полупрозрачный цвет 07
                            backdropFilter: 'blur(15px)',                    // Применяем blur, эффект размытия 11-15
                            // boxShadow: 'none',                           //Убираем/упрощаем тень
                        },
                    },
                    slotProps: {
                        backdrop: {
                            sx: {
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            },
                        },
                    },
                },
                // изменить стили root или paper через styleOverrides:
                // styleOverrides: {
                //   paper: {
                //     // что-то вроде
                //     backgroundColor: 'rgba(255,255,255,0.07)',
                //     backdropFilter: 'blur(3px)',
                //   },
                // },
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