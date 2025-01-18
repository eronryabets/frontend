import React, {MouseEvent} from 'react';

interface WordProps {
    word: string;
    onClick: (event: MouseEvent<HTMLSpanElement>, word: string) => void;
    style?: React.CSSProperties;        // Дополнительные стили (например, для подсветки)
    isHighlighted?: boolean;           // Флаг, указывающий, что слово подсвечено
}

/**
 * Компонент Word
 * Отображает слово с возможностью обработки клика, применяя кастомные стили и состояние выделения.
 */

export const Word: React.FC<WordProps> = ({word, onClick, style}) => { // removed ,isHighlighted

    /**
     * Обработчик клика по слову.
     * Останавливает всплытие события и вызывает переданный обработчик с текущим словом.
     */

    const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
        event.stopPropagation(); // Предотвращаем всплытие события
        onClick(event, word); // Вызывает обработчик с аргументами event и word
    };

    return (
        <span
            onClick={handleClick}
            style={{
                  ...style,
                 cursor: 'pointer', // Устанавливаем курсор всегда
                // показываем «указатель» при наведении только для подсвеченного слова.
                // ...(isHighlighted ? {cursor: 'pointer'} : undefined),
            }}
        >
      {word}
    </span>
    );
};

export default Word;
