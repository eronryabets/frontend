import React, {MouseEvent} from 'react';

interface WordProps {
    word: string;
    onClick: (event: MouseEvent<HTMLSpanElement>, word: string) => void;
    style?: React.CSSProperties;        // Стили, например, фон для подсветки
    isHighlighted?: boolean;           // Добавляем признак, что слово подсвечено
}

export const Word: React.FC<WordProps> = ({word, onClick, style, isHighlighted}) => {

    const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
        event.stopPropagation(); // Предотвращаем всплытие события
        onClick(event, word); // Передаём два аргумента
    };

    return (
        <span
            onClick={handleClick}
            style={{
                ...style,
                ...(isHighlighted
                        ? {cursor: 'pointer'}   // Если слово подсвечено, показываем «указатель» при наведении
                        : undefined
                ),
            }}
        >
      {word}
    </span>
    );
};

export default Word;
