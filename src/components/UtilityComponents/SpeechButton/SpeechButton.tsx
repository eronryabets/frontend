
import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import StopIcon from '@mui/icons-material/Stop';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

interface SpeechButtonProps {
    wordId: string;
    text: string;
    lang: string; // Язык для озвучивания, например, 'en-US'
}

const SpeechButton: React.FC<SpeechButtonProps> = ({ wordId, text, lang }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        const handleSpeechEnd = () => {
            setIsSpeaking(false);
        };

        const handleSpeechError = () => {
            setIsSpeaking(false);
        };

        // Добавляем слушатели событий
        window.speechSynthesis.addEventListener('end', handleSpeechEnd);
        window.speechSynthesis.addEventListener('error', handleSpeechError);

        // Очищаем слушатели при размонтировании
        return () => {
            window.speechSynthesis.removeEventListener('end', handleSpeechEnd);
            window.speechSynthesis.removeEventListener('error', handleSpeechError);
        };
    }, []);

    const handleSpeak = () => {
        if (!isSpeaking) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = lang;

                utterance.onstart = () => {
                    setIsSpeaking(true);
                };

                utterance.onend = () => {
                    setIsSpeaking(false);
                };

                utterance.onerror = () => {
                    setIsSpeaking(false);
                };

                window.speechSynthesis.speak(utterance);
            } else {
                alert('Ваш браузер не поддерживает Web Speech API.');
            }
        } else {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    return (
        <Tooltip title={isSpeaking ? "Остановить озвучивание" : "Озвучить слово"}>
            <IconButton
                onClick={handleSpeak}
                color={isSpeaking ? "secondary" : "primary"}
                aria-label="speak text"
                sx={{ mr: 1 }}
            >
                {isSpeaking ? <StopIcon /> : <VolumeUpIcon />}
            </IconButton>
        </Tooltip>
    );
};

export default SpeechButton;
