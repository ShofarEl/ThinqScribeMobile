// server/socket.js

import { Server } from 'socket.io';
import User from './models/User.js';
import Chat from './models/Chat.js';
import Message from './models/Message.js';
import Notification from './models/Notification.js';
import ServiceAgreement from './models/ServiceAgreement.js';
import Order from './models/Order.js';
import { ORDER_STATUS } from './models/constants.js';
import { generateOrderId } from './utils/helpers.js';

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  // Track online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Enhanced connection handling
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason);
      // Remove from online users
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          // Notify others that user went offline
          socket.broadcast.emit('userOffline', { userId });
          break;
        }
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Client reconnected:', socket.id, 'Attempt:', attemptNumber);
    });

    // Join user's private room for notifications
    socket.on('joinUserRoom', (userId) => {
      if (userId) {
        socket.join(`user-${userId}`);
        onlineUsers.set(userId, socket.id);
        console.log(`✅ Socket ${socket.id} joined user-${userId}`);
        socket.emit('joinedUserRoom', { userId, status: 'success' });
        
        // Notify others that user is online
        socket.broadcast.emit('userOnline', { userId });
      }
    });

    // Join chat room - CRITICAL FIX
    socket.on('joinChat', (chatId) => {
      if (chatId) {
        socket.join(chatId.toString()); // Join chat room with chatId
        console.log(`💬 Socket ${socket.id} joined chat room: ${chatId}`);
        socket.emit('joinedChat', { chatId, status: 'success' });
      }
    });

    // Leave chat room
    socket.on('leaveChat', (chatId) => {
      if (chatId) {
        socket.leave(chatId.toString());
        console.log(`👋 Socket ${socket.id} left chat room: ${chatId}`);
      }
    });

    // Handle typing indicators - FIXED
    socket.on('typing', ({ chatId, userId, userName }) => {
      if (chatId && userId) {
        console.log(`⌨️ User ${userName} typing in chat ${chatId}`);
        // Broadcast to all others in the chat room
        socket.to(chatId.toString()).emit('typing', { 
          chatId, 
          userId, 
          userName 
        });
      }
    });

    socket.on('stopTyping', ({ chatId, userId }) => {
      if (chatId && userId) {
        console.log(`⏹️ User ${userId} stopped typing in chat ${chatId}`);
        // Broadcast to all others in the chat room
        socket.to(chatId.toString()).emit('stopTyping', { 
          chatId, 
          userId 
        });
      }
    });

    // Handle message broadcasting (from chat controllers) - CRITICAL FIX
    socket.on('broadcastMessage', (data) => {
      const { chatId, message } = data;
      console.log(`📤 Broadcasting message to chat ${chatId}:`, message._id);
      
      // Broadcast to all users in the chat room
      io.to(chatId.toString()).emit('messageBroadcast', {
        chatId,
        message
      });
    });

    // Enhanced message sending with better error handling
    socket.on('sendMessage', async (payload) => {
      try {
        const { chatId, senderId, content, type = 'text', fileUrl, fileName, fileType } = payload;
        console.log(`📝 Sending message for chat ${chatId}`);

        if (!chatId || !senderId || (!content && !fileUrl)) {
          socket.emit('messageError', { 
            message: 'Invalid message data',
            error: 'Missing required fields' 
          });
          return;
        }

        // Create message data
        const messageData = {
          chat: chatId,
          sender: senderId,
          type
        };

        // Add content or file data
        if (fileUrl) {
          messageData.fileUrl = fileUrl;
          messageData.fileName = fileName;
          messageData.fileType = fileType;
          messageData.content = fileName || 'File attachment';
        } else {
          messageData.content = content;
        }

        // Create and save the message
        const message = await Message.create(messageData);

        // Populate sender info
        await message.populate('sender', 'name avatar role');

        // Broadcast to all users in the chat room
        io.to(chatId.toString()).emit('messageBroadcast', {
          chatId,
          message
        });

        // Send success confirmation to sender
        socket.emit('messageSuccess', {
          messageId: message._id,
          chatId,
          timestamp: message.timestamp
        });

        // Find chat and notify other participants
        const chat = await Chat.findById(chatId)
          .populate('participants', 'name role');

        if (chat) {
          const otherParticipants = chat.participants
            .filter(p => p._id.toString() !== senderId);

          for (const participant of otherParticipants) {
            try {
              const senderUser = await User.findById(senderId).select('name');
              const preview = fileUrl ? 
                `📎 ${fileName || 'File attachment'}` : 
                content.slice(0, 50) + (content.length > 50 ? '...' : '');
              
              const notif = await Notification.create({
                user: participant._id,
                type: 'message',
                title: `New message from ${senderUser.name}`,
                message: preview,
                link: `/chat/${participant.role}/${chatId}`,
                read: false
              });
              
              io.to(`user-${participant._id}`).emit('newMessage', {
                chatId,
                message,
                senderName: senderUser.name,
                title: `New message from ${senderUser.name}`,
                content: preview
              });
            } catch (err) {
              console.error('❌ Error creating notification:', err);
            }
          }
        }
      } catch (err) {
        console.error('❌ Error sending message:', err);
        socket.emit('messageError', { 
          message: 'Failed to send message',
          error: err.message 
        });
      }
    });

    // Mark messages as read with better error handling
    socket.on('markMessagesAsRead', async ({ chatId, userId }) => {
      try {
        console.log(`📖 Marking messages as read for chat ${chatId}, user ${userId}`);
        
        const chat = await Chat.findById(chatId);
        if (!chat) {
          console.error('❌ Chat not found for marking messages as read');
          return;
        }

        // Mark unread messages as read
        let updated = false;
        chat.messages.forEach(msg => {
          if (!msg.read && msg.sender.toString() !== userId) {
            msg.read = true;
            updated = true;
          }
        });

        if (updated) {
          await chat.save();
          
          // Notify the sender that their messages were read
          chat.messages.forEach(msg => {
            if (msg.read && msg.sender.toString() !== userId) {
              io.to(`user-${msg.sender}`).emit('messageRead', {
                chatId,
                messageId: msg._id,
                readBy: userId
              });
            }
          });
        }
      } catch (err) {
        console.error('❌ Error marking messages as read:', err);
      }
    });

    // Check online status
    socket.on('checkOnlineStatus', (userIds) => {
      const onlineStatuses = {};
      userIds.forEach(userId => {
        onlineStatuses[userId] = onlineUsers.has(userId);
      });
      socket.emit('onlineStatuses', onlineStatuses);
    });

    // Get online users list
    socket.on('getOnlineUsers', () => {
      socket.emit('onlineUsersList', Array.from(onlineUsers.keys()));
    });

    // Handle agreement events
    socket.on('agreementCreated', async (data) => {
      try {
        const { agreementId, studentId, writerId } = data;
        
        // Notify the student about the new agreement
        io.to(`user-${studentId}`).emit('newAgreement', {
          agreementId,
          message: 'You have a new service agreement to review'
        });
        
        console.log(`📋 Agreement ${agreementId} created, notified student ${studentId}`);
      } catch (err) {
        console.error('❌ Error handling agreement creation:', err);
      }
    });

    socket.on('agreementAccepted', async (data) => {
      try {
        const { agreementId, studentId, writerId } = data;
        
        // Notify the writer about the accepted agreement
        io.to(`user-${writerId}`).emit('agreementAccepted', {
          agreementId,
          message: 'Your service agreement has been accepted'
        });
        
        console.log(`✅ Agreement ${agreementId} accepted, notified writer ${writerId}`);
      } catch (err) {
        console.error('❌ Error handling agreement acceptance:', err);
      }
    });

    socket.on('agreementCompleted', async (data) => {
      try {
        const { agreementId, studentId, writerId, title, writerName, paidAmount, totalAmount } = data;
        
        // Notify student about completion
        io.to(`user-${studentId}`).emit('agreementCompleted', {
          agreementId,
          title,
          writerName,
          paidAmount,
          totalAmount,
          status: 'completed',
          message: `Your project "${title}" has been completed by ${writerName}`
        });
        
        // Notify writer about successful completion
        io.to(`user-${writerId}`).emit('agreementCompletedByMe', {
          agreementId,
          title,
          paidAmount,
          totalAmount,
          status: 'completed',
          message: `You have successfully completed "${title}"`
        });
        
        // Notify all admins about the completion
        const admins = await User.find({ role: 'admin' }).select('_id');
        admins.forEach(admin => {
          io.to(`user-${admin._id}`).emit('newCompletion', {
            agreementId,
            title,
            writerName,
            amount: totalAmount,
            completedAt: new Date()
          });
        });
        
        console.log(`🎉 Agreement ${agreementId} completed, notified all parties`);
      } catch (err) {
        console.error('❌ Error handling agreement completion:', err);
      }
    });

    // Handle order events
    socket.on('orderCreated', async (data) => {
      try {
        const { orderId, studentId, writerId } = data;
        
        // Notify the writer about the new order
        io.to(`user-${writerId}`).emit('newOrder', {
          orderId,
          message: 'You have a new order'
        });
        
        console.log(`📝 Order ${orderId} created, notified writer ${writerId}`);
      } catch (err) {
        console.error('❌ Error handling order creation:', err);
      }
    });

    socket.on('orderStatusUpdated', async (data) => {
      try {
        const { orderId, status, studentId, writerId } = data;
        
        // Notify the student about the order status update
        io.to(`user-${studentId}`).emit('orderStatusUpdate', {
          orderId,
          status,
          message: `Your order status has been updated to: ${status}`
        });
        
        console.log(`📋 Order ${orderId} status updated to ${status}, notified student ${studentId}`);
      } catch (err) {
        console.error('❌ Error handling order status update:', err);
      }
    });

    // Handle payment events
    socket.on('paymentCompleted', async (data) => {
      try {
        const { orderId, studentId, writerId, amount } = data;
        
        // Notify both parties about the completed payment
        io.to(`user-${studentId}`).emit('paymentConfirmed', {
          orderId,
          amount,
          message: 'Your payment has been confirmed'
        });
        
        io.to(`user-${writerId}`).emit('paymentReceived', {
          orderId,
          amount,
          message: 'Payment received for your order'
        });
        
        console.log(`💰 Payment completed for order ${orderId}, notified both parties`);
      } catch (err) {
        console.error('❌ Error handling payment completion:', err);
      }
    });

    // Handle notifications
    socket.on('sendNotification', async (data) => {
      try {
        const { userId, type, title, message, link } = data;
        
        // Create notification in database
        const notification = await Notification.create({
          user: userId,
          type,
          title,
          message,
          link,
          read: false
        });
        
        // Send real-time notification
        io.to(`user-${userId}`).emit('newNotification', {
          id: notification._id,
          type,
          title,
          message,
          link,
          timestamp: notification.createdAt
        });
        
        console.log(`🔔 Notification sent to user ${userId}: ${title}`);
      } catch (err) {
        console.error('❌ Error sending notification:', err);
      }
    });

    // Handle general events
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Handle user activity tracking
    socket.on('userActivity', ({ userId, activity }) => {
      console.log(`👤 User ${userId} activity: ${activity}`);
      // You can track user activities here if needed
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export { initSocket, getIO };