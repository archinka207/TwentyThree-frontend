import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    // Используем классы Bootstrap для стилизации и прижатия к низу
    // Класс `mt-auto` используется вместе с `d-flex flex-column min-vh-100` на родительском элементе (в App.js)
    <footer className="footer mt-auto py-3 bg-dark text-white-50">
      <Container className="text-center">
        <span>© {new Date().getFullYear()} TwentyThree Messenger. All rights reserved.</span>
        {/* Можно добавить ссылки на соцсети или другую информацию */}
        {/* <p className="mb-0">
          <a href="/privacy" className="text-white-50">Privacy Policy</a> |
          <a href="/terms" className="text-white-50 ms-2">Terms of Service</a>
        </p> */}
      </Container>
    </footer>
  );
};

export default Footer;