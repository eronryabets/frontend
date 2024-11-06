import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTranslation, clearTranslation } from '../redux/slices/translationSlice';
import { AppDispatch } from '../redux/store';

interface UseTextSelectionReturn {
    anchorEl: HTMLElement | null;
    selectedText: string;
    handleTextClick: (event: React.MouseEvent<HTMLDivElement>) => void;
    handleWordClick: (event: React.MouseEvent<HTMLSpanElement>, word: string) => void;
    handlePopoverClose: () => void;
}

export const useTextSelection = (): UseTextSelectionReturn => {
    const dispatch = useDispatch<AppDispatch>();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedText, setSelectedText] = useState<string>('');

    const handleTextClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (text && text.length > 1) { // Минимальная длина 2 символа
            // Нормализация текста: удаление переносов строк и замена нескольких пробелов на один
            const normalizedText = text.replace(/\s+/g, ' ');
            setSelectedText(normalizedText);
            setAnchorEl(event.currentTarget as HTMLElement);
            // Отправляем запрос на перевод
            dispatch(fetchTranslation({
                word: normalizedText,
                source_lang: 'en', // TODO: Динамически определить язык
                target_lang: 'ru',
            }));
        }
    };

    const handleWordClick = (event: React.MouseEvent<HTMLSpanElement>, word: string) => {
        event.stopPropagation(); // Предотвращаем всплытие события
        // Устанавливаем выделенный текст как кликнутое слово
        setSelectedText(word);
        setAnchorEl(event.currentTarget as HTMLElement);
        // Отправляем запрос на перевод
        dispatch(fetchTranslation({
            word: word,
            source_lang: 'en', // TODO: Динамически определить язык
            target_lang: 'ru',
        }));
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
