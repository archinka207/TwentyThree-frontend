import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Кастомный хук для доступа к AuthContext
import { FullPageSpinner } from '../common/LoadingSpinner'; // Компонент для полноэкранной загрузки

const ProtectedRoute = () => {
  const { currentUser, loading: authLoading } = useAuth(); // Получаем пользователя и состояние загрузки из AuthContext
  const location = useLocation(); // Для получения текущего URL и передачи его при редиректе

  // Если состояние аутентификации еще загружается, показываем спиннер
  // Это важно, чтобы избежать моргания или преждевременного редиректа
  if (authLoading) {
    return <FullPageSpinner message="Verifying your session..." />;
  }

  // Если пользователь не аутентифицирован (currentUser is null),
  // перенаправляем на страницу входа.
  // `state={{ from: location }}` передает текущий путь в location state страницы /login,
  // чтобы после успешного входа можно было вернуться на эту страницу.
  // `replace` заменяет текущую запись в истории навигации, чтобы кнопка "назад"
  // не возвращала пользователя на защищенный роут, с которого его только что перенаправили.
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если пользователь аутентифицирован, рендерим дочерний компонент роута.
  // <Outlet /> — это компонент из react-router-dom v6, который рендерит
  // соответствующий вложенный UI, когда URL совпадает с одним из дочерних роутов.
  return <Outlet />;
};

export default ProtectedRoute;