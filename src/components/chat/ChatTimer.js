import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Badge } from 'react-bootstrap';
import { parseISO, differenceInSeconds } from 'date-fns'; // Библиотека для работы с датами

const ChatTimer = ({ expiryTimestamp, onChatExpired }) => {
  // Используем useMemo, чтобы initialExpiryDate вычислялся только один раз при изменении expiryTimestamp
  const initialExpiryDate = useMemo(() => {
    if (!expiryTimestamp) return null;
    try {
      // Бэкенд обычно присылает дату в формате ISO (например, "2024-05-26T12:00:00Z")
      return parseISO(expiryTimestamp);
    } catch (e) {
      console.error("Invalid expiry timestamp provided to ChatTimer:", expiryTimestamp, e);
      return null;
    }
  }, [expiryTimestamp]);

  // useCallback для функции расчета оставшегося времени
  const calculateTimeLeft = useCallback(() => {
    if (!initialExpiryDate) return null;

    const totalSeconds = differenceInSeconds(initialExpiryDate, new Date());

    if (totalSeconds <= 0) {
      return { total: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      total: totalSeconds,
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: Math.floor(totalSeconds % 60),
    };
  }, [initialExpiryDate]); // Зависимость от initialExpiryDate

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    // Если дата окончания невалидна или время уже вышло, ничего не делаем
    if (!initialExpiryDate || (timeLeft && timeLeft.total <= 0)) {
      // Если время вышло и есть колбэк, вызываем его
      if (timeLeft && timeLeft.total <= 0 && onChatExpired && typeof onChatExpired === 'function') {
        onChatExpired();
      }
      return;
    }

    // Устанавливаем интервал для обновления таймера каждую секунду
    const timerInterval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Очищаем интервал при размонтировании компонента или когда время вышло
    return () => clearInterval(timerInterval);
  }, [timeLeft, initialExpiryDate, calculateTimeLeft, onChatExpired]); // Пересчитываем при изменении timeLeft или calculateTimeLeft

  if (!timeLeft || !expiryTimestamp) {
    return null; // Не рендерим таймер, если нет данных или даты
  }

  if (timeLeft.total <= 0) {
    return <Badge bg="danger">Chat Expired</Badge>;
  }

  // Форматируем вывод времени, добавляя ведущие нули
  const formattedHours = String(timeLeft.hours).padStart(2, '0');
  const formattedMinutes = String(timeLeft.minutes).padStart(2, '0');
  const formattedSeconds = String(timeLeft.seconds).padStart(2, '0');

  return (
    <Badge bg="warning" text="dark" pill className="p-2">
      Time left: {formattedHours}:{formattedMinutes}:{formattedSeconds}
    </Badge>
  );
};

export default ChatTimer;