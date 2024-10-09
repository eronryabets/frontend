import React from 'react';
import {Provider, useSelector} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor, RootState} from './redux/store';

import {ThemeProvider} from '@mui/material/styles';
import {MuiTheme} from "./components/MuiTheme";
import {CssBaseline} from "@mui/material";
import {RegistrationPage} from "./components/RegistrationPage";
import {HelmetProvider} from "react-helmet-async";
import {BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import {LoginPage} from "./components/LoginPage";
import {ProfilePage} from "./components/ProfilePage";
import {NotFoundPage} from "./components/NotFoundPage";
import {NavBar} from "./components/NavBar";
import {ProtectedRoute} from "./components/ProtectedRoute";

const AppContent = () => {
    const themeMode = useSelector((state: RootState) => state.theme.mode);
    const theme = React.useMemo(() => MuiTheme(themeMode), [themeMode]);
    const location = useLocation();

    // Определяем, нужно ли показывать NavBar в зависимости от текущего маршрута
    const hideNavBarRoutes = ['/login', '/registration', '/notfound'];
    const shouldHideNavBar = hideNavBarRoutes.includes(location.pathname.toLowerCase());

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {!shouldHideNavBar && <NavBar />} {/* Отображаем NavBar только если текущий маршрут не в списке */}
            <Routes>
                {/* Защищенные маршруты */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* Открытые маршруты */}
                <Route path="/registration" element={<RegistrationPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/*" element={<NotFoundPage />} />
            </Routes>
        </ThemeProvider>
    );
};

function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <HelmetProvider>
                    <Router>
                        <AppContent />
                    </Router>
                </HelmetProvider>
            </PersistGate>
        </Provider>
    );
}

export default App;
