
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {AppDispatch, RootState} from "../../redux/store";
import {setTheme} from "../../redux/slices/themeSlice";
import {fetchDictionaries} from "../../redux/slices/dictionarySlice";


const AuthListener: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector((state: RootState) => state.authorization.isAuthenticated);
    const userData = useSelector((state: RootState) => state.userInfo.userData);
    const dictionariesState = useSelector((state: RootState) => state.dictionaries.dictionaries);

    // Используем ref для отслеживания, выполнили ли мы уже начальные действия
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (isAuthenticated && userData.id && !hasInitialized.current) {
            // Устанавливаем тему, если она указана в настройках пользователя
            if (userData.settings?.theme?.mode) {
                const userThemeMode = userData.settings.theme.mode as 'light' | 'dark';
                dispatch(setTheme(userThemeMode));
            }

            // Загружаем словари, если они еще не загружены
            if (!dictionariesState || dictionariesState.length === 0) {
                dispatch(fetchDictionaries(1));
            }

            // Помечаем, что инициализация выполнена
            hasInitialized.current = true;
        }
    }, [isAuthenticated, userData, dictionariesState, dispatch]);

    return null; // Этот компонент не рендерит ничего
};

export default AuthListener;
