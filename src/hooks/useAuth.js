import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext'; // Импортируем созданный контекст

/**
 * Кастомный хук для доступа к AuthContext.
 * Предоставляет удобный способ получить currentUser, token, loading, login, logout, updateUserContext.
 * @returns {object} - Значение AuthContext.
 * @throws {Error} - Если хук используется вне AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Проверка на то, что хук используется внутри AuthProvider
  // Если context равен undefined, это означает, что AuthProvider не найден выше по дереву компонентов.
  // В AuthContext мы передаем null как начальное значение, но useContext вернет это значение,
  // если провайдер есть. Если провайдера нет, useContext вернет значение по умолчанию, указанное при создании контекста (null).
  // Однако, если мы хотим быть уверены, что context не просто null (например, пользователь не залогинен),
  // а что сам провайдер отсутствует, проверка на undefined более строгая.
  // Но так как мы инициализируем AuthContext.Provider всегда значением, даже если currentUser = null,
  // то context никогда не будет undefined, если Provider есть.
  // Поэтому, если context === null и мы ожидаем объект, это тоже может быть проблемой,
  // но она решается проверкой currentUser внутри компонентов.
  // Здесь главная проверка - на то, что сам context был предоставлен.
  // Если AuthContext.Provider не обернул компонент, использующий useAuth, context будет равен значению по умолчанию,
  // переданному в createContext() (в нашем случае null).
  // Чтобы отличить "нет провайдера" от "провайдер есть, но пользователь не залогинен",
  // можно в createContext передать специальный объект или undefined.
  // Если createContext(undefined), то context === undefined будет означать "нет провайдера".
  // Если createContext(null), то context === null может означать как "нет провайдера", так и "провайдер есть, но значение null".

  // Более надежная проверка - если значением по умолчанию createContext было бы undefined:
  // if (context === undefined) {
  //   throw new Error('useAuth must be used within an AuthProvider. Make sure your component is wrapped by AuthProvider.');
  // }

  // Так как мы передаем объект в value AuthContext.Provider, context не должен быть null, если он используется правильно.
  // Если context все еще null после инициализации AuthProvider, это может указывать на проблему в AuthProvider.
  // Но для простоты, если context === null, это значит, что Provider еще не установил значения или что-то пошло не так.
  // Однако, основная цель хука - удобный доступ. Проверка на null важна для избежания ошибок в компонентах.
  if (!context) {
    // Эта ошибка возникнет, если useAuth вызван вне дерева компонентов, обернутого в <AuthProvider>
    // или если AuthContext.Provider вернул null/undefined в value (что маловероятно при нашей реализации)
    throw new Error('useAuth must be used within an AuthProvider. The context is not available.');
  }

  return context;
};

// Нет default export, так как мы экспортируем именованную функцию useAuth.
// В компонентах импортируем так: import { useAuth } from '../hooks/useAuth';