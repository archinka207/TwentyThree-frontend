import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Кастомный хук
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Image, Container } from 'react-bootstrap'; // Компоненты Bootstrap
import defaultAvatar from '../../assets/images/default-avatar.png'; // Заглушка для аватара
import { getFullImageUrl } from '../../utils/helpers'; // Вспомогательная функция для URL изображений

const Navbar = () => {
  const { currentUser, logout } = useAuth(); // Получаем текущего пользователя и функцию выхода
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Вызываем функцию выхода из AuthContext
    navigate('/login'); // Перенаправляем на страницу входа
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container> {/* Используем Container для лучшего выравнивания и отступов */}
        <BootstrapNavbar.Brand as={Link} to="/" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          TwentyThree
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="responsive-navbar-nav" />
        <BootstrapNavbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {/* Можно добавить общие ссылки, например:
            <Nav.Link as={Link} to="/features">Features</Nav.Link>
            <Nav.Link as={Link} to="/about">About Us</Nav.Link>
            */}
          </Nav>
          <Nav className="align-items-center"> {/* Выравниваем элементы справа по центру */}
            {currentUser ? (
              // Если пользователь аутентифицирован
              <NavDropdown
                title={
                  <>
                    <Image
                      src={getFullImageUrl(currentUser.profilePictureUrl) || defaultAvatar}
                      alt={currentUser.nickname}
                      roundedCircle
                      width={30}
                      height={30}
                      className="me-2 border border-light" // Небольшая рамка вокруг аватара
                      onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }} // Замена на дефолтный, если URL картинки битый
                    />
                    {/* Показываем никнейм только на больших экранах для экономии места */}
                    <span className="d-none d-lg-inline">{currentUser.nickname}</span>
                  </>
                }
                id="user-nav-dropdown"
                align="end" // Выпадающий список выравнивается по правому краю
              >
                <NavDropdown.Item as={Link} to="/profile">
                  My Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/chat">
                  Current Chat
                </NavDropdown.Item>
                {/* Можно добавить другие пункты, например "Settings" */}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              // Если пользователь не аутентифицирован
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;