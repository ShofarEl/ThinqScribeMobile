import { useCallback, useState } from 'react';
import { usePersistentChat } from './usePersistentChat';

// Standalone persistent chat hook that works independently
export const useStandalonePersistentChat = () => {
  // Get persistent chat functionality
  const persistentChat = usePersistentChat();
  
  // Local state for AI functionality
  const [selectedModel, setSelectedModel] = useState('genius_pro');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [lastStreamingMessage, setLastStreamingMessage] = useState('');

  // Default models
  const models = [
    { id: 'genius_pro', name: 'Genius Pro', description: 'Advanced AI with superior reasoning' },
    { id: 'lightning_think', name: 'Lightning Think', description: 'Fast and efficient responses' }
  ];

  // Default settings
  const modelSettings = {
    temperature: 0.7,
    maxTokens: 4000,
    streaming: true
  };

  // Create new conversation
  const createNewConversation = useCallback(async (title = 'New Chat', model = selectedModel) => {
    const newConversation = {
      _id: `chat-${Date.now()}`,
      title,
      model,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const addedConversation = persistentChat.addConversation(newConversation);
      persistentChat.setCurrentConversation(addedConversation);
      console.log('💾 New conversation created:', newConversation._id);
      return addedConversation;
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      throw error;
    }
  }, [persistentChat, selectedModel]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      console.log('📦 Loading conversations from localStorage:', persistentChat.conversations.length);
      // In standalone mode, we just use what's in localStorage
      return persistentChat.conversations;
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
    }
  }, [persistentChat.conversations]);

  // Load models
  const loadModels = useCallback(async () => {
    console.log('📚 Using default models (standalone mode)');
    return models;
  }, []);

  // Send AI message with simulation
  const sendAIMessage = useCallback(async (message, files = [], options = {}) => {
    const currentConversation = persistentChat.currentConversation;
    
    if (!currentConversation) {
      throw new Error('No current conversation selected');
    }

    const userMessage = {
      role: 'user',
      content: message,
      files: files || [],
      timestamp: new Date().toISOString()
    };

    try {
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingMessage('');
      
      // Add user message immediately
      persistentChat.addMessageToConversation(currentConversation._id, userMessage);
      console.log('💾 User message saved');

      // Simulate AI response with streaming
      const responseTemplates = [
        `Thank you for your message: "${message}"`,
        `I'm running in **persistent mode** - your conversations are automatically saved to localStorage!`,
        `🔧 **Features available:**\n- Message persistence\n- Conversation switching\n- Offline support\n- Local storage backup`,
        `Try refreshing the page to see your messages are still here! 💾`
      ];

      let fullResponse = '';
      
      // Simulate streaming response
      for (let i = 0; i < responseTemplates.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        fullResponse += (i > 0 ? '\n\n' : '') + responseTemplates[i];
        setStreamingMessage(fullResponse);
      }

      // Final AI message
      const aiMessage = {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
        metadata: {
          model: selectedModel,
          persistent: true
        }
      };
      
      persistentChat.addMessageToConversation(currentConversation._id, aiMessage);
      setStreamingMessage('');
      setLastStreamingMessage(fullResponse);
      
      console.log('✅ AI response saved to persistent storage');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Save error message
      const errorMessage = {
        role: 'assistant',
        content: `❌ Error: ${error.message}. Your message was saved locally.`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      persistentChat.addMessageToConversation(currentConversation._id, errorMessage);
      
      throw error;
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [persistentChat, selectedModel]);

  // Switch model
  const switchModel = useCallback((modelId) => {
    setSelectedModel(modelId);
    console.log('🔄 Switched to model:', modelId);
  }, []);

  // Get model info
  const getModelInfo = useCallback((modelId) => {
    return models.find(m => m.id === modelId) || null;
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    console.log('⚙️ Settings updated:', newSettings);
    // In standalone mode, we just log this
  }, []);

  // Set streaming message
  const setStreamingMessageCallback = useCallback((message) => {
    setStreamingMessage(message);
  }, []);

  // Toggle research mode
  const toggleResearchMode = useCallback(() => {
    console.log('🔬 Research mode toggled (standalone mode)');
  }, []);

  return {
    // State
    conversations: persistentChat.conversations || [],
    currentConversation: persistentChat.currentConversation,
    selectedModel,
    isLoading,
    isStreaming,
    streamingMessage,
    lastStreamingMessage,
    models,
    modelSettings,

    // Actions
    sendAIMessage,
    createNewConversation,
    loadConversations,
    deleteConversation: persistentChat.deleteConversation,
    setCurrentConversation: persistentChat.setCurrentConversation,
    switchModel,
    getModelInfo,
    updateSettings,
    setStreamingMessage: setStreamingMessageCallback,
    toggleResearchMode,
    loadModels,
    
    // Persistent chat specific
    clearChatHistory: persistentChat.clearChatHistory,
    searchConversations: persistentChat.searchConversations,
    getStats: persistentChat.getStats
  };
};

export default useStandalonePersistentChat; 