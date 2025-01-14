import React from 'react';
import { Outlet } from 'react-router-dom';

import { Box } from '@mui/material';

import { NavBar } from '@/components';

export const Layout: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <NavBar />
            {/*<Toolbar /> /!* Спейсер для отступа при NavBar (AppBar) position=fixed *!/*/}
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Outlet />
            </Box>
        </Box>
    );
};

