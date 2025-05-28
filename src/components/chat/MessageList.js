import React, { useRef, useEffect } from 'react';
import { ListGroup, Image, Figure } from 'react-bootstrap';
import { formatTimeAgo, getFullImageUrl, isMessageFromCurrentUser } from '../../utils/helpers'; // Вспомогательные функции
import defaultAvatar from '../../assets/images/default-avatar.png'; // Заглушка

const MessageList = ({ messages, currentUserNickname, currentUserId }) => { // Добавим currentUserId
  const messagesEndRef = useRef(null); // Для автопрокрутки

  // Функция для плавной прокрутки вниз
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Прокрутка при загрузке и при добавлении новых сообщений
  useEffect(scrollToBottom, [messages]);

  if (!messages || messages.length === 0) {
    return <p className="text-center text-muted mt-4">No messages yet. Start the conversation!</p>;
  }

  return (
    <ListGroup variant="flush" className="p-0"> {/* Убираем стандартный padding ListGroup */}
      {messages.map((msg, index) => {
        // Определяем, является ли сообщение от текущего пользователя
        // Предполагаем, что currentUserNickname и currentUserId передаются корректно
        const isCurrentUserMsg = (currentUserNickname && msg.senderNickname === currentUserNickname) ||
                               (currentUserId && msg.senderId === currentUserId);

        const messageTime = formatTimeAgo(msg.sentAt); // Форматируем время

        return (
          <ListGroup.Item
            key={msg.id || `msg-${index}`} // Используем msg.id, если он уникален
            className={`d-flex flex-column ${isCurrentUserMsg ? 'align-items-end' : 'align-items-start'} mb-3 border-0 bg-transparent`}
          >
            <div
                className={`message-bubble shadow-sm ${isCurrentUserMsg ? 'sent' : 'received'}`}
            >
              {/* Отображаем аватар и ник для чужих сообщений */}
              {!isCurrentUserMsg && (
                <div className="message-sender d-flex align-items-center">
                  <Image
                    src={getFullImageUrl(msg.senderProfilePictureUrl) || defaultAvatar}
                    alt={msg.senderNickname}
                    roundedCircle
                    width={24}
                    height={24}
                    className="me-2"
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                  />
                  <span>{msg.senderNickname || 'Unknown User'}</span>
                </div>
              )}

              {/* Тело сообщения */}
              {msg.messageType === 'TEXT' && msg.contentText && (
                <p className="mb-0">{msg.contentText}</p>
              )}
              {msg.messageType === 'IMAGE' && msg.contentImageUrl && (
                <Figure className="mb-1 mt-1" style={{ maxWidth: '250px', cursor: 'pointer' }} onClick={() => window.open(getFullImageUrl(msg.contentImageUrl), '_blank')}>
                  <Figure.Image
                    src={getFullImageUrl(msg.contentImageUrl)}
                    alt="Chat attachment"
                    fluid // Адаптивное изображение
                    rounded
                  />
                  {/* Если есть текст к картинке (например, подпись) */}
                  {msg.contentText && <Figure.Caption className={`small ${isCurrentUserMsg ? 'text-white-75' : 'text-muted'}`}>{msg.contentText}</Figure.Caption>}
                </Figure>
              )}

              {/* Время отправки сообщения */}
              <div className={`message-time text-end ${isCurrentUserMsg ? 'sent' : 'received'}`}>
                {messageTime}
              </div>
            </div>
          </ListGroup.Item>
        );
      })}
      {/* Пустой div для автопрокрутки */}
      <div ref={messagesEndRef} />
    </ListGroup>
  );
};

export default MessageList;