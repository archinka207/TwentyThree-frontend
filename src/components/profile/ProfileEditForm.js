import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert, Row, Col, FloatingLabel, Card } from 'react-bootstrap';
import { getAllInterests as fetchAllInterestsApi } from '../../services/interestService'; // Сервис для загрузки интересов

const ProfileEditForm = ({ initialData, onSubmit, onCancel, loading, serverError }) => {
  const [nickname, setNickname] = useState(initialData.nickname || '');
  // Используем Set для удобного управления ID выбранных интересов
  const [selectedInterestIds, setSelectedInterestIds] = useState(new Set(initialData.interestIds || []));
  const [availableInterests, setAvailableInterests] = useState([]);
  const [formError, setFormError] = useState(''); // Ошибки валидации на стороне клиента
  const [interestsLoading, setInterestsLoading] = useState(true); // Загрузка списка интересов

  useEffect(() => {
    // Устанавливаем никнейм из initialData при монтировании или изменении initialData
    setNickname(initialData.nickname || '');
    setSelectedInterestIds(new Set(initialData.interestIds || []));
  }, [initialData]); // Зависимость от initialData

  useEffect(() => {
    // Загрузка списка всех доступных интересов при монтировании компонента
    const loadInterests = async () => {
      setInterestsLoading(true);
      setFormError(''); // Сбрасываем ошибки при перезагрузке
      try {
        const interests = await fetchAllInterestsApi();
        setAvailableInterests(interests || []);
      } catch (err) {
        console.error("Failed to load interests for profile form:", err);
        setFormError("Could not load available interests. Please try again later.");
      } finally {
        setInterestsLoading(false);
      }
    };
    loadInterests();
  }, []); // Пустой массив зависимостей - запускается один раз при монтировании

  // Обработчик изменения состояния чекбокса интереса
  const handleInterestChange = (interestId) => {
    const newSelectedIds = new Set(selectedInterestIds);
    if (newSelectedIds.has(interestId)) {
      newSelectedIds.delete(interestId);
    } else {
      newSelectedIds.add(interestId);
    }
    setSelectedInterestIds(newSelectedIds);
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(''); // Сбрасываем предыдущие ошибки валидации

    // Клиентская валидация
    if (!nickname.trim()) {
      setFormError("Nickname cannot be empty.");
      return;
    }
    if (nickname.trim().length < 3 || nickname.trim().length > 50) {
      setFormError("Nickname must be between 3 and 50 characters.");
      return;
    }
    // Можно добавить другие валидации, например, на количество выбранных интересов

    // Вызываем колбэк onSubmit, переданный из родительского компонента
    onSubmit({
      nickname: nickname.trim(),
      interestIds: Array.from(selectedInterestIds), // Преобразуем Set в массив для отправки на сервер
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Отображение ошибок валидации или серверных ошибок */}
      {formError && <Alert variant="warning" size="sm" className="mb-3 py-1">{formError}</Alert>}
      {serverError && <Alert variant="danger" size="sm" className="mb-3 py-1">{serverError}</Alert>}

      <FloatingLabel controlId="profileEditNickname" label="Nickname" className="mb-4">
        <Form.Control
          type="text"
          placeholder="Enter your new nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          disabled={loading} // Блокируем во время общей загрузки (отправки формы)
          minLength={3}
          maxLength={50}
        />
      </FloatingLabel>

      <Form.Group className="mb-4">
        <Form.Label as="h5" className="mb-3">Select Your Interests</Form.Label>
        {interestsLoading ? (
          <div className="text-center my-3">
            <Spinner animation="border" size="sm" />
            <span className="ms-2">Loading interests...</span>
          </div>
        ) : availableInterests.length > 0 ? (
          <Card> {/* Обертка для лучшего визуального разделения */}
            <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}> {/* Ограничение высоты и скролл */}
              <Row xs={1} md={2} className="g-2"> {/* Адаптивные колонки для чекбоксов */}
                {availableInterests.map((interest) => (
                  <Col key={interest.id}>
                    <Form.Check
                      type="checkbox"
                      id={`interest-edit-${interest.id}`}
                      label={interest.name}
                      checked={selectedInterestIds.has(interest.id)}
                      onChange={() => handleInterestChange(interest.id)}
                      disabled={loading} // Блокируем во время общей загрузки
                      className="mb-2"
                    />
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        ) : (
          <p className="text-muted">No interests available to select at the moment.</p>
        )}
      </Form.Group>

      <div className="d-flex justify-content-end mt-4 pt-3 border-top">
        <Button variant="outline-secondary" onClick={onCancel} disabled={loading} className="me-2">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={loading || interestsLoading}>
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-1">Saving...</span>
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </Form>
  );
};

export default ProfileEditForm;