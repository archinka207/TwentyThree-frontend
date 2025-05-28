import apiClient from './apiClient'; // Наш настроенный экземпляр Axios

/**
 * Отправляет запрос на вход пользователя.
 * @param {object} credentials - Объект с никнеймом и паролем.
 * @param {string} credentials.nickname - Никнейм пользователя.
 * @param {string} credentials.password - Пароль пользователя.
 * @returns {Promise<object>} - Promise, который разрешается объектом ответа от сервера (ожидается { accessToken, tokenType }).
 */
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    // Бэкенд должен вернуть объект вида:
    // { "accessToken": "your_jwt_token_here", "tokenType": "Bearer" }
    return response.data;
  } catch (error) {
    console.error("Error during login:", error.response?.data || error.message);
    // Перебрасываем ошибку, чтобы ее можно было обработать в компоненте
    throw error;
  }
};

/**
 * Отправляет запрос на регистрацию нового пользователя.
 * @param {object} userData - Объект с данными для регистрации.
 * @param {string} userData.nickname - Никнейм нового пользователя.
 * @param {string} userData.password - Пароль нового пользователя.
 * @returns {Promise<string>} - Promise, который разрешается сообщением об успехе от сервера (строка).
 */
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    // Бэкенд должен вернуть сообщение, например: "User registered successfully!"
    return response.data; // Обычно это строка
  } catch (error) {
    console.error("Error during registration:", error.response?.data || error.message);
    throw error;
  }
};

// Можно добавить другие функции, связанные с аутентификацией, если они появятся
// например, forgotPassword, resetPassword, refreshToken и т.д.