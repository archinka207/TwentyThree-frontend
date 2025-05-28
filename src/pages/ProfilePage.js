import React, { useState, useEffect, useCallback } from 'react';
import AlertMessage from '../components/common/AlertMessage';
import { useAuth } from '../hooks/useAuth'; // Кастомный хук для AuthContext
import ProfileEditForm from '../components/profile/ProfileEditForm'; // Форма редактирования
import { getUserProfile, updateUserProfile, updateUserAvatar as updateUserAvatarApi } from '../services/userService'; // API сервисы
import { Badge, Container, Row, Col, Card, Image, Alert, Button, Spinner, Form } from 'react-bootstrap'; // Компоненты Bootstrap
import defaultAvatar from '../assets/images/default-avatar.png'; // Аватар по умолчанию
import { getFullImageUrl } from '../utils/helpers'; // Вспомогательная функция для URL изображений
import { FullPageSpinner } from '../components/common/LoadingSpinner'; // Полноэкранный спиннер
import { Link } from 'react-router-dom'; // Для ссылки на главную страницу

const ProfilePage = () => {
  const { currentUser, updateUserContext, loading: authLoading } = useAuth(); // Используем authLoading из AuthContext
  const [profileData, setProfileData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true); // Отдельное состояние загрузки для страницы профиля
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false); // Режим редактирования профиля
  const [avatarFile, setAvatarFile] = useState(null); // Файл нового аватара
  const [uploadingAvatar, setUploadingAvatar] = useState(false); // Индикатор загрузки аватара
  const [updateError, setUpdateError] = useState(''); // Ошибки при обновлении профиля/аватара

  // Функция для загрузки данных профиля
  const loadProfile = useCallback(async () => {
    if (currentUser && currentUser.id) {
      setPageLoading(true);
      setError('');
      try {
        const data = await getUserProfile(); // getUserProfile из userService уже использует /me
        setProfileData(data);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError(err.response?.data?.message || 'Failed to load profile data.');
        setProfileData(null); // Сбрасываем данные профиля в случае ошибки
      } finally {
        setPageLoading(false);
      }
    } else if (!authLoading) { // Если authLoading завершен, а currentUser все еще нет
      setError("User not authenticated or session expired.");
      setPageLoading(false);
      setProfileData(null);
    }
    // Если authLoading еще true, ждем его завершения (useEffect ниже)
  }, [currentUser, authLoading]); // Зависимости для useCallback

  // Загрузка профиля при монтировании или изменении currentUser
  useEffect(() => {
    if (!authLoading) { // Загружаем профиль только после завершения проверки аутентификации
        loadProfile();
    }
  }, [authLoading, loadProfile]); // Зависимость от loadProfile (которая стабильна из-за useCallback)

  // Обработчик обновления данных профиля (никнейм, интересы)
  const handleProfileUpdate = async (updateData) => {
    if (!profileData) return;
    setPageLoading(true); // Можно использовать отдельный стейт типа `updatingProfile`
    setUpdateError('');
    try {
      const updatedProfile = await updateUserProfile(updateData); // updateUserProfile из userService уже использует /me
      setProfileData(updatedProfile);
      updateUserContext(updatedProfile); // Обновляем данные в AuthContext (ник, аватар и т.д.)
      setEditMode(false); // Выходим из режима редактирования
      alert('Profile updated successfully!'); // Простое уведомление
    } catch (err) {
      console.error("Failed to update profile:", err);
      setUpdateError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setPageLoading(false);
    }
  };

  // Обработчик выбора файла аватара
  const handleAvatarFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setUpdateError('Please select a valid image file (e.g., PNG, JPG, GIF).');
        setAvatarFile(null);
        e.target.value = null; // Сбрасываем input
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // Лимит 5MB для аватара
        setUpdateError('Avatar file is too large. Maximum size is 5MB.');
        setAvatarFile(null);
        e.target.value = null; // Сбрасываем input
        return;
      }
      setAvatarFile(file);
      setUpdateError(''); // Сбрасываем ошибку, если была
    }
  };

  // Обработчик загрузки нового аватара
  const handleAvatarUpload = async () => {
    if (!avatarFile || !profileData) return;
    setUploadingAvatar(true);
    setUpdateError('');
    try {
      const updatedProfile = await updateUserAvatarApi(avatarFile); // updateUserAvatarApi из userService уже использует /me
      setProfileData(updatedProfile); // Обновляем локальные данные профиля
      updateUserContext({ profilePictureUrl: updatedProfile.profilePictureUrl }); // Обновляем только URL аватара в AuthContext
      setAvatarFile(null); // Сбрасываем выбранный файл
      if (document.getElementById('avatar-upload-input')) { // Очищаем input file
        document.getElementById('avatar-upload-input').value = null;
      }
      alert('Avatar updated successfully!');
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      setUpdateError(err.response?.data?.message || 'Failed to upload avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // --- Рендеринг компонента ---

  // Если authLoading (начальная проверка аутентификации) еще идет
  if (authLoading) {
    return <FullPageSpinner message="Loading session..." />;
  }

  // Если pageLoading (загрузка данных профиля) еще идет, ИЛИ profileData еще не загружен
  // (но authLoading уже завершен)
  if (pageLoading || (!profileData && !error)) {
    return <FullPageSpinner message="Loading profile..." />;
  }

  // Если есть ошибка загрузки профиля ИЛИ profileData так и не был получен
  if (error || !profileData) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger"> {/* Здесь Alert корректно закрыт */}
          <h4>Error</h4>
          <p>{error || "Could not load profile data."}</p>
          <Link to="/">Go to Homepage</Link>
        </Alert>
      </Container>
    );
  }

  // Если все успешно загружено, отображаем профиль
  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={10} lg={8} xl={7}>
          <Card className="p-3 p-md-4 shadow-sm">
            <Card.Title as="h2" className="text-center mb-4">
              {editMode ? 'Edit Profile' : 'My Profile'}
            </Card.Title>

            {/* Общая ошибка обновления (если есть) */}
            {updateError && <AlertMessage variant="danger" message={updateError} onClose={() => setUpdateError('')} />}

            {!editMode && (
              <div className="text-center mb-4">
                <Image
                  src={getFullImageUrl(profileData.profilePictureUrl) || defaultAvatar}
                  alt={profileData.nickname}
                  roundedCircle
                  className="profile-avatar mb-3" // Добавим класс для стилизации
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                />
                <h4>{profileData.nickname}</h4>
                <p className="text-muted">Reputation: {profileData.reputation}</p>
                <p className="text-muted small">Member since: {new Date(profileData.createdAt).toLocaleDateString()}</p>

                <Form.Group controlId="avatar-upload-input" className="mt-3 mb-2">
                  <Form.Label visuallyHidden>Upload new avatar</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleAvatarFileChange} size="sm" disabled={uploadingAvatar} />
                </Form.Group>
                {avatarFile && (
                  <Button onClick={handleAvatarUpload} disabled={uploadingAvatar} size="sm" variant="info">
                    {uploadingAvatar ? (
                      <>
                        <Spinner as="span" size="sm" animation="border" className="me-1" /> Uploading...
                      </>
                    ) : (
                      'Upload New Avatar'
                    )}
                  </Button>
                )}
              </div>
            )}

            {editMode ? (
              <ProfileEditForm
                initialData={{
                  nickname: profileData.nickname,
                  interestIds: profileData.interests.map(i => i.id),
                }}
                onSubmit={handleProfileUpdate}
                onCancel={() => { setEditMode(false); setUpdateError(''); }} // Сбрасываем ошибку при отмене
                loading={pageLoading} // Используем pageLoading или отдельный стейт для формы
                serverError={updateError} // Передаем ошибку обновления в форму
              />
            ) : (
              <>
                <hr />
                <h5 className="mt-4 mb-3">Interests:</h5>
                {profileData.interests && profileData.interests.length > 0 ? (
                  <Row xs={1} sm={2} md={3} className="g-2">
                    {profileData.interests.map(interest => (
                      <Col key={interest.id}>
                        <Badge pill bg="light" text="dark" className="p-2 w-100 text-truncate">
                          {interest.name}
                        </Badge>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <p className="text-muted">You haven't selected any interests yet.</p>
                )}
                <Button variant="primary" onClick={() => setEditMode(true)} className="w-100 mt-4">
                  Edit Profile and Interests
                </Button>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;