import apiClient from './apiClient'; // Наш настроенный экземпляр Axios

/**
 * Получает список всех доступных интересов.
 * @returns {Promise<Array<object>>} - Promise, который разрешается массивом объектов InterestDto.
 * Каждый объект InterestDto: { id, name, description }
 */
export const getAllInterests = async () => {
  try {
    const response = await apiClient.get('/interests');
    return response.data; // Ожидаемый ответ: List<InterestDto>
  } catch (error) {
    console.error("Error fetching interests:", error.response?.data || error.message);
    // Возвращаем пустой массив в случае ошибки, чтобы UI не падал,
    // или можно перебросить ошибку для обработки в компоненте.
    // throw error;
    return [];
  }
};

// Если в будущем появится возможность создавать/редактировать интересы (для админа),
// соответствующие функции можно будет добавить сюда.