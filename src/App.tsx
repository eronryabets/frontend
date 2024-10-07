import React from 'react';
import {Provider, useSelector} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor, RootState} from './redux/store';

import {createTheme, ThemeProvider} from '@mui/material/styles';
import {MuiTheme} from "./components/MuiTheme";
import {CssBaseline} from "@mui/material";
import {RegistrationPage} from "./components/RegistrationPage";
import {HelmetProvider} from "react-helmet-async";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {LoginPage} from "./components/LoginPage";
import {ProfilePage} from "./components/ProfilePage";
import {NotFoundPage} from "./components/NotFoundPage";
import {NavBar} from "./components/NavBar";

function App() {

    // Получаем текущее состояние темы из Redux
    const themeMode = useSelector((state: RootState) => state.theme.mode);
    // Создаём тему на основе текущего состояния
    const theme = React.useMemo(() => MuiTheme(themeMode), [themeMode]);

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <HelmetProvider>
                    <ThemeProvider theme={theme}>
                        <CssBaseline/>
                        <Router>
                            <Routes>
                                <Route element={<NavBar/>}>
                                    <Route path="/profile" element={<ProfilePage/>}/>
                                </Route>
                                <Route path="/registration" element={<RegistrationPage/>}/>
                                <Route path="/login" element={<LoginPage/>}/>
                                <Route path="/profile" element={<ProfilePage/>}/>
                                <Route path="*" element={<NotFoundPage/>}/>
                            </Routes>
                        </Router>
                    </ThemeProvider>
                </HelmetProvider>
            </PersistGate>
        </Provider>
    );
}

export default App;
