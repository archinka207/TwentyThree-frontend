import React from 'react';
import { ListGroup, Image, Badge } from 'react-bootstrap';
import defaultAvatar from '../../assets/images/default-avatar.png'; // Заглушка для аватара
import { getFullImageUrl } from '../../utils/helpers'; // Вспомогательная функция для URL изображений

const ParticipantList = ({ participants, currentUserId }) => {
  if (!participants || participants.length === 0) {
    return <p className="text-muted p-3 text-center">No participants yet.</p>;
  }

  return (
    <div className="h-100 d-flex flex-column"> {/* Для растягивания на всю высоту родителя */}
      <h5 className="mb-2 text-center p-2 bg-light border-bottom">
        Participants <Badge pill bg="secondary">{participants.length}</Badge>
      </h5>
      <ListGroup variant="flush" className="flex-grow-1 overflow-auto"> {/* Позволяет списку скроллиться */}
        {participants.map((participant) => (
          <ListGroup.Item
            key={participant.userId}
            className="d-flex align-items-center p-2 border-0" // Убираем стандартные границы
          >
            <Image
              src={getFullImageUrl(participant.profilePictureUrl) || defaultAvatar}
              alt={participant.nickname}
              roundedCircle
              width={32} // Немного увеличим аватар
              height={32}
              className="me-2 border" // Добавим легкую рамку
              onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
            />
            <span className="flex-grow-1 text-truncate" title={participant.nickname}> {/* Обрезание длинных ников */}
              {participant.nickname}
            </span>
            {/* Пометка "You" для текущего пользователя */}
            {participant.userId === currentUserId && (
              <Badge pill bg="success" text="white" className="ms-auto">
                You
              </Badge>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default ParticipantList;