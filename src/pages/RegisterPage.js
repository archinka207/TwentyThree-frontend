import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm'; // Предполагается, что RegisterForm.js существует
import { Spinner, Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth'; // Предполагается, что useAuth.js существует

const RegisterPage = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
     return (
        <div className="text-center mt-5">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    );
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
              <h2 className="text-center mb-4 fw-bold">Register</h2>
              <RegisterForm />
              <div className="mt-3 text-center">
                Already have an account? <Link to="/login">Login here</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;