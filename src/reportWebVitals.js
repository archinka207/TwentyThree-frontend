// src/reportWebVitals.js

const reportWebVitals = onPerfEntry => {
  // Проверяем, что onPerfEntry является функцией
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Динамически импортируем библиотеку web-vitals
    // Это делается для того, чтобы библиотека не загружалась,
    // если вы не используете reportWebVitals.
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Вызываем функции для сбора каждой метрики,
      // передавая им ваш колбэк onPerfEntry
      getCLS(onPerfEntry); // Cumulative Layout Shift
      getFID(onPerfEntry); // First Input Delay
      getFCP(onPerfEntry); // First Contentful Paint
      getLCP(onPerfEntry); // Largest Contentful Paint
      getTTFB(onPerfEntry); // Time to First Byte
    });
  }
};

export default reportWebVitals;