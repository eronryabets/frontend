import {createTheme} from '@mui/material/styles';

export const MuiTheme = () => {

    // Default Theme
    const theme = createTheme({
        palette: {
            mode: 'dark', // dark / light
            primary: {
                main: '#1976d2', // Main color
            },
            secondary: {
                main: '#dc004e', // Second color
            },
        },
    });

    return (theme);

}

