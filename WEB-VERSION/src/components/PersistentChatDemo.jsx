import React, { useState, useEffect } from 'react';
import { Card, Button, Input, List, Typography, Space, Tag, Modal, message } from 'antd';
import { usePersistentChat, usePersistentChatStats } from '../hooks/usePersistentChat';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PersistentChatDemo = () => {
  const [demoMessage, setDemoMessage] = useState('');
  const [showStats, setShowStats] = useState(false);
  
  // Use persistent chat hook
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    addConversation,
    deleteConversation,
    addMessageToConversation,
    clearChatHistory,
    getStats
  } = usePersistentChat();

  const stats = getStats();

  // Initialize with a demo conversation if none exist
  useEffect(() => {
    if (conversations.length === 0) {
      const demoConv = {
        _id: `demo-${Date.now()}`,
        title: 'Welcome to ThinqScribe',
        model: 'genius_pro',
        messages: [
          {
            role: 'assistant',
            content: 'Hello! I\'m your AI assistant. Your conversations will now persist across browser sessions!',
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      addConversation(demoConv);
      setCurrentConversation(demoConv);
      
      message.success('✅ Chat persistence is now active! Your conversations will be saved locally.');
    }
  }, [conversations.length, addConversation, setCurrentConversation]);

  const handleCreateNewChat = () => {
    const newConv = {
      _id: `chat-${Date.now()}`,
      title: `Chat ${conversations.length + 1}`,
      model: 'genius_pro',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    addConversation(newConv);
    setCurrentConversation(newConv);
    message.success('New conversation created!');
  };

  const handleSendMessage = () => {
    if (!demoMessage.trim() || !currentConversation) return;
    
    const userMessage = {
      role: 'user',
      content: demoMessage,
      timestamp: new Date().toISOString()
    };
    
    addMessageToConversation(currentConversation._id, userMessage);
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        role: 'assistant',
        content: `Thanks for your message: "${demoMessage}". This conversation is now saved to localStorage and will persist when you refresh the page!`,
        timestamp: new Date().toISOString()
      };
      addMessageToConversation(currentConversation._id, aiMessage);
    }, 1000);
    
    setDemoMessage('');
  };

  const handleDeleteConversation = (convId) => {
    deleteConversation(convId);
    message.success('Conversation deleted from persistent storage');
  };

  const handleClearAll = () => {
    Modal.confirm({
      title: 'Clear All Chat History',
      content: 'This will permanently delete all conversations from localStorage. Are you sure?',
      onOk: () => {
        clearChatHistory();
        message.success('All chat history cleared');
      }
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <Title level={2}>🚀 ThinqScribe Persistent Chat Demo</Title>
      <Text style={{ display: 'block', marginBottom: '24px' }}>
        This demo shows how your chat conversations are now saved to localStorage and persist across browser sessions.
      </Text>

      {/* Stats Card */}
      <Card 
        title="📊 Persistence Statistics" 
        extra={<Button onClick={() => setShowStats(true)}>View Details</Button>}
        style={{ marginBottom: '24px' }}
      >
        <Space>
          <Tag color="blue">Conversations: {stats.totalConversations}</Tag>
          <Tag color="green">Messages: {stats.totalMessages}</Tag>
          <Tag color="orange">Current: {stats.currentConversationId || 'None'}</Tag>
        </Space>
      </Card>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Conversations List */}
        <Card 
          title="💬 Persistent Conversations" 
          style={{ width: '300px' }}
          extra={
            <Space>
              <Button size="small" onClick={handleCreateNewChat}>+ New</Button>
              <Button size="small" danger onClick={handleClearAll}>Clear All</Button>
            </Space>
          }
        >
          <List
            dataSource={conversations}
            renderItem={(conv) => (
              <List.Item
                actions={[
                  <Button 
                    size="small" 
                    type={currentConversation?._id === conv._id ? 'primary' : 'default'}
                    onClick={() => setCurrentConversation(conv)}
                  >
                    {currentConversation?._id === conv._id ? 'Current' : 'Select'}
                  </Button>,
                  <Button 
                    size="small" 
                    danger 
                    onClick={() => handleDeleteConversation(conv._id)}
                  >
                    Delete
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={conv.title}
                  description={`${conv.messages?.length || 0} messages • ${new Date(conv.createdAt).toLocaleDateString()}`}
                />
              </List.Item>
            )}
          />
        </Card>

        {/* Current Conversation */}
        <Card 
          title={`🗨️ Current: ${currentConversation?.title || 'No conversation selected'}`}
          style={{ flex: 1 }}
        >
          {currentConversation ? (
            <>
              {/* Messages */}
              <div style={{ height: '400px', overflowY: 'auto', marginBottom: '16px', border: '1px solid #f0f0f0', padding: '16px' }}>
                {currentConversation.messages?.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '16px',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: msg.role === 'user' ? '#e6f7ff' : '#f6ffed',
                      border: `1px solid ${msg.role === 'user' ? '#91d5ff' : '#b7eb8f'}`
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {msg.role === 'user' ? '👤 You' : '🤖 ThinqScribe'}
                    </div>
                    <div>{msg.content}</div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <Space.Compact style={{ width: '100%' }}>
                <TextArea
                  value={demoMessage}
                  onChange={(e) => setDemoMessage(e.target.value)}
                  placeholder="Type a message to test persistence..."
                  onPressEnter={handleSendMessage}
                  rows={1}
                  style={{ flexGrow: 1 }}
                />
                <Button type="primary" onClick={handleSendMessage}>
                  Send
                </Button>
              </Space.Compact>
            </>
          ) : (
            <Text>Select a conversation or create a new one to start chatting.</Text>
          )}
        </Card>
      </div>

      {/* Stats Modal */}
      <Modal
        title="📊 Detailed Persistence Statistics"
        open={showStats}
        onCancel={() => setShowStats(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>Total Conversations: {stats.totalConversations}</Text>
          <Text strong>Total Messages: {stats.totalMessages}</Text>
          <Text strong>Current Conversation: {stats.currentConversationId || 'None selected'}</Text>
          <Text strong>Last Activity: {stats.lastActive ? new Date(stats.lastActive).toLocaleString() : 'None'}</Text>
          
          <div style={{ marginTop: '16px' }}>
            <Text strong>Conversations:</Text>
            <List
              size="small"
              dataSource={conversations}
              renderItem={(conv) => (
                <List.Item>
                  <Text>{conv.title} - {conv.messages?.length || 0} messages</Text>
                </List.Item>
              )}
            />
          </div>
        </Space>
      </Modal>

      {/* Instructions */}
      <Card title="💡 How It Works" style={{ marginTop: '24px' }}>
        <ul>
          <li><strong>Automatic Saving:</strong> All conversations and messages are automatically saved to localStorage</li>
          <li><strong>Persistence:</strong> Refresh the page and your conversations will still be there!</li>
          <li><strong>Offline Support:</strong> Works even when the server is unavailable</li>
          <li><strong>Server Sync:</strong> When online, data syncs with the server for backup</li>
          <li><strong>Smart Merging:</strong> Local changes are preserved and merged with server data</li>
        </ul>
      </Card>
    </div>
  );
};

export default PersistentChatDemo; 