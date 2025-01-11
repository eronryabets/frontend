import {languageOptions} from "@/config/languageOptions.ts";

/**
 * Функция getLanguageName принимает код языка и возвращает его название.
 * Если язык не найден, возвращает сам код.
 *
 * @param code - Код языка (например, "en-US")
 * @returns Название языка (например, "English (United States)")
 */
export function getLanguageName(code: string): string {
  const found = languageOptions.find((option) => option.code === code);
  return found ? found.name : code;
}