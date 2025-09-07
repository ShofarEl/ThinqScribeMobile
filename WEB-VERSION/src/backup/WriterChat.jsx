// src/components/WriterChat.jsx

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
  Badge,
  Space,
  Dropdown,
  Menu,
  Modal,
  Empty,
  Card,
  notification,
  Drawer,
  Tag
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  SearchOutlined,
  CloseOutlined,
  MessageOutlined,
  SmileOutlined,
  UploadOutlined,
  PaperClipOutlined,
  DownloadOutlined,
  MoreOutlined,
  DashboardOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  BookOutlined,
  LoadingOutlined,
  MenuOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  FileImageOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Highlighter from 'react-highlight-words';


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
import HeaderComponent from '../components/HeaderComponent';

import ReviewAgreementModal from '../components/ReviewAgreementModal.jsx';
import { agreementApi } from '../api/agreement';
import CreateAgreementModal from '../components/CreateAgreementModal';
import FileViewer from '../components/FileViewer';
// Enhanced location and currency components
import EnhancedChatMessage from '../components/EnhancedChatMessage';
import ChatPartnerHeader from '../components/ChatPartnerHeader';
import WriterEarningsDisplay from '../components/WriterEarningsDisplay';
import { useCurrency } from '../hooks/useCurrency';

// Import the modern CSS styling
import './WriterChat.css';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const WriterChat = () => {
  const { chatId: routeChatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useNotifications();
  const { convertToUSD, formatCurrency, location: userLocation } = useCurrency();

  // ── Chat/List state ─────────────────────────────────────────────────────────
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  // ── New-message + Reply state ──────────────────────────────────────────────
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
  
  // ── Mobile sidebar state ─────────────────────────────────────────────────
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);

  // ── Agreement state ─────────────────────────────────────────────────────────
  const [pendingAgreements, setPendingAgreements] = useState([]);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [acceptingAgreement, setAcceptingAgreement] = useState(false);
  const [agreementBadgeCount, setAgreementBadgeCount] = useState(0);
  const [agreementListVisible, setAgreementListVisible] = useState(false);
  const [agreementModalVisible, setAgreementModalVisible] = useState(false);
  const [creatingAgreement, setCreatingAgreement] = useState(false);
  const formRef = useRef();
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  // ── 2) Track window width for responsive sidebar ───────────────────────────
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── 3) Listen for real-time incoming messages ──────────────────────────────
  useEffect(() => {
    if (!socket || !user) return;

    console.log('🔌 Setting up socket listeners for user:', user._id);

    const handleReceiveMessage = (data) => {
      console.log('📨 Received message:', data);
      
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

      // Only add messages from OTHER users (not current user) to prevent duplicates with optimistic UI
      if (data.message.sender._id !== user._id) {
        // If this message is for the currently selected chat, add it to messages
        if (selectedChat && data.chatId === selectedChat._id) {
          setChatMessages((prev) => {
            // Check if message already exists
            if (prev.some((msg) => msg._id === data.message._id)) {
              return prev;
            }
            const newMessages = [...prev, data.message];
            
            // Auto-scroll to bottom for new messages
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            
            return newMessages;
          });
        }
      }
    };

    const handleNewMessage = (data) => {
      console.log('📨 New message notification:', data);
      handleReceiveMessage(data);
    };

    const handleMessageSent = (data) => {
      console.log('✅ Message sent confirmation:', data);
      handleReceiveMessage(data);
    };

    const handleMessageError = (data) => {
      console.error('❌ Message error:', data);
      Msg.error(data.error || 'Failed to send message');
    };

    const handleTyping = ({ userId, userName, chatId }) => {
      if (selectedChat && selectedChat._id === chatId && userId !== user._id) {
        console.log('⌨️ User typing:', userName);
        setOtherUserTyping(true);
      }
    };

    const handleStopTyping = ({ userId, chatId }) => {
      if (selectedChat && selectedChat._id === chatId && userId !== user._id) {
        console.log('⏹️ User stopped typing');
        setOtherUserTyping(false);
      }
    };

    const handleConnectionStatus = () => {
      console.log('🔌 Socket connected:', socket.connected);
    };

    const handleJoinedUserRoom = (data) => {
      console.log('✅ Successfully joined user room:', data.userId);
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

    // Message read receipt handler
    const handleMessagesMarkedAsRead = ({ chatId, readBy }) => {
      if (selectedChat && chatId === selectedChat._id && readBy !== user._id) {
        setChatMessages(prev => prev.map(msg => 
          msg.sender._id === user._id ? { ...msg, read: true } : msg
        ));
      }
    };

    // Register all socket event listeners
    socket.on('messageBroadcast', handleReceiveMessage);
    socket.on('newMessage', handleNewMessage);
    socket.on('messageSent', handleMessageSent);
    socket.on('messageError', handleMessageError);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('connect', handleConnectionStatus);
    socket.on('disconnect', handleConnectionStatus);
    socket.on('joinedUserRoom', handleJoinedUserRoom);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('onlineStatuses', handleOnlineStatuses);
    socket.on('messagesRead', handleMessagesMarkedAsRead);

    return () => {
      console.log('🧹 Cleaning up socket listeners');
      socket.off('messageBroadcast', handleReceiveMessage);
      socket.off('newMessage', handleNewMessage);
      socket.off('messageSent', handleMessageSent);
      socket.off('messageError', handleMessageError);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('connect', handleConnectionStatus);
      socket.off('disconnect', handleConnectionStatus);
      socket.off('joinedUserRoom', handleJoinedUserRoom);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('onlineStatuses', handleOnlineStatuses);
      socket.off('messagesRead', handleMessagesMarkedAsRead);
    };
  }, [socket, user, selectedChat]);

  // ── 4) Fetch chat list (and pre-select from route) ─────────────────────────
  useEffect(() => {
    const fetchChats = async () => {
      setLoadingMessages(true);
      try {
        const data = await getChats();
        setChats(data || []);
        if (routeChatId) {
          const found = data.find((c) => c._id === routeChatId);
          if (found) setSelectedChat(found);
        }
        
        // Request current online statuses after chats are loaded
        setTimeout(() => {
          const allUserIds = (data || []).flatMap(chat => 
            chat.participants.filter(p => p._id !== user._id).map(p => p._id)
          );
          if (allUserIds.length > 0 && socket) {
            socket.emit('checkOnlineStatus', allUserIds);
          }
        }, 1000);
        
      } catch (err) {
        console.error('Failed to load chats:', err);
        Msg.error('Failed to load chats');
      } finally {
        setLoadingMessages(false);
      }
    };
    
    if (user && socket) {
      console.log('👤 Joining user room for:', user._id);
      socket.emit('joinUserRoom', user._id);
      fetchChats();
    }
  }, [routeChatId, user, socket]);

  // ── 5) Whenever selectedChat changes ▶︎ fetch its messages & join its room ─
  useEffect(() => {
    if (!selectedChat || !user || !socket) {
      setChatMessages([]);
      return;
    }
    
    console.log('💬 Selecting chat:', selectedChat._id);
    
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const msgs = await getChatMessages(selectedChat._id);
        setChatMessages(msgs || []);
        
        // Join the specific chat room for real-time updates
        console.log('🏠 Joining chat room:', selectedChat._id);
        socket.emit('joinChat', selectedChat._id);
        
        // Mark messages as read
        socket.emit('markMessagesAsRead', {
          chatId: selectedChat._id,
          userId: user._id,
        });
        
        // Auto-scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 200);
        
      } catch (err) {
        console.error('Failed to load messages:', err);
        Msg.error('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
    
    return () => {
      console.log('👋 Leaving chat room:', selectedChat._id);
      socket.emit('leaveChat', selectedChat._id);
    };
  }, [selectedChat, user, socket]);

  // ── 6) Scroll to bottom whenever chatMessages changes ─────────────────────
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // ── 7) Track scroll position for scroll-to-bottom button ───────────────────
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

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // ── 8) Handle selecting a chat in the sidebar ─────────────────────────────
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setOtherUserTyping(false);
    if (!isDesktop) {
        setMobileSidebarVisible(false); // Close sidebar on selection
        navigate(`/chat/writer/${chat._id}`);
    } else {
        navigate(`/chat/writer/${chat._id}`);
    }
  };

  // ── 9) Send message handler - WhatsApp Style (INSTANT UI) ──────────────────
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
      
      // Track sending state for each message and upload files in background (non-blocking)
      optimisticMessages.forEach((optimisticMsg, i) => {
        setSendingMessages(prev => new Set([...prev, optimisticMsg._id]));
        uploadFileInBackground(optimisticMsg, messageContent, replyToMessage);
      });
      
      // Auto-scroll immediately
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 10);
      
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
    if (e.key === 'Enter' && !e.shiftKey) {
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

  // ── 10) Handle "Reply" clicks ─────────────────────────────────────────────
  const handleReply = (msg) => {
    setReplyingTo(msg);
  };
  const cancelReply = () => {
    setReplyingTo(null);
  };

  // ── 11) Search logic ──────────────────────────────────────────────────────
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
      setTimeout(() => setHighlightedMsgId(null), 1500);
    }
  };

  // ── 13) Typing indicator: user is typing ──────────────────────────────────
  const handleTyping = () => {
    if (!selectedChat) return;
    socket.emit('typing', {
      chatId: selectedChat._id,
      userId: user._id,
      userName: user.name,
    });
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    typingTimeout.current = setTimeout(() => {
      socket.emit('stopTyping', {
        chatId: selectedChat._id,
        userId: user._id,
      });
    }, 1500);
  };

  // ── 14) Set up / tear down the emoji-picker-element event listener ─────────
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

  // ── Download helper for cross-origin S3 links ─────────────────────────────
  const downloadFile = async (url, fileName) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName || url.split('/').pop().split('?')[0];
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Download failed:', err);
      Msg.error({
        message: 'Download Failed',
        description: 'Download failed',
        type: 'error'
      });
    }
  };

  // ── File viewer handler ─────────────────────────────────────────────────────
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

  // ── Chat Actions Menu ─────────────────────────────────────────────────────
  const chatActionsMenu = (
    <Menu>
        <Menu.Item
            key="pendingAgreements"
            icon={<FileTextOutlined />}
            onClick={() => setAgreementListVisible(true)}
        >
            <Badge count={agreementBadgeCount} size="small" style={{ marginRight: 8 }}>
                Pending Agreements
            </Badge>
        </Menu.Item>
    </Menu>
  );

  // ── Sidebar: render list of chats ─────────────────────────────────────────
  const renderChatList = () => (
    <div className="writer-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="header-content">
          <div className="header-icon">
            <MessageOutlined />
          </div>
          <div className="header-text">
            <h3>Student Chats</h3>
            <p>Manage your conversations</p>
          </div>
        </div>
      </div>
      
      {/* Instructions Card */}
      <div className="sidebar-info">
        <div className="info-card">
          <div className="info-icon">
            <InfoCircleOutlined />
          </div>
          <div className="info-content">
            <h4>Writer Dashboard</h4>
            <ul>
              <li>Assist students with assignments</li>
              <li>Manage service agreements</li>
              <li>Review and accept projects</li>
              <li>Track your earnings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="chat-list-container">
        {loadingMessages ? (
          <div className="loading-state">
            <Spin size="large" />
            <p>Loading conversations...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="empty-state">
            <MessageOutlined className="empty-icon" />
            <h4>No conversations yet</h4>
            <p>Wait for students to contact you for assistance</p>
          </div>
        ) : (
          <div className="chat-list">
            {filteredChats.map((chat) => {
              const other = chat.participants?.find((p) => p._id !== user._id) || {};
              const lastMsg = chat.messages?.length > 0 ? chat.messages[chat.messages.length - 1] : null;
              const hasUnread = chat.messages?.some(msg => msg.sender._id !== user._id && msg.read === false);
              const isSelected = selectedChat?._id === chat._id;

              return (
                <div
                  key={chat._id}
                  className={`chat-item ${isSelected ? 'selected' : ''} ${hasUnread ? 'unread' : ''}`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="chat-avatar">
                    <Avatar
                      size={44}
                      src={other.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${other.name}`}
                      icon={<UserOutlined />}
                      className="avatar"
                    />
                    {hasUnread ? (
                      <div className="unread-badge" />
                    ) : (
                      <div className={`status-indicator ${onlineUsers.has(other._id) ? 'online' : 'offline'}`} />
                    )}
                  </div>
                  
                  <div className="chat-content">
                    <div className="chat-header">
                      <div className="name-section">
                        <span className="name">{other.name || 'Unknown User'}</span>
                        <span className={`role-badge ${other.role || 'student'}`}>
                          {other.role === 'student' ? 'Student' : 'Writer'}
                        </span>
                      </div>
                      <div className="meta-section">
                        {lastMsg && (
                          <span className="timestamp">{formatTime(lastMsg.timestamp)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="chat-preview">
                      {lastMsg ? (
                        <div className="last-message">
                          {lastMsg.sender._id === user._id && <span className="you-label">You: </span>}
                          {lastMsg.fileUrl ? (
                            <span className="file-message">
                              <PaperClipOutlined />
                              {lastMsg.fileType?.startsWith('image/') ? 'Image' : 
                               lastMsg.fileType?.startsWith('video/') ? 'Video' :
                               lastMsg.fileType?.startsWith('audio/') ? 'Audio' : 'File'}
                              {lastMsg.content && `: ${lastMsg.content.substring(0, 25)}...`}
                            </span>
                          ) : (
                            <span className="text-message">
                              {lastMsg.content?.substring(0, 45)}{lastMsg.content?.length > 45 ? '...' : ''}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="no-messages">No messages yet</div>
                      )}
                      
                      {other.studyLevel && (
                        <div className="study-level">
                          <span className="level-tag">{other.studyLevel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ── Agreement Functions ────────────────────────────────────────────────────
  const renderAgreementsList = () => {
    if (!agreementListVisible) return null;

    return (
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextOutlined style={{ color: '#015382' }} />
            <span>Pending Agreements ({pendingAgreements.length})</span>
          </div>
        }
        open={agreementListVisible}
        onCancel={() => setAgreementListVisible(false)}
        footer={null}
        width={700}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {pendingAgreements.length === 0 ? (
            <Empty 
              description="No pending agreements" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={pendingAgreements}
              renderItem={(agreement) => (
                <List.Item
                  key={agreement._id}
                  style={{
                    border: '1px solid #e8e8e8',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    padding: '16px',
                    background: '#f8fafc'
                  }}
                  actions={[
                    <Button
                      type="primary"
                      onClick={() => {
                        setSelectedAgreement(agreement);
                        setReviewModalVisible(true);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #015382 0%, #017DB0 100%)',
                        border: 'none'
                      }}
                    >
                      Review & Accept
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        src={agreement.student?.avatar}
                        icon={<UserOutlined />}
                        size="large"
                        style={{ backgroundColor: '#3b82f6' }}
                      />
                    }
                    title={
                      <div>
                        <Text strong style={{ fontSize: '16px' }}>
                          {agreement.projectDetails?.title}
                        </Text>
                        <Tag color="blue" style={{ marginLeft: '8px' }}>
                          ${agreement.totalAmount}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text style={{ color: '#666' }}>
                          From: {agreement.student?.name}
                        </Text>
                        <br />
                        <Text style={{ color: '#666', fontSize: '12px' }}>
                          Subject: {agreement.projectDetails?.subject}
                        </Text>
                        <br />
                        <Text style={{ color: '#666', fontSize: '12px' }}>
                          Deadline: {moment(agreement.projectDetails?.deadline).format('MMM DD, YYYY')}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </Modal>
    );
  };

  const handleAcceptAgreement = async (agreementId) => {
    setAcceptingAgreement(true);
    try {
      const result = await agreementApi.acceptAgreement(agreementId);
      
      notification.success({
        message: 'Agreement Accepted',
        description: 'You have successfully accepted the agreement. Redirecting to order page.',
        placement: 'bottomRight'
      });

      // Remove from pending agreements
      setPendingAgreements(prev => prev.filter(a => a._id !== agreementId));
      setAgreementBadgeCount(prev => Math.max(0, prev - 1));
      
      // Close modals
      setReviewModalVisible(false);
      setSelectedAgreement(null);
      
      // Navigate to the order page
      if (result.orderId) {
        navigate(`/orders/${result.orderId}`);
      }
    } catch (error) {
      console.error('Error accepting agreement:', error);
      notification.error({
        message: 'Failed to Accept Agreement',
        description: error.response?.data?.message || 'An error occurred while accepting the agreement.',
        placement: 'bottomRight'
      });
    } finally {
      setAcceptingAgreement(false);
    }
  };

  const handleCreateAgreement = async (agreementData) => {
    setCreatingAgreement(true);
    try {
      // Find the student from the selected chat participants
      const student = selectedChat?.participants.find(p => p.role === 'student');
      if (!student || !student._id) {
        notification.error({
          message: 'Cannot Create Agreement',
          description: 'Student not found in chat or student ID is missing.',
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
        studentId: student._id,
        chatId: selectedChat._id
      };

      // Create the agreement
      const response = await agreementApi.createAgreement(formattedData);

      // Close modal and show success message
      setAgreementModalVisible(false);
      notification.success({
        message: 'Agreement Created',
        description: 'Agreement has been created and sent to the student.',
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

  // ── Message Status Indicators (WhatsApp-style) ──────────────────────────────
  const renderMessageStatus = (msg) => {
    const isCurrentUser = msg.sender._id === user._id;
    if (!isCurrentUser) return null; // Only show status for sent messages

    const status = messageStatuses.get(msg._id) || 'sent';
    const isSending = sendingMessages.has(msg._id) || msg.isOptimistic || msg.isUploading;

    if (isSending) {
      return (
        <span style={{ marginLeft: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
          <LoadingOutlined />
        </span>
      );
    }

    if (msg.sendError || msg.uploadError) {
        return (
            <span style={{ marginLeft: '4px', fontSize: '10px', color: '#ef4444' }}>
                <ExclamationCircleOutlined />
            </span>
        );
    }

    switch (status) {
      case 'sent':
        return (
          <span style={{ marginLeft: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            ✓
          </span>
        );
      case 'delivered':
        return (
          <span style={{ marginLeft: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            ✓✓
          </span>
        );
      case 'read':
        return (
          <span style={{ marginLeft: '4px', fontSize: '12px', color: '#60a5fa' }}>
            ✓✓
          </span>
        );
      default:
        return null;
    }
  };
  
    // Use chatMessages by default since we have real-time filtering through UI


  // ── Main component JSX ─────────────────────────────────────────────────────────
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
            Writer Location: {userLocation ? `${userLocation.flag} ${userLocation.country} (USD standard)` : 'Not detected yet...'}
          </Text>
        </div>
      )}
      
      {/* Mobile Sidebar Drawer */}
      <Drawer
        title="Conversations"
        placement="left"
        width={300}
        onClose={() => setMobileSidebarVisible(false)}
        open={mobileSidebarVisible}
        bodyStyle={{ padding: 0 }}
      >
        {renderChatList()}
      </Drawer>
      
      <Layout style={{ height: 'calc(100vh - 64px)' }}>
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

        <Layout style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                  <Space>
                    <Dropdown overlay={chatActionsMenu} trigger={['click']} placement="bottomRight">
                      <Button type="text" shape="circle" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
                    </Dropdown>
                  </Space>
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
              <Content className="messages-container" ref={messagesContainerRef}>
                {showScrollToBottom && !searchTerm && (
                  <Button
                    shape="circle"
                    icon={<DownloadOutlined style={{ transform: 'rotate(180deg)' }}/>}
                    onClick={scrollToBottomSmooth}
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      right: '20px',
                      zIndex: 10,
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                )}
                
                {loadingMessages ? (
                  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                    <Spin size="large" />
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="empty-chat">
                     {searchTerm ? (
                        <>
                            <SearchOutlined className="empty-chat-icon" />
                            <h3>No Results Found</h3>
                            <p>No messages matched your search for "{searchTerm}".</p>
                        </>
                    ) : (
                        <>
                            <MessageOutlined className="empty-chat-icon" />
                            <h3>No messages yet</h3>
                            <p>Start the conversation with your student.</p>
                        </>
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
                          id={`msg-${msg._id}`}
                          className={`message-wrapper ${isCurrentUser ? 'own-message' : 'other-message'} ${
                            highlightedMsgId === msg._id ? 'highlighted' : ''
                          }`}
                        >
                          <div className="message-content-row">
                            {!isCurrentUser && (
                              <Avatar
                                size={32}
                                src={
                                  msg.sender.avatar ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${msg.sender.name}`
                                }
                                icon={<UserOutlined />}
                                className="message-avatar"
                              />
                            )}

                            <div className="message-bubble-container">
                                <div className={`message-bubble ${isCurrentUser ? 'own-bubble' : 'other-bubble'}`}>
                                  {/* Quoted reply */}
                                  {repliedMsg && (
                                    <div 
                                      className="reply-preview"
                                      onClick={() => scrollToMessage(repliedMsg._id)}
                                    >
                                      <Text strong style={{ fontSize: '11px', color: isCurrentUser ? 'rgba(255,255,255,0.9)' : '#015382' }}>
                                        {repliedMsg.sender.name}
                                      </Text>
                                      <br />
                                      <Text style={{ fontSize: '12px', color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#374151' }}>
                                        {repliedMsg.content.length > 60
                                          ? repliedMsg.content.slice(0, 60) + '…'
                                          : repliedMsg.content}
                                      </Text>
                                    </div>
                                  )}

                                  {/* Message content */}
                                  {(() => {
                                    if (msg.fileUrl) {
                                      const fileType = msg.fileType || '';
                                      const fileName = msg.fileName || 'Unknown file';
                                      
                                      if (fileType.startsWith('image/')) {
                                        return (
                                          <div className="image-message">
                                            <img
                                              src={msg.fileUrl}
                                              alt={fileName}
                                              style={{
                                                maxWidth: '280px',
                                                maxHeight: '200px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                objectFit: 'cover'
                                              }}
                                              onClick={() => handleFileView(msg)}
                                            />
                                            {msg.content && !msg.content.startsWith('File: ') && (
                                              <div className="message-text" style={{marginTop: '8px'}}>
                                                {searchTerm ? (
                                                  <Highlighter
                                                    highlightClassName="search-highlight"
                                                    searchWords={[searchTerm]}
                                                    autoEscape={true}
                                                    textToHighlight={msg.content}
                                                  />
                                                ) : (
                                                  msg.content
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div className="file-message-container" onClick={() => handleFileView(msg)}>
                                            <div style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '12px',
                                              padding: '12px',
                                              border: `1px solid ${isCurrentUser ? 'rgba(255,255,255,0.2)' : '#e5e7eb'}`,
                                              borderRadius: '8px',
                                              backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.1)' : '#f9fafb',
                                              maxWidth: '300px'
                                            }}>
                                              <FileOutlined style={{ 
                                                fontSize: '20px', 
                                                color: isCurrentUser ? 'white' : '#015382'
                                              }} />
                                              <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                  fontSize: '14px',
                                                  fontWeight: 500,
                                                  color: isCurrentUser ? 'white' : '#1f2937',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  whiteSpace: 'nowrap'
                                                }}>
                                                  {fileName}
                                                </div>
                                                <div style={{
                                                  fontSize: '12px',
                                                  color: isCurrentUser ? 'rgba(255,255,255,0.7)' : '#6b7280'
                                                }}>
                                                  Click to view
                                                </div>
                                              </div>
                                              <DownloadOutlined 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  downloadFile(msg.fileUrl, fileName);
                                                }}
                                                style={{
                                                  color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#015382',
                                                  cursor: 'pointer'
                                                }}
                                              />
                                            </div>
                                            {msg.content && !msg.content.startsWith('File: ') && (
                                              <div className="message-text" style={{ marginTop: '8px' }}>
                                                {searchTerm ? (
                                                  <Highlighter
                                                    highlightClassName="search-highlight"
                                                    searchWords={[searchTerm]}
                                                    autoEscape={true}
                                                    textToHighlight={msg.content}
                                                  />
                                                ) : (
                                                  msg.content
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }
                                    }
                                    
                                    return (
                                      <div className="message-text">
                                        {searchTerm ? (
                                          <Highlighter
                                            highlightClassName="search-highlight"
                                            searchWords={[searchTerm]}
                                            autoEscape={true}
                                            textToHighlight={msg.content}
                                          />
                                        ) : (
                                          msg.content
                                        )}
                                      </div>
                                    );
                                  })()}

                                  <div className="message-time">
                                    {formatTime(msg.timestamp)}
                                    {renderMessageStatus(msg)}
                                  </div>
                                </div>
                            </div>

                            <Button
                              icon={<MessageOutlined />}
                              size="small"
                              type="text"
                              onClick={() => handleReply(msg)}
                              className="reply-button"
                            />
                          </div>
                        </div>
                      );
                    })}
                    
                    {otherUserTyping && (
                      <div className="message-wrapper other-message">
                         <div className="message-content-row">
                            <Avatar
                                size={32}
                                src={selectedChat.participants.find(p => p._id !== user._id)?.avatar}
                                icon={<UserOutlined />}
                                className="message-avatar"
                            />
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </>
                )}
              </Content>

              {/* Input Area */}
              <div className="chat-input-area" style={{
                background: '#f9fafb',
                borderTop: '1px solid #e5e7eb',
                padding: '12px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 -2px 8px rgba(0,0,0,0.03)',
              }}>
                {/* Reply Banner */}
                {replyingTo && (
                  <div className="reply-banner">
                    <div className="reply-content">
                      <Text strong style={{ fontSize: '12px', color: '#667eea' }}>
                        Replying to {replyingTo.sender.name}
                      </Text>
                      <Text style={{ fontSize: '13px', color: '#6b7280', display: 'block' }}>
                        {replyingTo.content.length > 64
                          ? replyingTo.content.slice(0, 64) + '…'
                          : replyingTo.content}
                      </Text>
                    </div>
                    <Button
                      icon={<CloseOutlined />}
                      size="small"
                      onClick={cancelReply}
                      type="text"
                      style={{ color: '#6b7280' }}
                    />
                  </div>
                )}
                
                {fileToSend && uploadList.length > 0 && (
                  <div className="files-upload-preview" style={{
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    margin: '8px 0'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#667eea'
                    }}>
                      <PaperClipOutlined style={{ fontSize: 16, marginRight: '6px' }} />
                      {uploadList.length} file{uploadList.length > 1 ? 's' : ''} selected
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {uploadList.map((file, index) => (
                        <div key={file.uid} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '6px 8px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0'
                        }}>
                          {/* File icon based on type */}
                          {file.file?.type?.startsWith('image/') && <FileImageOutlined style={{ fontSize: 14, color: '#10b981', marginRight: '8px' }} />}
                          {file.file?.type?.startsWith('video/') && <VideoCameraOutlined style={{ fontSize: 14, color: '#f59e0b', marginRight: '8px' }} />}
                          {file.file?.type?.startsWith('audio/') && <AudioOutlined style={{ fontSize: 14, color: '#8b5cf6', marginRight: '8px' }} />}
                          {file.file?.type?.includes('pdf') && <FilePdfOutlined style={{ fontSize: 14, color: '#ef4444', marginRight: '8px' }} />}
                          {!file.file?.type?.startsWith('image/') && !file.file?.type?.startsWith('video/') && 
                           !file.file?.type?.startsWith('audio/') && !file.file?.type?.includes('pdf') && 
                           <FileOutlined style={{ fontSize: 14, color: '#6b7280', marginRight: '8px' }} />}
                          
                          <Text style={{ 
                            flex: 1, 
                            fontSize: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {file.name}
                          </Text>
                          
                          <Text style={{ 
                            fontSize: '11px', 
                            color: '#6b7280',
                            marginLeft: '8px'
                          }}>
                            {file.file ? `${(file.file.size / 1024 / 1024).toFixed(1)}MB` : ''}
                          </Text>
                          
                          <Button
                            type="text"
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={() => {
                              // Remove this specific file
                              const updatedList = uploadList.filter(f => f.uid !== file.uid);
                              setUploadList(updatedList);
                              
                              if (Array.isArray(fileToSend)) {
                                const updatedFiles = fileToSend.filter(f => f.name !== file.name);
                                setFileToSend(updatedFiles.length > 0 ? updatedFiles : null);
                              } else {
                                setFileToSend(null);
                              }
                            }}
                            style={{ 
                              fontSize: '12px',
                              padding: '2px',
                              marginLeft: '4px'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* Clear all button */}
                    {uploadList.length > 1 && (
                      <Button
                        type="text"
                        size="small"
                        onClick={() => {
                          setFileToSend(null);
                          setUploadList([]);
                        }}
                        style={{ 
                          marginTop: '8px',
                          fontSize: '12px',
                          color: '#ef4444'
                        }}
                      >
                        Clear All ({uploadList.length})
                      </Button>
                    )}
                  </div>
                )}

                <div className="input-wrapper" style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: 600,
                  background: '#fff',
                  borderRadius: 24,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  padding: '6px 12px',
                  border: '1px solid #e5e7eb',
                  margin: '0 auto',
                }}>
                  {/* Emoji picker */}
                  <Popover
                    content={
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: 12,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                          width: 360,
                          height: 440,
                          padding: '8px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px',
                          }}
                        >
                          <Text strong style={{ fontSize: 16 }}>
                            Emoji
                          </Text>
                          <Button
                            icon={<CloseOutlined />}
                            size="small"
                            type="text"
                            onClick={() => setEmojiVisible(false)}
                          />
                        </div>
                        <div
                          style={{
                            flex: 1,
                            borderRadius: '8px',
                            overflow: 'hidden',
                          }}
                        >
                          <emoji-picker
                            ref={emojiPickerRef}
                            style={{
                              width: '100%',
                              height: '100%',
                              '--picker-background': '#fafafa',
                              '--categories-background': '#ffffff',
                              '--emoji-size': '30px',
                              '--emoji-padding': '8px',
                              '--category-button-background-hover': 'rgba(102,126,234,0.15)',
                              '--category-button-background-active': 'rgba(102,126,234,0.2)',
                              '--category-button-border-radius': '6px',
                              '--category-button-size': '36px',
                              '--header-background': '#ffffff',
                              '--header-border-color': '#e5e7eb',
                            }}
                          ></emoji-picker>
                        </div>
                      </div>
                    }
                    trigger="click"
                    visible={emojiVisible}
                    onVisibleChange={(vis) => setEmojiVisible(vis)}
                    placement="topLeft"
                    overlayStyle={{ borderRadius: 12, overflow: 'hidden' }}
                  >
                    <button className="action-button">
                      <SmileOutlined style={{ fontSize: 20, color: '#6b7280' }} />
                    </button>
                  </Popover>

                  {/* Text input */}
                  <textarea
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="custom-chat-input"
                    rows={1}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      resize: 'none',
                      fontSize: '15px',
                      lineHeight: '1.5',
                      flex: 1,
                      height: '26px',
                      padding: '0 8px',
                      color: '#374151',
                      fontFamily: 'inherit',
                      overflow: 'hidden',
                      minWidth: 0,
                      maxWidth: 400,
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                    }}
                  />

                  <div className="input-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Upload button */}
                    <Upload
                      accept="image/*,video/*,audio/*,.mp4,.mov,.avi,.wmv,.mkv,.webm,.3gp,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.zip,.rar,.7z"
                      fileList={uploadList}
                      beforeUpload={(file) => {
                        console.log('🔍 File selected:', {
                          name: file.name,
                          type: file.type,
                          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                          extension: file.name.split('.').pop()
                        });

                        // Validate file size (max 350MB for videos, 20MB for others)
                        const maxSize = file.type.startsWith('video/') ? 350 : 20;
                        const isValidSize = file.size / 1024 / 1024 < maxSize;
                        if (!isValidSize) {
                          console.error('❌ File too large:', file.name, `${(file.size / 1024 / 1024).toFixed(2)}MB`, `Max: ${maxSize}MB`);
                          Msg.error(`File must be smaller than ${maxSize}MB!`);
                          return false;
                        }
                        
                        // Comprehensive file type validation with more video formats
                        const allowedTypes = [
                          // Images
                          'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
                          // Videos - Extended list
                          'video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/wmv', 'video/flv', 'video/webm', 'video/3gp', 'video/quicktime',
                          'video/x-msvideo', 'video/x-ms-wmv', 'video/x-flv', 'video/x-matroska', 'video/mp2t', 'video/3gpp', 'video/3gpp2',
                          // Audio
                          'audio/mp3', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/ogg', 'audio/mpeg', 'audio/m4a', 'audio/wma',
                          'audio/x-wav', 'audio/x-aac', 'audio/x-flac', 'audio/x-m4a',
                          // Documents
                          'application/pdf', 
                          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                          'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                          'text/plain', 'text/csv', 'application/rtf',
                          // Archives
                          'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip'
                        ];
                        
                        // More flexible validation - allow any video/audio/image type OR specific types
                        const isValidType = allowedTypes.includes(file.type) || 
                                            file.type.startsWith('image/') || 
                                            file.type.startsWith('video/') || 
                                            file.type.startsWith('audio/');
                        
                        console.log('🔍 File validation:', {
                          type: file.type,
                          isValidType,
                          startsWith: {
                            image: file.type.startsWith('image/'),
                            video: file.type.startsWith('video/'),
                            audio: file.type.startsWith('audio/')
                          }
                        });
                        
                        // Fallback validation for files without proper MIME types
                        const fileExtension = file.name.split('.').pop().toLowerCase();
                        const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm', '3gp', 'flv', 'm4v'];
                        const audioExtensions = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma'];
                        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
                        
                        const isVideoByExtension = videoExtensions.includes(fileExtension);
                        const isAudioByExtension = audioExtensions.includes(fileExtension);
                        const isImageByExtension = imageExtensions.includes(fileExtension);
                        
                        // Enhanced validation with extension fallback
                        const isValidTypeEnhanced = isValidType || isVideoByExtension || isAudioByExtension || isImageByExtension;
                        
                        console.log('🔍 Enhanced validation:', {
                          originalValidation: isValidType,
                          extension: fileExtension,
                          isVideoByExtension,
                          isAudioByExtension,
                          isImageByExtension,
                          finalValidation: isValidTypeEnhanced
                        });
                        
                        if (!isValidTypeEnhanced) {
                          console.error('❌ File type not supported:', file.type, 'Extension:', fileExtension);
                          Msg.error(`File type not supported! File type: ${file.type || 'unknown'}, Extension: .${fileExtension}. Please upload images, videos, audio, documents, or archives.`);
                          return false;
                        }
                        
                        console.log('✅ File validation passed, adding to list');
                        
                        // Handle multiple files
                        const newFile = {
                          uid: file.uid || Date.now() + Math.random(),
                          name: file.name,
                          status: 'done',
                          url: URL.createObjectURL(file),
                          file: file
                        };
                        
                        // Add to existing files array
                        setUploadList(prev => {
                          const updated = [...prev, newFile];
                          console.log('📎 Upload list updated:', updated.length, 'files');
                          return updated;
                        });
                        
                        // Update files to send (convert to array if needed)
                        setFileToSend(prev => {
                          let result;
                          if (Array.isArray(prev)) {
                            result = [...prev, file];
                          } else {
                            result = prev ? [prev, file] : [file];
                          }
                          console.log('📎 Files to send updated:', result.length, 'files');
                          return result;
                        });
                        
                        console.log('📎 File processing complete:', file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`);
                        return false; // Prevent auto upload
                      }}
                      onRemove={(file) => {
                        // Remove from upload list
                        setUploadList(prev => prev.filter(f => f.uid !== file.uid));
                        
                        // Remove from files to send
                        setFileToSend(prev => {
                          if (Array.isArray(prev)) {
                            const updatedFiles = prev.filter(f => f.name !== file.name);
                            return updatedFiles.length > 0 ? updatedFiles : null;
                          } else {
                            return null;
                          }
                        });
                      }}
                      showUploadList={false}
                      multiple={true}
                    >
                      <button className="action-button" title="Upload File">
                        <PaperClipOutlined style={{ fontSize: 20, color: '#6b7280' }} />
                      </button>
                    </Upload>

                    {/* Send button - Always enabled for rapid sending */}
                    <button
                      className="action-button send-button"
                      onClick={handleSend}
                      disabled={false}
                      style={{
                        background: 'linear-gradient(135deg, #015382 0%, #017DB0 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(1,83,130,0.10)',
                        marginLeft: 4,
                        transition: 'all 0.2s',
                      }}
                    >
                      <SendOutlined style={{ fontSize: 20 }} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-chat">
                {!isDesktop && (
                <Button
                    type="text"
                    icon={<MenuOutlined />}
                    onClick={() => setMobileSidebarVisible(true)}
                    style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10 }}
                    size="large"
                />
                )}
                <MessageOutlined className="empty-chat-icon" />
                <h3>Select a chat</h3>
                <p>Choose a conversation from the sidebar to start messaging.</p>
            </div>
          )}
        </Layout>
      </Layout>

      {/* Modals */}
      {renderAgreementsList()}

      <ReviewAgreementModal
        visible={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          setSelectedAgreement(null);
        }}
        agreement={selectedAgreement}
        onAccept={handleAcceptAgreement}
        loading={acceptingAgreement}
      />

      <CreateAgreementModal
        visible={agreementModalVisible}
        onCancel={() => {
          setAgreementModalVisible(false);
          setSelectedStudent(null);
        }}
        onSubmit={handleCreateAgreement}
        loading={creatingAgreement}
        student={selectedStudent}
        ref={formRef}
      />

      {/* File Viewer Modal */}
      <FileViewer
        visible={fileViewerVisible}
        onClose={closeFileViewer}
        fileUrl={selectedFile.url}
        fileName={selectedFile.name}
        fileType={selectedFile.type}
        fileSize={selectedFile.size}
        content={selectedFile.content}
      />
    </>
  );
};

export default WriterChat;