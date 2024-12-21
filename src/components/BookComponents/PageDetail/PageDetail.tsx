import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Button,
  IconButton,
  useTheme,
  Pagination,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { Book } from '@mui/icons-material';
import { RootState, AppDispatch } from '../../../redux/store';
import { fetchPageByNumber } from '../../../redux/slices/pageSlice';
import { fetchBookDetails } from '../../../redux/slices/bookSlice';
import { fetchWordsProgress } from '../../../redux/slices/wordsProgressSlice';
import { TextToSpeech } from '../TextToSpeech';
import { useTextSelection } from '../../../hooks';
import { TextRenderer } from '../TextRenderer';
import { TranslationDialog } from '../TranslationDialog';
import AddWordModal from '../../DictionariesComponents/AddWordModal/AddWordModal';
import { getBackgroundColorByProgress } from '../../../utils/getBackgroundColorByProgress';

export const PageDetail: React.FC = () => {
  const { bookId, chapterId, pageNumber } = useParams<{
    bookId: string;
    chapterId: string;
    pageNumber: string;
  }>();

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();

  const { page, loading, error } = useSelector((state: RootState) => state.page);
  const { books } = useSelector((state: RootState) => state.books);
  const {
    translation,
    loading: translationLoading,
    error: translationError,
  } = useSelector((state: RootState) => state.translation);

  // Слова с прогрессом из wordsProgressSlice
  const { words: wordsProgress } = useSelector((state: RootState) => state.wordsProgress);

  const currentPageNumber = Number(pageNumber);
  const book = books.find((b) => b.id === bookId);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    selectedText,
    handleTextClick,
    handleWordClick,
    handlePopoverClose,
  } = useTextSelection(book ? book.language : 'en');

  const findChapterByPageNumber = (pageNumber: number) => {
    return book?.chapters.find((c) => {
      return pageNumber >= c.start_page_number && pageNumber <= c.end_page_number;
    });
  };

  const chapter = findChapterByPageNumber(currentPageNumber);

  useEffect(() => {
    if (!book) {
      dispatch(fetchBookDetails(bookId!));
    }
  }, [dispatch, bookId, book]);

  useEffect(() => {
    if (book && chapter) {
      dispatch(fetchPageByNumber({ chapterId: chapter.id, pageNumber: currentPageNumber }));
    } else if (book) {
      const newChapter = findChapterByPageNumber(currentPageNumber);
      if (newChapter) {
        navigate(`/books/${bookId}/chapters/${newChapter.id}/pages/${currentPageNumber}`);
      } else {
        console.error('Chapter not found for page number:', currentPageNumber);
      }
    }
  }, [dispatch, book, chapter, currentPageNumber, navigate, bookId]);

  // Загружаем слова с прогрессом при первом заходе, если они не загружены
  const dictionary_id = useSelector(
    (state: RootState) => state.userInfo.userData.settings?.current_dictionary?.dictionary_id
  );

  useEffect(() => {
    if (bookId && wordsProgress.length === 0 && dictionary_id) {
      dispatch(fetchWordsProgress({ dictionaryId: dictionary_id }));
    }
  }, [dispatch, bookId, wordsProgress.length, dictionary_id]);

  const totalPagesInBook = book?.total_pages || 0;

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    const newPageNumber = value;
    const newChapter = findChapterByPageNumber(newPageNumber);

    if (newChapter) {
      navigate(`/books/${bookId}/chapters/${newChapter.id}/pages/${newPageNumber}`);
    } else {
      console.error('Chapter not found for page number:', newPageNumber);
    }
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedWordForModal, setSelectedWordForModal] = useState('');
  const [selectedTranslationForModal, setSelectedTranslationForModal] = useState('');

  const isDialogOpen = Boolean(selectedText && translation);

  const handleAddToDictionaryClick = (word: string, trans: string) => {
    handlePopoverClose();
    setSelectedWordForModal(word);
    setSelectedTranslationForModal(trans);
    setIsAddModalOpen(true);
  };

  // Создадим Map для быстрого доступа к progress по слову
  const wordsMap = useMemo(() => {
    const map = new Map<string, number>();
    wordsProgress.forEach((w) => map.set(w.word.toLowerCase(), w.progress));
    return map;
  }, [wordsProgress]);

  // Функция подсветки слова
  const highlightWord = (word: string): React.CSSProperties | undefined => {
    const progress = wordsMap.get(word.toLowerCase());
    if (progress !== undefined) {
      return { backgroundColor: getBackgroundColorByProgress(progress) };
    }
    return undefined;
  };

  if (loading || !book) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!page) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Страница не найдена.</Alert>
        <Button
          component={RouterLink}
          to={`/book/${bookId}`}
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Вернуться к книге
        </Button>
      </Container>
    );
  }

  return (
    <Container
      data-name="mainContainer"
      sx={{
        position: 'relative',
        paddingTop: '30px',
        paddingBottom: '30px',
      }}
      onMouseUp={handleTextClick}
    >
      {/* Заголовок и кнопки */}
      <Box
        data-name="wraperBox1"
        display="flex"
        alignItems="center"
        justifyContent="center" //space-between
        mb={2}
      >
        <Box data-name="chapterNameBox" display="flex" alignItems="center">
          {chapter && (
            <Typography variant="h5" gutterBottom>
              {chapter.chapter_title}
            </Typography>
          )}
        </Box>
        <Tooltip title="Вернуться к книге">
          <IconButton
            color="primary"
            component={RouterLink}
            to={`/book/${bookId}`}
            aria-label="Вернуться к книге"
          >
            <Book />
          </IconButton>
        </Tooltip>
      </Box>

        <Tooltip title="Озвучивание текста">
          <TextToSpeech text={page.content} bookLanguage={book.language} />
        </Tooltip>

      {/* Обёрточный Box для центрирования pageContentBox */}
      <Box display="flex" justifyContent="center" mb={4}>
        <Box
          data-name="pageContentBox"
          sx={{
          p: 3,
          background: theme.customBackground.paperGradient,
          boxShadow: 3,
          borderRadius: 2,
          mb: 4,
          whiteSpace: 'pre-line',
          // Убираем flexGrow и overflow, чтобы высота и ширина были авто:
          // flexGrow: 1,
          // overflowY: 'auto',
          display: 'inline-block',  //'inline-block', если нужно подстраивать ширину, block - если не нужно
          width: 'auto',
          height: 'auto',
        }}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: 350,
              fontSize: '1.1rem',
              lineHeight: 1.8,
              textAlign: 'left', // Дополнительно убеждаемся, что текст выровнен по левому краю
            }}
          >
            <TextRenderer
              content={page.content}
              onWordClick={handleWordClick}
              highlightWord={highlightWord}
            />
          </Typography>
        </Box>
      </Box>

      {/* Пагинация внизу страницы */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mb={4}
      >
        <Pagination
          count={totalPagesInBook}
          page={currentPageNumber}
          onChange={handlePageChange}
          color="primary"
          siblingCount={1}
          boundaryCount={1}
        />
      </Box>

      {/* Остальной контент */}
      <TranslationDialog
        open={isDialogOpen}
        onClose={handlePopoverClose}
        selectedText={selectedText}
        translation={translation}
        translationLoading={translationLoading}
        translationError={translationError}
        sourceLanguage={book.language.slice(0, 2)}
        onAddToDictionaryClick={handleAddToDictionaryClick}
      />

      <AddWordModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        dictionaryId={bookId!}
        initialWord={selectedWordForModal}
        initialTranslation={selectedTranslationForModal}
      />
    </Container>
  );
};
