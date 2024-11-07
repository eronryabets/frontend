import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    Typography,
    IconButton,
    Drawer,
    Stack,
    Tooltip
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import {languageOptions} from "../../config/languageOptions";

interface TextToSpeechProps {
    text: string;
    bookLanguage: string;
    languages?: Array<{ code: string; name: string }>;
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, bookLanguage, languages }) => {

    const availableLanguages = languages && languages.length > 0 ? languages : languageOptions;

    // Состояния для параметров озвучивания
    const [language, setLanguage] = useState<string>(bookLanguage); // Установили язык который указан в книге
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

    // Состояние для загрузки голосов
    const [voicesLoaded, setVoicesLoaded] = useState<boolean>(false);

    // Состояние для текущего индекса символа (для паузы и возобновления)
    const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);

    // Получение доступных голосов при монтировании и при изменении языка
    useEffect(() => {
        if (!language) {
            setSelectedVoiceName('');
            return;
        }

        const handleVoicesChanged = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                setVoicesLoaded(true);

                const voicesForLanguage = availableVoices.filter(voice => voice.lang === language);

                // Ищем Google голос среди голосов для текущего языка
                const googleVoice = voicesForLanguage.find(
                    voice => voice.name.toLowerCase().includes('google')
                );

                if (googleVoice) {
                    setSelectedVoiceName(googleVoice.name);
                } else if (voicesForLanguage.length > 0) {
                    // Если Google голос не найден, выбираем первый доступный голос для языка
                    setSelectedVoiceName(voicesForLanguage[0].name);
                } else if (availableVoices.length > 0) {
                    // Если нет голосов для языка, выбираем первый доступный голос из общего списка
                    setSelectedVoiceName(availableVoices[0].name);
                } else {
                    setSelectedVoiceName('');
                }
            }
        };

        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        handleVoicesChanged(); // Попытка загрузки голосов сразу

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        };
    }, [language]);

    // Функции управления озвучиванием
    const handlePlay = () => {
        if ('speechSynthesis' in window) {
            // Проверяем, есть ли голоса
            if (voices.length === 0) {
                alert('Голоса ещё не загружены. Пожалуйста, попробуйте позже.');
                return;
            }

            if (!language) {
                alert('Пожалуйста, выберите язык.');
                return;
            }

            if (!selectedVoiceName) {
                alert('Голос не выбран или недоступен.');
                return;
            }

            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text.slice(currentCharIndex));
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

            // Отслеживаем текущий индекс символа
            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    setCurrentCharIndex(currentCharIndex + event.charIndex);
                }
            };

            utterance.onstart = () => {
                setIsSpeaking(true);
                setIsPaused(false);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
                setIsPaused(false);
                setCurrentCharIndex(0); // Сбрасываем индекс после завершения
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
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel(); // Отменяем текущую озвучку
            setIsPaused(true);
            setIsSpeaking(false);
        }
    };

    const handleResume = () => {
        if (isPaused) {
            setIsPaused(false);
            setIsSpeaking(true);
            handlePlay(); // Запускаем озвучку с текущего индекса
        }
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentCharIndex(0); // Сбрасываем индекс
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
                            onChange={(e) => {
                                setLanguage(e.target.value);
                                setCurrentCharIndex(0); // Сбрасываем индекс при смене языка
                            }}
                        >
                            {availableLanguages.map((lang) => (
                                <MenuItem key={lang.code} value={lang.code}>
                                    {lang.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Выбор голоса */}
                    <FormControl fullWidth sx={{ mb: 2 }} disabled={!language}>
                        <InputLabel id="tts-voice-select-label">Голос</InputLabel>
                        <Select
                            labelId="tts-voice-select-label"
                            value={voices.some(voice => voice.name === selectedVoiceName) ? selectedVoiceName : ''}
                            label="Голос"
                            onChange={(e) => {
                                setSelectedVoiceName(e.target.value);
                                setCurrentCharIndex(0); // Сбрасываем индекс при смене голоса
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

                    {/* Кнопки управления озвучкой с иконками */}
                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                        {!isSpeaking && (
                            <Tooltip title="Воспроизвести">
                                <IconButton
                                    color="primary"
                                    onClick={handlePlay}
                                    disabled={!voicesLoaded || !language || !selectedVoiceName}
                                >
                                    <PlayArrowIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        {isSpeaking && (
                            <Tooltip title="Пауза">
                                <IconButton
                                    color="secondary"
                                    onClick={handlePause}
                                >
                                    <PauseIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        {isPaused && (
                            <Tooltip title="Продолжить">
                                <IconButton
                                    color="primary"
                                    onClick={handleResume}
                                >
                                    <PlayArrowIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        {(isSpeaking || isPaused) && (
                            <Tooltip title="Остановить">
                                <IconButton
                                    color="error"
                                    onClick={handleStop}
                                >
                                    <StopIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Box>
            </Drawer>
        </>
    );
};

export default TextToSpeech;
