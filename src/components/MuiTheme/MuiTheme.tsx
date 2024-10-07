import {createTheme} from '@mui/material/styles';
export const MuiTheme = (themeMode: 'light' | 'dark') => {

  return createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });
};

