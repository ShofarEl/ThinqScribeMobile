// ThinqScribe/src/api/chat.js
import client from './client';

export const startChat = async (participantId) => {
  try {
    const response = await client.post('/chat', { participantId });
    return response; // This should return the populated chat object
  } catch (error) {
    console.error('Error starting chat:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId) => {
  try {
    const response = await client.get(`/chat/${chatId}/messages`);
    return response; // This should return the messages array
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (messageData) => {
  try {
    // Updated to use the correct endpoint
    const response = await client.post('/chat/send', messageData);
    return response; // This should return the sent message
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getUserChats = async () => {
  try {
    const response = await client.get('/chat');
    return response; // This should return the user's chats array
  } catch (error) {
    console.error('Error fetching user chats:', error);
    throw error;
  }
};

export const getChats = async () => {
  try {
    const response = await client.get('/chat');
    return response; // This should return the chats array
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
};

export const sendChatFile = async ({ chatId, file, content, replyTo, voiceDuration, fileName, fileType }) => {
  try {
    console.log('📤 [sendChatFile] Starting file upload:', {
      chatId,
      fileName: fileName || file.name,
      fileType: fileType || file.type,
      fileSize: file.size,
      voiceDuration,
      hasContent: !!content,
      hasReplyTo: !!replyTo
    });

    const formData = new FormData();
    
    // Use custom filename if provided, otherwise use file.name
    const finalFileName = fileName || file.name || 'uploaded-file';
    
    // Handle different file object formats (React Native vs Web)
    if (file.uri && !file.constructor?.name?.includes('File')) {
      // React Native format (has uri but is not a File object)
      console.log('📱 [sendChatFile] Using React Native file format');
      formData.append('file', {
        uri: file.uri,
        name: finalFileName,
        type: fileType || file.type || file.mimeType || 'application/octet-stream'
      });
    } else {
      // Web format (File object or Blob)
      console.log('🌐 [sendChatFile] Using Web file format');
      console.log('🌐 [sendChatFile] File object details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        constructor: file.constructor?.name,
        isFile: file instanceof File,
        isBlob: file instanceof Blob
      });
      
      // For web, the file is already a proper File/Blob object
      formData.append('file', file, finalFileName);
    }
    
    formData.append('chatId', chatId);
    
    // Add content (caption) if provided
    if (content && content.trim()) {
      formData.append('content', content.trim());
    }
    
    // Add replyTo if provided
    if (replyTo) {
      formData.append('replyTo', replyTo);
    }
    
    // Add voiceDuration for voice messages
    if (voiceDuration !== undefined && voiceDuration !== null) {
      formData.append('voiceDuration', voiceDuration.toString());
    }
    
    // Add fileType if provided
    if (fileType) {
      formData.append('fileType', fileType);
    }

    console.log('📤 [sendChatFile] FormData prepared, sending to server...');
    
    // Debug FormData contents
    console.log('🔍 [sendChatFile] FormData contents:');
    for (let [key, value] of formData.entries()) {
      if (key === 'file') {
        console.log(`  ${key}:`, {
          name: value.name || 'no name',
          size: value.size || 'no size',
          type: value.type || 'no type',
          constructor: value.constructor?.name,
          isFile: value instanceof File,
          isBlob: value instanceof Blob
        });
      } else {
        console.log(`  ${key}:`, value);
      }
    }
    
    const response = await client.post('/chat/send-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60 seconds for file uploads
    });
    
    console.log('✅ [sendChatFile] Upload successful:', response);
    return response;
  } catch (error) {
    console.error('❌ [sendChatFile] Upload failed:', error);
    console.error('❌ [sendChatFile] Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};
