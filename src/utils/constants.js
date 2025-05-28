// src/utils/constants.js

// WebSocket Endpoints and Prefixes
export const WS_CHAT_TOPIC_PREFIX = '/topic/chat/'; // Куда подписываемся для получения сообщений чата
export const WS_USER_SPECIFIC_PREFIX = '/user/queue/'; // Для персональных сообщений/ошибок
export const WS_USER_ERRORS_QUEUE = `${WS_USER_SPECIFIC_PREFIX}errors`; // Очередь для ошибок
export const WS_APP_DESTINATION_PREFIX = '/app'; // Префикс для отправки сообщений на сервер
export const WS_SEND_MESSAGE_ENDPOINT = (chatId) => `${WS_APP_DESTINATION_PREFIX}/chat/${chatId}/send`;
// export const WS_ADD_USER_ENDPOINT = (chatId) => `${WS_APP_DESTINATION_PREFIX}/chat/${chatId}/addUser`; // Если нужно

// LocalStorage Keys
export const LOCAL_STORAGE_TOKEN_KEY = 'token';

// UI Constants
export const DEFAULT_AVATAR_PATH = '/images/default-avatar.png'; // Путь относительно public/
// Если default-avatar.png в src/assets/images, то импортируйте его в компонентах:
// import defaultAvatar from '../assets/images/default-avatar.png';

export const CHAT_MESSAGE_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  JOIN: 'JOIN',   // Пример системного сообщения
  LEAVE: 'LEAVE'  // Пример системного сообщения
};

export const MAX_IMAGE_UPLOAD_SIZE_MB = 10; // Максимальный размер загружаемого изображения в МБ

// Другие константы, если они понадобятся
// export const APP_NAME = "TwentyThree Messenger";