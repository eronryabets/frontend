
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchWords, setCurrentPage, setDictionaryId } from '../../../redux/slices/wordsSlice';
import { useParams, useSearchParams } from 'react-router-dom';
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
    Button
} from '@mui/material';
import defaultCover from '../../../assets/default_word_image.jpg';
import MapsUgcIcon from '@mui/icons-material/MapsUgc';
import EditIcon from '@mui/icons-material/Edit';
import AddWordModal from "../AddWordModal/AddWordModal";
import { MyIconButton } from "../../utils";
import EditWordModal from "../EditWordModal/EditWordModal";

const WordsList: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { words, loading, error, currentPage, totalPages, dictionaryId } = useSelector((state: RootState) => state.words);
    const [searchParams, setSearchParams] = useSearchParams();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Состояние для модального окна
    //состояние для модалки редактирования слова :
    const [editWordData, setEditWordData] = useState<null | {
        id: string;
        word: string;
        translation: string;
        tags: { name: string }[];
        image_path: string | null;
    }>(null);

    // Установка dictionaryId и текущей страницы из URL при монтировании
    useEffect(() => {
        if (id) {
            if (dictionaryId !== id) {
                dispatch(setDictionaryId(id));
            }
            const page = parseInt(searchParams.get('page') || '1', 10);
            dispatch(setCurrentPage(page));
        }
    }, [dispatch, id, searchParams, dictionaryId]);

     // Фетчинг слов при изменении dictionaryId или currentPage
    useEffect(() => {
        if (id && dictionaryId) {
            dispatch(fetchWords({ dictionaryId: id, page: currentPage }));
            setSearchParams({ page: currentPage.toString() });
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
            image_path: word.image_path
        });
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditWordData(null);
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    if (error) return <Typography color="error" align="center" mt={4}>{error}</Typography>;

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Слова в словаре
            </Typography>
            <Box sx={{ pl: 2, pb: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<MapsUgcIcon />}
                    sx={{ mr: 2 }}
                    onClick={handleOpenAddModal}
                >
                    Добавить слово
                </Button>
            </Box>
            {words && words.length > 0 ? (
                <Box>
                    <Table sx={{ minWidth: 650 }} aria-label="words table">
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Изображение</strong></TableCell>
                                <TableCell><strong>Слово</strong></TableCell>
                                <TableCell><strong>Перевод</strong></TableCell>
                                <TableCell><strong>Теги</strong></TableCell>
                                <TableCell><strong>Count</strong></TableCell>
                                <TableCell><strong>Progress</strong></TableCell>
                                <TableCell><strong>Added</strong></TableCell>
                                <TableCell><strong>Edit</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {words.map((word) => (
                                <TableRow key={word.id}>
                                    <TableCell>
                                        <Avatar
                                            src={word.image_path ? word.image_path : defaultCover}
                                            alt={word.word}
                                            sx={{ width: 60, height: 60, borderRadius: 4 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle1">{word.word}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{word.translation}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {word.tags.length > 0 ? word.tags.map(tag => tag.name).join(', ') : '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{word.count}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{word.progress}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{word.created_at.substring(0, 10)}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <MyIconButton
                                            color="primary"
                                            startIcon={<EditIcon />}
                                            onClick={() => handleOpenEditModal(word)}>
                                        </MyIconButton>
                                    </TableCell>
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
