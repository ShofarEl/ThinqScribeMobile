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

export const sendChatMessage = async (messageData) => {
  try {
    // Updated to use the correct endpoint
    const response = await client.post('/chat/send', messageData);
    return response; // This should return the sent message
  } catch (error) {
    console.error('Error sending message:', error);
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
  const formData = new FormData();
  
  // Use custom filename if provided, otherwise use file.name
  const finalFileName = fileName || file.name || 'uploaded-file';
  formData.append('file', file, finalFileName);
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
    formData.append('voiceDuration', voiceDuration);
  }
  
  // Add fileType if provided
  if (fileType) {
    formData.append('fileType', fileType);
  }
  
  const response = await client.post('/chat/send-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response; // Now consistent with other functions
};


