import React, { Suspense } from 'react'; // Suspense для ленивой загрузки, если будете использовать
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute'; // Компонент для защиты роутов
import { FullPageSpinner } from './components/common/LoadingSpinner'; // Для Suspense fallback

// Ленивая загрузка страниц для лучшей производительности начальной загрузки (опционально)
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
// CreateChatPage, как мы решили, будет модальным окном на HomePage,
// но если нужна отдельная страница, ее тоже можно загружать лениво.
// const CreateChatPage = React.lazy(() => import('./pages/CreateChatPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    // Классы Bootstrap для гибкого макета и прижатия футера
    <div className="d-flex flex-column min-vh-100 app-container">
      <Navbar />
      {/* Основной контент страницы */}
      {/* Suspense нужен, если используется React.lazy для страниц */}
      <Suspense fallback={<FullPageSpinner message="Loading page..." />}>
        <main className="container mt-4 flex-grow-1"> {/* mt-4 для отступа от навбара */}
          <Routes>
            {/* Публичные роуты */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Защищенные роуты (доступны только аутентифицированным пользователям) */}
            {/* ProtectedRoute использует <Outlet /> для рендеринга дочерних роутов */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/chat" element={<ChatPage />} />
              {/* Если CreateChatPage будет отдельной страницей:
              <Route path="/create-chat" element={<CreateChatPage />} />
              */}
            </Route>

            {/* Роут для ненайденных страниц (404) */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </Suspense>
      <Footer />
    </div>
  );
}

export default App;