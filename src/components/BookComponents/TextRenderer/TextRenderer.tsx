import React from 'react';
import {Word} from '../../DictionariesComponents/Word';

interface TextRendererProps {
    content: string;
    onWordClick: (event: React.MouseEvent<HTMLSpanElement>, word: string) => void;
    highlightWord?: (word: string) => React.CSSProperties | undefined;
}

export const TextRenderer: React.FC<TextRendererProps> = ({content, onWordClick, highlightWord}) => {
    // Регулярное выражение для разделения текста на слова, знаки препинания и пробелы
    const tokens = content.match(/(\n|\s+|[\w'-]+|[^\s\w])/g) || [];

    return (
        <>
            {tokens.map((token, index) => {
                if (token === '\n') {
                    // Если токен - перенос строки, отображаем <br />
                    return <br key={index}/>;
                } else if (/^\s+$/.test(token)) {
                    // Если токен состоит только из пробелов или табуляций, отображаем его как есть
                    return <span key={index}>{token}</span>;
                } else if (/^[\w'-]+$/.test(token)) {
                    // Если токен - слово, получаем стили подсветки
                    const style = highlightWord ? highlightWord(token) : undefined;
                    const isHighlighted = style !== undefined; // если style есть, значит слово подсвечено
                    return (
                        <Word
                            key={index}
                            word={token}
                            onClick={onWordClick}
                            style={style}
                            isHighlighted={isHighlighted} // Передаем проп, указывающий, подсвечено ли слово
                        />
                    );
                } else {
                    // Если токен - знак препинания или другой символ, отображаем его как есть
                    return <span key={index}>{token}</span>;
                }
            })}
        </>
    );
};

export default TextRenderer;
