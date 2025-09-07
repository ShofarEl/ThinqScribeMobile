// src/components/WriterChat.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  List,
  Input,
  Button,
  Avatar,
  Spin,
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
  Tag,
  Tooltip
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
  FileTextOutlined,
  InfoCircleOutlined,
  BookOutlined,
  LoadingOutlined,
  MenuOutlined,
  LeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  FileImageOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  PlusOutlined,
  DashboardOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';

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
import { useCall } from '../context/CallContext';
// Main header removed inside chat pages to maximize chat area

import ReviewAgreementModal from '../components/ReviewAgreementModal.jsx';
import { agreementApi } from '../api/agreement';
import FileViewer from '../components/FileViewer';
import VoiceRecorder from '../components/VoiceRecorder.jsx';
import VoiceWaveform from '../components/VoiceWaveform.jsx';

// Import premium Writer chat CSS
import './WriterChat.css';

const { Sider, Content } = Layout;
// Removed Typography usage; using Tailwind-styled elements instead
const { TextArea } = Input;

const WriterChat = () => {
  const { chatId: routeChatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket, setActiveChatId } = useNotifications();
  const { startCall } = useCall();

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

      // Only add messages from OTHER users (not current user) to prevent duplicates with optimistic UI
      if (data.message.sender._id !== user._id) {
        // If this message is for the currently selected chat, add it to messages
        if (selectedChat && data.chatId === selectedChat._id) {
          setChatMessages((prev) => {
            // Check if message already exists
            if (prev.some((msg) => msg._id === data.message._id)) {
              return prev;
            }
            const newMessages = [...prev, { ...data.message, read: true }];
            
            // Auto-scroll to bottom for new messages
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            
            return newMessages;
          });

          // Immediately mark as read when viewing the chat
          socket.emit('markMessagesAsRead', {
            chatId: selectedChat._id,
            userId: user._id,
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
              const isFromOther = data.message?.sender?._id !== user._id;
              const toAppend = selectedChat && data.chatId === selectedChat._id && isFromOther
                ? { ...data.message, read: true }
                : data.message;
              return {
                ...chat,
                messages: [...(chat.messages || []), toAppend],
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
        // Flag current user's sent messages as read in UI
        setChatMessages(prev => prev.map(msg =>
          msg.sender._id === user._id ? { ...msg, read: true } : msg
        ));
        // Update status map for checkmarks
        setMessageStatuses(prev => {
          const updated = new Map(prev);
          for (const msg of chatMessages) {
            if (msg.sender._id === user._id) {
              updated.set(msg._id, 'read');
            }
          }
          return updated;
        });
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
    socket.on('messagesRead', handleMessagesMarkedAsRead);
    socket.on('joinedUserRoom', handleJoinedUserRoom);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('onlineStatuses', handleOnlineStatuses);

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
      socket.off('messagesRead', handleMessagesMarkedAsRead);
      socket.off('joinedUserRoom', handleJoinedUserRoom);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('onlineStatuses', handleOnlineStatuses);
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
      setActiveChatId && setActiveChatId(null);
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
        setActiveChatId && setActiveChatId(selectedChat._id);
        
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
      setActiveChatId && setActiveChatId(null);
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
        replyTo: replyToMessage?._id,
        voiceDuration: file && file.type && file.type.startsWith('audio/') ? Math.round((file.duration || 0)) : undefined
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
      {selectedChat && selectedChat.participants.some(p => p.role === 'student') && (
        <Menu.Item
          key="createAgreement"
          icon={<PlusOutlined />}
          onClick={() => {
            const student = selectedChat.participants.find(p => p.role === 'student');
            if (student?._id) {
              navigate(`/agreements/create?chatId=${selectedChat._id}&studentId=${student._id}`);
            }
          }}
        >
          Create Agreement
        </Menu.Item>
      )}
    </Menu>
  );

  // ── Sidebar: render list of chats ─────────────────────────────────────────
  const renderChatList = () => (
    <div className="professional-chat-sidebar" style={{ color: '#fff' }}>
      <div className="chat-sidebar-header" style={{ color: '#fff' }}>
        <h3 className="m-0 text-[20px] font-semibold" style={{ color: '#fff' }}>Student Conversations</h3>
        <p className="text-[14px] mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>Chat with students</p>
        
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
            fontSize: '13px',
            color: '#fff'
          }}
          size="small"
        />
      </div>
      
      <div className="chat-instructions" style={{ color: '#fff' }}>
        <Card size="small" style={{ marginBottom: '16px', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', background: 'rgba(255,255,255,0.10)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#3b82f6', marginTop: '2px' }} />
            <div>
              <p className="text-[13px] font-semibold" style={{ color: '#fff' }}>Writer Dashboard:</p>
              <p className="text-[12px] leading-relaxed mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
                1. Chat with students about their projects<br/>
                2. Review and accept service agreements<br/>
                3. Create agreements for new projects<br/>
                4. Manage ongoing project communications
              </p>
            </div>
          </div>
        </Card>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={filteredChats}
        loading={loadingMessages}
        locale={{ emptyText: <span>No conversations yet</span> }}
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
                        backgroundColor: other.role === 'student' ? '#3b82f6' : '#52c41a',
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
                        text={other.role === 'student' ? 'Student' : 'Writer'}
                        style={{
                          backgroundColor: other.role === 'student' ? '#dbeafe' : '#dcfce7',
                          color: other.role === 'student' ? '#1e40af' : '#166534',
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
                    <p className="text-[13px] text-gray-600 truncate">
                      {lastMsg.sender._id === user._id ? 'You: ' : ''}{lastMsg.content}
                    </p>
                  )
                }
              />
            </List.Item>
          );
        }}
      />
    </div>
  );

  // ── Agreement Functions ────────────────────────────────────────────────────
  const renderAgreementsList = () => {
    if (!agreementListVisible) return null;

    return (
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextOutlined style={{ color: '#667eea' }} />
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
                    background: '#fafafa'
                  }}
                  actions={[
                    <Button
                      type="primary"
                      onClick={() => {
                        setSelectedAgreement(agreement);
                        setReviewModalVisible(true);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                        <span className="text-[16px] font-semibold">
                          {agreement.projectDetails?.title}
                        </span>
                        <Tag color="orange" style={{ marginLeft: '8px' }}>
                          ${agreement.totalAmount}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <p className="text-gray-600">From: {agreement.student?.name}</p>
                        <p className="text-gray-600 text-[12px]">Subject: {agreement.projectDetails?.subject}</p>
                        <p className="text-gray-600 text-[12px]">Deadline: {moment(agreement.projectDetails?.deadline).format('MMM DD, YYYY')}</p>
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

      // Send a message to the chat about the agreement (currency-aware)
      const currencySymbol = (formattedData?.paymentPreferences?.currency || '').toLowerCase() === 'ngn' ? '₦' : '$';
      await sendChatMessage({
        chatId: selectedChat._id,
        content: `📝 Created a new service agreement for "${formattedData.projectDetails.title}" - Total Amount: ${currencySymbol}${formattedData.totalAmount}`,
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

  // ── Main component JSX ─────────────────────────────────────────────────────────
  return (
    <>
      <Layout style={{ height: '100vh' }}>
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
              {/* Professional Chat Header */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  padding: isDesktop ? '16px 24px' : '12px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  backdropFilter: 'blur(10px)',
                  minHeight: isDesktop ? '70px' : '60px',
                }}
              >
                {!isDesktop && (
                  <Button
                    type="text"
                    icon={<LeftOutlined />}
                    onClick={() => {
                      setSelectedChat(null);
                      setSelectedStudent(null);
                      setActiveChatId && setActiveChatId(null);
                      navigate('/chat/writer');
                    }}
                    style={{ marginRight: 8 }}
                  />
                )}
                
                {/* Professional User Identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: isDesktop ? 16 : 12, minWidth: 0, flex: 1 }}>
                  <div style={{ position: 'relative' }}>
                    <Avatar
                      size={isDesktop ? 48 : 40}
                      src={
                        selectedChat.participants.find((p) => p._id !== user._id)
                          .avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${
                          selectedChat.participants.find((p) => p._id !== user._id)
                            .name
                        }`
                      }
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor:
                          selectedChat.participants.find((p) => p._id !== user._id)
                            .role === 'student'
                            ? '#017DB0'
                            : '#015382',
                        border: '3px solid white',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: onlineUsers.has(
                          selectedChat.participants.find((p) => p._id !== user._id)?._id
                        ) ? '#22c55e' : '#cbd5e1',
                        border: '3px solid white',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        animation: onlineUsers.has(
                          selectedChat.participants.find((p) => p._id !== user._id)?._id
                        ) ? 'pulse 2s infinite' : 'none',
                      }}
                    />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 2,
                    }}>
                      <h4 className="m-0" style={{ 
                        fontSize: isDesktop ? 18 : 16, 
                        fontWeight: 700, 
                        color: '#1e293b',
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: isDesktop ? '200px' : '150px',
                      }}>
                        {selectedChat.participants.find((p) => p._id !== user._id).name}
                      </h4>
                      <Tag 
                        color={selectedChat.participants.find((p) => p._id !== user._id).role === 'student' ? 'blue' : 'green'}
                        style={{ 
                          margin: 0, 
                          fontWeight: 600, 
                          fontSize: '11px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {selectedChat.participants.find((p) => p._id !== user._id).role === 'student' ? 'Student' : 'Writer'}
                      </Tag>
                    </div>
                    {otherUserTyping ? (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 6,
                        color: '#22c55e', 
                        fontSize: 13, 
                        fontWeight: 500,
                        fontStyle: 'italic'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#22c55e',
                          animation: 'pulse 1.5s infinite'
                        }} />
                        typing...
                      </div>
                    ) : (
                      <p style={{ 
                        color: onlineUsers.has(selectedChat.participants.find((p) => p._id !== user._id)?._id) ? '#22c55e' : '#64748b',
                        fontSize: 12, 
                        margin: 0,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        {onlineUsers.has(selectedChat.participants.find((p) => p._id !== user._id)?._id) ? '🟢 Online' : '⚫ Offline'}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Professional Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: isDesktop ? 12 : 8 }}>
                  <Tooltip title="Start Audio Call" placement="bottom">
                    <Button
                      type="text"
                      icon={<PhoneOutlined />}
                      onClick={() => {
                        if (!selectedChat) {
                          console.error('❌ No chat selected for call');
                          return;
                        }
                        
                        const student = selectedChat.participants?.find(p => p._id !== user._id);
                        if (!student || !student._id) {
                          console.error('❌ No student found in chat for call');
                          Msg.error('Cannot start call: Student not found');
                          return;
                        }
                        
                        console.log('🔄 Starting call with student:', student.name);
                        startCall(student, selectedChat._id);
                      }}
                      style={{ 
                        color: '#22c55e',
                        background: 'transparent',
                        border: 'none',
                        width: isDesktop ? '40px' : '36px',
                        height: isDesktop ? '40px' : '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Tooltip>
                  
                  <Tooltip title="Dashboard" placement="bottom">
                    <Button
                      type="text"
                      icon={<DashboardOutlined />}
                      onClick={() => navigate('/writer/dashboard')}
                      style={{ 
                        color: '#015382',
                        background: 'transparent',
                        border: 'none',
                        width: isDesktop ? '40px' : '36px',
                        height: isDesktop ? '40px' : '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Tooltip>
                  
                  {!isDesktop && (
                    <Tooltip title="Create Agreement" placement="bottom">
                      <Button 
                        type="text" 
                        icon={<MoreOutlined />} 
                        onClick={() => navigate(`/agreements/create?chatId=${selectedChat._id}`)}
                        style={{ 
                          color: '#64748b',
                          background: 'transparent',
                          border: 'none',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </Tooltip>
                  )}
                  
                  {isDesktop && (
                    <Dropdown overlay={chatActionsMenu} trigger={['click']} placement="bottomRight">
                      <Tooltip title="More Actions" placement="bottom">
                        <Button 
                          type="text" 
                          icon={<MoreOutlined style={{ fontSize: 18 }} />}
                          style={{ 
                            color: '#64748b',
                            background: 'transparent',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Tooltip>
                    </Dropdown>
                  )}
                </div>
              </div>

              {/* Professional Search Bar */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                  borderBottom: '1px solid #e2e8f0',
                  padding: isDesktop ? '12px 24px' : '10px 16px',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div className="search-input-wrapper" style={{ position: 'relative', maxWidth: isDesktop ? '320px' : '100%' }}>
                  <SearchOutlined 
                    className="search-icon" 
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                      fontSize: '16px',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}
                  />
                   <input
                    type="text"
                    placeholder="Search conversations..."
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
                      height: isDesktop ? '42px' : '38px',
                      padding: '10px 45px 10px 45px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '21px',
                      fontSize: '14px',
                      background: 'white',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      outline: 'none',
                      color: '#1e293b',
                      fontWeight: '400',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#015382';
                      e.target.style.boxShadow = '0 0 0 4px rgba(1, 83, 130, 0.1), 0 2px 8px rgba(0, 0, 0, 0.1)';
                      e.target.style.background = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    }}
                  />
                  {searchTerm && (
                    <CloseOutlined
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                        fontSize: '14px',
                        cursor: 'pointer',
                        padding: '4px',
                        zIndex: 2,
                        transition: 'color 0.2s ease'
                      }}
                      onClick={() => setSearchTerm('')}
                      onMouseEnter={(e) => e.target.style.color = '#015382'}
                      onMouseLeave={(e) => e.target.style.color = '#64748b'}
                    />
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
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <div style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #f0f2f5',
                      background: 'linear-gradient(135deg, #667eea08 0%, #764ba208 100%)',
                      borderRadius: '16px 16px 0 0',
                      fontSize: '11px',
                      fontWeight: 600,
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
                          background: highlightedMsgId === result._id ? 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' : 'white',
                          fontSize: '13px',
                          borderBottom: index < searchResults.length - 1 ? '1px solid #f0f2f5' : 'none',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                          borderRadius: '8px',
                          margin: '4px 8px'
                        }}
                        onClick={() => {
                          scrollToMessage(result._id);
                          setSearchTerm('');
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Avatar size={20} src={result.sender.avatar} style={{ flexShrink: 0 }}>
                            {result.sender.name?.[0]}
                          </Avatar>
                          <span style={{ fontWeight: 600, fontSize: 12, color: '#374151' }}>{result.sender.name}</span>
                          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>{formatTime(result.timestamp)}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#6b7280' }}>
                          {result.content.length > 50 ? result.content.slice(0, 50) + '…' : result.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div className="messages-container" ref={messagesContainerRef} style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '16px',
                position: 'relative' 
              }}>
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
                    }}
                  >
                    <MessageOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                    <p className="text-[16px] text-gray-600">No messages yet</p>
                  </div>
                ) : (
                  <>
                    {chatMessages.map((msg) => {
                      const isCurrentUser = msg.sender._id === user._id;
                      const isReply = !!msg.replyTo;
                      const repliedMsg = isReply ? msg.replyTo : null;

                      return (
                        <div
                          key={msg._id}
                          id={`msg-${msg._id}`}
                          className={`message-wrapper ${isCurrentUser ? 'own-message' : 'other-message'} ${
                            highlightedMsgId === msg._id ? 'highlighted' : ''
                          }`}
                          style={{
                            display: 'flex',
                            width: '100%',
                            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                            marginBottom: '16px',
                            padding: '0 8px'
                          }}
                        >
                          <div className={`message-content ${isCurrentUser ? 'own-content' : 'other-content'}`} style={{ maxWidth: '70%' }}>
                            {!isCurrentUser && (
                              <Avatar
                                size={32}
                                src={
                                  msg.sender.avatar ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${msg.sender.name}`
                                }
                                icon={<UserOutlined />}
                                style={{ 
                                  flexShrink: 0,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                              />
                            )}

                            <div className={`message-bubble ${isCurrentUser ? 'own-bubble' : 'other-bubble'}`}>
                              {/* Quoted reply */}
                              {repliedMsg && (
                                <div 
                                  className="reply-preview"
                                  onClick={() => scrollToMessage(repliedMsg._id)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <span className="text-[11px] font-semibold">{repliedMsg.sender.name}</span>
                                  <br />
                                  <span className="text-[12px]">{repliedMsg.content.length > 60 ? repliedMsg.content.slice(0, 60) + '…' : repliedMsg.content}</span>
                                </div>
                              )}

                              {/* Message content - Handle files and images properly */}
                              {(() => {
                                // Check if message has file URL (S3 link)
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
                                        {/* Show caption if it's different from default filename format */}
                                        {msg.content && !msg.content.startsWith('File: ') && (
                                          <div style={{ 
                                            marginTop: '8px', 
                                            fontSize: '14px',
                                            color: isCurrentUser ? 'white' : '#1f2937',
                                            lineHeight: '1.4'
                                          }}>
                                            {msg.content}
                                          </div>
                                        )}
                                        <div style={{ marginTop: '8px', fontSize: '12px' }}>
                                          <Button
                                            type="text"
                                            icon={<DownloadOutlined />}
                                            size="small"
                                            onClick={() => downloadFile(msg.fileUrl, fileName)}
                                            style={{
                                              color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#667eea',
                                              padding: 0
                                            }}
                                          >
                                            {fileName}
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  } else if (fileType.startsWith('audio/')) {
                                    return (
                                      <div className="audio-message-container" style={{ maxWidth: '340px' }}>
                                        <div style={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: 8, 
                                          flexWrap: window.innerWidth <= 768 ? 'wrap' : 'nowrap' 
                                        }}>
                                          {(() => {
                                            const onAudioError = () => {
                                              try { Msg.warning('Cannot play this audio in your browser. Downloading...'); } catch (_) {}
                                              downloadFile(msg.fileUrl, fileName);
                                            };
                                            return (
                                          <audio 
                                            controls 
                                                preload="metadata"
                                                onError={onAudioError}
                                            style={{ 
                                              width: window.innerWidth <= 768 ? '100%' : 200, 
                                              maxWidth: window.innerWidth <= 768 ? '240px' : '200px',
                                              flexShrink: 0,
                                              height: '32px'
                                            }} 
                                                src={msg.fileUrl}
                                          />
                                            );
                                          })()}
                                          <div className="voice-waveform" style={{
                                            width: window.innerWidth <= 768 ? '100%' : 'auto',
                                            maxWidth: window.innerWidth <= 768 ? '180px' : 'none',
                                            pointerEvents: 'none'
                                          }}>
                                            <VoiceWaveform src={msg.fileUrl} height={window.innerWidth <= 768 ? 24 : 32} barColor={isCurrentUser ? 'rgba(255,255,255,0.9)' : '#475569'} />
                                          </div>
                                        </div>
                                        {msg.content && (
                                          <div style={{ 
                                            marginTop: '8px', 
                                            fontSize: '14px',
                                            color: isCurrentUser ? 'white' : '#1f2937',
                                            lineHeight: '1.4',
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word'
                                          }}>
                                            {msg.content}
                                          </div>
                                        )}
                                        <div className="audio-meta" style={{ 
                                          marginTop: 4, 
                                          fontSize: 12, 
                                          color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#64748b',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          flexWrap: 'wrap'
                                        }}>
                                        {typeof msg.voiceDuration === 'number' && (
                                            <span>
                                            {Math.floor(msg.voiceDuration / 60)}:{(Math.floor(msg.voiceDuration % 60)).toString().padStart(2, '0')}
                                            </span>
                                        )}
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    // Non-image files (documents, videos, etc.)
                                    return (
                                      <div className="file-message-container" style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '12px',
                                          padding: '12px',
                                          border: `1px solid ${isCurrentUser ? 'rgba(255,255,255,0.2)' : '#e5e7eb'}`,
                                          borderRadius: '8px',
                                          backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.1)' : '#f9fafb',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s ease',
                                          maxWidth: '300px'
                                        }}
                                        onClick={() => handleFileView(msg)}
                                        >
                                          <div style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.2)' : '#667eea',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                          }}>
                                            <FileOutlined style={{ 
                                              fontSize: '20px', 
                                            color: 'white'
                                            }} />
                                          </div>
                                        <div className="file-info" style={{ flex: 1, minWidth: 0 }}>
                                          <div className="file-name" style={{
                                              fontSize: '14px',
                                              fontWeight: 500,
                                              color: isCurrentUser ? 'white' : '#1f2937',
                                              marginBottom: '4px',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap'
                                            }}>
                                              {fileName}
                                            </div>
                                          <div className="file-size" style={{
                                              fontSize: '12px',
                                            color: isCurrentUser ? 'rgba(255,255,255,0.7)' : '#6b7280',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                            }}>
                                            File
                                          </div>
                                          </div>
                                          <Button
                                            type="text"
                                            icon={<DownloadOutlined />}
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              downloadFile(msg.fileUrl, fileName);
                                            }}
                                            style={{
                                              color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#667eea'
                                            }}
                                          />
                                      </div>
                                    );
                                  }
                                }
                                
                                // Check if it's a call message
                                if (msg.type === 'call' || msg.content.includes('📞 Audio call')) {
                                  return (
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '8px 12px',
                                      backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.1)' : '#f0f9ff',
                                      borderRadius: '8px',
                                      border: `1px solid ${isCurrentUser ? 'rgba(255,255,255,0.2)' : '#bfdbfe'}`,
                                      fontSize: '14px',
                                      color: isCurrentUser ? 'white' : '#1e40af'
                                    }}>
                                      <span style={{ fontSize: '16px' }}>📞</span>
                                      <span>{msg.content.replace('📞 ', '')}</span>
                                    </div>
                                  );
                                }
                                
                                // Regular text message
                                return (
                                  <p className="message-text">
                                    {msg.content}
                                  </p>
                                );
                              })()}

                              <div className="message-time">
                                {formatTime(msg.timestamp)}
                                {renderMessageStatus(msg)}
                                {isCurrentUser && msg.read && ' • Read'}
                              </div>
                            </div>

                            {/* Reply button */}
                            <Button
                              icon={<MessageOutlined />}
                              size="small"
                              type="text"
                              onClick={() => handleReply(msg)}
                              style={{
                                opacity: 0.6,
                                transition: 'opacity 0.2s',
                              }}
                              className="reply-button"
                            />
                            
                            {isCurrentUser && (
                              <Avatar
                                size={32}
                                src={
                                  msg.sender.avatar ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${msg.sender.name}`
                                }
                                icon={<UserOutlined />}
                                style={{ 
                                  flexShrink: 0,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Typing indicator */}
                    {otherUserTyping && (
                      <div className="message-wrapper other-message">
                        <div className="message-content">
                          <Avatar
                            size={32}
                            src={
                              selectedChat.participants.find(p => p._id !== user._id)?.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${
                                selectedChat.participants.find(p => p._id !== user._id)?.name
                              }`
                            }
                            icon={<UserOutlined />}
                            style={{ flexShrink: 0 }}
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
              </div>

              {/* Input + Emoji + File Upload Area */}
              <div className="chat-input-area">
                {/* Reply Banner */}
                {replyingTo && (
                  <div className="reply-banner">
                    <div className="reply-content">
                      <span className="text-[12px] font-semibold text-indigo-500">Replying to {replyingTo.sender.name}</span>
                      <span className="block text-[13px] text-gray-500">{replyingTo.content.length > 64 ? replyingTo.content.slice(0, 64) + '…' : replyingTo.content}</span>
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

                <div className="input-wrapper">
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
                          <span className="text-[16px] font-semibold">Emoji</span>
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
                       fontSize: '16px',
                      lineHeight: '1.4',
                      flex: 1,
                      height: '24px',
                      padding: '0 6px',
                      color: '#374151',
                      fontFamily: 'inherit',
                      overflow: 'hidden'
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                    }}
                  />

                  <div className="input-actions">
                    {/* Voice recorder */}
                    <div style={{ marginRight: 4 }}>
                      {/* Lazy inline recorder to avoid layout shift; small circular button */}
                      <VoiceRecorder
                        disabled={!selectedChat}
                        onRecordingComplete={(audioFile) => {
                          // Queue the voice note so user can just press the normal Send button
                          const newItem = {
                            uid: Date.now() + Math.random(),
                            name: audioFile.name,
                            status: 'done',
                            url: URL.createObjectURL(audioFile),
                            file: audioFile
                          };
                          setUploadList(prev => [...prev, newItem]);
                          setFileToSend(prev => Array.isArray(prev) ? [...prev, audioFile] : prev ? [prev, audioFile] : [audioFile]);
                        }}
                        onCancel={() => {}}
                      />
                    </div>
                    {/* Upload button */}
                    <Upload
                      accept="image/*,video/*,audio/*,.mp4,.mov,.avi,.wmv,.mkv,.webm,.3gp,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.zip,.rar,.7z"
                      fileList={uploadList}
                      showUploadList={false}
                      beforeUpload={(file) => {
                        console.log('🔍 File selected in WriterChat:', {
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
                    >
                      <SendOutlined style={{ fontSize: 20, color: 'white' }} />
                    </button>
                  </div>
                </div>

                {/* Multiple Files preview */}
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
                        <div key={file.uid} className="file-row" style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '6px 8px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          minWidth: 0
                        }}>
                          {/* File icon based on type */}
                          {file.file?.type?.startsWith('image/') && <FileImageOutlined style={{ fontSize: 14, color: '#10b981', marginRight: '8px' }} />}
                          {file.file?.type?.startsWith('video/') && <VideoCameraOutlined style={{ fontSize: 14, color: '#f59e0b', marginRight: '8px' }} />}
                          {file.file?.type?.startsWith('audio/') && <AudioOutlined style={{ fontSize: 14, color: '#8b5cf6', marginRight: '8px' }} />}
                          {file.file?.type?.includes('pdf') && <FilePdfOutlined style={{ fontSize: 14, color: '#ef4444', marginRight: '8px' }} />}
                          {!file.file?.type?.startsWith('image/') && !file.file?.type?.startsWith('video/') && 
                           !file.file?.type?.startsWith('audio/') && !file.file?.type?.includes('pdf') && 
                           <FileOutlined style={{ fontSize: 14, color: '#6b7280', marginRight: '8px' }} />}
                          
                          <span className="file-name text-[12px]" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#374151' }}>{file.name}</span>
                          
                          <span className="file-size" style={{ fontSize: '11px', color: '#6b7280', marginLeft: '8px' }}>{file.file ? `${(file.file.size / 1024 / 1024).toFixed(1)}MB` : ''}</span>
                          
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
              </div>
            </>
          ) : (
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
              {isDesktop ? (
                <>
                  <MessageOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                  <p className="text-[16px] text-gray-600">Select a chat to start messaging</p>
                </>
              ) : (
                <div style={{ height: '100%', overflow: 'auto', width: '100%' }}>
                  {renderChatList()}
                </div>
              )}
            </div>
          )}
        </Content>
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

      {/* Agreement creation now handled on dedicated page */}

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