import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { summarizeConversation as summarizeConversationAPI } from '../api/aiChat';

// Enhanced Chat History Store with Persistence
const useChatHistoryStore = create(
  persist(
    (set, get) => ({
      // State
      conversations: [],
      currentConversation: null,
      searchQuery: '',
      isLoading: false,
      lastSyncTime: null,
      
      // Actions
      addConversation: (conversation) => {
        const { conversations } = get();
        const newConversations = [conversation, ...conversations];
        set({ 
          conversations: newConversations,
          lastSyncTime: Date.now()
        });
        return conversation;
      },

      updateConversation: (conversationId, updates) => {
        const { conversations } = get();
        const updatedConversations = conversations.map(conv => 
          conv._id === conversationId 
            ? { ...conv, ...updates, updatedAt: new Date().toISOString() }
            : conv
        );
        set({ 
          conversations: updatedConversations,
          lastSyncTime: Date.now()
        });
      },

      setConversations: (conversations) => {
        set({ 
          conversations: conversations || [],
          lastSyncTime: Date.now()
        });
      },

      setCurrentConversation: (conversation) => {
        set({ currentConversation: conversation });
      },

      deleteConversation: (conversationId) => {
        const { conversations, currentConversation } = get();
        const updatedConversations = conversations.filter(conv => conv._id !== conversationId);
        const newCurrentConversation = currentConversation?._id === conversationId ? null : currentConversation;
        
        set({ 
          conversations: updatedConversations,
          currentConversation: newCurrentConversation,
          lastSyncTime: Date.now()
        });
      },

      addMessageToConversation: (conversationId, message) => {
        const { conversations, currentConversation } = get();
        
        // Update conversations list
        const updatedConversations = conversations.map(conv => {
          if (conv._id === conversationId) {
            const updatedConv = {
              ...conv,
              messages: [...(conv.messages || []), message],
              updatedAt: new Date().toISOString()
            };
            return updatedConv;
          }
          return conv;
        });

        // Update current conversation if it matches
        const newCurrentConversation = currentConversation?._id === conversationId
          ? {
              ...currentConversation,
              messages: [...(currentConversation.messages || []), message],
              updatedAt: new Date().toISOString()
            }
          : currentConversation;

        set({ 
          conversations: updatedConversations,
          currentConversation: newCurrentConversation,
          lastSyncTime: Date.now()
        });
      },

      updateMessageInConversation: (conversationId, messageIndex, messageUpdate) => {
        const { conversations, currentConversation } = get();
        
        // Update conversations list
        const updatedConversations = conversations.map(conv => {
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
        });

        // Update current conversation if it matches
        const newCurrentConversation = currentConversation?._id === conversationId
          ? (() => {
              const updatedMessages = [...(currentConversation.messages || [])];
              if (updatedMessages[messageIndex]) {
                updatedMessages[messageIndex] = {
                  ...updatedMessages[messageIndex],
                  ...messageUpdate
                };
              }
              return {
                ...currentConversation,
                messages: updatedMessages,
                updatedAt: new Date().toISOString()
              };
            })()
          : currentConversation;

        set({ 
          conversations: updatedConversations,
          currentConversation: newCurrentConversation,
          lastSyncTime: Date.now()
        });
      },

      updateConversationTitle: (conversationId, title) => {
        get().updateConversation(conversationId, { title });
      },

      generateConversationSummary: async (conversationId) => {
        const conversation = get().conversations.find(c => c._id === conversationId);
        if (!conversation || !conversation.messages || conversation.messages.length < 2) {
          return null;
        }

        try {
          set({ isLoading: true });
          const response = await summarizeConversationAPI(conversationId);
          
          if (response.success) {
            const summary = response.summary;
            get().updateConversation(conversationId, { 
              summary,
              summaryGeneratedAt: new Date().toISOString()
            });
            return summary;
          }
        } catch (error) {
          // Handle specific error for unsupported models
          if (error.response?.status === 400 && 
              error.response?.data?.message?.includes('Summarization not supported')) {
            console.log('Summarization not supported by this model');
            // Return a default summary instead of showing error
            const defaultSummary = `Chat conversation (${conversation.messages.length} messages)`;
            get().updateConversation(conversationId, { 
              summary: defaultSummary,
              summaryGeneratedAt: new Date().toISOString()
            });
            return defaultSummary;
          }
          console.error('Error generating summary:', error);
        } finally {
          set({ isLoading: false });
        }
        return null;
      },

      getConversationSummary: (conversationId) => {
        const conversation = get().conversations.find(c => c._id === conversationId);
        return conversation?.summary || null;
      },

      searchConversations: (query) => {
        const { conversations } = get();
        if (!query.trim()) return conversations;
        
        return conversations.filter(conv => 
          conv.title?.toLowerCase().includes(query.toLowerCase()) ||
          conv.messages?.some(msg => 
            msg.content?.toLowerCase().includes(query.toLowerCase())
          )
        );
      },

      getFilteredConversations: () => {
        const { conversations, searchQuery } = get();
        return get().searchConversations(searchQuery);
      },

      clearSearch: () => {
        set({ searchQuery: '' });
      },

      // Sync with server (to be called when online)
      syncWithServer: async (serverConversations) => {
        const { conversations, lastSyncTime } = get();
        
        try {
          // Simple merge strategy: server data takes precedence for conflicts
          const mergedConversations = serverConversations || [];
          
          // Add any local conversations that don't exist on server
          const localOnlyConversations = conversations.filter(localConv => 
            !mergedConversations.find(serverConv => serverConv._id === localConv._id)
          );
          
          const finalConversations = [...mergedConversations, ...localOnlyConversations]
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

          set({ 
            conversations: finalConversations,
            lastSyncTime: Date.now()
          });

          return finalConversations;
        } catch (error) {
          console.error('Failed to sync with server:', error);
          return conversations;
        }
      },

      // Clear all data (for logout)
      clearChatHistory: () => {
        set({
          conversations: [],
          currentConversation: null,
          lastSyncTime: null
        });
      },

      // Get statistics
      getStats: () => {
        const { conversations } = get();
        return {
          totalConversations: conversations.length,
          totalMessages: conversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0),
          lastActive: conversations[0]?.updatedAt || conversations[0]?.createdAt
        };
      },

      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'thinqscribe-chat-history', // localStorage key
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState, version) => {
        // Handle version migrations if needed
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...persistedState,
            lastSyncTime: Date.now()
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        // Only persist these fields
        conversations: state.conversations,
        currentConversation: state.currentConversation,
        lastSyncTime: state.lastSyncTime
      }),
      onRehydrateStorage: (state) => {
        console.log('💾 Rehydrating chat history from localStorage...');
        return (state, error) => {
          if (error) {
            console.error('❌ Failed to rehydrate chat history:', error);
          } else {
            console.log('✅ Chat history rehydrated successfully:', {
              conversations: state?.conversations?.length || 0,
              currentConversation: state?.currentConversation?._id || 'none',
              lastSync: state?.lastSyncTime ? new Date(state.lastSyncTime).toLocaleString() : 'never'
            });
          }
        };
      }
    }
  )
);

// Helper hooks for specific functionality
export const useChatHistory = () => {
  const conversations = useChatHistoryStore(state => state.conversations);
  const currentConversation = useChatHistoryStore(state => state.currentConversation);
  const setCurrentConversation = useChatHistoryStore(state => state.setCurrentConversation);
  const addConversation = useChatHistoryStore(state => state.addConversation);
  const updateConversation = useChatHistoryStore(state => state.updateConversation);
  const deleteConversation = useChatHistoryStore(state => state.deleteConversation);
  const searchConversations = useChatHistoryStore(state => state.searchConversations);
  const syncWithServer = useChatHistoryStore(state => state.syncWithServer);
  const clearChatHistory = useChatHistoryStore(state => state.clearChatHistory);

  return {
    conversations,
    currentConversation,
    setCurrentConversation,
    addConversation,
    updateConversation,
    deleteConversation,
    searchConversations,
    syncWithServer,
    clearChatHistory
  };
};

export const useChatMessages = () => {
  const addMessageToConversation = useChatHistoryStore(state => state.addMessageToConversation);
  const updateMessageInConversation = useChatHistoryStore(state => state.updateMessageInConversation);
  
  return {
    addMessageToConversation,
    updateMessageInConversation
  };
};

export const useChatStats = () => {
  const getStats = useChatHistoryStore(state => state.getStats);
  const stats = getStats();
  
  return stats;
};

export default useChatHistoryStore; 