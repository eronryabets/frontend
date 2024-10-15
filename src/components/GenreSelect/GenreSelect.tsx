
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { Genre } from "../../types/genres";

interface GenreSelectProps {
    value: number | null;
    onChange: (value: null | number) => void;
    label?: string;
    required?: boolean;
}

const GenreSelect: React.FC<GenreSelectProps> = ({ value, onChange, label = "Genre", required = false }) => {
    const { genres, loading, error } = useSelector((state: RootState) => state.genres);

    const handleChange = (event: SelectChangeEvent<string>) => {
        const selectedId = event.target.value === "" ? null : Number(event.target.value);
        onChange(selectedId);
    };

    return (
        <FormControl fullWidth
                     variant="outlined"
                     required={required}
                     disabled={loading || !!error}
                     sx={{mb: 2}}
        >
            <InputLabel id="genre-label">{label}</InputLabel>
            <Select
                 labelId="genre-label"
                id="genre-select"
                value={value !== null ? value.toString() : ''}
                onChange={handleChange}
                label={label}
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

export default GenreSelect;
