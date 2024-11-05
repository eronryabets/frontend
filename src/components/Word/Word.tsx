import React, {MouseEvent} from 'react';


interface WordProps {
    word: string;
    onClick: (event: MouseEvent<HTMLSpanElement>, word: string) => void;
}

export const Word: React.FC<WordProps> = ({word, onClick}) => {

    const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
        event.stopPropagation(); // Предотвращаем всплытие события
        onClick(event, word);
    };

    return (
        <span
            onClick={handleClick}
            style={{cursor: 'pointer', position: 'relative'}}
        >
        {word}
    </span>
    );
};

