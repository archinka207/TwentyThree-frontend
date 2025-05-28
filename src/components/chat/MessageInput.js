import React, { useState, useRef } from 'react';
import { Form, Button, InputGroup, Spinner, Alert, Image } from 'react-bootstrap';
import { BsPaperclip, BsFillSendFill } from 'react-icons/bs'; // Иконки Bootstrap
import { uploadChatImage } from '../../services/chatService'; // Сервис для загрузки изображений

const MessageInput = ({ onSendMessage, chatId, chatIsActive }) => {
  const [messageText, setMessageText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Для превью выбранного изображения
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null); // Для программного клика по input[type=file] и его сброса

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return; // Не отправлять пустое сообщение

    onSendMessage(messageText.trim(), 'TEXT', null);
    setMessageText(''); // Очистить поле ввода
    setError('');      // Сбросить ошибку
  };

  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Проверка типа файла (опционально, но рекомендуется)
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (png, jpg, gif).');
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      // Проверка размера файла (например, 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File is too large. Max 10MB allowed.');
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Создаем URL для превью
      setError('');
    }
  };

  const handleImageUploadAndSend = async () => {
    if (!imageFile || !chatId) {
      setError("Please select an image file first.");
      return;
    }
    setIsUploading(true);
    setError('');
    try {
      // Шаг 1: Загружаем изображение на сервер через HTTP POST
      const imageMessageDto = await uploadChatImage(chatId, imageFile);
      // imageMessageDto от бэкенда должен содержать contentImageUrl и, возможно, contentText (если имя файла или др.)
      if (imageMessageDto && imageMessageDto.contentImageUrl) {
        // Шаг 2: Отправляем WebSocket сообщение с типом IMAGE и URL загруженного изображения
        onSendMessage(imageMessageDto.contentText, 'IMAGE', imageMessageDto.contentImageUrl);
      } else {
        throw new Error("Image URL was not returned from the server after upload.");
      }
      // Сброс после успешной отправки
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Failed to upload and send image:", err);
      setError(err.response?.data?.message || "Failed to process image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImagePreview = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError('');
  }

  if (!chatIsActive) {
    return null; // Не показывать инпут, если чат неактивен
  }

  return (
    <div className="message-input-area p-2 border-top bg-light">
      {error && <Alert variant="danger" size="sm" className="mb-2 py-1" onClose={() => setError('')} dismissible>{error}</Alert>}

      {imagePreview && (
        <div className="mb-2 position-relative" style={{ maxWidth: '150px' }}>
          <Image src={imagePreview} thumbnail fluid />
          <Button
            variant="danger"
            size="sm"
            onClick={removeImagePreview}
            disabled={isUploading}
            className="position-absolute top-0 end-0 m-1"
            style={{ lineHeight: '0.8', padding: '0.2rem 0.4rem' }}
            aria-label="Remove image"
          >
            ×
          </Button>
        </div>
      )}

      <Form onSubmit={handleTextSubmit}>
        <InputGroup>
          {/* Скрытый input[type=file] */}
          <Form.Control
            type="file"
            id="chatImageUploadInput"
            accept="image/png, image/jpeg, image/gif"
            onChange={handleImageFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
            aria-label="Upload image file"
            disabled={isUploading}
          />
          {/* Кнопка для вызова скрытого input */}
          <Button
            variant="outline-secondary"
            onClick={triggerFileInput}
            disabled={isUploading}
            title="Attach image"
          >
            <BsPaperclip /> {/* Или BsCardImage */}
          </Button>

          <Form.Control
            type="text"
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            aria-label="Message text"
            disabled={isUploading || !!imageFile} // Блокируем ввод текста, если выбрано изображение для загрузки
            autoFocus
          />

          {imageFile ? (
            <Button
              variant="success"
              onClick={handleImageUploadAndSend}
              disabled={isUploading || !imageFile}
            >
              {isUploading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="visually-hidden">Uploading...</span>
                </>
              ) : (
                <BsFillSendFill /> /* Иконка отправки для изображения */
              )}
            </Button>
          ) : (
            <Button
              variant="primary"
              type="submit"
              disabled={!messageText.trim() || isUploading}
            >
              <BsFillSendFill /> {/* Иконка отправки для текста */}
            </Button>
          )}
        </InputGroup>
      </Form>
    </div>
  );
};

export default MessageInput;