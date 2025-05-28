import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Предполагается, что useAuth.js существует
import { Button, Card, Col, Row, Modal, Form, Spinner, Image, Container } from 'react-bootstrap';
import { getAllInterests } from '../services/interestService'; // Предполагается, что interestService.js существует
import { joinChatByInterest, createNewChat, getCurrentChat } from '../services/chatService'; // Предполагается, что chatService.js существует
import AlertMessage from '../components/common/AlertMessage'; // Предполагается, что AlertMessage.js существует
import defaultAvatar from '../assets/images/default-avatar.png'; // Предполагается, что default-avatar.png существует
import { getFullImageUrl } from '../utils/helpers'; // Предполагается, что helpers.js существует

const HomePage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [interests, setInterests] = useState([]);
  const [selectedInterestToJoin, setSelectedInterestToJoin] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createChatName, setCreateChatName] = useState('');
  const [createChatInterestId, setCreateChatInterestId] = useState('');

  const [pageError, setPageError] = useState('');
  const [modalError, setModalError] = useState('');
  const [actionLoading, setActionLoading] = useState(false); // Для кнопок Join/Create
  const [interestsLoading, setInterestsLoading] = useState(false);

  // Проверка текущего активного чата пользователя при загрузке
  useEffect(() => {
    if (currentUser && !authLoading) { // Убедимся, что данные пользователя загружены
      const checkActiveChat = async () => {
        try {
          const activeChat = await getCurrentChat();
          if (activeChat && activeChat.id) {
            navigate('/chat', { replace: true }); // Перенаправляем, если уже в чате
          }
        } catch (error) {
          // Если ошибка 404 или 204 (нет чата), ничего не делаем
          if (error.response && (error.response.status === 404 || error.response.status === 204)) {
            console.log("No active chat found for current user.");
          } else {
            console.error("Error checking for active chat:", error);
            // Можно показать ошибку, но HomePage должна оставаться доступной
          }
        }
      };
      checkActiveChat();
    }
  }, [currentUser, authLoading, navigate]);

  // Загрузка списка интересов
  const loadInterests = useCallback(async () => {
    setInterestsLoading(true);
    setPageError('');
    try {
      const interestsData = await getAllInterests();
      setInterests(interestsData || []);
      if (interestsData && interestsData.length > 0) {
        // Устанавливаем значения по умолчанию для модальных окон
        setSelectedInterestToJoin(interestsData[0].id.toString());
        setCreateChatInterestId(interestsData[0].id.toString());
      }
    } catch (err) {
      console.error("Failed to fetch interests:", err);
      setPageError(err.response?.data?.message || 'Failed to load interests. Please try again.');
    } finally {
      setInterestsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInterests();
  }, [loadInterests]);


  const handleOpenJoinModal = () => {
    setModalError('');
    setShowJoinModal(true);
  };

  const handleOpenCreateModal = () => {
    setModalError('');
    setCreateChatName(''); // Сбрасываем имя при открытии
    setShowCreateModal(true);
  };

  const handleJoinChat = async (e) => {
    e.preventDefault();
    if (!selectedInterestToJoin) {
      setModalError('Please select an interest to join a chat.');
      return;
    }
    setActionLoading(true);
    setModalError('');
    try {
      await joinChatByInterest(selectedInterestToJoin);
      navigate('/chat');
    } catch (err) {
      console.error("Failed to join chat:", err);
      setModalError(err.response?.data?.message || 'Failed to join chat. No active chats for this interest or you might already be in one.');
    } finally {
      setActionLoading(false);
      // setShowJoinModal(false); // Не закрываем модалку при ошибке
    }
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!createChatInterestId) {
      setModalError('Please select an interest for the new chat.');
      return;
    }
    setActionLoading(true);
    setModalError('');
    try {
      await createNewChat({
        chatName: createChatName.trim() || null, // Отправляем null, если имя пустое
        primaryInterestId: parseInt(createChatInterestId),
      });
      navigate('/chat');
    } catch (err) {
      console.error("Failed to create chat:", err);
      setModalError(err.response?.data?.message || 'Failed to create chat. You might already have an active chat.');
    } finally {
      setActionLoading(false);
      // setShowCreateModal(false); // Не закрываем модалку при ошибке
    }
  };

  if (authLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading user data...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center text-center mb-5">
        <Col md={8}>
          <Card className="p-4 shadow-sm">
            <Card.Body>
              <Card.Title as="h1">Welcome to TwentyThree!</Card.Title>
              <Card.Text className="lead">
                Discover temporary group chats based on your interests.
                Connect, discuss, and explore with like-minded individuals in an anonymous and spontaneous environment.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AlertMessage message={pageError} show={!!pageError} variant="danger" />

      {currentUser ? (
        <>
          <Row className="justify-content-center align-items-center mb-4 text-center">
            <Col xs="auto">
              <Link to="/profile" className="text-decoration-none text-dark d-flex flex-column align-items-center">
                <Image
                  src={getFullImageUrl(currentUser.profilePictureUrl) || defaultAvatar}
                  alt={currentUser.nickname}
                  roundedCircle
                  style={{ width: '60px', height: '60px', objectFit: 'cover', border: '2px solid #007bff' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                />
                <span className="mt-2 fw-bold">{currentUser.nickname}</span>
              </Link>
            </Col>
          </Row>

          <Row className="justify-content-center text-center">
            <Col md={5} lg={4} className="mb-3">
              <Button
                variant="outline-primary"
                size="lg"
                className="w-100 py-3"
                onClick={handleOpenCreateModal}
                disabled={actionLoading || interestsLoading}
              >
                {actionLoading || interestsLoading ? <Spinner as="span" size="sm" animation="border"/> : 'Make New Chat'}
              </Button>
            </Col>
            <Col md={5} lg={4} className="mb-3">
              <Button
                variant="outline-success"
                size="lg"
                className="w-100 py-3"
                onClick={handleOpenJoinModal}
                disabled={actionLoading || interestsLoading}
              >
                {actionLoading || interestsLoading ? <Spinner as="span" size="sm" animation="border"/> : 'Join Existing Chat'}
              </Button>
            </Col>
          </Row>
        </>
      ) : (
        <Row className="justify-content-center text-center">
          <Col md={6}>
            <Card className="p-3 shadow-sm">
                <p className="mb-2">Please login or register to start chatting.</p>
                <Link to="/login" className="btn btn-primary btn-lg me-2">Login</Link>
                <Link to="/register" className="btn btn-secondary btn-lg">Register</Link>
            </Card>
          </Col>
        </Row>
      )}

      {/* Модальное окно для присоединения к чату */}
      <Modal show={showJoinModal} onHide={() => setShowJoinModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Join Chat by Interest</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleJoinChat}>
          <Modal.Body>
            <AlertMessage message={modalError} show={!!modalError} variant="danger" />
            <Form.Group className="mb-3">
              <Form.Label>Select an Interest</Form.Label>
              {interestsLoading ? (
                 <div className="text-center"><Spinner animation="border" size="sm"/> Loading interests...</div>
              ) : interests.length > 0 ? (
                <Form.Select
                  value={selectedInterestToJoin}
                  onChange={(e) => setSelectedInterestToJoin(e.target.value)}
                  disabled={actionLoading}
                  required
                >
                  {/* <option value="">-- Select an Interest --</option> */}
                  {interests.map((interest) => (
                    <option key={interest.id} value={interest.id}>
                      {interest.name}
                    </option>
                  ))}
                </Form.Select>
              ) : (
                <p className="text-muted">No interests available.</p>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowJoinModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={actionLoading || interestsLoading || !selectedInterestToJoin}>
              {actionLoading ? <Spinner as="span" size="sm" animation="border"/> : 'Join Chat'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Модальное окно для создания чата */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create a New Chat</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateChat}>
          <Modal.Body>
            <AlertMessage message={modalError} show={!!modalError} variant="danger" />
            <Form.Group className="mb-3">
              <Form.Label>Chat Name (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="E.g., Sci-Fi Book Club"
                value={createChatName}
                onChange={(e) => setCreateChatName(e.target.value)}
                disabled={actionLoading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Primary Interest</Form.Label>
               {interestsLoading ? (
                 <div className="text-center"><Spinner animation="border" size="sm"/> Loading interests...</div>
              ) : interests.length > 0 ? (
                <Form.Select
                  value={createChatInterestId}
                  onChange={(e) => setCreateChatInterestId(e.target.value)}
                  required
                  disabled={actionLoading}
                >
                  {/* <option value="">-- Select an Interest --</option> */}
                  {interests.map((interest) => (
                    <option key={interest.id} value={interest.id}>
                      {interest.name}
                    </option>
                  ))}
                </Form.Select>
              ) : (
                <p className="text-muted">No interests available to create a chat.</p>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={actionLoading || interestsLoading || !createChatInterestId}>
              {actionLoading ? <Spinner as="span" size="sm" animation="border"/> : 'Create Chat'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default HomePage;