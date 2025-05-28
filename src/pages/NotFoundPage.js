import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
// import Lottie from 'react-lottie'; // Если хотите добавить Lottie анимацию
// import animationData from '../assets/animations/404-animation.json'; // Пример Lottie файла

const NotFoundPage = () => {
//   const defaultOptions = {
//       loop: true,
//       autoplay: true,
//       animationData: animationData,
//       rendererSettings: {
//         preserveAspectRatio: 'xMidYMid slice'
//       }
//     };

  return (
    <Container className="text-center mt-5 pt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="p-4 shadow-lg border-danger">
            <Card.Body>
              {/* <Lottie options={defaultOptions} height={200} width={200} /> */}
              <h1 className="display-1 text-danger fw-bold">404</h1>
              <h2 className="mb-3">Oops! Page Not Found.</h2>
              <p className="lead text-muted mb-4">
                The page you are looking for might have been removed, had its name changed,
                or is temporarily unavailable.
              </p>
              <Button as={Link} to="/" variant="primary" size="lg">
                Go Back to Homepage
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;