// src/components/TextToSpeech/TextToSpeech.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    Typography,
    IconButton,
    Drawer,
    Stack
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

interface TextToSpeechProps {
    text: string;
    languages?: Array<{ code: string; name: string }>;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, languages }) => {
    // Список популярных языков, если не передан через props
    const defaultLanguages = [
        { code: 'en-US', name: 'Английский (США)' },
        { code: 'en-GB', name: 'Английский (Великобритания)' },
        { code: 'de-DE', name: 'Немецкий' },
        { code: 'es-ES', name: 'Испанский (Испания)' },
        { code: 'es-MX', name: 'Испанский (Мексика)' },
        { code: 'ru-RU', name: 'Русский' },
        { code: 'uk-UA', name: 'Украинский' },
        { code: 'pl-PL', name: 'Польский' },
        // Добавьте другие языки по необходимости
    ];

    const availableLanguages = languages && languages.length > 0 ? languages : defaultLanguages;

    // Состояния для параметров озвучивания
    const [language, setLanguage] = useState<string>('ru-RU');
    const [pitch, setPitch] = useState<number>(1);
    const [rate, setRate] = useState<number>(1);
    const [volume, setVolume] = useState<number>(1);

    // Состояния для управления озвучиванием
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);

    // Состояние для доступных голосов
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    // Состояние для выбранного голоса
    const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');

    // Реф для хранения текущего Utterance
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Состояние для управления выдвижной панелью
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    // Получение доступных голосов при монтировании
    useEffect(() => {
        const populateVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);

            // Устанавливаем голос по умолчанию для выбранного языка
            const defaultVoice = availableVoices.find(voice => voice.lang === language);
            if (defaultVoice) {
                setSelectedVoiceName(defaultVoice.name);
            }
        };

        populateVoices();
        window.speechSynthesis.onvoiceschanged = populateVoices;
    }, [language]);

    // Функции управления озвучиванием
    const handlePlay = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language;
            utterance.pitch = pitch;
            utterance.rate = rate;
            utterance.volume = volume;

            const selectedVoice = voices.find(voice => voice.name === selectedVoiceName && voice.lang === language);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            } else {
                alert(`Голос для языка ${language} не найден.`);
                return;
            }

            utterance.onstart = () => {
                setIsSpeaking(true);
                setIsPaused(false);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };

            utterance.onerror = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };

            utteranceRef.current = utterance;

            window.speechSynthesis.speak(utterance);
        } else {
            alert('Ваш браузер не поддерживает Web Speech API.');
        }
    };

    const handlePause = () => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    const handleResume = () => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    return (
        <>
            {/* Кнопка для открытия выдвижной панели */}
            <IconButton
                color="primary"
                onClick={() => setIsDrawerOpen(true)}
                sx={{ position: 'fixed', top: 80, left: 10, zIndex: 1000 }}
            >
                <VolumeUpIcon fontSize="large" />
            </IconButton>

            {/* Выдвижная панель */}
            <Drawer
                anchor="left"
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            >
                <Box sx={{ width: 300, p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Настройки озвучивания
                    </Typography>

                    {/* Выбор языка */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="tts-language-select-label">Язык</InputLabel>
                        <Select
                            labelId="tts-language-select-label"
                            value={language}
                            label="Язык"
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            {availableLanguages.map((lang) => (
                                <MenuItem key={lang.code} value={lang.code}>
                                    {lang.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Выбор голоса */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="tts-voice-select-label">Голос</InputLabel>
                        <Select
                            labelId="tts-voice-select-label"
                            value={selectedVoiceName}
                            label="Голос"
                            onChange={(e) => {
                                setSelectedVoiceName(e.target.value);
                            }}
                        >
                            {voices
                                .filter(voice => voice.lang === language)
                                .map((voice) => (
                                    <MenuItem key={voice.name} value={voice.name}>
                                        {voice.name}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>

                    {/* Настройки озвучивания */}
                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>Высота тона: {pitch.toFixed(1)}</Typography>
                        <Slider
                            value={pitch}
                            min={0}
                            max={2}
                            step={0.1}
                            onChange={(e, newValue) => setPitch(newValue as number)}
                            aria-labelledby="tts-pitch-slider"
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>Скорость речи: {rate.toFixed(1)}</Typography>
                        <Slider
                            value={rate}
                            min={0.1}
                            max={10}
                            step={0.1}
                            onChange={(e, newValue) => setRate(newValue as number)}
                            aria-labelledby="tts-rate-slider"
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>Громкость: {volume.toFixed(1)}</Typography>
                        <Slider
                            value={volume}
                            min={0}
                            max={1}
                            step={0.1}
                            onChange={(e, newValue) => setVolume(newValue as number)}
                            aria-labelledby="tts-volume-slider"
                        />
                    </Box>

                    {/* Кнопки управления озвучкой */}
                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                        {!isSpeaking && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handlePlay}
                            >
                                Воспроизвести
                            </Button>
                        )}
                        {isSpeaking && !isPaused && (
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handlePause}
                            >
                                Пауза
                            </Button>
                        )}
                        {isSpeaking && isPaused && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleResume}
                            >
                                Продолжить
                            </Button>
                        )}
                        {isSpeaking && (
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleStop}
                            >
                                Остановить
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Drawer>
        </>
    );
};

export default TextToSpeech;
