import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm'; // Предполагается, что LoginForm.js существует
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth'; // Предполагается, что useAuth.js существует

const LoginPage = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
        <div className="text-center mt-5">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    ); // Или ваш компонент LoadingSpinner
  }

  if (currentUser) {
    return <Navigate to="/" replace />; // Если пользователь уже залогинен, перенаправляем на главную
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5} xl={4}>
          <Card className="p-4 shadow">
            <Card.Body>
              <h2 className="text-center mb-4 fw-bold">Login</h2>
              <LoginForm />
              <div className="mt-3 text-center">
                Don't have an account? <Link to="/register">Register here</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;