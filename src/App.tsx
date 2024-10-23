import React from 'react';
import {Provider, useSelector} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor, RootState} from './redux/store';

import {ThemeProvider} from '@mui/material/styles';
import {MuiTheme} from "./components/MuiTheme";
import {CssBaseline, Toolbar} from "@mui/material";
import {RegistrationPage} from "./components/RegistrationPage";
import {HelmetProvider} from "react-helmet-async";
import {BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import {LoginPage} from "./components/LoginPage";
import {ProfilePage} from "./components/ProfilePage";
import {NotFoundPage} from "./components/NotFoundPage";
import {ProtectedRoute} from "./components/ProtectedRoute";
import {BookUpload} from "./components/BookUpload";
import {BooksList} from "./components/BookList";
import {BookDetail} from "./components/BookDetail";
import {GlobalStyles} from './styles';
import {PageDetail} from "./components/PageDetail/PageDetail";
import Layout from "./components/Layout/Layout";

const AppContent = () => {
    const themeMode = useSelector((state: RootState) => state.theme.mode);
    const theme = React.useMemo(() => MuiTheme(themeMode), [themeMode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <GlobalStyles/>
            <Routes>
                {/* Защищенные маршруты */}
                <Route element={<ProtectedRoute/>}>
                    <Route element={<Layout/>}>
                        <Route path="/profile" element={<ProfilePage/>}/>
                        <Route path="/book" element={<BookUpload/>}/>
                        <Route path="/booklist" element={<BooksList/>}/>
                        <Route path="/book/:id" element={<BookDetail/>}/>
                        <Route path="/books/:bookId/chapters/:chapterId/pages/:pageNumber" element={<PageDetail/>}/>
                    </Route>
                </Route>

                {/* Открытые маршруты */}
                <Route path="/registration" element={<RegistrationPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/*" element={<NotFoundPage/>}/>
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
                        <AppContent/>
                    </Router>
                </HelmetProvider>
            </PersistGate>
        </Provider>
    );
}

export default App;
