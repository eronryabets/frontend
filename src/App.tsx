import React from 'react';

import {ThemeProvider} from '@mui/material/styles';
import {MuiTheme} from "./components/MuiTheme";
import {CssBaseline} from "@mui/material";
import {RegistrationPage} from "./components/RegistrationPage";
import {HelmetProvider} from "react-helmet-async";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {LoginPage} from "./components/LoginPage";
import {ProfilePage} from "./components/ProfilePage";
import {NotFoundPage} from "./components/NotFoundPage";

function App() {

    return (
        <HelmetProvider>
            <ThemeProvider theme={MuiTheme}>
                <CssBaseline/>
                 <Router>
                    <Routes>
                        <Route path="/registration" element={<RegistrationPage/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/profile" element={<ProfilePage/>}/>
                        <Route path="*" element={<NotFoundPage/>}/> 
                    </Routes>
                </Router>
            </ThemeProvider>
        </HelmetProvider>
    );
}

export default App;
