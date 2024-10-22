
// Функция для генерации номеров страниц
export const generatePageNumbers = (start: number, end: number): number[] => {
    const pageNumbers = [];
    for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
    }
    return pageNumbers;
};
