import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './MobileAuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const { user, isAuthenticated } = useAuth();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      console.log('🔌 [Socket] Not connecting - user not authenticated');
      return;
    }

    console.log('🔌 [Socket] Initializing connection...');

    const newSocket = io('https://thinkscribe-xk1e.onrender.com', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      auth: {
        userId: user._id
      }
    });

    newSocket.on('connect', () => {
      console.log('✅ [Socket] Connected successfully');
      console.log('🔌 [Socket] Socket ID:', newSocket.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Join user's personal room
      newSocket.emit('joinUserRoom', user._id);
      console.log(`🏠 [Socket] Joined user room: user-${user._id}`);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ [Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('💥 [Socket] Connection error:', error);
      setIsConnected(false);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('🚫 [Socket] Max reconnection attempts reached');
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 [Socket] Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      reconnectAttempts.current = 0;
      // Rejoin user room on reconnection
      newSocket.emit('joinUserRoom', user._id);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('🔄❌ [Socket] Reconnection error:', error);
    });

    // Handle online/offline status updates
    newSocket.on('userOnline', ({ userId }) => {
      console.log('🟢 [Socket] User came online:', userId);
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    newSocket.on('userOffline', ({ userId }) => {
      console.log('🔴 [Socket] User went offline:', userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Handle typing indicators
    newSocket.on('typing', ({ chatId, userId, userName }) => {
      console.log(`⌨️ [Socket] User ${userName} typing in chat ${chatId}`);
      setTypingUsers(prev => new Set([...prev, userId]));
    });

    newSocket.on('stopTyping', ({ chatId, userId }) => {
      console.log(`⏹️ [Socket] User ${userId} stopped typing in chat ${chatId}`);
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 [Socket] Cleaning up connection...');
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user?._id]);

  const joinChat = (chatId) => {
    if (socket && chatId) {
      socket.emit('joinChat', chatId);
      console.log(`💬 [Socket] Joined chat room: ${chatId}`);
    }
  };

  const leaveChat = (chatId) => {
    if (socket && chatId) {
      socket.emit('leaveChat', chatId);
      console.log(`👋 [Socket] Left chat room: ${chatId}`);
    }
  };

  const sendTypingIndicator = (chatId, isTyping) => {
    if (socket && chatId && user) {
      if (isTyping) {
        socket.emit('typing', { 
          chatId, 
          userId: user._id, 
          userName: user.name 
        });
      } else {
        socket.emit('stopTyping', { chatId, userId: user._id });
      }
    }
  };

  // WebRTC Call Functions
  const initiateCall = (targetUserId, chatRoomId) => {
    if (socket && targetUserId && user) {
      const callId = `call_${Date.now()}_${user._id}`;
      // Emit with both legacy and new fields to satisfy server expectations
      socket.emit('initiateCall', {
        // New fields
        to: targetUserId,
        from: user._id,
        fromName: user.name,
        fromAvatar: user.avatar,
        chatId: chatRoomId,
        callId,
        // Legacy fields used by existing client/server handlers
        recipientId: targetUserId,
        callerId: user._id,
        callerName: user.name,
        callerAvatar: user.avatar,
      });
      console.log(`📞 [Socket] Call initiated to ${targetUserId}`);
      return callId;
    }
    return null;
  };

  const acceptCall = (callId, targetUserId) => {
    if (socket && callId && targetUserId) {
      socket.emit('acceptCall', { callId, to: targetUserId, recipientId: targetUserId });
      console.log(`✅ [Socket] Call accepted: ${callId}`);
    }
  };

  const rejectCall = (callId, targetUserId) => {
    if (socket && callId && targetUserId) {
      socket.emit('rejectCall', { callId, to: targetUserId, recipientId: targetUserId });
      console.log(`❌ [Socket] Call rejected: ${callId}`);
    }
  };

  const endCall = (callId, targetUserId) => {
    if (socket && callId && targetUserId) {
      socket.emit('endCall', { callId, to: targetUserId, recipientId: targetUserId });
      console.log(`📴 [Socket] Call ended: ${callId}`);
    }
  };

  const sendWebRTCSignal = (signal, targetUserId, callId) => {
    if (socket && signal && targetUserId && callId) {
      socket.emit('webrtc:signal', {
        to: targetUserId,
        from: user._id,
        callId,
        signal,
        // Legacy mirror fields in case server expects different keys
        recipientId: targetUserId,
        callerId: user._id,
      });
      console.log(`📡 [Socket] WebRTC signal sent: ${signal.type}`);
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    joinChat,
    leaveChat,
    sendTypingIndicator,
    // WebRTC Call Functions
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    sendWebRTCSignal
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
