// src/pages/ChatPage.js

// ... (импорты остаются такими же)
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Alert, Button, Col, Row, Container, Badge } from 'react-bootstrap';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom'; // Добавляем useLocation
import { useAuth } from '../hooks/useAuth';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import ChatWindow from '../components/chat/ChatWindow';
import ParticipantList from '../components/chat/ParticipantList';
import ChatTimer from '../components/chat/ChatTimer';
import {
  getCurrentChat,
  getChatDetails,
  getChatMessages,
  leaveChat as leaveChatApi
} from '../services/chatService';
import { FullPageSpinner } from '../components/common/LoadingSpinner';

const ChatPage = () => {
  const { currentUser, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // <--- Получаем location здесь
  const { chatId: chatIdFromUrl } = useParams();

  // ... (стейты остаются такими же)
  const [chatDetails, setChatDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(false);

  const stompClientRef = useRef(null);
  const chatExpiredRef = useRef(false);

  // Сохраняем navigate и location в ref, чтобы иметь доступ к актуальным значениям в колбэках
  const navigateRef = useRef(navigate);
  const locationRef = useRef(location);

  // Обновляем ref при изменении navigate или location (хотя navigate обычно стабилен)
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);


  const fetchChatData = useCallback(async () => {
    // ... (код fetchChatData без изменений)
    if (!currentUser) {
      // Используем navigateRef.current
      navigateRef.current('/login', { state: { from: { pathname: `/chat${chatIdFromUrl ? `/${chatIdFromUrl}` : ''}` } } });
      return;
    }
    setLoading(true);
    setError('');
    chatExpiredRef.current = false;

    try {
      let currentChat;
      if (chatIdFromUrl) {
        currentChat = await getChatDetails(chatIdFromUrl);
      } else {
        currentChat = await getCurrentChat();
      }

      if (!currentChat || !currentChat.active) {
        setError(currentChat && !currentChat.active ? 'Your chat has expired or is no longer active.' : 'No active chat found.');
        setChatDetails(null);
        setTimeout(() => navigateRef.current('/'), 3000);
        return;
      }
      setChatDetails(currentChat);
      const chatMessages = await getChatMessages(currentChat.id);
      setMessages(chatMessages || []);
    } catch (err) {
      console.error("Failed to fetch chat data:", err);
      setError(err.response?.data?.message || 'Failed to load chat data.');
      setChatDetails(null);
    } finally {
      setLoading(false);
    }
  }, [currentUser, chatIdFromUrl]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);


  // Эффект для WebSocket
  useEffect(() => {
    if (!chatDetails || !chatDetails.active || !token || chatExpiredRef.current) {
      if (stompClientRef.current && stompClientRef.current.active) {
        stompClientRef.current.deactivate();
      }
      return;
    }
    if (stompClientRef.current && stompClientRef.current.active) return;

    setConnecting(true);
    const client = new Client({
      brokerURL: process.env.REACT_APP_WS_BASE_URL.replace('http', 'ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      webSocketFactory: () => new SockJS(process.env.REACT_APP_WS_BASE_URL),
      debug: (str) => console.log('STOMP DEBUG: ' + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      // ... (код onConnect без изменений)
      setConnecting(false);
      setIsWsConnected(true);
      console.log('STOMP: Connected to WebSocket:', frame);
      client.subscribe(`/topic/chat/${chatDetails.id}`, (message) => {
        try {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        } catch (e) {
          console.error("STOMP: Error parsing message body:", e, message.body);
        }
      });
      client.subscribe(`/user/queue/errors`, (message) => {
        console.error("STOMP: Received error from server via WebSocket:", message.body);
        setError(`Chat Error: ${message.body}`);
      });
    };

    client.onStompError = (frame) => {
      setConnecting(false);
      setIsWsConnected(false);
      const errorMessage = frame.headers['message'] || 'Broker error';
      console.error('STOMP: Broker reported error: ' + errorMessage);
      console.error('STOMP: Additional details: ' + frame.body);
      setError('WebSocket connection error: ' + errorMessage);

      // ИСПРАВЛЕНИЕ: Используем navigateRef.current и locationRef.current
      if (errorMessage?.includes('AccessDeniedException') || errorMessage?.includes('401')) {
        logout(); // logout из useAuth (он useCallback, так что стабилен)
        // Используем актуальные значения navigate и location из ref
        navigateRef.current('/login', {
          state: { from: locationRef.current, error: 'Session expired or invalid.' },
          replace: true // Важно для предотвращения возврата на страницу чата
        });
      }
    };

    client.onWebSocketError = (errorEvent) => {
      // ... (код onWebSocketError без изменений)
      setConnecting(false);
      setIsWsConnected(false);
      console.error('STOMP: WebSocket transport error:', errorEvent);
      if (!chatExpiredRef.current) {
        setError('WebSocket connection lost. Attempting to reconnect...');
      }
    };

    client.onDisconnect = () => {
      // ... (код onDisconnect без изменений)
      setConnecting(false);
      setIsWsConnected(false);
      console.log("STOMP: Disconnected from WebSocket");
    };

    stompClientRef.current = client;
    client.activate();

    return () => {
      if (stompClientRef.current && stompClientRef.current.active) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null; // Важно сбросить ref
        setIsWsConnected(false);
      }
    };
  // Добавляем logout в зависимости, так как он используется в onStompError
  // logout сам по себе стабилен благодаря useCallback в AuthContext
  }, [chatDetails, token, logout]); // Удаляем navigate из зависимостей WebSocket, так как он теперь в ref


  const handleSendMessage = (messageText, messageType = 'TEXT', imageUrl = null) => {
    // ... (код handleSendMessage без изменений)
    if (stompClientRef.current && stompClientRef.current.connected && chatDetails && chatDetails.active) {
      const chatMessagePayload = {
        messageType: messageType,
        contentText: messageType === 'TEXT' ? messageText : null,
        contentImageUrl: messageType === 'IMAGE' ? imageUrl : null,
      };
      try {
        stompClientRef.current.publish({
          destination: `/app/chat/${chatDetails.id}/send`,
          body: JSON.stringify(chatMessagePayload),
        });
      } catch (e) {
        console.error("STOMP: Failed to publish message:", e);
        setError("Failed to send message. Connection issue?");
      }
    } else {
      setError('Not connected to chat or chat is inactive.');
    }
  };

  const handleLeaveChat = async () => {
    // ... (код handleLeaveChat)
    if (!chatDetails) return;
    setLoading(true);
    try {
      await leaveChatApi(chatDetails.id);
      if (stompClientRef.current && stompClientRef.current.active) {
        stompClientRef.current.deactivate();
      }
      navigateRef.current('/'); // Используем navigateRef
    } catch (err) {
      console.error("Failed to leave chat:", err);
      setError(err.response?.data?.message || "Error leaving chat.");
    } finally {
      setLoading(false);
    }
  };

  const handleChatExpired = useCallback(() => {
    // ... (код handleChatExpired)
    setError('This chat has expired.');
    setChatDetails(prev => prev ? { ...prev, active: false } : null);
    chatExpiredRef.current = true;
    if (stompClientRef.current && stompClientRef.current.active) {
      stompClientRef.current.deactivate();
    }
  }, []); // navigate убран из зависимостей, если не используется здесь напрямую


  // --- Рендеринг компонента ---
  // ... (JSX без изменений, но при редиректах из ошибок можно тоже использовать navigateRef.current)
  if (loading) {
    return <FullPageSpinner message="Loading chat..." />;
  }

  if (error && !chatDetails) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger">
          <h4>Error Loading Chat</h4>
          <p>{error}</p>
          <Button as={Link} to="/" variant="primary">Go to Homepage</Button>
        </Alert>
      </Container>
    );
  }

  if (!chatDetails) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="info">
          No active chat found.
          <div className="mt-3">
            <Button as={Link} to="/" variant="outline-primary">Find or Create a New Chat</Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="d-flex flex-column p-0" style={{ height: 'calc(100vh - 56px - 1rem)' }}>
      {error && !chatDetails.active && <Alert variant="danger" className="m-2" onClose={() => setError('')} dismissible>{error}</Alert>}
      {connecting && <Alert variant="info" className="m-2 text-center">Connecting to chat server...</Alert>}
      {!isWsConnected && chatDetails.active && !connecting && <Alert variant="warning" className="m-2 text-center">Disconnected. Attempting to reconnect...</Alert>}

      <Row className="g-0 p-2 align-items-center border-bottom bg-light sticky-top" style={{top: '56px', zIndex: 1000}}>
        <Col>
          <h4 className="mb-0 text-truncate" title={chatDetails.chatName}>{chatDetails.chatName}</h4>
          <small className="text-muted">Interest: {chatDetails.primaryInterestName}</small>
        </Col>
        <Col md="auto" className="text-center mx-2">
          {chatDetails.expiresAt && chatDetails.active && (
            <ChatTimer
              expiryTimestamp={chatDetails.expiresAt}
              onChatExpired={handleChatExpired}
            />
          )}
          {!chatDetails.active && <Badge bg="secondary">Chat Inactive</Badge>}
        </Col>
        <Col md="auto">
          <Button variant="outline-danger" size="sm" onClick={handleLeaveChat} disabled={loading}>
            Leave Chat
          </Button>
        </Col>
      </Row>

      <Row className="g-0 flex-grow-1" style={{ overflow: 'hidden' }}>
        <Col xs={12} md={8} lg={9} className="d-flex flex-column p-0 border-end">
          <ChatWindow
            messages={messages}
            currentUserNickname={currentUser?.nickname}
            currentUserId={currentUser?.id}
            onSendMessage={handleSendMessage}
            chatId={chatDetails.id}
            chatIsActive={chatDetails.active && isWsConnected}
          />
        </Col>
        <Col md={4} lg={3} className="d-none d-md-block participant-list-col h-100 overflow-auto bg-light">
          <ParticipantList
            participants={chatDetails.participants || []}
            currentUserId={currentUser?.id}
          />
        </Col>
      </Row>
      <Row className="g-0 d-md-none mt-2 border-top">
        <Col xs={12} className="participant-list-col-mobile p-2 bg-light" style={{maxHeight: '200px', overflowY: 'auto'}}>
             <ParticipantList
                participants={chatDetails.participants || []}
                currentUserId={currentUser?.id}
              />
        </Col>
      </Row>
    </Container>
  );
};

export default ChatPage;