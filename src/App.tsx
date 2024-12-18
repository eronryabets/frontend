import React, {useEffect} from 'react';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor, RootState, AppDispatch} from './redux/store';

import {ThemeProvider} from '@mui/material/styles';
import {MuiTheme} from "./components/MuiTheme";
import {CssBaseline} from "@mui/material";
import {RegistrationPage} from "./components/RegistrationPage";
import {HelmetProvider} from "react-helmet-async";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {LoginPage} from "./components/LoginPage";
import {ProfilePage} from "./components/UserComponents";
import {NotFoundPage} from "./components/NotFoundPage";
import {ProtectedRoute} from "./components/ProtectedRoute";
import {BookUpload} from "./components/BookComponents/BookUpload";
import {BooksList} from "./components/BookComponents/BookList";
import {BookDetail} from "./components/BookComponents/BookDetail";
import {GlobalStyles} from './styles';
import {PageDetail} from "./components/BookComponents/PageDetail/PageDetail";
import Layout from "./components/Layout/Layout";
import DictionariesList from "./components/DictionariesComponents/DictionariesList/DictionariesList";
import WordsList from "./components/DictionariesComponents/WordsList/WordsList";
import {UserSettingsPage} from "./components/UserComponents";
import {setTheme} from "./redux/slices/themeSlice";

const AppContent = () => {
    const dispatch = useDispatch<AppDispatch>();
    const themeMode = useSelector((state: RootState) => state.theme.mode);
    const theme = React.useMemo(() => MuiTheme(themeMode), [themeMode]);

    const isAuthenticated = useSelector((state: RootState) => state.authorization.isAuthenticated);
    const userData = useSelector((state: RootState) => state.userInfo.userData);

    // Эффект, который отслеживает изменения userData и аутентификации - применяет, подгружает наши настройки и т.д.
    React.useEffect(() => {
        if (isAuthenticated && userData.id && userData.settings && userData.settings.theme?.mode) {
            const userThemeMode = userData.settings.theme.mode as 'light' | 'dark';
            if (themeMode !== userThemeMode) {
                console.log("THEME MODE = 'light' | 'dark'");
                dispatch(setTheme(userThemeMode));
            }
        }
    }, [isAuthenticated, userData, dispatch, themeMode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <GlobalStyles/>
            <Routes>
                {/* Защищенные маршруты */}
                <Route element={<ProtectedRoute/>}>
                    <Route element={<Layout/>}>
                        {/*USER*/}
                        <Route path="/profile" element={<ProfilePage/>}/>
                        <Route path="/settings" element={<UserSettingsPage/>}/>
                        {/*BOOK*/}
                        <Route path="/book" element={<BookUpload/>}/>
                        <Route path="/booklist" element={<BooksList/>}/>
                        <Route path="/book/:id" element={<BookDetail/>}/>
                        <Route path="/books/:bookId/chapters/:chapterId/pages/:pageNumber" element={<PageDetail/>}/>
                        {/*DICTIONARY*/}
                        <Route path="/dictionaries" element={<DictionariesList />} />
                        <Route path="/dictionary/:id" element={<WordsList />} />
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
