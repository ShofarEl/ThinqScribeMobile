import { useState, useEffect, useCallback } from 'react';

// Custom hook for persistent chat history using localStorage
export const usePersistentChat = () => {
  const STORAGE_KEY = 'thinqscribe-chat-history';
  const CURRENT_CONVERSATION_KEY = 'thinqscribe-current-conversation';
  
  // Initialize state from localStorage
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load conversations from localStorage:', error);
      return [];
    }
  });

  const [currentConversation, setCurrentConversation] = useState(() => {
    try {
      const saved = localStorage.getItem(CURRENT_CONVERSATION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load current conversation from localStorage:', error);
      return null;
    }
  });

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      console.log('💾 Conversations saved to localStorage:', conversations.length);
    } catch (error) {
      console.error('Failed to save conversations to localStorage:', error);
    }
  }, [conversations]);

  // Save current conversation to localStorage whenever it changes
  useEffect(() => {
    try {
      if (currentConversation) {
        localStorage.setItem(CURRENT_CONVERSATION_KEY, JSON.stringify(currentConversation));
        console.log('💾 Current conversation saved to localStorage:', currentConversation._id);
      } else {
        localStorage.removeItem(CURRENT_CONVERSATION_KEY);
      }
    } catch (error) {
      console.error('Failed to save current conversation to localStorage:', error);
    }
  }, [currentConversation]);

  // Add new conversation
  const addConversation = useCallback((conversation) => {
    setConversations(prev => {
      const newConversations = [conversation, ...prev.filter(c => c._id !== conversation._id)];
      return newConversations;
    });
    return conversation;
  }, []);

  // Update existing conversation
  const updateConversation = useCallback((conversationId, updates) => {
    setConversations(prev => 
      prev.map(conv => 
        conv._id === conversationId 
          ? { ...conv, ...updates, updatedAt: new Date().toISOString() }
          : conv
      )
    );

    // Update current conversation if it matches
    setCurrentConversation(prev => 
      prev && prev._id === conversationId 
        ? { ...prev, ...updates, updatedAt: new Date().toISOString() }
        : prev
    );
  }, []);

  // Delete conversation
  const deleteConversation = useCallback((conversationId) => {
    setConversations(prev => prev.filter(conv => conv._id !== conversationId));
    
    // Clear current conversation if it was deleted
    setCurrentConversation(prev => 
      prev && prev._id === conversationId ? null : prev
    );
  }, []);

  // Add message to conversation
  const addMessageToConversation = useCallback((conversationId, message) => {
    const updatedMessage = {
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    };

    // Update conversations list
    setConversations(prev => 
      prev.map(conv => {
        if (conv._id === conversationId) {
          return {
            ...conv,
            messages: [...(conv.messages || []), updatedMessage],
            updatedAt: new Date().toISOString()
          };
        }
        return conv;
      })
    );

    // Update current conversation if it matches
    setCurrentConversation(prev => {
      if (prev && prev._id === conversationId) {
        return {
          ...prev,
          messages: [...(prev.messages || []), updatedMessage],
          updatedAt: new Date().toISOString()
        };
      }
      return prev;
    });
  }, []);

  // Update message in conversation
  const updateMessageInConversation = useCallback((conversationId, messageIndex, messageUpdate) => {
    // Update conversations list
    setConversations(prev => 
      prev.map(conv => {
        if (conv._id === conversationId && conv.messages) {
          const updatedMessages = [...conv.messages];
          if (updatedMessages[messageIndex]) {
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              ...messageUpdate
            };
          }
          return {
            ...conv,
            messages: updatedMessages,
            updatedAt: new Date().toISOString()
          };
        }
        return conv;
      })
    );

    // Update current conversation if it matches
    setCurrentConversation(prev => {
      if (prev && prev._id === conversationId && prev.messages) {
        const updatedMessages = [...prev.messages];
        if (updatedMessages[messageIndex]) {
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            ...messageUpdate
          };
        }
        return {
          ...prev,
          messages: updatedMessages,
          updatedAt: new Date().toISOString()
        };
      }
      return prev;
    });
  }, []);

  // Sync with server data
  const syncWithServer = useCallback(async (serverConversations) => {
    try {
      if (!serverConversations) return conversations;

      // Merge server data with local data
      const mergedConversations = serverConversations.map(serverConv => {
        const localConv = conversations.find(c => c._id === serverConv._id);
        
        // If local version is newer, prefer it
        if (localConv && new Date(localConv.updatedAt) > new Date(serverConv.updatedAt)) {
          return localConv;
        }
        
        return serverConv;
      });

      // Add any local-only conversations
      const localOnlyConversations = conversations.filter(localConv => 
        !serverConversations.find(serverConv => serverConv._id === localConv._id)
      );

      const finalConversations = [...mergedConversations, ...localOnlyConversations]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

      setConversations(finalConversations);
      
      console.log('🔄 Synced conversations with server:', {
        server: serverConversations.length,
        local: conversations.length,
        merged: finalConversations.length
      });

      return finalConversations;
    } catch (error) {
      console.error('Failed to sync with server:', error);
      return conversations;
    }
  }, [conversations]);

  // Search conversations
  const searchConversations = useCallback((query) => {
    if (!query.trim()) return conversations;
    
    return conversations.filter(conv => 
      conv.title?.toLowerCase().includes(query.toLowerCase()) ||
      conv.messages?.some(msg => 
        msg.content?.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [conversations]);

  // Get conversation by ID
  const getConversationById = useCallback((conversationId) => {
    return conversations.find(conv => conv._id === conversationId);
  }, [conversations]);

  // Clear all chat history
  const clearChatHistory = useCallback(() => {
    setConversations([]);
    setCurrentConversation(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_CONVERSATION_KEY);
    console.log('🗑️ Chat history cleared');
  }, []);

  // Get statistics
  const getStats = useCallback(() => {
    return {
      totalConversations: conversations.length,
      totalMessages: conversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0),
      lastActive: conversations[0]?.updatedAt || conversations[0]?.createdAt,
      currentConversationId: currentConversation?._id
    };
  }, [conversations, currentConversation]);

  // Set conversations (for initial load from server)
  const setPersistedConversations = useCallback((newConversations) => {
    setConversations(newConversations || []);
  }, []);

  return {
    // State
    conversations,
    currentConversation,
    
    // Actions
    setCurrentConversation,
    addConversation,
    updateConversation,
    deleteConversation,
    addMessageToConversation,
    updateMessageInConversation,
    syncWithServer,
    searchConversations,
    getConversationById,
    clearChatHistory,
    getStats,
    setConversations: setPersistedConversations
  };
};

// Additional hooks for specific functionality
export const usePersistentChatStats = () => {
  const { getStats } = usePersistentChat();
  return getStats();
};

export default usePersistentChat; 