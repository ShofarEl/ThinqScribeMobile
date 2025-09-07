/**
 * Chat Persistence Utilities
 * 
 * This file contains utilities for persisting chat conversations to localStorage
 * and restoring them when needed.
 */

// Storage keys
const STORAGE_KEYS = {
  CONVERSATIONS: 'thinqscribe-conversations',
  CURRENT_CONVERSATION: 'thinqscribe-current-conversation',
  MODEL_SETTINGS: 'thinqscribe-model-settings',
  SELECTED_MODEL: 'thinqscribe-selected-model',
  LAST_SAVE: 'thinqscribe-last-save',
  FORCE_RESTORE: 'thinqscribe-force-restore'
};

/**
 * Save conversations to localStorage
 * @param {Array} conversations - Array of conversation objects
 */
export const saveConversations = (conversations) => {
  try {
    if (conversations && Array.isArray(conversations)) {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
      localStorage.setItem(STORAGE_KEYS.LAST_SAVE, Date.now().toString());
      console.log(`💾 Saved ${conversations.length} conversations to localStorage`);
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to save conversations to localStorage:', error);
  }
  return false;
};

/**
 * Save current conversation to localStorage
 * @param {Object} conversation - Current conversation object
 */
export const saveCurrentConversation = (conversation) => {
  try {
    if (conversation) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, JSON.stringify(conversation));
      console.log(`💾 Saved current conversation: ${conversation._id}`);
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to save current conversation to localStorage:', error);
  }
  return false;
};

/**
 * Save model settings to localStorage
 * @param {String} selectedModel - Selected model ID
 * @param {Object} modelSettings - Model settings object
 */
export const saveModelSettings = (selectedModel, modelSettings) => {
  try {
    if (selectedModel) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, selectedModel);
    }
    
    if (modelSettings) {
      localStorage.setItem(STORAGE_KEYS.MODEL_SETTINGS, JSON.stringify(modelSettings));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to save model settings to localStorage:', error);
    return false;
  }
};

/**
 * Load conversations from localStorage
 * @returns {Array|null} Array of conversation objects or null if not found
 */
export const loadConversations = () => {
  try {
    const savedConversations = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (savedConversations) {
      const parsedConversations = JSON.parse(savedConversations);
      console.log(`📂 Loaded ${parsedConversations.length} conversations from localStorage`);
      return parsedConversations;
    }
  } catch (error) {
    console.error('❌ Failed to load conversations from localStorage:', error);
  }
  return null;
};

/**
 * Load current conversation from localStorage
 * @returns {Object|null} Current conversation object or null if not found
 */
export const loadCurrentConversation = () => {
  try {
    const savedCurrentConversation = localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
    if (savedCurrentConversation) {
      const parsedCurrentConversation = JSON.parse(savedCurrentConversation);
      console.log(`📂 Loaded current conversation from localStorage: ${parsedCurrentConversation._id}`);
      return parsedCurrentConversation;
    }
  } catch (error) {
    console.error('❌ Failed to load current conversation from localStorage:', error);
  }
  return null;
};

/**
 * Load model settings from localStorage
 * @returns {Object} Object containing selectedModel and modelSettings
 */
export const loadModelSettings = () => {
  try {
    const selectedModel = localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
    const savedSettings = localStorage.getItem(STORAGE_KEYS.MODEL_SETTINGS);
    
    return {
      selectedModel: selectedModel || null,
      modelSettings: savedSettings ? JSON.parse(savedSettings) : null
    };
  } catch (error) {
    console.error('❌ Failed to load model settings from localStorage:', error);
    return { selectedModel: null, modelSettings: null };
  }
};

/**
 * Clear all chat data from localStorage
 */
export const clearChatData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ Cleared all chat data from localStorage');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear localStorage:', error);
    return false;
  }
};

/**
 * Set force restore flag
 */
export const setForceRestore = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.FORCE_RESTORE, 'true');
    return true;
  } catch (error) {
    console.error('❌ Failed to set force restore flag:', error);
    return false;
  }
};

/**
 * Check if force restore flag is set
 * @returns {Boolean} True if force restore flag is set
 */
export const shouldForceRestore = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.FORCE_RESTORE) === 'true';
  } catch (error) {
    console.error('❌ Failed to check force restore flag:', error);
    return false;
  }
};

/**
 * Clear force restore flag
 */
export const clearForceRestore = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.FORCE_RESTORE);
    return true;
  } catch (error) {
    console.error('❌ Failed to clear force restore flag:', error);
    return false;
  }
};

/**
 * Get persistence statistics
 * @returns {Object} Object containing persistence statistics
 */
export const getPersistenceStats = () => {
  try {
    const savedConversations = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    const savedCurrentConversation = localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
    const lastSave = localStorage.getItem(STORAGE_KEYS.LAST_SAVE);
    
    const stats = {
      hasLocalConversations: !!savedConversations,
      localConversationsCount: savedConversations ? JSON.parse(savedConversations).length : 0,
      hasCurrentConversation: !!savedCurrentConversation,
      lastSaveTime: lastSave ? new Date(parseInt(lastSave)).toLocaleString() : 'Never',
      storageSize: savedConversations ? JSON.stringify(JSON.parse(savedConversations)).length : 0,
      isOnline: navigator.onLine
    };
    
    return stats;
  } catch (error) {
    console.error('❌ Failed to get persistence stats:', error);
    return null;
  }
};

/**
 * Force reload with localStorage data
 */
export const forceReloadWithLocalData = () => {
  setForceRestore();
  window.location.reload();
}; 