import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, RootState } from './redux/store';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { GlobalStyles } from './styles';

import {
    MuiTheme,
    Layout,
    RegistrationPage,
    LoginPage,
    ProfilePage,
    NotFoundPage,
    ProtectedRoute,
    DictionariesList,
    UserSettingsPage,
    BookUpload,
    BooksList,
    BookDetail,
    PageDetail,
    WordsList,
    AuthListener,
} from '@/components';



const AppContent = () => {

    const themeMode = useSelector((state: RootState) => state.theme.mode);
    const theme = React.useMemo(() => MuiTheme(themeMode), [themeMode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <GlobalStyles/>
            <AuthListener />
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
