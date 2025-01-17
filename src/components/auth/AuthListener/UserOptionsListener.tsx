import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '@/redux/store.ts';
import { fetchWordsProgress } from '@/redux/slices/wordsProgressSlice.ts';

/**
 * Компонент UserOptionsListener
 * Отслеживает аутентификацию пользователя и инициирует загрузку словарей и прогресса слов.
 * Компонент не рендерит ничего (возвращает null).
 */

export const UserOptionsListener: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector((state: RootState) => state.authorization.isAuthenticated);

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

export default UserOptionsListener;
