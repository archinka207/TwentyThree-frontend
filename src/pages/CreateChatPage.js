import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Предполагается, что useAuth.js существует
import { Form, Button, Container, Row, Col, Card, Spinner, FloatingLabel } from 'react-bootstrap';
import { getAllInterests } from '../services/interestService'; // Предполагается, что interestService.js существует
import { createNewChat } from '../services/chatService'; // Предполагается, что chatService.js существует
import AlertMessage from '../components/common/AlertMessage'; // Предполагается, что AlertMessage.js существует

const CreateChatPage = () => {
  const { currentUser } = useAuth(); // Для проверки, залогинен ли пользователь
  const navigate = useNavigate();

  const [chatName, setChatName] = useState('');
  const [selectedInterestId, setSelectedInterestId] = useState('');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [interestsLoading, setInterestsLoading] = useState(true);

  const loadInterests = useCallback(async () => {
    setInterestsLoading(true);
    setError('');
    try {
      const interestsData = await getAllInterests();
      setInterests(interestsData || []);
      if (interestsData && interestsData.length > 0) {
        setSelectedInterestId(interestsData[0].id.toString()); // Выбираем первый по умолчанию
      }
    } catch (err) {
      console.error("Failed to fetch interests:", err);
      setError(err.response?.data?.message || 'Failed to load interests. Please try again.');
    } finally {
      setInterestsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInterests();
  }, [loadInterests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInterestId) {
      setError('Please select an interest for the chat.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createNewChat({
        chatName: chatName.trim() || null,
        primaryInterestId: parseInt(selectedInterestId),
      });
      navigate('/chat'); // Перенаправляем на страницу чата после успешного создания
    } catch (err) {
      console.error("Failed to create chat:", err);
      setError(err.response?.data?.message || 'Failed to create chat. You might already have an active chat.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    // Это состояние не должно достигаться, если используется ProtectedRoute
    // Но на всякий случай, если страница сделана публичной
    navigate('/login', { state: { from: { pathname: '/create-chat' } } });
    return null;
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="p-4 shadow-lg">
            <Card.Title as="h2" className="text-center mb-4 border-bottom pb-3">
              Create a New Chat
            </Card.Title>
            <AlertMessage message={error} show={!!error} variant="danger" onClose={() => setError('')} />
            <Form onSubmit={handleSubmit}>
              <FloatingLabel controlId="createChatName" label="Chat Name (Optional)" className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Enter chat name (e.g., Weekend Gaming)"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  disabled={loading || interestsLoading}
                />
              </FloatingLabel>

              <FloatingLabel controlId="createChatInterest" label="Select Primary Interest" className="mb-4">
                <Form.Select
                  value={selectedInterestId}
                  onChange={(e) => setSelectedInterestId(e.target.value)}
                  required
                  disabled={loading || interestsLoading || interests.length === 0}
                  aria-label="Select primary interest for the chat"
                >
                  <option value="" disabled={selectedInterestId !== ""}>-- Select an Interest --</option>
                  {interests.map((interest) => (
                    <option key={interest.id} value={interest.id}>
                      {interest.name}
                    </option>
                  ))}
                </Form.Select>
              </FloatingLabel>

              {interestsLoading && (
                <div className="text-center mb-3">
                  <Spinner animation="border" size="sm" /> Loading available interests...
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                className="w-100 btn-lg"
                disabled={loading || interestsLoading || !selectedInterestId || interests.length === 0}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-1">Creating Chat...</span>
                  </>
                ) : (
                  'Create Chat'
                )}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateChatPage;