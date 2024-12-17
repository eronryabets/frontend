
export function getBackgroundColorByProgress(progress: number): string {
    // 0 - оранжевый, 10 - зелёный
    // Сделаем линейный переход, или просто if/else:

    if (progress <= 3) return 'lightcoral';       // низкий прогресс - красноватый
    else if (progress <= 6) return 'lightgoldenrodyellow'; // средний прогресс - желтоватый
    else return 'lightgreen'; // высокий прогресс - зеленоватый
}
