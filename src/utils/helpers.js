// src/utils/helpers.js
import { formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';

/**
 * Форматирует дату/время в строку "X (единиц времени) назад".
 * @param {string | Date | number} dateInput - Строка ISO даты, объект Date или timestamp.
 * @returns {string} - Отформатированная строка времени или пустая строка при ошибке.
 */
export const formatTimeAgo = (dateInput) => {
  if (!dateInput) return '';
  try {
    // Пытаемся обработать разные форматы входных данных
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    if (!isValid(date)) {
      console.warn("Invalid date provided to formatTimeAgo:", dateInput);
      return ''; // Или какое-то значение по умолчанию, например, "a moment ago"
    }
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date in formatTimeAgo:", dateInput, error);
    return ''; // Возвращаем пустую строку при любой ошибке форматирования
  }
};

/**
 * Создает полный URL для изображения, если передан относительный путь.
 * Учитывает базовый URL API, убирая из него '/api', если он там есть,
 * так как статика обычно раздается не через /api префикс.
 * @param {string} relativeImageUrl - Относительный URL изображения (например, /uploads/images/avatar.png).
 * @returns {string | null} - Полный URL изображения или null, если входной URL пуст.
 */
export const getFullImageUrl = (relativeImageUrl) => {
  if (!relativeImageUrl) return null;

  // Если URL уже абсолютный (начинается с http, https или blob)
  if (relativeImageUrl.startsWith('http://') || relativeImageUrl.startsWith('https://') || relativeImageUrl.startsWith('blob:')) {
    return relativeImageUrl;
  }

  // Получаем базовый URL сервера (без /api)
  // REACT_APP_API_BASE_URL = http://localhost:8080/api
  // Нам нужен http://localhost:8080
  const serverBaseUrl = process.env.REACT_APP_API_BASE_URL
    ? process.env.REACT_APP_API_BASE_URL.replace('/api', '')
    : 'http://localhost:8080'; // Запасной вариант, если переменная не установлена

  // Убеждаемся, что относительный URL начинается со слеша
  const imagePath = relativeImageUrl.startsWith('/') ? relativeImageUrl : `/${relativeImageUrl}`;

  return `${serverBaseUrl}${imagePath}`;
};

/**
 * Проверяет, является ли сообщение от текущего пользователя.
 * Используется в MessageList для стилизации.
 * @param {object} message - Объект сообщения.
 * @param {string} [currentUserNickname] - Никнейм текущего пользователя.
 * @param {number | string} [currentUserId] - ID текущего пользователя.
 * @returns {boolean}
 */
export const isMessageFromCurrentUser = (message, currentUserNickname, currentUserId) => {
  if (!message) return false;
  if (currentUserId && message.senderId) {
    // Сравниваем ID, если они есть и совпадают по типу (оба числа или оба строки)
    return String(message.senderId) === String(currentUserId);
  }
  if (currentUserNickname && message.senderNickname) {
    return message.senderNickname === currentUserNickname;
  }
  return false; // Если нет данных для сравнения
};

// Можно добавить другие вспомогательные функции, например:
/**
 * Обрезает строку до указанной длины и добавляет многоточие.
 * @param {string} text - Исходный текст.
 * @param {number} maxLength - Максимальная длина.
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};