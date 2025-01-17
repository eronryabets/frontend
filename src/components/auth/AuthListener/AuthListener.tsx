import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '@/redux/store.ts';
import { setTheme } from '@/redux/slices/themeSlice.ts';
import { fetchDictionaries } from '@/redux/slices/dictionarySlice.ts';
import { fetchWordsProgress } from '@/redux/slices/wordsProgressSlice.ts';

/**
 * Компонент AuthListener
 * Отслеживает аутентификацию пользователя и инициирует загрузку словарей и прогресса слов.
 * Компонент не рендерит ничего (возвращает null).
 */

export const AuthListener: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector((state: RootState) => state.authorization.isAuthenticated);
    const userData = useSelector((state: RootState) => state.userInfo.userData);
    const dictionariesState = useSelector((state: RootState) => state.dictionaries.dictionaries);

    // Используем ref для отслеживания, выполнили ли мы уже начальные действия
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (isAuthenticated && userData.id && !hasInitialized.current) {
            console.log("При аутентификации и наличии userData инициируем загрузку словарей и устанавливаем тему");
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

    useEffect(() => {
        if (!isAuthenticated) {
            // Сбрасываем инициализацию при логауте
            hasInitialized.current = false;
            console.log("Сброс инициализации в AuthListener после логаута");
        }
    }, [isAuthenticated]);

    //Смена word progress при смене выбранного словаря :
    const dictionaryId = useSelector(
        (state: RootState) => state.userInfo.userData.settings?.current_dictionary?.dictionary_id
    );
    useEffect(() => {
        if (isAuthenticated && dictionaryId) {
            console.log("Dictionary changed, re-fetch wordsProgress:", dictionaryId);
            dispatch(fetchWordsProgress({dictionaryId}));
        }
    }, [isAuthenticated, dictionaryId, dispatch]);

    return null; // Этот компонент не рендерит ничего
};

export default AuthListener;
