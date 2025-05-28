import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Кастомный хук для доступа к AuthContext
import { loginUser } from '../../services/authService'; // Сервис для API запросов
import { Form, Button, Alert, Spinner, FloatingLabel } from 'react-bootstrap'; // Компоненты React Bootstrap

const LoginForm = () => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Для отображения ошибок от сервера или валидации
  const [loading, setLoading] = useState(false); // Для индикатора загрузки

  const { login } = useAuth(); // Получаем функцию login из нашего AuthContext
  const navigate = useNavigate(); // Для программной навигации
  const location = useLocation(); // Для получения предыдущего пути

  // Определяем, куда перенаправить пользователя после успешного входа.
  // Если пользователь был перенаправлен на /login с какой-то другой страницы,
  // то location.state.from будет содержать этот путь.
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы (перезагрузку страницы)
    setError(''); // Сбрасываем предыдущие ошибки
    setLoading(true); // Включаем индикатор загрузки

    try {
      const responseData = await loginUser({ nickname, password });
      // responseData от бэкенда должен содержать accessToken
      // Пример: { accessToken: "your_jwt_token", tokenType: "Bearer" }

      if (responseData && responseData.accessToken) {
        await login(responseData.accessToken); // Обновляем состояние аутентификации в AuthContext
        navigate(from, { replace: true }); // Перенаправляем пользователя
      } else {
        // Если бэкенд вернул успешный ответ, но без токена (маловероятно при правильной настройке)
        setError('Login successful, but no token received. Please contact support.');
      }
    } catch (err) {
      console.error("Login attempt failed:", err);
      // Пытаемся получить сообщение об ошибке из ответа сервера,
      // или используем общее сообщение, если специфичного нет.
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your nickname and password.';
      setError(errorMessage);
    } finally {
      setLoading(false); // Выключаем индикатор загрузки в любом случае
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Отображение сообщения об ошибке, если оно есть */}
      {error && <Alert variant="danger" className="mb-3 py-2">{error}</Alert>}

      <FloatingLabel
        controlId="loginNickname"
        label="Nickname"
        className="mb-3"
      >
        <Form.Control
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          placeholder="Enter your nickname"
          disabled={loading} // Блокируем поле во время загрузки
          autoFocus // Автофокус на поле при загрузке формы
        />
      </FloatingLabel>

      <FloatingLabel
        controlId="loginPassword"
        label="Password"
        className="mb-3"
      >
        <Form.Control
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          disabled={loading}
          autoComplete="current-password" // Подсказка для менеджеров паролей
        />
      </FloatingLabel>

      <Button variant="primary" type="submit" className="w-100" disabled={loading}>
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </Button>
    </Form>
  );
};

export default LoginForm;