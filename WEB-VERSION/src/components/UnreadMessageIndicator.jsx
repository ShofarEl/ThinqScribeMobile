import React, { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

/**
 * UnreadMessageIndicator - A component that displays an indicator for unread messages
 * 
 * @param {Object} props
 * @param {string} props.chatId - The ID of the chat to check for unread messages
 * @param {string} props.className - Additional CSS classes to apply
 * @param {boolean} props.showCount - Whether to show the count of unread messages
 * @param {boolean} props.pulseAnimation - Whether to show a pulse animation
 */
const UnreadMessageIndicator = ({ 
  chatId, 
  className = '', 
  showCount = true, 
  pulseAnimation = true 
}) => {
  const { notifications } = useNotifications();
  const [unreadCount, setUnreadCount] = useState(0);

  // Calculate unread messages for this specific chat
  useEffect(() => {
    if (!chatId || !notifications) return;

    // Filter notifications to only include unread messages for this chat
    const unreadMessages = notifications.filter(notification => {
      return (
        notification.type === 'message' &&
        !notification.read &&
        notification.link?.includes(chatId)
      );
    });

    setUnreadCount(unreadMessages.length);
  }, [chatId, notifications]);

  // Don't render anything if there are no unread messages
  if (unreadCount === 0) return null;

  return (
    <div 
      className={`
        inline-flex items-center justify-center 
        ${pulseAnimation ? 'animate-pulse' : ''}
        bg-red-500 text-white rounded-full
        ${showCount ? 'min-w-[20px] h-[20px] px-1' : 'w-[10px] h-[10px]'}
        ${className}
      `}
      aria-label={`${unreadCount} unread messages`}
    >
      {showCount && (
        <span className="text-xs font-bold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default UnreadMessageIndicator;



