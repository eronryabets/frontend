/**
 * Возвращает цвет фона изучаемых слов на основе уровня прогресса.
 * @param progress - Уровень прогресса (0-10).
 * @returns Цвет в формате HEX.
 */

import progressColors from "./constants/progressColors";


export function getBackgroundColorByProgress(progress: number): string {
    // Проверка и приведение значения прогресса к допустимому диапазону
    if (progress < 0) {
        console.warn(`Progress value ${progress} is below 0. Clamping to 0.`);
        progress = 0;
    }
    if (progress > 10) {
        console.warn(`Progress value ${progress} is above 10. Clamping to 10.`);
        progress = 10;
    }

    return progressColors[progress];
}

/**
 * Изменяет значение альфа-канала в строке RGBA.
 *
 * @param {string} rgba - Исходная строка RGBA, например, "rgba(255, 0, 0, 0.5)".
 * @param {number} newAlpha - Новое значение альфа-канала.
 * @returns {string} Новая строка RGBA с обновлённым альфа-каналом.
 */
export function adjustAlpha(rgba: string, newAlpha: number): string {
  return rgba.replace(
    /rgba\((\d+,\s*\d+,\s*\d+),\s*([\d.]+)\)/,
    `rgba($1, ${newAlpha})`
  );
}