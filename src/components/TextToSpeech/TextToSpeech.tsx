// src/components/TextToSpeech/TextToSpeech.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    Typography,
    Stack
} from '@mui/material';

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

    // Реф для хранения текущего Utterance
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Получение доступных голосов при монтировании
    useEffect(() => {
        const populateVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
        };

        populateVoices();
        window.speechSynthesis.onvoiceschanged = populateVoices;
    }, []);

    // Функция для воспроизведения текста
    const handlePlay = () => {
        if ('speechSynthesis' in window) {
            // Остановить любую текущую озвучку
            window.speechSynthesis.cancel();

            // Создать новое Utterance
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language; // Установить выбранный язык
            utterance.pitch = pitch;    // Высота тона
            utterance.rate = rate;      // Скорость речи
            utterance.volume = volume;  // Громкость

            // Выбор голоса, соответствующего выбранному языку
            const selectedVoice = voices.find(voice => voice.lang === language);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            } else {
                alert(`Голос для языка ${language} не найден.`);
                return;
            }

            // Обработчики событий
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

            // Сохранить Utterance в ref
            utteranceRef.current = utterance;

            // Начать озвучивание
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Ваш браузер не поддерживает Web Speech API.');
        }
    };

    // Функция для паузы озвучивания
    const handlePause = () => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    // Функция для продолжения озвучивания
    const handleResume = () => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    };

    // Функция для остановки озвучивания
    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    return (
        <Box>
            {/* Контролы для настройки озвучивания */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Настройки озвучивания
                </Typography>
                <Grid container spacing={2}>
                    {/* Выбор языка */}
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
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
                    </Grid>

                    {/* Выбор голоса */}
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth disabled={!voices.find(voice => voice.lang === language)}>
                            <InputLabel id="tts-voice-select-label">Голос</InputLabel>
                            <Select
                                labelId="tts-voice-select-label"
                                value={utteranceRef.current?.voice?.name || ''}
                                label="Голос"
                                onChange={(e) => {
                                    const selectedVoice = voices.find(voice => voice.name === e.target.value);
                                    if (selectedVoice && utteranceRef.current) {
                                        utteranceRef.current.voice = selectedVoice;
                                    }
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
                    </Grid>

                    {/* Настройка высоты тона */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography gutterBottom>Высота тона: {pitch.toFixed(1)}</Typography>
                        <Slider
                            value={pitch}
                            min={0}
                            max={2}
                            step={0.1}
                            onChange={(e, newValue) => setPitch(newValue as number)}
                            aria-labelledby="tts-pitch-slider"
                        />
                    </Grid>

                    {/* Настройка скорости речи */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography gutterBottom>Скорость речи: {rate.toFixed(1)}</Typography>
                        <Slider
                            value={rate}
                            min={0.1}
                            max={10}
                            step={0.1}
                            onChange={(e, newValue) => setRate(newValue as number)}
                            aria-labelledby="tts-rate-slider"
                        />
                    </Grid>

                    {/* Настройка громкости */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography gutterBottom>Громкость: {volume.toFixed(1)}</Typography>
                        <Slider
                            value={volume}
                            min={0}
                            max={1}
                            step={0.1}
                            onChange={(e, newValue) => setVolume(newValue as number)}
                            aria-labelledby="tts-volume-slider"
                        />
                    </Grid>
                </Grid>
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
    );
};

export default TextToSpeech;
