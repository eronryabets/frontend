import {createTheme} from '@mui/material/styles';
export const MuiTheme = (themeMode: 'light' | 'dark') => {

  return createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: 'rgba(137,193,220,0.75)',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });
};

