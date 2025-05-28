import React from 'react';
import { Spinner } from 'react-bootstrap';

// Простой спиннер
const LoadingSpinner = ({
  animation = "border", // "border" или "grow"
  variant = "primary",  // Цвет Bootstrap (primary, secondary, success, etc.)
  size,                 // "sm" для маленького, или undefined для стандартного
  message,              // Текст под спиннером
  className = "text-center my-4" // Дополнительные классы для контейнера
}) => {
  return (
    <div className={className}>
      <Spinner animation={animation} role="status" variant={variant} size={size}>
        <span className="visually-hidden">{message || 'Loading...'}</span>
      </Spinner>
      {message && <p className="mt-2 mb-0 text-muted">{message}</p>}
    </div>
  );
};

// Компонент для полноэкранного спиннера (например, при загрузке страницы)
export const FullPageSpinner = ({ message = "Loading application..." }) => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        position: 'fixed', // Или absolute, если родитель имеет relative
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Полупрозрачный фон
        zIndex: 1050 // Выше большинства элементов
      }}
    >
      <LoadingSpinner message={message} size="lg" />
    </div>
  );
};

export default LoadingSpinner;