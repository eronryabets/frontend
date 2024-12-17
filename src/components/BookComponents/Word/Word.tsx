import React, { MouseEvent } from 'react';

interface WordProps {
    word: string;
    onClick: (event: MouseEvent<HTMLSpanElement>, word: string) => void;
    style?: React.CSSProperties; // <-- Добавлено
}

export const Word: React.FC<WordProps> = ({ word, onClick, style }) => {

    const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
        event.stopPropagation(); // Предотвращаем всплытие события
        onClick(event, word); // Передаём два аргумента
    };

    return (
        <span style={style} onClick={handleClick}>
            {word}
        </span>
    );
};

export default Word;
