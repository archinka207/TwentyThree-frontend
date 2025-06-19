import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { loginUser as apiLoginUser } from '../../services/authService'; // Переименуем, чтобы не конфликтовать с login из useAuth
import { Form, Button, Alert, Spinner, FloatingLabel } from 'react-bootstrap';

const LoginForm = () => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Локальный loading для самой формы

  const { login } = useAuth(); // Функция login из AuthContext
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const responseData = await apiLoginUser({ nickname, password }); // Вызов API

      if (responseData && responseData.accessToken) {
        // Вызываем login из AuthContext и дожидаемся его выполнения
        // login теперь возвращает Promise, который разрешается данными пользователя или null
        const loggedInUser = await login(responseData.accessToken);

        if (loggedInUser) {
          navigate(from, { replace: true }); // Перенаправляем после успешного логина и загрузки пользователя
        } else {
          // Это может случиться, если токен получен, но fetchCurrentUserDetails не смог загрузить пользователя
          setError('Login succeeded, but failed to retrieve user details. Please try again.');
          // logout() здесь может быть вызван автоматически в AuthContext, если fetchCurrentUserDetails упал
        }
      } else {
        setError('Login successful, but no token received. Please contact support.');
      }
    } catch (err) {
      console.error("Login attempt failed:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your nickname and password.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger" className="mb-3 py-2">{error}</Alert>}
      <FloatingLabel controlId="loginNickname" label="Nickname" className="mb-3">
        <Form.Control
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          placeholder="Enter your nickname"
          disabled={loading}
          autoFocus
        />
      </FloatingLabel>
      <FloatingLabel controlId="loginPassword" label="Password" className="mb-3">
        <Form.Control
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          disabled={loading}
          autoComplete="current-password"
        />
      </FloatingLabel>
      <Button variant="primary" type="submit" className="w-100" disabled={loading}>
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
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