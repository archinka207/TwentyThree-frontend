import React from 'react';
import { Alert } from 'react-bootstrap';

const AlertMessage = ({
  variant = 'danger', // Bootstrap варианты: primary, secondary, success, danger, warning, info, light, dark
  message,            // Текст сообщения (может быть строкой или объектом ошибки)
  show = true,        // Показать/скрыть алерт
  onClose,            // Функция для кнопки закрытия (делает алерт dismissible)
  className = "mt-3"  // Дополнительные классы
}) => {
  if (!show || !message) {
    return null; // Не рендерить, если нечего показывать или show=false
  }

  let displayMessage = message;

  // Пытаемся извлечь более читаемое сообщение, если message - это объект ошибки от Axios
  if (typeof message === 'object' && message !== null) {
    if (message.response && message.response.data) { // Ошибка Axios
      if (typeof message.response.data.message === 'string') {
        displayMessage = message.response.data.message;
      } else if (typeof message.response.data === 'string') { // Иногда тело ответа просто строка
        displayMessage = message.response.data;
      } else if (message.response.data.errors) { // Ошибки валидации Spring
        displayMessage = Object.values(message.response.data.errors).join('. ');
      } else {
        displayMessage = "An unexpected error occurred. Please check console."; // Общее
      }
    } else if (message.message) { // Стандартное свойство Error.message
      displayMessage = message.message;
    } else {
      try {
        displayMessage = JSON.stringify(message); // В крайнем случае
      } catch (e) {
        displayMessage = "An unreadable error object was received.";
      }
    }
  }

  return (
    <Alert
      variant={variant}
      onClose={onClose} // Если onClose передана, Alert будет dismissible
      dismissible={!!onClose}
      className={className}
      role="alert"
    >
      {/* Можно добавить заголовок Alert.Heading, если нужно */}
      {/* <Alert.Heading>Oh snap! You got an error!</Alert.Heading> */}
      {displayMessage}
    </Alert>
  );
};

export default AlertMessage;