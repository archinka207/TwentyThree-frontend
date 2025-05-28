import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // Библиотека для декодирования JWT токенов
import apiClient from '../services/apiClient'; // Наш настроенный Axios экземпляр
import { getUserProfile } from '../services/userService'; // Сервис для получения данных пользователя

// 1. Создаем контекст
// Значение по умолчанию null, но оно будет переопределено провайдером
export const AuthContext = createContext(null);

// 2. Создаем компонент-провайдер
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Данные текущего пользователя
  const [token, setToken] = useState(localStorage.getItem('token')); // JWT токен из localStorage
  const [loading, setLoading] = useState(true); // Индикатор начальной загрузки/проверки аутентификации

  // Функция для загрузки деталей текущего пользователя с бэкенда
  // useCallback используется для мемоизации функции, чтобы она не создавалась заново при каждом рендере,
  // если ее зависимости не изменились. Это важно для useEffect.
  const fetchCurrentUserDetails = useCallback(async (currentToken) => {
    if (!currentToken) {
      setCurrentUser(null);
      delete apiClient.defaults.headers.common['Authorization'];
      setLoading(false);
      return;
    }

    try {
      // Устанавливаем токен в заголовки apiClient для этого запроса (и последующих)
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      const userProfile = await getUserProfile(); // Запрос на /api/users/me
      setCurrentUser(userProfile); // Сохраняем данные пользователя
    } catch (error) {
      console.error("AuthContext: Failed to fetch user details:", error);
      // Если не удалось загрузить данные (например, токен невалиден на бэкенде),
      // сбрасываем пользователя и токен.
      setCurrentUser(null);
      localStorage.removeItem('token'); // Удаляем невалидный токен
      setToken(null); // Обновляем состояние токена в AuthContext
      delete apiClient.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false); // Завершаем загрузку
    }
  }, []); // Пустой массив зависимостей, т.к. getUserProfile не зависит от внешних переменных этого компонента

  // Эффект для проверки токена при инициализации приложения или при изменении токена
  useEffect(() => {
    setLoading(true); // Начинаем загрузку при проверке токена
    const storedToken = localStorage.getItem('token'); // Проверяем localStorage еще раз

    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken); // Декодируем токен
        // Проверяем срок действия токена
        if (decodedToken.exp * 1000 > Date.now()) {
          // Токен валиден и не истек, загружаем данные пользователя
          setToken(storedToken); // Устанавливаем токен в состояние, если он еще не там
          fetchCurrentUserDetails(storedToken);
        } else {
          // Токен истек
          console.log("AuthContext: Token expired on initial check.");
          localStorage.removeItem('token');
          setToken(null);
          setCurrentUser(null);
          delete apiClient.defaults.headers.common['Authorization'];
          setLoading(false);
        }
      } catch (error) {
        // Ошибка декодирования (невалидный токен)
        console.error("AuthContext: Invalid token on initial check:", error);
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
        delete apiClient.defaults.headers.common['Authorization'];
        setLoading(false);
      }
    } else {
      // Нет токена в localStorage
      setCurrentUser(null);
      delete apiClient.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [fetchCurrentUserDetails]); // Запускается один раз и при изменении fetchCurrentUserDetails (что стабильно из-за useCallback)


  // Функция для входа пользователя
  const login = useCallback(async (newToken) => {
    setLoading(true); // Начинаем загрузку
    localStorage.setItem('token', `Bearer ${newToken}`); // Сохраняем токен в localStorage
    setToken(`Bearer ${newToken}`); // Обновляем состояние токена, что вызовет useEffect для загрузки данных пользователя
    // fetchCurrentUserDetails(newToken) будет вызван через useEffect при изменении токена
  }, []); // fetchCurrentUserDetails стабилен благодаря useCallback

  // Функция для выхода пользователя
  const logout = useCallback(() => {
    setLoading(true); // Можно показать короткую загрузку для выхода
    localStorage.removeItem('token');
    setToken(null); // Обновляем состояние токена, что вызовет useEffect для сброса пользователя
    // setCurrentUser(null) и delete apiClient.defaults... будут выполнены в useEffect
    // setLoading(false) также будет вызван в useEffect
    // Если нужно немедленное обновление UI без ожидания useEffect:
    // setCurrentUser(null);
    // delete apiClient.defaults.headers.common['Authorization'];
    // setLoading(false);
  }, []);

  // Функция для обновления данных currentUser из других частей приложения
  // (например, после редактирования профиля, чтобы ник или аватар обновились в Navbar)
  const updateUserContext = useCallback((updatedUserData) => {
    setCurrentUser(prevUser => {
      if (prevUser) {
        return { ...prevUser, ...updatedUserData };
      }
      return updatedUserData; // Если prevUser был null, просто устанавливаем новые данные
    });
  }, []);

  // Собираем значение, которое будет предоставлено контекстом
  const contextValue = {
    currentUser,
    token,
    loading, // Состояние загрузки (полезно для отображения спиннеров)
    login,
    logout,
    updateUserContext,
    fetchCurrentUserDetails // Можно экспортировать, если нужно вызвать принудительно
  };

  // Предоставляем значение контекста всем дочерним компонентам
  // Не рендерим дочерние компоненты, пока идет начальная загрузка,
  // чтобы избежать проблем с ProtectedRoute и отображением данных до того, как пользователь определен.
  // Однако, если loading=true только из-за login/logout, дочерние компоненты могут быть видны.
  // Решение: можно иметь отдельный initialLoading стейт.
  // Пока что, если loading=true, то ProtectedRoute покажет свой спиннер.
  return (
    <AuthContext.Provider value={contextValue}>
      {/* Если !loading, то рендерим детей. Если loading, то дети не рендерятся
          Это предотвратит преждевременный рендер компонентов, которые зависят от currentUser.
          Однако, это может привести к тому, что ничего не будет видно, пока loading=true.
          ProtectedRoute сам обрабатывает состояние loading.
          Поэтому здесь можно всегда рендерить children, а ProtectedRoute разберется.
      */}
      {children}
    </AuthContext.Provider>
  );
};