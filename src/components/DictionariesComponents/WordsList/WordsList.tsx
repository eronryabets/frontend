import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../../../redux/store';
import {fetchWords, setCurrentPage, setDictionaryId} from '../../../redux/slices/wordsSlice';
import {useParams, useSearchParams} from 'react-router-dom';
import {
    Pagination,
    CircularProgress,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Box,
    Avatar,
    Button,
    IconButton,
    Tooltip, Chip
} from '@mui/material';
import defaultCover from '../../../assets/default_word_image.jpg';
import MapsUgcIcon from '@mui/icons-material/MapsUgc';
import EditIcon from '@mui/icons-material/Edit';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';
import AddWordModal from "../AddWordModal/AddWordModal";
import EditWordModal from "../EditWordModal/EditWordModal";
import {MyIconButton} from "../../UtilityComponents";

const WordsList: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const {
        words,
        loading,
        error,
        currentPage,
        totalPages,
        dictionaryId
    } = useSelector((state: RootState) => state.words);
    const [searchParams, setSearchParams] = useSearchParams();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editWordData, setEditWordData] = useState<null | {
        id: string;
        word: string;
        translation: string;
        tags: { name: string }[];
        image_path: string | null;
        progress: number;
    }>(null);

    // Вместо boolean храните id говорящего слова или null
    const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            if (dictionaryId !== id) {
                dispatch(setDictionaryId(id));
            }
            const page = parseInt(searchParams.get('page') || '1', 10);
            dispatch(setCurrentPage(page));
        }
    }, [dispatch, id, searchParams, dictionaryId]);

    useEffect(() => {
        if (id && dictionaryId) {
            dispatch(fetchWords({dictionaryId: id, page: currentPage}));
            setSearchParams({page: currentPage.toString()});
        }
    }, [dispatch, id, dictionaryId, currentPage, setSearchParams]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        dispatch(setCurrentPage(value));
    };

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    };

    const handleOpenEditModal = (word: any) => {
        setEditWordData({
            id: word.id,
            word: word.word,
            translation: word.translation,
            tags: word.tags,
            image_path: word.image_path,
            progress: word.progress,
        });
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditWordData(null);
    };

    const handleSpeak = (wordId: string, text: string) => {
        if (!speakingWordId) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-US';

                utterance.onstart = () => {
                    setSpeakingWordId(wordId);
                };

                utterance.onend = () => {
                    setSpeakingWordId(null);
                };

                utterance.onerror = () => {
                    setSpeakingWordId(null);
                };

                window.speechSynthesis.speak(utterance);
            } else {
                alert('Ваш браузер не поддерживает Web Speech API.');
            }
        } else {
            // Если уже есть звучащее слово, останавливаем его
            window.speechSynthesis.cancel();
            setSpeakingWordId(null);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress/></Box>;
    if (error) return <Typography color="error" align="center" mt={4}>{error}</Typography>;

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Слова в словаре
            </Typography>
            <Box sx={{pl: 2, pb: 2}}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<MapsUgcIcon/>}
                    sx={{mr: 2}}
                    onClick={handleOpenAddModal}
                >
                    Добавить слово
                </Button>
            </Box>
            {words && words.length > 0 ? (
                <Box>
                    <Table sx={{minWidth: 650}} aria-label="words table">
                        <TableHead>
                            <TableRow>
                                <TableCell><strong></strong></TableCell>
                                <TableCell><strong>Termin</strong></TableCell>
                                <TableCell><strong>Translate</strong></TableCell>
                                <TableCell><strong>Count</strong></TableCell>
                                <TableCell><strong>Progress</strong></TableCell>
                                <TableCell><strong>Теги</strong></TableCell>
                                <TableCell><strong>Added</strong></TableCell>
                                {/*<TableCell><strong>Edit</strong></TableCell>*/}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {words.map((word) => (
                                <TableRow
                                    key={word.id}
                                    sx={{
                                        transition: 'background-color 0.3s, box-shadow 0.3s',
                                        // cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 255, 0.05)', // легкий синий оттенок
                                            boxShadow: '0px 4px 20px rgba(0, 0, 255, 0.1)',
                                        },
                                        // Добавим плавный эффект для картинки при наведении на строку
                                        '&:hover img': {
                                            transform: 'scale(1.05)', // увеличиваем картинку
                                            boxShadow: '0 0 20px rgba(0, 0, 255, 0.5)',
                                            filter: 'brightness(1.1) contrast(1.1)',
                                        }
                                    }}
                                >
                                    {/*WORD'S IMAGE*/}
                                    <TableCell>
                                        <Avatar
                                            src={word.image_path ? word.image_path : defaultCover}
                                            alt={word.word}
                                            sx={{width: 60, height: 60, borderRadius: 4}}
                                        />
                                    </TableCell>

                                    {/*VolumeUpIcon & WORD*/}
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <Tooltip
                                                title={speakingWordId === word.id ? "Остановить озвучивание" : "Озвучить слово"}>
                                                <IconButton
                                                    onClick={() => handleSpeak(word.id, word.word)}
                                                    color={speakingWordId === word.id ? "secondary" : "primary"}
                                                    aria-label="speak text"
                                                    sx={{mr: 1}}
                                                >
                                                    {speakingWordId === word.id ? <StopIcon/> : <VolumeUpIcon/>}
                                                </IconButton>
                                            </Tooltip>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    maxWidth: '50ch',
                                                    whiteSpace: 'normal',
                                                    overflowWrap: 'break-word'
                                                }}
                                            >
                                                {word.word}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/*translation*/}
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <MyIconButton
                                                color="primary"
                                                startIcon={<EditIcon/>}
                                                onClick={() => handleOpenEditModal(word)}>
                                            </MyIconButton>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    maxWidth: '50ch',          // Примерно 50 символов в ширину
                                                    whiteSpace: 'normal',      // Разрешаем перенос на новую строку
                                                    overflowWrap: 'break-word' // Переносим слова, если не помещаются
                                                }}
                                            >
                                                {word.translation}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/*count*/}
                                    <TableCell>
                                        <Typography variant="body2">{word.count}</Typography>
                                    </TableCell>

                                    {/*progress*/}
                                    <TableCell>
                                        <Typography variant="body2">{word.progress}</Typography>
                                    </TableCell>

                                    {/*TAGS*/}
                                    <TableCell>
                                        {/*<Typography variant="body2">*/}
                                        {/*    {word.tags.length > 0 ? word.tags.map(tag => tag.name).join(', ') : '—'}*/}
                                        {/*</Typography>*/}

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                // justifyContent: 'center',
                                                gap: 1, // Отступы между чипами
                                                mt: 1,
                                            }}
                                        >
                                            {word.tags.length > 0 ?
                                                word.tags.slice(0, 3).map((tag) => (
                                                    <Chip
                                                        key={tag.id}
                                                        label={tag.name}
                                                        variant="outlined"
                                                        color="primary"
                                                        size="small"
                                                    />
                                                ))
                                                : '—'
                                            }
                                            {word.tags.length > 3 && (
                                                <Chip
                                                    label={`+${word.tags.length - 3}`}
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                    </TableCell>

                                    {/*created_at*/}
                                    <TableCell>
                                        <Typography variant="body2">{word.created_at.substring(0, 10)}</Typography>
                                    </TableCell>

                                    {/*edit*/}
                                    {/*<TableCell>*/}
                                    {/*    <MyIconButton*/}
                                    {/*        color="primary"*/}
                                    {/*        startIcon={<EditIcon/>}*/}
                                    {/*        onClick={() => handleOpenEditModal(word)}>*/}
                                    {/*    </MyIconButton>*/}
                                    {/*</TableCell>*/}

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            ) : (
                <Typography variant="h6" align="center" mt={4}>
                    В этом словаре пока нет слов.
                </Typography>
            )}
            {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            )}
            {id && (
                <AddWordModal
                    open={isAddModalOpen}
                    onClose={handleCloseAddModal}
                    dictionaryId={id}
                />
            )}
            {id && editWordData && (
                <EditWordModal
                    open={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    dictionaryId={id}
                    wordData={editWordData}
                />
            )}
        </Box>
    );
};

export default WordsList;
