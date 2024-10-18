
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Box, Chip} from "@mui/material";
import { Genre } from "../../types";

interface GenreSelectProps {
    values: number[]; // Массив выбранных жанров
    onChange: (values: number[]) => void;
    label?: string;
    required?: boolean;
}

export const GenreSelect: React.FC<GenreSelectProps> = ({ values, onChange, label = "Genres", required = false }) => {
    const { genres, loading, error } = useSelector((state: RootState) => state.genres);

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        // Явно указываем TypeScript, что event.target.value - это string[]
        const selectedIds = (event.target.value as string[]).map((val: string) => Number(val));
        onChange(selectedIds);
    };

    return (
        <FormControl fullWidth
                     variant="outlined"
                     required={required}
                     disabled={loading || !!error}
                     sx={{mb: 2}}
        >
            <InputLabel id="genres-label">{label}</InputLabel>
            <Select
                labelId="genres-label"
                id="genres-select"
                multiple
                value={values.map(id => id.toString())} // Преобразуем числа в строки
                onChange={handleChange}
                label={label}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                            const genre = genres.find((g) => g.id === Number(value));
                            return <Chip key={value} label={genre ? genre.name : value} />;
                        })}
                    </Box>
                )}
            >
                {genres.map((genre: Genre) => (
                    <MenuItem key={genre.id} value={genre.id.toString()}>
                        {genre.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

