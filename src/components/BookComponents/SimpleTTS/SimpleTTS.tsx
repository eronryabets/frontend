import React, { useEffect, useState } from 'react';

import {
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material';

import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';


const SimpleTTS: React.FC = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [voicesLoaded, setVoicesLoaded] = useState<boolean>(false);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            setVoicesLoaded(true);

            console.log('Доступные голоса:', availableVoices);

            // Устанавливаем голос по умолчанию (например, первый в списке)
            if (availableVoices.length > 0 && !selectedVoice) {
                setSelectedVoice(availableVoices[0]);
            }
        };

        // Загрузка голосов
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
        loadVoices(); // Попытка загрузки голосов сразу

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        };
    }, [selectedVoice]);

    const handlePlay = () => {
        if (voices.length === 0) {
            alert('Голоса еще не загружены. Пожалуйста, попробуйте позже.');
            return;
        }

        if (!selectedVoice) {
            alert('Пожалуйста, выберите голос.');
            return;
        }

        const utterance = new SpeechSynthesisUtterance('Привет, это тестовая озвучка.');
        utterance.lang = selectedVoice.lang;
        utterance.voice = selectedVoice;

        console.log('Используется голос:', selectedVoice.name);

        window.speechSynthesis.speak(utterance);
    };

    return (
        <div>
            {/* Выпадающий список для выбора голоса */}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="voice-select-label">Выберите голос</InputLabel>
                <Select
                    labelId="voice-select-label"
                    value={selectedVoice ? selectedVoice.name : ''}
                    label="Выберите голос"
                    onChange={(e) => {
                        const voiceName = e.target.value;
                        const voice = voices.find((v) => v.name === voiceName);
                        setSelectedVoice(voice || null);
                    }}
                    disabled={!voicesLoaded}
                >
                    {voices.map((voice) => (
                        <MenuItem key={voice.name} value={voice.name}>
                            {`${voice.name} (${voice.lang})`}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Кнопки управления озвучиванием */}
            <Tooltip title="Воспроизвести Тест">
                <IconButton
                    color="primary"
                    onClick={handlePlay}
                    disabled={!voicesLoaded || !selectedVoice}
                >
                    <PlayArrowIcon fontSize="large" />
                </IconButton>
            </Tooltip>
        </div>
    );
};

export default SimpleTTS;
