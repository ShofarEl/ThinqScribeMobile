// src/components/StudentChat.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  List,
  Input,
  Button,
  Avatar,
  Spin,
  Typography,
  message as Msg,
  Popover,
  Upload,
  Space,
  Badge,
  Dropdown,
  Menu,
  notification,
  Card,
  Tooltip,
  Divider,
  Drawer
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  SearchOutlined,
  CloseOutlined,
  MessageOutlined,
  SmileOutlined,
  UploadOutlined,
  FilePdfOutlined,
  PaperClipOutlined,
  DownloadOutlined,
  PlusOutlined,
  MoreOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  StarOutlined,
  CalendarOutlined,
  BookOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  LoadingOutlined,
  MenuOutlined,
  FileOutlined,
  FileImageOutlined,
  AudioOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

// Import the Web Component. This registers <emoji-picker> in the browser.
import 'emoji-picker-element';

import {
  getChatMessages,
  getChats,
  sendChatMessage,
  sendChatFile,
} from '../api/chat';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
// Enhanced imports for location and currency features
import HeaderComponent from '../components/HeaderComponent';
import CreateAgreementModal from '../components/CreateAgreementModal';
import { agreementApi } from '../api/agreement';
import FileViewer from '../components/FileViewer';
import VideoCallButton from '../components/VideoCallButton';
// Enhanced location and currency components
import EnhancedChatMessage from '../components/EnhancedChatMessage';
import ChatPartnerHeader from '../components/ChatPartnerHeader';
import LocalizedPriceDisplay from '../components/LocalizedPriceDisplay';
import { useCurrency } from '../hooks/useCurrency';

// Import the beautiful CSS styling
import './StudentChat.css';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const StudentChat = () => {
  const { chatId: routeChatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useNotifications();
  const { convertPrice, formatCurrency, getCurrencySymbol, location: userLocation } = useCurrency();

  // ── Chat/List state ─────────────────────────────────────────────────────────
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedWriter, setSelectedWriter] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  // ── New-message + Reply state ───────────────────────────────────────────────
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  // ── Message status tracking ─────────────────────────────────────────────────
  const [messageStatuses, setMessageStatuses] = useState(new Map()); // Track message delivery/read status
  const [sendingMessages, setSendingMessages] = useState(new Set()); // Track individual message sending state

  // ── File-to-send state ──────────────────────────────────────────────────────
  const [fileToSend, setFileToSend] = useState(null);
  const [uploadList, setUploadList] = useState([]);

  // ── Search state ────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);

  // ── Emoji picker visibility and ref ─────────────────────────────────────────
  const [emojiVisible, setEmojiVisible] = useState(false);
  const emojiPickerRef = useRef(null);

  // ── Typing indicator state ──────────────────────────────────────────────────
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  // ── Online status tracking ─────────────────────────────────────────────────
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // ── Scroll position tracking ────────────────────────────────────────────────
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesContainerRef = useRef(null);

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // ── Agreement modal state ──────────────────────────────────────────────────
  const [agreementModalVisible, setAgreementModalVisible] = useState(false);
  const [creatingAgreement, setCreatingAgreement] = useState(false);

  // Ref for the CreateAgreementModal's form instance
  const formRef = useRef(null);

  // ── Mobile sidebar state ─────────────────────────────────────────────────
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);

  // ── FileViewer state ─────────────────────────────────────────────────────
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState({
    url: '',
    name: '',
    type: '',
    size: 0,
    content: ''
  });

  // ── 1) On mount, re-join "user-<id>" room ─────────────────────────────────
  useEffect(() => {
    if (user && socket) {
      socket.emit('joinUserRoom', user._id);
    }
  }, [user, socket]);

  // 2) Track window width for responsive sidebar ───────────────────────────
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3) Listen for real-time incoming messages and agreement events ──────────────
  useEffect(() => {
    if (!socket || !user) return;

    const handleReceiveMessage = (data) => {
      console.log('📨 Received message:', data);
      
      // Only add messages from OTHER users (not current user) to prevent duplicates with optimistic UI
      if (data.message.sender._id !== user._id) {
        // Update chat messages if it's the currently selected chat
        if (selectedChat && data.chatId === selectedChat._id) {
          setChatMessages((prev) => {
            // Prevent duplicates
            if (prev.some((msg) => msg._id === data.message._id)) {
              return prev;
            }
            const newMessages = [...prev, data.message];
            
            // Scroll to bottom for new messages
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            
            return newMessages;
          });
        }
      }
      
      // Always update the chat list for any new message
      setChats((prevChats) => {
        const updated = prevChats.map((chat) => {
          if (chat._id === data.chatId) {
            const already = (chat.messages || []).some(
              (msg) => msg._id === data.message._id
            );
            if (!already) {
              return {
                ...chat,
                messages: [...(chat.messages || []), data.message],
                updatedAt: new Date(),
              };
            }
          }
          return chat;
        });
        
        // Move updated chat to top
        const chatToMove = updated.find((c) => c._id === data.chatId);
        if (chatToMove) {
          return [chatToMove, ...updated.filter((c) => c._id !== data.chatId)];
        }
        return updated;
      });
    };

    const handleMessageError = (data) => {
      console.error('❌ Message error:', data);
      Msg.error({
        message: 'Message Error',
        description: data.error || 'Failed to send message',
      });
    };

    const handleTyping = ({ userId, chatId }) => {
      console.log('👀 User typing:', { userId, chatId, selectedChatId: selectedChat?._id });
      if (selectedChat && chatId === selectedChat._id && userId !== user._id) {
        setOtherUserTyping(true);
        
        // Clear existing timeout
        if (typingTimeout.current) {
          clearTimeout(typingTimeout.current);
        }
        
        // Auto-clear typing after 3 seconds
        typingTimeout.current = setTimeout(() => {
          setOtherUserTyping(false);
        }, 3000);
      }
    };

    const handleStopTyping = ({ userId, chatId }) => {
      console.log('✋ User stopped typing:', { userId, chatId });
      if (selectedChat && chatId === selectedChat._id && userId !== user._id) {
        setOtherUserTyping(false);
        if (typingTimeout.current) {
          clearTimeout(typingTimeout.current);
        }
      }
    };

    // Agreement acceptance handler
    const handleAgreementAccepted = ({ agreementId, orderId }) => {
      Msg.success('Writer has accepted your agreement! Redirecting to order page.');
      navigate(`/orders/${orderId}`);
    };

    // Message read receipt handler
    const handleMessagesMarkedAsRead = ({ chatId, readBy }) => {
      if (selectedChat && chatId === selectedChat._id && readBy !== user._id) {
        setChatMessages(prev => prev.map(msg => 
          msg.sender._id === user._id ? { ...msg, read: true } : msg
        ));
      }
    };

    const handleConnectionStatus = () => {
      console.log('🔌 Socket connected:', socket.connected);
    };

    const handleUserOnline = ({ userId }) => {
      console.log('🟢 User came online:', userId);
      setOnlineUsers(prev => new Set([...prev, userId]));
    };

    const handleUserOffline = ({ userId }) => {
      console.log('🔴 User went offline:', userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    const handleOnlineStatuses = (statuses) => {
      console.log('📊 Received online statuses:', statuses);
      const onlineUserIds = Object.keys(statuses).filter(userId => statuses[userId]);
      setOnlineUsers(new Set(onlineUserIds));
    };

    // Register socket event listeners
    socket.on('messageBroadcast', handleReceiveMessage);
    socket.on('newMessage', handleReceiveMessage);
    socket.on('messageError', handleMessageError);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('agreementAccepted', handleAgreementAccepted);
    socket.on('messagesRead', handleMessagesMarkedAsRead);
    socket.on('connect', handleConnectionStatus);
    socket.on('disconnect', handleConnectionStatus);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('onlineStatuses', handleOnlineStatuses);
    socket.on('callCompleted', handleCallCompleted); // NEW: Handle call completion for duration messages

    return () => {
      console.log('🧹 Cleaning up socket listeners');
      socket.off('messageBroadcast', handleReceiveMessage);
      socket.off('newMessage', handleReceiveMessage);
      socket.off('messageError', handleMessageError);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('agreementAccepted', handleAgreementAccepted);
      socket.off('messagesRead', handleMessagesMarkedAsRead);
      socket.off('connect', handleConnectionStatus);
      socket.off('disconnect', handleConnectionStatus);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('onlineStatuses', handleOnlineStatuses);
      socket.off('callCompleted', handleCallCompleted); // NEW: Cleanup call completion listener
    };
  }, [socket, user, selectedChat, navigate]);

  // 4) Fetch chat list (and pre-select from route) ─────────────────────────
  useEffect(() => {
    const fetchChats = async () => {
      setLoadingMessages(true);
      try {
        const data = await getChats();
        setChats(data || []);
        if (routeChatId) {
          const found = data.find((c) => c._id === routeChatId);
          if (found) {
            // Validate chat participants before setting
            if (!found.participants || !Array.isArray(found.participants)) {
              notification.error({
                message: 'Invalid Chat',
                description: 'The selected chat is invalid or has no participants.',
                type: 'error'
              });
              return;
            }

            // Find and validate writer
            const writer = found.participants.find(p => p?.role === 'writer' && p?._id);
            if (!writer) {
              notification.error({
                message: 'Writer Not Found',
                description: 'No writer found in this chat. Please select a chat with a writer to create an agreement.',
                type: 'error'
              });
              return;
            }

            setSelectedChat(found);
            setSelectedWriter(writer);
          }
        }
      } catch (err) {
        console.error('Failed to load chats:', err);
        Msg.error('Failed to load chats');
      } finally {
        setLoadingMessages(false);
      }
    };
    if (user) {
      fetchChats();
      socket?.emit('joinUserRoom', user._id); // Ensure user is in their room
    }
  }, [routeChatId, user, socket]);

  // 5) Whenever selectedChat changes ▶︎ fetch its messages & join its room ─
  useEffect(() => {
    if (!selectedChat || !user || !socket) {
      setChatMessages([]);
      return;
    }
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const msgs = await getChatMessages(selectedChat._id);
        setChatMessages(msgs || []);
        socket.emit('joinChat', selectedChat._id); // Join the specific chat room
        socket.emit('markMessagesAsRead', { // Mark messages as read
          chatId: selectedChat._id,
          userId: user._id,
        });
      } catch (err) {
        console.error('Failed to load messages:', err);
        Msg.error('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
    // Clean up: leave chat room when selected chat changes or component unmounts
    return () => {
      socket.emit('leaveChat', selectedChat._id);
    };
  }, [selectedChat, user, socket]);

  // 6) Scroll to bottom whenever chatMessages changes ─────────────────────
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // 7) Track scroll position for scroll-to-bottom button ───────────────────
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
      setShowScrollToBottom(!isNearBottom);
    };

    messagesContainer.addEventListener('scroll', handleScroll);
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, [selectedChat]);

  const scrollToBottomSmooth = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 8) Handle selecting a chat in the sidebar ─────────────────────────────
  const handleSelectChat = (chat) => {
    if (!chat || !Array.isArray(chat.participants)) {
      notification.error({
        message: 'Invalid Chat',
        description: 'The selected chat is invalid or has no participants.',
        type: 'error'
      });
      return;
    }

    setSelectedChat(chat);
    // Find and set the writer from the chat participants
    const writer = chat.participants.find(p => p?.role === 'writer' && p?._id);
    if (!writer) {
      notification.error({
        message: 'Writer Not Found',
        description: 'No writer found in this chat. Please select a chat with a writer to create an agreement.',
        type: 'error'
      });
    }
    setSelectedWriter(writer || null);
    setOtherUserTyping(false);
    if (!isDesktop) {
      navigate(`/chat/student/${chat._id}`); // Navigate for mobile view
    }
  };

  // 9) Handle sending a new message/file - WhatsApp Style (INSTANT UI)
  const handleSend = () => {
    if (!selectedChat) return;
    
    const content = newMessage.trim();
    const hasFile = !!(fileToSend && (Array.isArray(fileToSend) ? fileToSend.length > 0 : true));
    
    if (!content && !hasFile) return;
    
    // Store values before clearing
    const messageContent = content;
    const filesToUpload = hasFile ? (Array.isArray(fileToSend) ? [...fileToSend].filter(Boolean) : [fileToSend].filter(Boolean)) : [];
    const replyToMessage = replyingTo;
    
    // Clear input immediately (WhatsApp-style) - SYNCHRONOUS
    setNewMessage('');
    setReplyingTo(null);
    if (hasFile) {
      setFileToSend(null);
      setUploadList([]);
    }
    
    // Stop typing indicator
    if (socket) {
      socket.emit('stopTyping', {
        chatId: selectedChat._id,
        userId: user._id
      });
    }
    
    if (hasFile && filesToUpload.length > 0) {
      // Handle file uploads with INSTANT optimistic UI
      console.log('📎 Processing files:', filesToUpload.map(f => f?.name || 'Unknown'), messageContent ? `with caption: "${messageContent}"` : 'without caption');
      
      // Create all optimistic messages IMMEDIATELY and SYNCHRONOUSLY
      const optimisticMessages = filesToUpload.map((file, i) => {
        if (!file || !file.name || !file.type) {
          console.error(`❌ Invalid file at index ${i}:`, file);
          Msg.error(`Invalid file selected. Please try again.`);
          return null;
        }
        
        const tempId = `temp-file-${Date.now()}-${i}`;
        
        return {
          _id: tempId,
          content: messageContent || '',
          sender: { 
            _id: user._id, 
            name: user.name, 
            avatar: user.avatar 
          },
          timestamp: new Date().toISOString(),
          chatId: selectedChat._id,
          fileUrl: URL.createObjectURL(file), // Show preview immediately
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          isUploading: true, // Flag for upload state
          replyTo: replyToMessage || null,
          tempId, // Store for later reference
          originalFile: file // Store original file for upload
        };
      }).filter(Boolean);
      
      // Add ALL optimistic messages to UI IMMEDIATELY (synchronous)
      setChatMessages(prev => [...prev, ...optimisticMessages]);
      
      // Track sending state for each message
      optimisticMessages.forEach(msg => {
        setSendingMessages(prev => new Set([...prev, msg._id]));
      });
      
      // Auto-scroll immediately
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 10);
      
      // Now upload files in background (non-blocking)
      optimisticMessages.forEach((optimisticMsg, i) => {
        uploadFileInBackground(optimisticMsg, messageContent, replyToMessage);
      });
      
    } else if (messageContent) {
      // Handle text message - INSTANT optimistic UI
      const tempId = `temp-text-${Date.now()}`;
      
      const optimisticMessage = {
        _id: tempId,
        content: messageContent,
        sender: { _id: user._id, name: user.name, avatar: user.avatar },
        timestamp: new Date().toISOString(),
        chatId: selectedChat._id,
        replyTo: replyToMessage || null,
        isOptimistic: true
      };
      
      // Add to UI IMMEDIATELY (synchronous)
      setChatMessages(prev => [...prev, optimisticMessage]);
      setSendingMessages(prev => new Set([...prev, tempId]));
      
      // Auto-scroll immediately
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 10);
      
      // Send text message in background (non-blocking)
      sendTextMessageInBackground(optimisticMessage, messageContent, replyToMessage);
    }
  };
  
  // Separate async function for file uploads (runs in background)
  const uploadFileInBackground = async (optimisticMsg, messageContent, replyToMessage) => {
    try {
      const file = optimisticMsg.originalFile;
      console.log(`🔄 Background upload starting: ${file.name} (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      console.log(`📝 Caption: "${messageContent}"`);
      
      const uploadData = {
        chatId: selectedChat._id,
        file: file,
        content: messageContent || '',
        replyTo: replyToMessage?._id
      };
      
      const realMessage = await sendChatFile(uploadData);
      console.log(`✅ Background upload completed: ${file.name}`);
      console.log('📥 Server response:', realMessage);
      
      // Replace optimistic message with real server response
      setChatMessages(prev => prev.map(msg => 
        msg._id === optimisticMsg._id ? {
          ...realMessage,
          isUploading: false
        } : msg
      ));
      
      // Update status tracking
      setMessageStatuses(prev => new Map(prev).set(realMessage._id, 'sent'));
      setSendingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(optimisticMsg._id);
        return newSet;
      });
      
      // Update chat list
      setChats(prevChats => {
        const updated = prevChats.map(chat => {
          if (chat._id === selectedChat._id) {
            const exists = (chat.messages || []).some(msg => msg._id === realMessage._id);
            if (!exists) {
              return {
                ...chat,
                messages: [...(chat.messages || []), realMessage],
                updatedAt: new Date()
              };
            }
          }
          return chat;
        });
        
        const chatToMove = updated.find(c => c._id === selectedChat._id);
        return chatToMove ? [chatToMove, ...updated.filter(c => c._id !== selectedChat._id)] : updated;
      });
      
    } catch (uploadError) {
      console.error(`❌ Background upload failed: ${optimisticMsg.fileName}:`, uploadError);
      
      // Update optimistic message to show error
      setChatMessages(prev => prev.map(msg => 
        msg._id === optimisticMsg._id ? {
          ...msg,
          content: `❌ Failed to upload: ${optimisticMsg.fileName}`,
          isUploading: false,
          uploadError: true
        } : msg
      ));
      
      setSendingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(optimisticMsg._id);
        return newSet;
      });
      
      const errorMsg = uploadError.response?.data?.message || uploadError.message || 'Upload failed';
      Msg.error(`Failed to upload ${optimisticMsg.fileName}: ${errorMsg}`);
    }
  };
  
  // Separate async function for text messages (runs in background)
  const sendTextMessageInBackground = async (optimisticMsg, messageContent, replyToMessage) => {
    try {
      const realMessage = await sendChatMessage({
        chatId: selectedChat._id,
        content: messageContent,
        replyTo: replyToMessage?._id
      });
      
      setChatMessages(prev => prev.map(msg => 
        msg._id === optimisticMsg._id ? { ...realMessage, isOptimistic: false } : msg
      ));
      
      setMessageStatuses(prev => new Map(prev).set(realMessage._id, 'sent'));
      setSendingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(optimisticMsg._id);
        return newSet;
      });
      
    } catch (textError) {
      console.error('❌ Background text send failed:', textError);
      
      setChatMessages(prev => prev.map(msg => 
        msg._id === optimisticMsg._id ? {
          ...msg,
          content: `❌ ${messageContent}`,
          sendError: true,
          isOptimistic: false
        } : msg
      ));
      
      setSendingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(optimisticMsg._id);
        return newSet;
      });
      
      Msg.error(`Failed to send message: ${textError.message || 'Send error'}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Send on Enter, new line on Shift+Enter
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  // 10) Handle "Reply" clicks ─────────────────────────────────────────────
  const handleReply = (msg) => {
    setReplyingTo(msg);
  };
  const cancelReply = () => {
    setReplyingTo(null);
  };

  // 11) Search logic ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    const results = chatMessages.filter((msg) =>
      msg.content.toLowerCase().includes(term)
    );
    setSearchResults(results);
  }, [searchTerm, chatMessages]);

  // ── 12) Chat filtering logic ──────────────────────────────────────────────
  useEffect(() => {
    if (!chatSearchTerm.trim()) {
      setFilteredChats(chats);
      return;
    }
    const term = chatSearchTerm.toLowerCase();
    const filtered = chats.filter((chat) => {
      const otherParticipant = chat.participants?.find((p) => p._id !== user._id);
      const name = otherParticipant?.name?.toLowerCase() || '';
      const lastMessage = chat.messages && chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1].content.toLowerCase() 
        : '';
      return name.includes(term) || lastMessage.includes(term);
    });
    setFilteredChats(filtered);
  }, [chatSearchTerm, chats, user._id]);

  const scrollToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(msgId);
      setTimeout(() => setHighlightedMsgId(null), 1500); // Remove highlight after 1.5s
    }
  };

  // 13) Typing indicator: user is typing ──────────────────────────────────
  const handleTyping = () => {
    if (!selectedChat || !socket) return;
    
    console.log('🔤 Emitting typing event for chat:', selectedChat._id);
    
    // Emit typing event
    socket.emit('typing', {
      chatId: selectedChat._id,
      userId: user._id,
      userName: user.name,
    });
    
    // Clear previous timeout and set a new one
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    
    typingTimeout.current = setTimeout(() => {
      console.log('⏰ Stopping typing timeout');
      socket.emit('stopTyping', {
        chatId: selectedChat._id,
        userId: user._id,
      });
    }, 2000); // Stop typing after 2 seconds of no input
  };

  // 14) Set up / tear down the emoji-picker-element event listener ─────────
  useEffect(() => {
    const pickerEl = emojiPickerRef.current;
    if (!pickerEl) return;

    const onEmojiClick = (event) => {
      const unicode = event.detail.unicode;
      if (unicode) {
        setNewMessage((prev) => prev + unicode);
      }
    };

    if (emojiVisible) {
      pickerEl.addEventListener('emoji-click', onEmojiClick);
    } else {
      pickerEl.removeEventListener('emoji-click', onEmojiClick);
    }

    return () => {
      pickerEl.removeEventListener('emoji-click', onEmojiClick);
    };
  }, [emojiVisible]);

  // 15) Download helper for cross-origin S3 links ─────────────────────────────
  const downloadFile = async (url, fileName) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName || url.split('/').pop().split('?')[0]; // Extract filename without query params
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href); // Clean up the object URL
    } catch (err) {
      console.error('Download failed:', err);
      Msg.error({
        message: 'Download Failed',
        description: 'Download failed',
        type: 'error'
      });
    }
  };

  // ── 15) Handle file viewing (WhatsApp-like) ─────────────────────────────────
  const handleFileView = (msg) => {
    setSelectedFile({
      url: msg.fileUrl,
      name: msg.fileName || 'Unknown file',
      type: msg.fileType || '',
      size: msg.fileSize || 0,
      content: msg.content || ''
    });
    setFileViewerVisible(true);
  };

  const closeFileViewer = () => {
    setFileViewerVisible(false);
    setSelectedFile({
      url: '',
      name: '',
      type: '',
      size: 0,
      content: ''
    });
  };

  // ── Message Status Indicators (WhatsApp-style) ──────────────────────────────
  const renderMessageStatus = (msg) => {
    const isCurrentUser = msg.sender._id === user._id;
    if (!isCurrentUser) return null; // Only show status for sent messages

    const status = messageStatuses.get(msg._id) || 'sent';
    const isSending = sendingMessages.has(msg._id);

    if (isSending) {
      return (
        <span style={{ marginLeft: '4px', fontSize: '10px', color: '#9ca3af' }}>
          <LoadingOutlined />
        </span>
      );
    }

    switch (status) {
      case 'sent':
        return (
          <span style={{ marginLeft: '4px', fontSize: '10px', color: '#9ca3af' }}>
            ✓
          </span>
        );
      case 'delivered':
        return (
          <span style={{ marginLeft: '4px', fontSize: '10px', color: '#9ca3af' }}>
            ✓✓
          </span>
        );
      case 'read':
        return (
          <span style={{ marginLeft: '4px', fontSize: '10px', color: '#2563eb' }}>
            ✓✓
          </span>
        );
      default:
        return null;
    }
  };

  // ── Agreement creation handler (for student) ────────────────────────────────
  const handleCreateAgreement = async (agreementData) => {
    setCreatingAgreement(true);
    try {
      // Find the writer's ID from the selected chat participants
      const writer = selectedChat?.participants.find(p => p.role === 'writer');
      if (!writer || !writer._id) {
        notification.error({
          message: 'Cannot Create Agreement',
          description: 'Writer not found in chat or writer ID is missing.',
          placement: 'bottomRight'
        });
        return;
      }

      // Validate the data before sending
      if (!agreementData.projectDetails?.title ||
          !agreementData.projectDetails?.description ||
          !agreementData.projectDetails?.subject ||
          !agreementData.projectDetails?.deadline ||
          !agreementData.totalAmount ||
          !agreementData.installments?.length) {
        notification.error({
          message: 'Invalid Agreement Data',
          description: 'Please fill in all required fields.',
          placement: 'bottomRight'
        });
        return;
      }

      // Format the data for API submission
      const formattedData = {
        ...agreementData,
        writerId: writer._id,
        chatId: selectedChat._id
      };

      // Validate the dates
      const now = new Date();
      if (new Date(formattedData.projectDetails.deadline) <= now) {
        notification.error({
          message: 'Invalid Deadline',
          description: 'Project deadline must be in the future.',
          placement: 'bottomRight'
        });
        return;
      }

      // Validate installment dates and amounts
      const invalidInstallments = formattedData.installments.reduce((errors, inst, idx) => {
        if (!inst.amount || inst.amount <= 0) {
          errors.push(`Installment ${idx + 1} amount must be greater than 0`);
        }
        if (new Date(inst.dueDate) <= now) {
          errors.push(`Installment ${idx + 1} due date must be in the future`);
        }
        return errors;
      }, []);

      if (invalidInstallments.length > 0) {
        notification.error({
          message: 'Invalid Installments',
          description: invalidInstallments.join('\n'),
          placement: 'bottomRight'
        });
        return;
      }

      // Validate total amount matches sum of installments
      const installmentSum = formattedData.installments.reduce((sum, inst) => sum + Number(inst.amount), 0);
      if (Math.abs(formattedData.totalAmount - installmentSum) > 0.01) {
        notification.error({
          message: 'Invalid Amounts',
          description: 'Sum of installments must equal total amount',
          placement: 'bottomRight'
        });
        return;
      }

      // Create the agreement
      const response = await agreementApi.createAgreement(formattedData);

      // Close modal and show success message
      setAgreementModalVisible(false);
      notification.success({
        message: 'Agreement Created',
        description: 'Agreement has been created and sent to the writer.',
        placement: 'bottomRight'
      });

      // Reset the form
      formRef.current?.resetFields();

      // Send a message to the chat about the agreement
      await sendChatMessage({
        chatId: selectedChat._id,
        content: `📝 Created a new service agreement for "${formattedData.projectDetails.title}" - Total Amount: $${formattedData.totalAmount}`,
        type: 'system'
      });

      // Update the chat list to show updated status
      const updatedChats = await getChats();
      setChats(updatedChats);

    } catch (error) {
      console.error('Error creating agreement:', error);
      notification.error({
        message: 'Agreement Creation Failed',
        description: error.response?.data?.message || 'Failed to create agreement. Please try again.',
        placement: 'bottomRight'
      });
    } finally {
      setCreatingAgreement(false);
    }
  };

  // Menu for chat actions (e.g., Create Agreement, Video Call)
  const chatActionsMenu = (
    <Menu>
      <Menu.Item
        key="videoCall"
        icon={<VideoCameraOutlined />}
        onClick={() => {
          // Trigger video call from dropdown
          const videoCallButton = document.querySelector('[title="Start Video Call"]');
          if (videoCallButton) {
            videoCallButton.click();
          }
        }}
        disabled={!selectedChat}
      >
        Start Video Call
      </Menu.Item>
      <Menu.Divider />
      {selectedChat && selectedChat.participants.some(p => p.role === 'writer') && (
        <Menu.Item
          key="createAgreement"
          icon={<PlusOutlined />}
          onClick={() => setAgreementModalVisible(true)}
        >
          Create Agreement
        </Menu.Item>
      )}
      {/* Add other chat-related actions here if needed */}
    </Menu>
  );

  // ── Sidebar: render list of chats ─────────────────────────────────────────
  const renderChatList = () => (
    <div className="professional-chat-sidebar">
      <div className="chat-sidebar-header">
        <Title level={3} style={{ color: '#1f2937', margin: 0, fontSize: '20px' }}>
          My Conversations
        </Title>
        <Text type="secondary" style={{ fontSize: '14px', marginTop: '4px', display: 'block' }}>
          Chat with writers
        </Text>
        
        {/* Chat search input */}
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search conversations..."
          allowClear
          value={chatSearchTerm}
          onChange={(e) => setChatSearchTerm(e.target.value)}
          style={{ 
            borderRadius: 16, 
            marginTop: '12px',
            fontSize: '13px'
          }}
          size="small"
        />
      </div>
      
      <div className="chat-instructions">
        <Card size="small" style={{ marginBottom: '16px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#3b82f6', marginTop: '2px' }} />
            <div>
              <Text strong style={{ fontSize: '13px', color: '#374151' }}>How it works:</Text>
              <Paragraph style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                1. Browse and chat with writers<br/>
                2. Discuss your project requirements<br/>
                3. Create a service agreement for your project<br/>
                4. Writer accepts and starts your project
              </Paragraph>
            </div>
          </div>
        </Card>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={filteredChats}
        loading={loadingMessages}
        locale={{ emptyText: <Text>No conversations yet</Text> }}
        renderItem={(chat) => {
          const other = chat.participants?.find((p) => p._id !== user._id) || {};
          const lastMsg =
            chat.messages && chat.messages.length > 0
              ? chat.messages[chat.messages.length - 1]
              : null;
          const hasUnread = chat.messages?.some(
            (msg) =>
              msg.sender._id.toString() !== user._id.toString() && !msg.read
          );

          return (
            <List.Item
              onClick={() => handleSelectChat(chat)}
              className={`professional-chat-item ${
                selectedChat && selectedChat._id === chat._id ? 'selected' : ''
              } ${hasUnread ? 'unread' : ''}`}
            >
              <List.Item.Meta
                avatar={
                  <div className="chat-avatar-container">
                    <Avatar
                      size="large"
                      src={
                        other.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${other.name}`
                      }
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: other.role === 'writer' ? '#52c41a' : '#3b82f6',
                        border: '2px solid #fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    {/* Online status indicator */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: onlineUsers.has(other._id) ? '#52c41a' : '#d9d9d9',
                        border: '2px solid white',
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                      }}
                      title={onlineUsers.has(other._id) ? 'Online' : 'Offline'}
                    />
                    {hasUnread && (
                      <div className="unread-indicator" />
                    )}
                  </div>
                }
                title={
                  <div className="chat-item-header">
                    <span className="writer-name">
                      {other.name || 'Unknown'}
                    </span>
                    <div className="chat-meta">
                      <Badge
                        text={other.role === 'writer' ? 'Expert Writer' : 'Student'}
                        style={{
                          backgroundColor: other.role === 'writer' ? '#dbeafe' : '#f3f4f6',
                          color: other.role === 'writer' ? '#1e40af' : '#6b7280',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '600'
                        }}
                      />
                      {lastMsg && (
                        <span className="chat-time">
                          {formatTime(lastMsg.timestamp)}
                        </span>
                      )}
                    </div>
                  </div>
                }
                description={
                  lastMsg && (
                    <Text className="last-message" ellipsis={{ rows: 1 }}>
                      {lastMsg.sender._id === user._id ? 'You: ' : ''}
                      {lastMsg.content}
                    </Text>
                  )
                }
              />
            </List.Item>
          );
        }}
      />
    </div>
  );

  // Update writer when chat changes
  useEffect(() => {
    if (selectedChat) {
      const writer = selectedChat.participants.find(p => p.role === 'writer');
      setSelectedWriter(writer || null);
    } else {
      setSelectedWriter(null);
    }
  }, [selectedChat]);

  // Handle showing the agreement modal
  const handleCreateAgreementClick = () => {
    if (!selectedChat || !selectedChat.participants) {
      notification.error({
        message: 'Cannot Create Agreement',
        description: 'Please select a chat first.',
        type: 'error'
      });
      return;
    }

    const writer = selectedChat.participants.find(p => p?.role === 'writer' && p?._id);
    if (!writer || !writer._id) {
      notification.error({
        message: 'Cannot Create Agreement',
        description: 'No writer found in this chat. Please select a chat with a writer to create an agreement.',
        type: 'error'
      });
      return;
    }

    setSelectedWriter(writer);
    setAgreementModalVisible(true);
  };

  // NEW: Handle call completion for duration messages
  const handleCallCompleted = async ({ chatId, endedBy, duration }) => {
    console.log('📞 Call completed:', { chatId, endedBy, duration });
    
    if (selectedChat && chatId === selectedChat._id && duration > 0) {
      try {
        // Format duration like WhatsApp
        const formatCallDuration = (seconds) => {
          if (seconds < 60) {
            return `${seconds} second${seconds !== 1 ? 's' : ''}`;
          }
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          if (minutes < 60) {
            return remainingSeconds > 0 
              ? `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`
              : `${minutes} minute${minutes !== 1 ? 's' : ''}`;
          }
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
        };

        const formattedDuration = formatCallDuration(duration);
        const message = `📞 Video call ended • Duration: ${formattedDuration}`;
        
        // Send system message
        await sendChatMessage({
          chatId: selectedChat._id,
          content: message,
          type: 'system'
        });
        
        console.log('✅ Call duration message sent:', message);
      } catch (error) {
        console.error('❌ Failed to send call duration message:', error);
      }
    }
  };

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
          <>
        <HeaderComponent/>
        
        {/* Location Debug Bar */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            background: userLocation ? '#ecfdf5' : '#fef2f2', 
            padding: '8px 16px', 
            borderBottom: `1px solid ${userLocation ? '#10b981' : '#ef4444'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <EnvironmentOutlined style={{ color: userLocation ? '#059669' : '#dc2626' }} />
            <Text style={{ fontSize: '12px', color: userLocation ? '#065f46' : '#991b1b' }}>
              Student Location: {userLocation ? `${userLocation.flag} ${userLocation.country} (${userLocation.currency})` : 'Not detected yet...'}
            </Text>
          </div>
        )}
        
        {/* Assuming ChatHeader is used, not HeaderNoNotif */}
      
      {/* Mobile Sidebar Drawer */}
      <Drawer
        title="Chat History"
        placement="left"
        width={300}
        onClose={() => setMobileSidebarVisible(false)}
        open={mobileSidebarVisible}
        bodyStyle={{ padding: '16px' }}
      >
        {renderChatList()}
      </Drawer>
      
      <Layout style={{ height: 'calc(100vh - 64px)' }}> {/* Adjust height for header */}
        {isDesktop && (
          <Sider
            width={300}
            style={{
              background: '#fff',
              borderRight: '1px solid #f0f0f0',
              overflowY: 'auto',
              padding: '16px',
            }}
          >
            {renderChatList()}
          </Sider>
        )}

        <Content
          style={{
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {selectedChat ? (
            <>
              {/* Enhanced Chat Header with Location */}
              <ChatPartnerHeader
                partner={selectedChat.participants.find((p) => p._id !== user._id)}
                isOnline={onlineUsers.has(selectedChat.participants.find((p) => p._id !== user._id)?._id)}
                isTyping={otherUserTyping}
                showMobileMenu={!isDesktop}
                onMenuClick={() => setMobileSidebarVisible(true)}
                actions={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Video Call Button */}
                    {selectedChat && (
                      <VideoCallButton
                        socket={socket}
                        chatId={selectedChat._id}
                        userId={user._id}
                        userName={user.name}
                        otherUserId={selectedChat.participants.find((p) => p._id !== user._id)?._id}
                        otherUserName={selectedChat.participants.find((p) => p._id !== user._id)?.name}
                      />
                    )}
                    
                    {/* Actions Dropdown */}
                    <Dropdown overlay={chatActionsMenu} trigger={['click']} placement="bottomRight">
                      <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
                    </Dropdown>
                  </div>
                }
              />

              {/* Search Bar */}
              <div
                style={{
                  background: '#fff',
                  borderBottom: '1px solid #f0f0f0',
                  padding: '8px 16px',
                  position: 'sticky',
                  top: otherUserTyping ? 96 : 64,
                  zIndex: 1,
                }}
              >
                <div className="search-input-wrapper" style={{ position: 'relative', maxWidth: '280px' }}>
                  <SearchOutlined 
                    className="search-icon" 
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af',
                      fontSize: '16px',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults.length > 0) {
                        scrollToMessage(searchResults[0]._id);
                      }
                    }}
                    className="custom-search-input"
                    style={{
                      width: '100%',
                      height: '36px',
                      padding: '8px 40px 8px 40px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '16px',
                      fontSize: '14px',
                      background: 'white',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      color: '#374151'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {searchTerm && (
                    <button
                      className="clear-search-button"
                      onClick={() => setSearchTerm('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f3f4f6';
                        e.target.style.color = '#374151';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.color = '#9ca3af';
                      }}
                    >
                      <CloseOutlined style={{ fontSize: '12px' }} />
                    </button>
                  )}
                </div>
                {searchResults.length > 0 && (
                  <div
                    className="search-results-container"
                    style={{
                      background: 'white',
                      border: '1px solid #e1e5e9',
                      borderRadius: 16,
                      maxHeight: 200,
                      overflow: 'auto',
                      position: 'absolute',
                      zIndex: 10,
                      width: 320,
                      marginTop: 8,
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <div style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #f0f2f5',
                      background: 'linear-gradient(135deg, #667eea08 0%, #764ba208 100%)',
                      borderRadius: '16px 16px 0 0',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </div>
                    {searchResults.map((result, index) => (
                      <div
                        key={result._id}
                        className="search-result-item"
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          background: highlightedMsgId === result._id ? 
                            'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' : 
                            'white',
                          fontSize: '13px',
                          borderBottom: index < searchResults.length - 1 ? '1px solid #f0f2f5' : 'none',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                          borderRadius: '8px',
                          margin: '4px 8px'
                        }}
                        onClick={() => {
                          scrollToMessage(result._id);
                          setSearchTerm(''); // Clear search after selection
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #667eea08 0%, #764ba208 100%)';
                          e.target.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = highlightedMsgId === result._id ? 
                            'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' : 
                            'white';
                          e.target.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Avatar size={20} src={result.sender.avatar} style={{ flexShrink: 0 }}>
                            {result.sender.name[0]}
                          </Avatar>
                          <Text strong style={{ fontSize: '12px', color: '#374151' }}>
                            {result.sender.name}
                          </Text>
                          <Text style={{ fontSize: '11px', color: '#9ca3af', marginLeft: 'auto' }}>
                            {formatTime(result.timestamp)}
                          </Text>
                        </div>
                        <Text style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                          {result.content.length > 50
                            ? result.content.slice(0, 50) + '…'
                            : result.content}
                        </Text>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div className="messages-container" ref={messagesContainerRef} style={{ position: 'relative' }}>
                {/* Scroll to Bottom Button */}
                {showScrollToBottom && (
                  <button
                    onClick={scrollToBottomSmooth}
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      right: '20px',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#667eea',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                      transition: 'all 0.3s ease',
                      opacity: 0.9
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '1';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '0.9';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    ↓
                  </button>
                )}
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Spin size="large" />
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#888',
                      position: 'relative',
                    }}
                  >
                    {/* Mobile menu button for empty state */}
                    {!isDesktop && (
                      <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileSidebarVisible(true)}
                        style={{ 
                          position: 'absolute',
                          top: '16px',
                          left: '16px',
                          zIndex: 10
                        }}
                        size="large"
                      />
                    )}
                    <MessageOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                    <Text style={{ fontSize: '16px', color: '#666' }}>Select a chat to start messaging</Text>
                    {!isDesktop && (
                      <Text style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
                        Tap the menu button to view your conversations
                      </Text>
                    )}
                  </div>
                ) : (
                  <>
                    {chatMessages.map((msg) => {
                      return (
                        <EnhancedChatMessage
                          key={msg._id}
                          message={msg}
                          currentUserId={user._id}
                          isHighlighted={highlightedMsgId === msg._id}
                          onReply={handleReply}
                          onFileView={handleFileView}
                          onDownload={downloadFile}
                          renderMessageStatus={renderMessageStatus}
                          sendingMessages={sendingMessages}
                        />
                      );
                    })}
                        <div
                          key={msg._id}
                          id={`