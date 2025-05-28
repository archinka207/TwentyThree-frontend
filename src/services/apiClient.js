import axios from 'axios';

// Получаем базовый URL API из переменных окружения
// Файл .env в корне проекта должен содержать:
// REACT_APP_API_BASE_URL=http://localhost:8080/api
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Можно добавить другие общие заголовки, если необходимо
    // 'Accept': 'application/json',
  },
});

// Interceptor для запросов:
// Добавляет токен авторизации к каждому запросу, если он есть.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Предполагаем, что токен хранится в localStorage под ключом 'token'
    if (token) {
      // Добавляем заголовок Authorization со схемой Bearer
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config; // Возвращаем измененную конфигурацию
  },
  (error) => {
    // Обработка ошибок при отправке запроса (например, нет сети)
    console.error("Error in request interceptor:", error);
    return Promise.reject(error);
  }
);

// Interceptor для ответов (опционально, но полезно для глобальной обработки ошибок):
// Можно использовать для автоматического logout при получении 401 ошибки от сервера.
apiClient.interceptors.response.use(
  (response) => {
    // Любой код состояния, находящийся в диапазоне 2xx, вызывает срабатывание этой функции
    return response;
  },
  (error) => {
    // Любые коды состояния, выходящие за пределы диапазона 2xx, вызывают срабатывание этой функции
    if (error.response) {
      // Запрос был сделан, и сервер ответил кодом состояния, который выходит из диапазона 2xx
      console.error("API Error Response Status:", error.response.status);
      console.error("API Error Response Data:", error.response.data);

      if (error.response.status === 401) {
        // Неавторизованный доступ (например, токен истек или недействителен)
        // Здесь можно реализовать логику автоматического выхода пользователя.
        // Например, удалить токен из localStorage и перенаправить на страницу входа.
        // Важно: эту логику нужно координировать с AuthContext, чтобы избежать конфликтов.
        // AuthContext сам может обрабатывать протухшие токены при их проверке.
        // Если AuthContext не справился (например, токен стал невалидным между проверками),
        // этот interceptor может быть последней линией защиты.
        console.warn("Received 401 Unauthorized from API. User session might be invalid.");
        // localStorage.removeItem('token'); // Делается в AuthContext.logout()
        // if (!window.location.pathname.includes('/login')) { // Предотвращаем цикл редиректов
        //   window.location.href = '/login'; // Простой редирект, лучше использовать useNavigate из AuthContext
        // }
      } else if (error.response.status === 403) {
        // Доступ запрещен (пользователь аутентифицирован, но не имеет прав на этот ресурс)
        console.warn("Received 403 Forbidden from API.");
      }
      // Другие коды ошибок можно обрабатывать здесь или в компонентах
    } else if (error.request) {
      // Запрос был сделан, но ответ не был получен
      // `error.request` это экземпляр XMLHttpRequest в браузере и экземпляр
      // http.ClientRequest в node.js
      console.error("API Error: No response received for the request.", error.request);
      // Это может быть проблема с сетью или бэкенд недоступен
      // Можно вернуть более дружелюбное сообщение об ошибке
      return Promise.reject(new Error("Network error or server is not responding. Please try again later."));
    } else {
      // Произошло что-то при настройке запроса, что вызвало ошибку
      console.error("API Error: Error setting up the request.", error.message);
    }
    return Promise.reject(error); // Передаем ошибку дальше для обработки в компонентах
  }
);

export default apiClient;