import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService'; // Предполагается, что authService.js существует
import { Form, Button, Alert, Spinner, FloatingLabel } from 'react-bootstrap'; // Компоненты React Bootstrap

const RegisterForm = () => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (nickname.length < 3) {
      setError("Nickname must be at least 3 characters long.");
      return;
    }

    setLoading(true);
    try {
      const responseMessage = await registerUser({ nickname, password });
      setSuccess(responseMessage + " You can now log in.");
      setNickname('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error("Registration attempt failed:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try a different nickname or try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Весь JSX должен быть обернут в один родительский элемент.
  // В данном случае, <Form> является этим родительским элементом.
  return (
    <Form onSubmit={handleSubmit}> {/* <--- Родительский элемент */}
      {error && <Alert variant="danger" className="mb-3 py-2">{error}</Alert>}
      {success && <Alert variant="success" className="mb-3 py-2">{success}</Alert>}

      <FloatingLabel
        controlId="registerNickname"
        label="Nickname"
        className="mb-3"
      >
        <Form.Control
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          placeholder="Choose a nickname" // Этот placeholder для FloatingLabel
          disabled={loading}
          autoFocus
        />
      </FloatingLabel>

      <FloatingLabel
        controlId="registerPassword"
        label="Password (min. 6 characters)"
        className="mb-3"
      >
        <Form.Control
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Create a password" // Этот placeholder для FloatingLabel
          minLength={6}
          disabled={loading}
          autoComplete="new-password"
        />
      </FloatingLabel>

      <FloatingLabel
        controlId="registerConfirmPassword"
        label="Confirm Password"
        className="mb-3"
      >
        <Form.Control
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Confirm your password" // Этот placeholder для FloatingLabel
          disabled={loading}
          autoComplete="new-password"
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
            Registering...
          </>
        ) : (
          'Register'
        )}
      </Button>
    </Form> // <--- Закрытие родительского элемента
  );
};

export default RegisterForm;