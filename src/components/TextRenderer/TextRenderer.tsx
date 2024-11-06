import React from 'react';
import { Word } from '../Word';

interface TextRendererProps {
    content: string;
    onWordClick: (event: React.MouseEvent<HTMLSpanElement>, word: string) => void;
}

export const TextRenderer: React.FC<TextRendererProps> = ({ content, onWordClick }) => {
    // Регулярное выражение для разделения текста на слова, знаки препинания и пробелы
     const tokens = content.match(/(\n|\s+|[\w'-]+|[^\s\w])/g) || [];

    return (
        <>
            {tokens.map((token, index) => {
                if (token === '\n') {
                    // Если токен - перенос строки, отображаем <br />
                    return <br key={index} />;
                } else if (/^\s+$/.test(token)) {
                    // Если токен состоит только из пробелов или табуляций, отображаем его как есть
                    return <span key={index}>{token}</span>;
                } else if (/^[\w'-]+$/.test(token)) {
                    // Если токен - слово (включая апострофы и дефисы), оборачиваем его в компонент Word
                    return <Word key={index} word={token} onClick={onWordClick} />;
                } else {
                    // Если токен - знак препинания или другой символ, отображаем его как есть
                    return <span key={index}>{token}</span>;
                }
            })}
        </>
    );
};

export default TextRenderer;
