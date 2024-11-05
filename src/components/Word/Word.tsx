import React, { MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTranslation } from '../../redux/slices/translationSlice';
import { AppDispatch } from '../../redux/store';
import { Typography } from '@mui/material';

interface WordProps {
    word: string;
    onClick: (event: MouseEvent<HTMLSpanElement>, word: string) => void;
}

const Word: React.FC<WordProps> = ({ word, onClick }) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
        event.stopPropagation(); // Предотвращаем всплытие события
        onClick(event, word); // Теперь два аргумента соответствуют типу
    };

    return (
        <span
            onClick={handleClick}
            style={{ cursor: 'pointer', position: 'relative' }}
        >
            {word}{' '}
        </span>
    );
};

export default Word;
