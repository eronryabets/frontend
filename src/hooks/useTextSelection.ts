import { useState } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { fetchTranslation, clearTranslation } from '../redux/slices/translationSlice';
import {AppDispatch, RootState} from '../redux/store';

interface UseTextSelectionReturn {
    anchorEl: HTMLElement | null;
    selectedText: string;
    handleTextClick: (event: React.MouseEvent<HTMLDivElement>) => void;
    handleWordClick: (event: React.MouseEvent<HTMLSpanElement>, word: string) => void;
    handlePopoverClose: () => void;
}

export const useTextSelection = (bookLanguage: string): UseTextSelectionReturn => {
    const dispatch = useDispatch<AppDispatch>();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedText, setSelectedText] = useState<string>('');
    //для определения языка перевода
    const userData = useSelector((state: RootState) => state.userInfo.userData);
    const {native_language} = userData;

    const handleTextClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (text && text.length > 1 && native_language) { // Проверяем, что native_language не null
            // Нормализация текста: удаление переносов строк и замена нескольких пробелов на один
            const normalizedText = text.replace(/\s+/g, ' ');
            setSelectedText(normalizedText);
            setAnchorEl(event.currentTarget as HTMLElement);

            // Отправляем запрос на перевод
            dispatch(fetchTranslation({
                word: normalizedText,
                source_lang: bookLanguage.slice(0, 2),      // 'en_US' -> 'en'
                target_lang: native_language.slice(0, 2),
            }));
        } else if (!native_language) {
            // Обработка случая, когда native_language отсутствует
            alert('Родной язык не установлен. Пожалуйста, установите родной язык в профиле.');
        }
    };

    const handleWordClick = (event: React.MouseEvent<HTMLSpanElement>, word: string) => {
        event.stopPropagation(); // Предотвращаем всплытие события

        if (word && word.length > 1 && native_language) { // Проверяем, что native_language не null
            setSelectedText(word);
            setAnchorEl(event.currentTarget as HTMLElement);
            // Отправляем запрос на перевод
            dispatch(fetchTranslation({
                word: word,
                source_lang: bookLanguage.slice(0, 2),     // 'en_US' -> 'en'
                target_lang: native_language.slice(0, 2),
            }));
        } else if (!native_language) {
            alert('Родной язык не установлен. Пожалуйста, установите родной язык в профиле.');
        }
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
        setSelectedText('');
        dispatch(clearTranslation());
    };

    return {
        anchorEl,
        selectedText,
        handleTextClick,
        handleWordClick,
        handlePopoverClose,
    };
};

export default useTextSelection;
