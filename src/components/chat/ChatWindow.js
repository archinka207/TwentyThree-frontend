import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Card } from 'react-bootstrap';

const ChatWindow = ({
  messages,
  currentUserNickname,
  currentUserId, // Передаем ID текущего пользователя для MessageList
  onSendMessage,
  chatId,
  chatIsActive
}) => {
  return (
    <Card className="h-100 d-flex flex-column shadow-sm">
      {/* Заголовок чата лучше вынести на уровень ChatPage, чтобы он был над ChatWindow и ParticipantList */}
      {/* <Card.Header>Chat Room Name</Card.Header> */}

      {/* Область для отображения сообщений */}
      <Card.Body className="flex-grow-1 overflow-auto p-0 message-list-container"> {/* Убираем padding, т.к. он есть в MessageList */}
        <MessageList
          messages={messages}
          currentUserNickname={currentUserNickname}
          currentUserId={currentUserId}
        />
      </Card.Body>

      {/* Область для ввода сообщения */}
      {/* Показываем инпут, только если чат активен */}
      {chatIsActive && (
        <div className="message-input-form"> {/* Этот div для MessageInput теперь в ChatWindow */}
          <MessageInput
            onSendMessage={onSendMessage}
            chatId={chatId}
            chatIsActive={chatIsActive} // Передаем для контроля активности инпута
          />
        </div>
      )}
       {!chatIsActive && (
         <Card.Footer className="text-center text-muted p-3">
            This chat has ended. You can no longer send messages.
         </Card.Footer>
       )}
    </Card>
  );
};

export default ChatWindow;