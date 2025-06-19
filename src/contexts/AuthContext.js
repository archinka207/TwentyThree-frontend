import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../services/apiClient';
import { getUserProfile } from '../services/userService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  // Инициализируем токен из localStorage. Если его там нет, будет null.
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // Общая начальная загрузка

  const applyTokenToApiClient = (currentToken) => {
    if (currentToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  };

  const fetchCurrentUserDetails = useCallback(async (currentTokenForFetch) => {
    if (!currentTokenForFetch) {
      setCurrentUser(null);
      applyTokenToApiClient(null); // Убедимся, что заголовок удален
      setLoading(false);
      return null; // Возвращаем null, если нет токена
    }

    applyTokenToApiClient(currentTokenForFetch); // Устанавливаем заголовок перед запросом
    try {
      const userProfile = await getUserProfile();
      setCurrentUser(userProfile);
      setLoading(false);
      return userProfile; // Возвращаем данные пользователя
    } catch (error) {
      console.error("AuthContext: Failed to fetch user details:", error);
      setCurrentUser(null);
      localStorage.removeItem('token'); // Удаляем невалидный токен
      setToken(null);                   // Сбрасываем токен в стейте
      applyTokenToApiClient(null);      // Удаляем заголовок
      setLoading(false);
      return null; // Возвращаем null в случае ошибки
    }
  }, []); // Пустой массив зависимостей, так как зависимости (getUserProfile) стабильны

  // Эффект для первоначальной загрузки и валидации токена
  useEffect(() => {
    const initialToken = localStorage.getItem('token');
    if (initialToken) {
      try {
        const decoded = jwtDecode(initialToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(initialToken); // Устанавливаем токен в стейт
          fetchCurrentUserDetails(initialToken); // Загружаем пользователя
        } else {
          console.log("AuthContext: Token expired on initial load.");
          localStorage.removeItem('token');
          setToken(null);
          setCurrentUser(null);
          applyTokenToApiClient(null);
          setLoading(false);
        }
      } catch (e) {
        console.error("AuthContext: Invalid token on initial load.", e);
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
        applyTokenToApiClient(null);
        setLoading(false);
      }
    } else {
      // Нет токена, завершаем начальную загрузку
      applyTokenToApiClient(null); // Убедимся, что заголовок удален
      setCurrentUser(null);
      setLoading(false);
    }
  }, [fetchCurrentUserDetails]); // Запускается один раз при монтировании


  const login = useCallback(async (newToken) => {
    if (!newToken) {
        console.error("AuthContext: Attempted to login with a null or undefined token.");
        // Можно выбросить ошибку или просто ничего не делать
        return Promise.reject(new Error("Invalid token provided for login."));
    }
    localStorage.setItem('token', newToken);
    setToken(newToken); // Обновляем токен в стейте
    // После установки токена, немедленно пытаемся загрузить данные пользователя
    // Это важно, чтобы currentUser обновился как можно скорее.
    // setLoading(true) здесь может быть излишним, т.к. fetchCurrentUserDetails уже управляет loading.
    setLoading(true); // Указываем, что идет процесс (логин + загрузка пользователя)
    return fetchCurrentUserDetails(newToken); // Возвращаем Promise от fetchCurrentUserDetails
  }, [fetchCurrentUserDetails]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    applyTokenToApiClient(null); // Удаляем заголовок из apiClient
    // setLoading(false) не нужно здесь, т.к. нет асинхронной операции
    // Если после logout есть редирект на страницу, которая делает запрос, loading может быть полезен
  }, []);

  const updateUserContext = useCallback((updatedUserData) => {
    setCurrentUser(prevUser => prevUser ? { ...prevUser, ...updatedUserData } : updatedUserData);
  }, []);

  const contextValue = {
    currentUser,
    token,
    loading,
    login,
    logout,
    updateUserContext,
    // fetchCurrentUserDetails можно не экспортировать, если он используется только внутри
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};