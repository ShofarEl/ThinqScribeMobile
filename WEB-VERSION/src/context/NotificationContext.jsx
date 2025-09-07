// src/context/NotificationContext.jsx

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';

import {
  getNotifications,
  markNotificationAsRead as apiMarkRead,
  markAllNotificationsAsRead as apiMarkAllRead,
} from '../api/notifications';

// Import our new notification utilities
import notificationSoundManager from '../utils/NotificationSoundManager';
import pageVisibilityTracker from '../utils/PageVisibilityTracker';
import browserNotificationManager from '../utils/BrowserNotificationManager';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isPageVisible, setIsPageVisible] = useState(pageVisibilityTracker.isPageVisible());
  
  // Track page visibility changes
  useEffect(() => {
    // Register visibility change callback
    const unsubscribe = pageVisibilityTracker.onVisibilityChange((isVisible) => {
      console.log(`👁️ [NotificationContext] Page visibility changed: ${isVisible ? 'visible' : 'hidden'}`);
      setIsPageVisible(isVisible);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Safe access to auth context with error handling
  let user = null;
  let isAuthenticated = false;
  try {
    const auth = useAuth();
    user = auth?.user || null;
    isAuthenticated = auth?.isAuthenticated || false;
  } catch (error) {
    console.warn('⚠️ [NotificationProvider] AuthContext not available:', error.message);
    // Set default values when auth context is not available
    user = null;
    isAuthenticated = false;
  }
  
  const location = useLocation();

  // Get current chat ID from URL if in chat route
  const getCurrentChatId = () => {
    const match = location.pathname.match(/\/chat\/(student|writer)\/([^/]+)/);
    return match ? match[2] : null;
  };

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      console.log('🔌 [Socket] Not connecting - user not authenticated');
      return;
    }

    console.log('🔌 [Socket] Initializing connection...');

    const socketURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : 'https://thinkscribe-xk1e.onrender.com';
    const newSocket = io(socketURL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        userId: user._id
      }
    });

    newSocket.on('connect', () => {
      console.log('✅ [Socket] Connected successfully');
      console.log('🔌 [Socket] Socket ID:', newSocket.id);
      setIsSocketConnected(true);
      
      // Join user's personal room
      newSocket.emit('joinUserRoom', user._id);
      console.log(`🏠 [Socket] Joined user room: user-${user._id}`);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ [Socket] Disconnected:', reason);
      setIsSocketConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('💥 [Socket] Connection error:', error);
      setIsSocketConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 [Socket] Reconnected after ${attemptNumber} attempts`);
      setIsSocketConnected(true);
      // Rejoin user room on reconnection
      newSocket.emit('joinUserRoom', user._id);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('🔄❌ [Socket] Reconnection error:', error);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 [Socket] Cleaning up connection...');
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user?._id]);

  // Fetch notifications function (move outside useEffect so it can be exposed)
  const fetchNotifications = async () => {
    try {
      console.log('📬 [Notifications] Fetching...');
      const response = await getNotifications();
      console.log('📬 [Notifications] API Response:', response);
      console.log('📬 [Notifications] Fetched:', response.notifications?.length || 0, 'notifications, unread count:', response.unreadCount || 0);
      
      // Ensure we always set arrays/numbers properly
      const notifications = Array.isArray(response.notifications) ? response.notifications : [];
      const unreadCount = typeof response.unreadCount === 'number' ? response.unreadCount : 0;
      
      setNotifications(notifications);
      setUnreadCount(unreadCount);
      
      console.log('📬 [Notifications] State updated with:', notifications.length, 'notifications, unread:', unreadCount);
    } catch (err) {
      console.error('❌ [Notifications] Error fetching:', err);
      // Set default values on error
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Fetch notifications on mount and socket connection
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;
    fetchNotifications();
  }, [isAuthenticated, user?._id]);

  // Handle socket events for notifications
  useEffect(() => {
    if (!socket || !user?._id) return;

    console.log('👂 [Socket] Setting up notification listeners...');

    // Agreement-related events
    socket.on('newAgreement', (data) => {
      console.log('📝 [Socket] New agreement received:', data);
      // Add notification for new agreement
      setNotifications(prev => [{
        _id: Date.now(),
        type: 'agreement',
        title: 'New Service Agreement',
        message: `New agreement request from ${data.studentName}`,
        link: `/agreements/${data.agreement._id}`,
        read: false,
        createdAt: new Date()
      }, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      if (isPageVisible) {
        // Foreground: agreement events → happy bells
        notificationSoundManager.playNotificationSound('agreement');
      } else {
        // Background: show browser notification
        browserNotificationManager.showNotification({
          title: 'New Service Agreement',
          body: `New agreement request from ${data.studentName}`,
          tag: `agreement-${data.agreement._id}`,
          onClick: () => window.location.href = `/agreements/${data.agreement._id}`
        });
      }
    });

    socket.on('agreementAccepted', (data) => {
      console.log('✅ [Socket] Agreement accepted:', data);
      // Add notification for accepted agreement
      setNotifications(prev => [{
        _id: Date.now(),
        type: 'agreement',
        title: 'Agreement Accepted',
        message: `${data.writerName} has accepted your agreement for "${data.title}"`,
        link: `/order/${data.orderId}`,
        read: false,
        createdAt: new Date()
      }, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      if (isPageVisible) {
        notificationSoundManager.playNotificationSound('agreement');
      } else {
        browserNotificationManager.showNotification({
          title: 'Agreement Accepted',
          body: `${data.writerName} has accepted your agreement for "${data.title}"`,
          tag: `agreement-${data.orderId}`,
          onClick: () => window.location.href = `/order/${data.orderId}`
        });
      }
    });

    socket.on('agreementUpdated', (data) => {
      console.log('🔄 [Socket] Agreement updated:', data);
      // Add notification for agreement updates
      setNotifications(prev => [{
        _id: Date.now(),
        type: 'agreement',
        title: 'Agreement Updated',
        message: data.message,
        link: `/agreements/${data.agreementId}`,
        read: false,
        createdAt: new Date()
      }, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      if (isPageVisible) {
        notificationSoundManager.playNotificationSound('agreement');
      } else {
        browserNotificationManager.showNotification({
          title: 'Agreement Updated',
          body: data.message,
          tag: `agreement-${data.agreementId}`,
          onClick: () => window.location.href = `/agreements/${data.agreementId}`
        });
      }
    });

    // Payment-related events
    socket.on('paymentCompleted', (data) => {
      console.log('💰 [Socket] Payment completed:', data);
      setNotifications(prev => [{
        _id: Date.now(),
        type: 'payment',
        title: 'Payment Received',
        message: `Payment of $${data.amount} has been received`,
        link: `/payments/${data.paymentId}`,
        read: false,
        createdAt: new Date()
      }, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      if (isPageVisible) {
        notificationSoundManager.playNotificationSound('payment');
      } else {
        browserNotificationManager.showNotification({
          title: 'Payment Received',
          body: `Payment of $${data.amount} has been received`,
          tag: `payment-${data.paymentId}`,
          onClick: () => window.location.href = `/payments/${data.paymentId}`
        });
      }
    });

    // Message-related events
    socket.on('newMessage', (data) => {
      console.log('💬 [Socket] New message received:', data);
      const currentChatId = activeChatId || getCurrentChatId();
      const incomingChatId = data?.chatId;
      const senderId = data?.senderId; // if server provides
      const isFromMe = senderId && user?._id && senderId === user._id;
      const isOtherChat = incomingChatId && currentChatId !== incomingChatId;

      // Only create notification if not in the current chat (existing behavior)
      if (isOtherChat) {
        setNotifications(prev => [{
          _id: Date.now(),
          type: 'message',
          title: data.title,
          message: data.content,
          link: data.link,
          read: false,
          createdAt: new Date()
        }, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Play sound in foreground, show notification in background
        if (!isFromMe) {
          const metaTitle = data.title || 'New message';
          const metaBody = data.content || 'You have a new message';
          if (!isPageVisible) {
            // Background: show browser notification
            browserNotificationManager.showMessageNotification(
              { content: metaBody, fileUrl: data.fileUrl }, 
              metaTitle.replace('New message from ', ''), 
              incomingChatId
            );
          } else {
            // Foreground: message events → long pop
            notificationSoundManager.playNotificationSound('message');
          }
        }
      }
    });

    // Some servers emit a broadcast event with a different shape: { chatId, message }
    // We only play sound/OS notification here to avoid double-counting unread state.
    socket.on('messageBroadcast', (data) => {
      try {
        const currentChatId = activeChatId || getCurrentChatId();
        const incomingChatId = data?.chatId || data?.message?.chatId;
        const msg = data?.message;
        const senderId = msg?.sender?._id;
        const isFromMe = senderId && user?._id && senderId === user._id;
        const isOtherChat = incomingChatId && currentChatId !== incomingChatId;
        if (isOtherChat && !isFromMe) {
          const metaTitle = msg?.sender?.name ? `New message from ${msg.sender.name}` : 'New message';
          const preview = msg?.fileUrl ? 'Sent an attachment' : (msg?.content || 'You have a new message');
          if (!isPageVisible) {
            browserNotificationManager.showMessageNotification(
              msg, 
              msg?.sender?.name, 
              incomingChatId
            );
          } else {
            notificationSoundManager.playNotificationSound('message');
          }
        }
      } catch (_) {
        // ignore
      }
    });

    // Dashboard update events
    socket.on('dashboardUpdate', (data) => {
      console.log('📊 [Socket] Dashboard update received:', data);
      // This could trigger a refresh of dashboard data
    });

    return () => {
      console.log('👂 [Socket] Cleaning up notification listeners...');
      socket.off('newAgreement');
      socket.off('agreementAccepted');
      socket.off('agreementUpdated');
      socket.off('paymentCompleted');
      socket.off('newMessage');
      socket.off('messageBroadcast');
      socket.off('dashboardUpdate');
    };
  }, [socket, user?._id, location.pathname, isPageVisible]);

  const markAsRead = async (notificationId) => {
    try {
      await apiMarkRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiMarkAllRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Ensure we always provide a valid context value
  const contextValue = {
    notifications: notifications || [],
    unreadCount: unreadCount || 0,
    socket: socket || null,
    isSocketConnected: isSocketConnected || false,
    activeChatId: activeChatId || null,
    setActiveChatId: setActiveChatId || (() => {}),
    markAsRead: markAsRead || (() => Promise.resolve()),
    markAllAsRead: markAllAsRead || (() => Promise.resolve()),
    fetchNotifications: fetchNotifications || (() => Promise.resolve()),
    isPageVisible: isPageVisible || true
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.error('❌ [useNotifications] Context not found - component may be outside NotificationProvider');
    console.error('❌ [useNotifications] Current context:', context);
    console.error('❌ [useNotifications] NotificationContext:', NotificationContext);
    
    // Instead of throwing immediately, return a fallback object
    console.warn('⚠️ [useNotifications] Returning fallback context');
    return {
      notifications: [],
      unreadCount: 0,
      socket: null,
      isSocketConnected: false,
      activeChatId: null,
      setActiveChatId: () => {},
      markAsRead: () => Promise.resolve(),
      markAllAsRead: () => Promise.resolve(),
      fetchNotifications: () => Promise.resolve(),
      isPageVisible: true
    };
  }
  return context;
};

export default NotificationContext;