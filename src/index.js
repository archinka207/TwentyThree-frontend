import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Главный компонент приложения
import reportWebVitals from './reportWebVitals'; // Для метрик производительности
import { BrowserRouter } from 'react-router-dom'; // Для роутинга
import { AuthProvider } from './contexts/AuthContext'; // Провайдер состояния аутентификации
import './styles/App.css'; // Подключаем глобальные стили

// Если вы не подключили Bootstrap CSS через CDN в public/index.html,
// вы можете импортировать его здесь:
// import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode> {/* Включает дополнительные проверки и предупреждения в режиме разработки */}
    <BrowserRouter> {/* Оборачиваем приложение в BrowserRouter для работы react-router-dom */}
      <AuthProvider> {/* Оборачиваем в AuthProvider для доступа к контексту аутентификации */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Если вы хотите измерять производительность вашего приложения, передайте функцию
// для логирования результатов (например: reportWebVitals(console.log))
// или отправьте на эндпоинт аналитики. Узнайте больше: https://bit.ly/CRA-vitals
reportWebVitals();