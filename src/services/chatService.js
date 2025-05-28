import apiClient from './apiClient'; // Наш настроенный экземпляр Axios

/**
 * Создает новый чат.
 * @param {object} chatCreateRequest - Данные для создания чата (ChatCreateRequest).
 * @param {string} [chatCreateRequest.chatName] - Название чата (опционально).
 * @param {number} chatCreateRequest.primaryInterestId - ID основного интереса чата.
 * @returns {Promise<object>} - Promise, который разрешается объектом ChatDto созданного чата.
 */
export const createNewChat = async (chatCreateRequest) => {
  try {
    const response = await apiClient.post('/chats', chatCreateRequest);
    return response.data; // Ожидаемый ответ: ChatDto
  } catch (error) {
    console.error("Error creating new chat:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Присоединяется к случайному активному чату по указанному интересу.
 * @param {number} interestId - ID интереса.
 * @returns {Promise<object>} - Promise, который разрешается объектом ChatDto чата, к которому присоединился пользователь.
 */
export const joinChatByInterest = async (interestId) => {
  try {
    // Бэкенд ожидает POST /api/chats/join/{interestId}
    const response = await apiClient.post(`/chats/join/${interestId}`);
    return response.data; // Ожидаемый ответ: ChatDto
  } catch (error) {
    console.error(`Error joining chat for interest ID ${interestId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Получает информацию о текущем активном чате пользователя.
 * @returns {Promise<object|null>} - Promise, который разрешается объектом ChatDto или null, если нет активного чата.
 */
export const getCurrentChat = async () => {
  try {
    const response = await apiClient.get('/chats/current');
    // Бэкенд может вернуть 200 с ChatDto или 204 No Content, если чата нет
    // Axios по умолчанию считает 204 успехом, response.data будет undefined или null.
    // Мы можем явно проверить статус или просто вернуть response.data.
    return response.data; // Если 204, data будет пустой.
  } catch (error) {
    // Если бэкенд возвращает 404, когда чата нет, это тоже нужно обработать.
    if (error.response && (error.response.status === 404 || error.response.status === 204)) {
      return null; // Нет активного чата
    }
    console.error("Error fetching current chat:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Получает детали конкретного чата по его ID.
 * (Может быть полезно, если навигация идет по /chat/:chatId)
 * @param {number} chatId - ID чата.
 * @returns {Promise<object>} - Promise, который разрешается объектом ChatDto.
 */
export const getChatDetails = async (chatId) => {
    try {
      const response = await apiClient.get(`/chats/${chatId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for chat ID ${chatId}:`, error.response?.data || error.message);
      throw error;
    }
};


/**
 * Загружает историю сообщений для указанного чата.
 * ВНИМАНИЕ: Бэкенд должен иметь соответствующий GET эндпоинт, например, /api/chats/{chatId}/messages
 * Если такого эндпоинта нет, эта функция не будет работать, и чат будет загружаться пустым
 * (сообщения будут появляться только через WebSocket).
 * @param {number} chatId - ID чата.
 * @returns {Promise<Array<object>>} - Promise, который разрешается массивом объектов MessageDto.
 */
export const getChatMessages = async (chatId) => {
  try {
    // Предполагаемый эндпоинт, который нужно реализовать на бэкенде
    const response = await apiClient.get(`/chats/${chatId}/messages`);
    return response.data; // Ожидаемый ответ: List<MessageDto>
  } catch (error) {
    console.warn(`Failed to fetch initial messages for chat ${chatId} via HTTP. This endpoint might not be implemented on the backend. Chat will rely on WebSocket for new messages.`, error.response?.data || error.message);
    return []; // Возвращаем пустой массив, чтобы UI не падал
  }
};

/**
 * Загружает изображение для сообщения в чате.
 * @param {number} chatId - ID чата.
 * @param {File} imageFile - Файл изображения.
 * @returns {Promise<object>} - Promise, который разрешается объектом MessageDto (с contentImageUrl).
 */
export const uploadChatImage = async (chatId, imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile); // 'file' - имя параметра на бэкенде

  try {
    // Бэкенд ожидает POST /api/chats/{chatId}/messages/image
    const response = await apiClient.post(`/chats/${chatId}/messages/image`, formData, {
      // 'Content-Type': 'multipart/form-data' axios установит автоматически для FormData
    });
    return response.data; // Ожидаемый ответ: MessageDto с заполненным contentImageUrl
  } catch (error) {
    console.error(`Error uploading image for chat ${chatId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Позволяет текущему пользователю покинуть указанный чат.
 * @param {number} chatId - ID чата.
 * @returns {Promise<string>} - Promise, который разрешается сообщением об успехе.
 */
export const leaveChat = async (chatId) => {
  try {
    const response = await apiClient.post(`/chats/${chatId}/leave`);
    return response.data; // Ожидаемый ответ: строка (например, "Successfully left the chat.")
  } catch (error) {
    console.error(`Error leaving chat ${chatId}:`, error.response?.data || error.message);
    throw error;
  }
};