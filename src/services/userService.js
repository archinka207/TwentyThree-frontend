import apiClient from './apiClient'; // Наш настроенный экземпляр Axios

/**
 * Получает данные профиля текущего аутентифицированного пользователя.
 * @returns {Promise<object>} - Promise, который разрешается объектом UserProfileDto.
 */
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/users/me'); // Бэкенд должен иметь этот эндпоинт
    // Ожидаемый ответ: UserProfileDto
    // { id, nickname, reputation, profilePictureUrl, createdAt, interests: [{id, name, description}] }
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Обновляет данные профиля текущего пользователя.
 * @param {object} profileData - Объект с обновляемыми данными (UserUpdateDto).
 * @param {string} [profileData.nickname] - Новый никнейм (опционально).
 * @param {number[]} [profileData.interestIds] - Массив ID выбранных интересов (опционально).
 * @returns {Promise<object>} - Promise, который разрешается обновленным объектом UserProfileDto.
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/users/me', profileData); // Бэкенд должен иметь этот эндпоинт
    return response.data; // Ожидаемый ответ: обновленный UserProfileDto
  } catch (error) {
    console.error("Error updating user profile:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Обновляет аватар текущего пользователя.
 * @param {File} avatarFile - Файл изображения аватара.
 * @returns {Promise<object>} - Promise, который разрешается обновленным объектом UserProfileDto (с новым URL аватара).
 */
export const updateUserAvatar = async (avatarFile) => {
  // Для отправки файла используется FormData
  const formData = new FormData();
  formData.append('file', avatarFile); // 'file' - это имя параметра, которое ожидает бэкенд

  try {
    const response = await apiClient.post('/users/me/avatar', formData, {
      headers: {
        // Axios автоматически установит 'Content-Type': 'multipart/form-data'
        // при передаче объекта FormData, но иногда явное указание помогает
        // или если есть проблемы с автоматическим определением.
        // Обычно это не требуется.
        // 'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // Ожидаемый ответ: обновленный UserProfileDto
  } catch (error) {
    console.error("Error uploading user avatar:", error.response?.data || error.message);
    throw error;
  }
};