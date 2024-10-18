import { GlobalStyles as MUIGlobalStyles } from '@mui/material';
import React from 'react';
import { useTheme } from '@mui/material/styles';

export const GlobalStyles: React.FC = () => {
  const theme = useTheme();

  return (
    <MUIGlobalStyles
      styles={{
        body: {
          margin: 0,
          padding: 0,
          background: theme.customBackground.gradient,
          minHeight: '100vh',
          transition: theme.transitions.create(['background'], {
            duration: theme.transitions.duration.standard,
          }),
        },
        /* Styles for WebKit browsers */
        '*::-webkit-scrollbar': {
          width: '12px',
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#555',
          borderRadius: '6px',
        },
        /* Styles for Firefox */
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#555 #f1f1f1',
        },
      }}
    />
  );
};
