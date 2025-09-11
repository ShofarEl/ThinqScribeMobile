// PATCH FOR REPLY PERSISTENCE ISSUE
// Replace the normalizeMessages function in both StudentChat.js and WriterChat.js

// Enhanced message normalization to ensure replyTo has a consistent structure
const normalizeMessages = (msgs) => {
  try {
    const arr = Array.isArray(msgs) ? msgs : [];
    const messageMap = new Map();
    
    // First pass: create a map of all messages for reference lookup
    arr.forEach(msg => {
      messageMap.set(msg._id || msg.id, msg);
    });
    
    return arr.map(m => {
      if (!m.replyTo) return m;

      const replyTo = m.replyTo;
      
      // Case 1: replyTo is just a string ID
      if (typeof replyTo === 'string') {
        // Try to find the referenced message in our current message set
        const referencedMessage = messageMap.get(replyTo);
        if (referencedMessage) {
          return { 
            ...m, 
            replyTo: {
              _id: referencedMessage._id || referencedMessage.id,
              content: referencedMessage.content || referencedMessage.message || 'Message not available',
              sender: referencedMessage.sender || { _id: '', name: 'Unknown', avatar: null },
              timestamp: referencedMessage.timestamp || referencedMessage.createdAt || null
            }
          };
        }
        // If we can't find the message, create a placeholder
        return { 
          ...m, 
          replyTo: { 
            _id: replyTo, 
            content: 'Message not available', 
            sender: { _id: '', name: 'Unknown', avatar: null },
            timestamp: null
          } 
        };
      }

      // Case 2: replyTo is an object but might be incomplete
      return {
        ...m,
        replyTo: {
          _id: replyTo._id || replyTo.id || replyTo,
          content: replyTo.content || replyTo.message || 'Message not available',
          sender: replyTo.sender || { _id: '', name: 'Unknown', avatar: null },
          timestamp: replyTo.timestamp || replyTo.createdAt || null
        }
      };
    });
  } catch (error) {
    console.warn('❌ Error normalizing messages:', error);
    return msgs;
  }
};

// Also update the fetchMessages function to ensure better reply data handling:
const fetchMessages = async (selectedChatId = chatId) => {
  if (!selectedChatId) return;
  
  try {
    setLoadingMessages(true);
    console.log('📱 Fetching messages for chat:', selectedChatId);
    
    const messagesData = await getChatMessages(selectedChatId);
    const messagesArray = Array.isArray(messagesData) ? messagesData : messagesData?.messages || [];
    
    const enhancedMessages = messagesArray.map(msg => ({
      id: msg._id || msg.id,
      content: msg.content || msg.message || '',
      sender: msg.sender || { _id: user._id, name: user.name, avatar: user.avatar },
      timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
      fileUrl: msg.fileUrl,
      fileName: msg.fileName,
      fileType: msg.fileType,
      fileSize: msg.fileSize,
      voiceDuration: msg.voiceDuration,
      // Enhanced replyTo handling
      replyTo: msg.replyTo ? (
        typeof msg.replyTo === 'string' ? msg.replyTo : {
          _id: msg.replyTo._id || msg.replyTo.id || msg.replyTo,
          content: msg.replyTo.content || msg.replyTo.message || '',
          sender: msg.replyTo.sender || { _id: '', name: 'Unknown', avatar: null },
          timestamp: msg.replyTo.timestamp || msg.replyTo.createdAt || null
        }
      ) : null,
      read: msg.read || false,
      // Add additional metadata for persistence
      chatId: selectedChatId,
      isFromServer: true
    }));

    // Sort messages by timestamp
    const sortedMessages = enhancedMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const normalized = normalizeMessages(sortedMessages);
    setMessages(normalized);
    
    // Enhanced persistence with complete reply data
    try { 
      await AsyncStorage.setItem(`chat_messages_${selectedChatId}`, JSON.stringify(normalized)); 
    } catch (e) {
      console.warn('Failed to cache messages:', e);
    }

    // Mark messages as read only if we're not already in a loading state
    if (socket && !loading) {
      try {
        socket.emit('markMessagesAsRead', { chatId: selectedChatId, userId: user._id });
      } catch (e) {
        console.warn('Failed to mark messages as read:', e);
      }
    }
    
    setTimeout(() => scrollToBottom(false), 100);
    
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    showSnackbar('Failed to load messages');
  } finally {
    setLoadingMessages(false);
  }
};
