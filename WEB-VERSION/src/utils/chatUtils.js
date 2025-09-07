import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Storage keys
const STORAGE_KEYS = {
  CONVERSATIONS: 'thinqscribe_conversations',
  CURRENT_CONVERSATION: 'thinqscribe_current_conversation',
  SETTINGS: 'thinqscribe_chat_settings',
  PREFERENCES: 'thinqscribe_user_preferences'
};

class ChatUtils {
  // Generate unique message ID
  static generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate unique conversation ID
  static generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Local Storage Management
  static saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  static getFromStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  }

  static removeFromStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  }

  // Conversation Management
  static getAllConversations() {
    return this.getFromStorage(STORAGE_KEYS.CONVERSATIONS, []);
  }

  static getConversation(conversationId) {
    const conversations = this.getAllConversations();
    return conversations.find(conv => conv.id === conversationId);
  }

  static saveConversation(conversationId, messages) {
    try {
      const conversations = this.getAllConversations();
      const existingIndex = conversations.findIndex(conv => conv.id === conversationId);
      
      const conversationData = {
        id: conversationId,
        messages,
        title: this.generateConversationTitle(messages),
        lastActivity: new Date().toISOString(),
        messageCount: messages.length,
        createdAt: existingIndex === -1 ? new Date().toISOString() : conversations[existingIndex].createdAt
      };
      
      if (existingIndex !== -1) {
        conversations[existingIndex] = conversationData;
      } else {
        conversations.push(conversationData);
      }
      
      // Sort by last activity
      conversations.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
      
      // Keep only last 50 conversations
      const trimmedConversations = conversations.slice(0, 50);
      
      this.saveToStorage(STORAGE_KEYS.CONVERSATIONS, trimmedConversations);
      return true;
    } catch (error) {
      console.error('Failed to save conversation:', error);
      return false;
    }
  }

  static createNewConversation(initialMessages = []) {
    const conversationId = this.generateConversationId();
    this.saveConversation(conversationId, initialMessages);
    this.setCurrentConversation(conversationId);
    return conversationId;
  }

  static deleteConversation(conversationId) {
    try {
      const conversations = this.getAllConversations();
      const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
      this.saveToStorage(STORAGE_KEYS.CONVERSATIONS, filteredConversations);
      
      // If this was the current conversation, clear it
      const currentConv = this.getCurrentConversation();
      if (currentConv && currentConv.id === conversationId) {
        this.removeFromStorage(STORAGE_KEYS.CURRENT_CONVERSATION);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      return false;
    }
  }

  static getCurrentConversation() {
    const currentId = this.getFromStorage(STORAGE_KEYS.CURRENT_CONVERSATION);
    return currentId ? this.getConversation(currentId) : null;
  }

  static setCurrentConversation(conversationId) {
    this.saveToStorage(STORAGE_KEYS.CURRENT_CONVERSATION, conversationId);
  }

  static generateConversationTitle(messages) {
    if (!messages || messages.length === 0) return 'New Conversation';
    
    // Find the first user message
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (!firstUserMessage) return 'New Conversation';
    
    // Extract title from first message (up to 50 characters)
    let title = firstUserMessage.content.replace(/[#*_`]/g, '').trim();
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    return title || 'New Conversation';
  }

  // Message Search and Filtering
  static searchMessages(conversations, query) {
    if (!query || !query.trim()) return [];
    
    const results = [];
    const searchTerm = query.toLowerCase();
    
    conversations.forEach(conversation => {
      conversation.messages.forEach(message => {
        if (message.content.toLowerCase().includes(searchTerm)) {
          results.push({
            conversationId: conversation.id,
            conversationTitle: conversation.title,
            message,
            snippet: this.createSearchSnippet(message.content, searchTerm)
          });
        }
      });
    });
    
    return results.sort((a, b) => new Date(b.message.timestamp) - new Date(a.message.timestamp));
  }

  static createSearchSnippet(content, searchTerm, maxLength = 150) {
    const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index === -1) return content.substring(0, maxLength);
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + 100);
    
    let snippet = content.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    return snippet;
  }

  // Export/Import Functions
  static exportConversation(conversationId, messages, format = 'json') {
    try {
      const conversation = this.getConversation(conversationId);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `conversation_${timestamp}`;
      
      switch (format.toLowerCase()) {
        case 'json':
          this.exportAsJSON(conversation, messages, filename);
          break;
        case 'markdown':
          this.exportAsMarkdown(conversation, messages, filename);
          break;
        case 'pdf':
          this.exportAsPDF(conversation, messages, filename);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  static exportAsJSON(conversation, messages, filename) {
    const exportData = {
      conversation,
      messages,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    saveAs(blob, `${filename}.json`);
  }

  static exportAsMarkdown(conversation, messages, filename) {
    let markdown = `# ${conversation.title}\n\n`;
    markdown += `**Exported:** ${new Date().toLocaleString()}\n`;
    markdown += `**Messages:** ${messages.length}\n\n`;
    markdown += '---\n\n';
    
    messages.forEach((message, index) => {
      const role = message.role === 'user' ? '👤 User' : '🤖 Assistant';
      const timestamp = new Date(message.timestamp).toLocaleString();
      
      markdown += `## ${role} - ${timestamp}\n\n`;
      markdown += `${message.content}\n\n`;
      
      if (message.aiModel) {
        markdown += `*Model: ${message.aiModel}*\n\n`;
      }
      
      markdown += '---\n\n';
    });
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    saveAs(blob, `${filename}.md`);
  }

  static exportAsPDF(conversation, messages, filename) {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;
    
    // Title
    pdf.setFontSize(16);
    pdf.text(conversation.title, margin, yPosition);
    yPosition += lineHeight * 2;
    
    // Metadata
    pdf.setFontSize(10);
    pdf.text(`Exported: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += lineHeight;
    pdf.text(`Messages: ${messages.length}`, margin, yPosition);
    yPosition += lineHeight * 2;
    
    // Messages
    messages.forEach((message, index) => {
      // Check if we need a new page
      if (yPosition > pdf.internal.pageSize.getHeight() - margin * 2) {
        pdf.addPage();
        yPosition = margin;
      }
      
      // Message header
      pdf.setFontSize(12);
      const role = message.role === 'user' ? 'User' : 'Assistant';
      const timestamp = new Date(message.timestamp).toLocaleString();
      pdf.text(`${role} - ${timestamp}`, margin, yPosition);
      yPosition += lineHeight;
      
      // Message content
      pdf.setFontSize(10);
      const lines = pdf.splitTextToSize(message.content, pageWidth - margin * 2);
      lines.forEach(line => {
        if (yPosition > pdf.internal.pageSize.getHeight() - margin * 2) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      
      yPosition += lineHeight;
    });
    
    pdf.save(`${filename}.pdf`);
  }

  static importConversation(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (!data.conversation || !data.messages) {
            throw new Error('Invalid conversation file format');
          }
          
          // Generate new ID to avoid conflicts
          const newId = this.generateConversationId();
          data.conversation.id = newId;
          
          // Save the imported conversation
          this.saveConversation(newId, data.messages);
          
          resolve(data.conversation);
        } catch (error) {
          reject(new Error(`Failed to import conversation: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  // File Processing Utilities
  static async extractTextFromFile(file) {
    const fileType = file.type || this.getFileTypeFromExtension(file.name);
    
    try {
      switch (fileType) {
        case 'application/pdf':
          return await this.extractTextFromPDF(file);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractTextFromDOCX(file);
        case 'text/plain':
        case 'text/markdown':
        case 'text/csv':
        case 'application/json':
        case 'application/xml':
        case 'text/xml':
        case 'text/javascript':
        case 'text/typescript':
        case 'text/x-python':
        case 'text/html':
        case 'text/css':
          return await this.extractTextFromTextFile(file);
        default:
          // Try as text file
          return await this.extractTextFromTextFile(file);
      }
    } catch (error) {
      throw new Error(`Failed to extract text from ${file.name}: ${error.message}`);
    }
  }

  static getFileTypeFromExtension(filename) {
    const extension = filename.split('.').pop()?.toLowerCase();
    const typeMap = {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'md': 'text/markdown',
      'csv': 'text/csv',
      'json': 'application/json',
      'xml': 'application/xml',
      'js': 'text/javascript',
      'ts': 'text/typescript',
      'py': 'text/x-python',
      'html': 'text/html',
      'css': 'text/css',
      'java': 'text/x-java',
      'cpp': 'text/x-c++src',
      'c': 'text/x-c'
    };
    
    return typeMap[extension] || 'text/plain';
  }

  static async extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  }

  static async extractTextFromDOCX(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  static async extractTextFromTextFile(file) {
    return await file.text();
  }

  // Utility Functions
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  static truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  // Settings Management
  static getUserSettings() {
    return this.getFromStorage(STORAGE_KEYS.SETTINGS, {
      theme: 'dark',
      fontSize: 'medium',
      autoSave: true,
      notifications: true,
      soundEnabled: false,
      defaultModel: 'gemini-2.0-flash',
      maxTokens: 4000,
      temperature: 0.7
    });
  }

  static saveUserSettings(settings) {
    return this.saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }

  static getUserPreferences() {
    return this.getFromStorage(STORAGE_KEYS.PREFERENCES, {
      showWelcomeMessage: true,
      autoScrollToBottom: true,
      showTimestamps: true,
      groupMessagesByTime: true,
      enableMarkdownPreview: true,
      enableSyntaxHighlighting: true,
      defaultExportFormat: 'markdown'
    });
  }

  static saveUserPreferences(preferences) {
    return this.saveToStorage(STORAGE_KEYS.PREFERENCES, preferences);
  }

  // Analytics and Statistics
  static getUsageStatistics() {
    const conversations = this.getAllConversations();
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messageCount, 0);
    const totalConversations = conversations.length;
    
    // Calculate average messages per conversation
    const avgMessagesPerConv = totalConversations > 0 ? 
      Math.round(totalMessages / totalConversations) : 0;
    
    // Find most active conversation
    const mostActiveConv = conversations.reduce((max, conv) => 
      conv.messageCount > (max?.messageCount || 0) ? conv : max, null);
    
    // Calculate time range
    const oldestConv = conversations.reduce((oldest, conv) => 
      new Date(conv.createdAt) < new Date(oldest?.createdAt || Date.now()) ? conv : oldest, null);
    
    return {
      totalConversations,
      totalMessages,
      avgMessagesPerConv,
      mostActiveConversation: mostActiveConv,
      oldestConversation: oldestConv,
      storageUsed: this.calculateStorageUsage()
    };
  }

  static calculateStorageUsage() {
    let totalSize = 0;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += new Blob([item]).size;
      }
    });
    
    return this.formatFileSize(totalSize);
  }

  // Cleanup and Maintenance
  static cleanupOldConversations(maxAge = 90) {
    try {
      const conversations = this.getAllConversations();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAge);
      
      const activeConversations = conversations.filter(conv => 
        new Date(conv.lastActivity) > cutoffDate
      );
      
      this.saveToStorage(STORAGE_KEYS.CONVERSATIONS, activeConversations);
      
      return conversations.length - activeConversations.length;
    } catch (error) {
      console.error('Cleanup failed:', error);
      return 0;
    }
  }

  static clearAllData() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        this.removeFromStorage(key);
      });
      return true;
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  }
}

export default ChatUtils; 