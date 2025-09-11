import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  PanResponder,
  Platform,
  TextInput as RNTextInput,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Searchbar,
  Snackbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { agreementApi } from '../api/agreement';
import { getChatMessages, getUserChats, sendChatFile, sendMessage as sendChatMessage } from '../api/chat';
import CompleteAssignmentModal from '../components/CompleteAssignmentModal';
import ReviewAgreementModal from '../components/ReviewAgreementModal';
import { useAppLoading } from '../context/AppLoadingContext';
import { useAuth } from '../context/MobileAuthContext';
import { useSocket } from '../context/SocketContext';

const { width, height } = Dimensions.get('window');

const WriterChat = () => {
  const { chatId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { setLoading: setGlobalLoading } = useAppLoading();
  const { socket, joinChat, leaveChat, sendTypingIndicator } = useSocket() || {};

  // Debug log to confirm component is loading
  console.log('🎯 [WriterChat] Component loaded with audio call functionality!');
  console.log('🎯 [WriterChat] User role:', user?.role);
  console.log('🎯 [WriterChat] Chat ID:', chatId);

  // State management - comprehensive state for all features
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showChatList, setShowChatList] = useState(!chatId);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'agreements'
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sendingMessages, setSendingMessages] = useState(new Set());
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [currentSound, setCurrentSound] = useState(null);
  const [swipeThreshold] = useState(64);
  const messageIndexMapRef = useRef(new Map());

  const normalizeMessages = (msgs) => {
    try {
      const arr = Array.isArray(msgs) ? msgs : [];
      const messageMap = new Map();
      
      // First pass: create a map of all messages for reference lookup
      arr.forEach(msg => {
        const key = msg._id || msg.id;
        if (key) {
          messageMap.set(key, msg);
        }
      });
      
      return arr.map(m => {
        // Ensure basic message structure
        const normalizedMessage = {
          id: m._id || m.id,
          content: m.content || m.message || '',
          sender: m.sender || { _id: '', name: 'Unknown', avatar: null },
          timestamp: m.timestamp || m.createdAt || new Date().toISOString(),
          fileUrl: m.fileUrl,
          fileName: m.fileName,
          fileType: m.fileType,
          fileSize: m.fileSize,
          voiceDuration: m.voiceDuration,
          read: m.read || false,
          chatId: m.chatId,
          isFromServer: m.isFromServer || false,
          replyTo: null // Initialize as null
        };

        // Handle replyTo properly
        if (m.replyTo) {
          const replyTo = m.replyTo;
          
          // Case 1: replyTo is just a string ID
          if (typeof replyTo === 'string') {
            const referencedMessage = messageMap.get(replyTo);
            if (referencedMessage) {
              normalizedMessage.replyTo = {
                _id: referencedMessage._id || referencedMessage.id,
                content: referencedMessage.content || referencedMessage.message || 'Message not available',
                sender: referencedMessage.sender || { _id: '', name: 'Unknown', avatar: null },
                timestamp: referencedMessage.timestamp || referencedMessage.createdAt || null
              };
            } else {
              // Create placeholder for missing message
              normalizedMessage.replyTo = { 
                _id: replyTo, 
                content: 'Message not available', 
                sender: { _id: '', name: 'Unknown', avatar: null },
                timestamp: null
              };
            }
          }
          // Case 2: replyTo is already an object
          else if (typeof replyTo === 'object' && replyTo !== null) {
            normalizedMessage.replyTo = {
              _id: replyTo._id || replyTo.id || replyTo,
              content: replyTo.content || replyTo.message || 'Message not available',
              sender: replyTo.sender || { _id: '', name: 'Unknown', avatar: null },
              timestamp: replyTo.timestamp || replyTo.createdAt || null
            };
          }
        }

        return normalizedMessage;
      });
    } catch (error) {
      console.warn('❌ [WriterChat] Error normalizing messages:', error);
      return Array.isArray(msgs) ? msgs : [];
    }
  };
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Audio Call States
  const [callState, setCallState] = useState('idle'); // 'idle', 'calling', 'ringing', 'connected', 'ended', 'failed'
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callQuality, setCallQuality] = useState('good'); // 'excellent', 'good', 'fair', 'poor'
  const [callTimer, setCallTimer] = useState(null);
  const [ringtoneSound, setRingtoneSound] = useState(null);
  const [callSound, setCallSound] = useState(null);
  
  // Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);

  // Refs for managing focus and scroll
  const flatListRef = useRef(null);
  const isMountedRef = useRef(true);
  const typingTimeoutRef = useRef(null);
  const scrollOffsetRef = useRef(0);

  // Hide bottom tabs when inside a chat room
  useEffect(() => {
    const parent = navigation?.getParent?.();
    if (!parent) return;
    if (!showChatList) {
      parent.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      parent.setOptions({ tabBarStyle: undefined });
    }
    return () => {
      parent.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation, showChatList]);

  // Initial data loading
  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    fetchChats();
    fetchAgreements();
    
    if (chatId) {
      (async () => {
        try {
          const cached = await AsyncStorage.getItem(`chat_messages_${chatId}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length) {
              // Re-normalize cached messages to ensure proper structure
              const reNormalized = normalizeMessages(parsed);
              setMessages(reNormalized);
            }
          }
        } catch (e) {
          console.warn('Failed to load cached messages:', e);
        }
        // Always fetch fresh messages after loading cache
        fetchMessages(chatId);
      })();
      setShowChatList(false);
    }

    // Keyboard listeners for proper input sizing
    const keyboardWillShow = Platform.select({
      ios: 'keyboardWillShow',
      android: 'keyboardDidShow'
    });
    const keyboardWillHide = Platform.select({
      ios: 'keyboardWillHide', 
      android: 'keyboardDidHide'
    });

    const showSubscription = Keyboard.addListener(keyboardWillShow, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(keyboardWillHide, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, [chatId]);

  // Hide bottom tabs when inside a chat room (showChatList === false)
  useEffect(() => {
    const parent = navigation?.getParent?.();
    if (!parent) return;
    if (!showChatList) {
      parent.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      parent.setOptions({ tabBarStyle: undefined });
    }
    return () => {
      parent.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation, showChatList]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Real-time socket event handling
  useEffect(() => {
    if (!socket || !user?._id) return;

    socket.emit('joinUserRoom', user._id);

    const handleReceiveMessage = (data) => {
      try {
        console.log('📨 [WriterChat] Received message:', data);

        if (!data?.message || data.message.sender._id === user._id) {
          console.log('📨 [WriterChat] Skipping own message or invalid message');
          return;
        }

        if (currentChat && data.chatId === currentChat.id) {
          setMessages(prev => {
            const existingMessage = prev.find(m =>
              m.id === data.message._id ||
              (m.timestamp === data.message.timestamp &&
               m.sender._id === data.message.sender._id &&
               m.content === data.message.content)
            );

            if (existingMessage) {
              console.log('📨 [WriterChat] Message already exists, skipping');
              return prev;
            }

            const newMessage = {
              id: data.message._id || data.message.id,
              content: data.message.content || '',
              sender: data.message.sender,
              timestamp: data.message.timestamp || data.message.createdAt || new Date().toISOString(),
              fileUrl: data.message.fileUrl,
              fileName: data.message.fileName,
              fileType: data.message.fileType,
              fileSize: data.message.fileSize,
              voiceDuration: data.message.voiceDuration,
              // CRITICAL: Preserve reply structure from server
              replyTo: data.message.replyTo || null,
              read: true,
              chatId: data.chatId,
              isFromServer: true
            };

            console.log('📨 [WriterChat] Adding new message to chat');
            const updated = [...prev, newMessage];
            
            // Cache the updated messages with reply context
            (async () => { 
              try { 
                if (currentChat?.id) {
                  await AsyncStorage.setItem(`chat_messages_${currentChat.id}`, JSON.stringify(updated)); 
                }
              } catch (e) {} 
            })();
            
            return updated;
          });

          socket.emit('markMessagesAsRead', {
            chatId: currentChat.id,
            userId: user._id
          });

          setTimeout(() => scrollToBottom(), 100);
        }

        // Update chat list
        setChats(prev => prev.map(c => c.id === data.chatId ? {
          ...c,
          lastMessage: data.message?.content || c.lastMessage,
          lastMessageTime: data.message?.timestamp || new Date().toISOString()
        } : c));

      } catch (error) {
        console.error('❌ [WriterChat] Error handling received message:', error);
      }
    };

    const handleTyping = ({ chatId: cId, userId, userName }) => {
      if (!currentChat || userId === user._id) return;
      if (currentChat.id === cId) {
        setOtherUserTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setOtherUserTyping(false);
        }, 3000);
      }
    };

    const handleStopTyping = ({ chatId: cId, userId }) => {
      if (!currentChat || userId === user._id) return;
      if (currentChat.id === cId) {
        setOtherUserTyping(false);
        clearTimeout(typingTimeoutRef.current);
      }
    };

    const handleOnlineStatuses = (statuses) => {
      const onlineIds = Object.keys(statuses || {}).filter(id => statuses[id]);
      setOnlineUsers(new Set(onlineIds));
    };

    const handleMessagesRead = ({ chatId: cId, readBy }) => {
      if (currentChat?.id === cId && readBy !== user._id) {
        setMessages(prev => prev.map(msg => 
          msg.sender?._id === user._id ? { ...msg, read: true } : msg
        ));
      }
    };

    const handleUserOnline = ({ userId }) => setOnlineUsers(prev => new Set([...prev, userId]));
    const handleUserOffline = ({ userId }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    // Audio Call Event Handlers
    const handleIncomingCall = (callData) => {
      console.log('📞 [WriterChat] Incoming call:', callData);
      
      // Navigate to incoming call screen
      router.push({
        pathname: '/audio-call',
        params: {
          userId: callData.from,
          userName: callData.fromName,
          userAvatar: callData.fromAvatar,
          isIncoming: 'true',
          chatId: callData.chatId,
          callId: callData.callId
        }
      });
    };

    const handleCallAccepted = (callData) => {
      console.log('📞 [WriterChat] Call accepted:', callData);
      setCallState('connected');
      setCallStartTime(Date.now());
      stopRingtone();
      startCallTimer();
      
      // Start simulated audio streaming
      startAudioStreaming();
      
      showSnackbar('Call connected');
    };

    const handleCallRejected = (callData) => {
      console.log('📞 [WriterChat] Call rejected:', callData);
      setCallState('idle');
      setIncomingCall(null);
      setOutgoingCall(null);
      stopRingtone();
      showSnackbar('Call rejected');
    };

    const handleCallEnded = (callData) => {
      console.log('📞 [WriterChat] Call ended:', callData);
      endCall();
      stopAudioStreaming();
      showSnackbar('Call ended');
    };

    const handleCallFailed = (callData) => {
      console.log('📞 [WriterChat] Call failed:', callData);
      setCallState('failed');
      setIncomingCall(null);
      setOutgoingCall(null);
      stopRingtone();
      showSnackbar('Call failed');
    };

    // Socket event listeners
    socket.on('messageBroadcast', handleReceiveMessage);
    socket.on('newMessage', handleReceiveMessage);
    socket.on('messageSent', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('onlineStatuses', handleOnlineStatuses);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('messagesRead', handleMessagesRead);
    
    // Call event listeners
    socket.on('incomingCall', handleIncomingCall);
    socket.on('callAccepted', handleCallAccepted);
    socket.on('callRejected', handleCallRejected);
    socket.on('callEnded', handleCallEnded);
    socket.on('callFailed', handleCallFailed);

    return () => {
      console.log('🧹 [WriterChat] Cleaning up socket listeners');

      // Remove all message-related listeners
      socket.off('messageBroadcast', handleReceiveMessage);
      socket.off('newMessage', handleReceiveMessage);
      socket.off('messageSent', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('onlineStatuses', handleOnlineStatuses);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('messagesRead', handleMessagesRead);

      // Remove all call-related listeners
      socket.off('incomingCall', handleIncomingCall);
      socket.off('callAccepted', handleCallAccepted);
      socket.off('callRejected', handleCallRejected);
      socket.off('callEnded', handleCallEnded);
      socket.off('callFailed', handleCallFailed);

      // Clear any pending timeouts
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop any active call timers
      if (callTimer) {
        clearInterval(callTimer);
      }

      // Clean up audio resources
      if (currentSound) {
        currentSound.unloadAsync();
      }
      if (ringtoneSound) {
        ringtoneSound.unloadAsync();
      }
      if (callSound) {
        callSound.unloadAsync();
      }
    };
  }, [socket, user?._id, currentChat]);

  // API Functions
  const fetchChats = async () => {
    try {
      console.log('📱 [WriterChat] Fetching chats...');
      const chatsData = await getUserChats();
      console.log('📱 [WriterChat] Chats data:', chatsData);
      
      const chatsArray = Array.isArray(chatsData) ? chatsData : chatsData?.chats || [];
      
      const enhancedChats = chatsArray.map(chat => ({
        ...chat,
        id: chat._id || chat.id,
        lastMessage: chat.lastMessage || 'No messages yet',
        lastMessageTime: chat.lastMessageTime || chat.updatedAt || new Date().toISOString(),
        unreadCount: chat.unreadCount || 0,
        participants: chat.participants || [],
        otherParticipant: chat.participants?.find(p => p._id !== user._id && p.id !== user._id) || {
          name: 'Unknown User',
          avatar: null,
          isOnline: false
        }
      }));
      
      setChats(enhancedChats);
      
      if (chatId) {
        const chat = enhancedChats.find(c => c.id === chatId);
        if (chat) {
          setCurrentChat(chat);
        }
      }
    } catch (err) {
      console.error('📱 [WriterChat] Error fetching chats:', err);
      Alert.alert('Error', 'Failed to load chats');
    }
  };

  const fetchAgreements = async () => {
    try {
      console.log('📱 [WriterChat] Fetching agreements...');
      const agreementsData = await agreementApi.getAgreements();
      console.log('📱 [WriterChat] Agreements data:', agreementsData);
      
      const enhancedAgreements = (agreementsData || []).map(agreement => ({
        ...agreement,
        id: agreement._id,
        title: agreement.projectDetails?.title || 'Untitled Project',
        amount: agreement.totalAmount || 0,
        deadline: agreement.projectDetails?.deadline,
        studentName: agreement.student?.name || 'Unknown Student',
        studentAvatar: agreement.student?.avatar,
        status: agreement.status || 'pending'
      }));
      
      setAgreements(enhancedAgreements);
    } catch (err) {
      console.error('📱 [WriterChat] Error fetching agreements:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (selectedChatId = chatId) => {
    if (!selectedChatId) return;

    try {
      setLoadingMessages(true);
      console.log('📱 [WriterChat] Fetching messages for chat:', selectedChatId);

      const messagesData = await getChatMessages(selectedChatId);
      console.log('📱 [WriterChat] Raw messages data:', messagesData);

      const messagesArray = Array.isArray(messagesData) ? messagesData : messagesData?.messages || [];

      const enhancedMessages = messagesArray.map(msg => ({
        id: msg._id || msg.id,
        content: msg.content || msg.message || '',
        sender: msg.sender || { _id: user._id, name: user.name, avatar: user.avatar },
        timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        fileType: msg.fileType,
        fileSize: msg.fileSize,
        voiceDuration: msg.voiceDuration,
        // CRITICAL: Preserve the original replyTo structure from server
        replyTo: msg.replyTo || null,
        read: msg.read || false,
        chatId: selectedChatId,
        isFromServer: true
      }));

      // Sort messages by timestamp
      const sortedMessages = enhancedMessages.sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
      );

      // Normalize with proper reply handling
      const normalized = normalizeMessages(sortedMessages);
      setMessages(normalized);
      
      // Cache the normalized messages
      try { 
        await AsyncStorage.setItem(`chat_messages_${selectedChatId}`, JSON.stringify(normalized)); 
      } catch (e) {
        console.warn('Failed to cache messages:', e);
      }

      // Mark messages as read only if we're not already in a loading state
      if (socket && !loading) {
        try {
          socket.emit('markMessagesAsRead', { chatId: selectedChatId, userId: user._id });
        } catch (e) {
          console.warn('Failed to mark messages as read:', e);
        }
      }

      // Scroll to bottom after a brief delay to allow rendering
      setTimeout(() => scrollToBottom(false), 100);

    } catch (error) {
      console.error('📱 [WriterChat] Error fetching messages:', error);
      showSnackbar('Failed to load messages');

      // Don't clear messages on error - keep existing ones
      if (messages.length === 0) {
        setMessages([]);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  // Message sending with optimistic updates
  const handleSendMessage = async () => {
    if ((!messageText.trim() && selectedFiles.length === 0) || !currentChat || sending) return;

    const messageContent = messageText.trim();
    const filesToSend = [...selectedFiles];
    const replyToMessage = replyingTo; // Store the full reply context

    setMessageText('');
    setSelectedFiles([]);
    setReplyingTo(null);
    setSending(true);

    if (socket) {
      socket.emit('stopTyping', { chatId: currentChat.id, userId: user._id });
    }

    try {
      if (filesToSend.length > 0) {
        for (const file of filesToSend) {
          const optimisticId = `temp-${Date.now()}-${Math.random()}`;
          const optimisticMessage = {
            id: optimisticId,
            content: messageContent || '',
            sender: { _id: user._id, name: user.name, avatar: user.avatar },
            timestamp: new Date().toISOString(),
            fileUrl: file.uri,
            fileName: file.name,
            fileType: file.mimeType,
            fileSize: file.size,
            // CRITICAL: Preserve the full reply context in optimistic message
            replyTo: replyToMessage ? {
              _id: replyToMessage._id || replyToMessage.id,
              content: replyToMessage.content,
              sender: replyToMessage.sender,
              timestamp: replyToMessage.timestamp
            } : null,
            isOptimistic: true,
            isUploading: true
          };

          setMessages(prev => {
            const updated = [...prev, optimisticMessage];
            // Cache with reply context preserved
            (async () => { 
              try { 
                if (currentChat?.id) {
                  await AsyncStorage.setItem(`chat_messages_${currentChat.id}`, JSON.stringify(updated)); 
                }
              } catch (e) {} 
            })();
            return updated;
          });
          setSendingMessages(prev => new Set([...prev, optimisticId]));
          scrollToBottom();

          try {
            const realMessage = await sendChatFile({
              chatId: currentChat.id,
              file: { uri: file.uri, name: file.name, type: file.mimeType, size: file.size },
              content: messageContent,
              replyTo: replyToMessage?._id || replyToMessage?.id,
              voiceDuration: file.duration
            });

            setMessages(prev => prev.map(msg => msg.id === optimisticId ? {
              ...realMessage,
              id: realMessage._id,
              isOptimistic: false,
              isUploading: false,
              // Ensure reply context is preserved from server or fallback to original
              replyTo: realMessage.replyTo || replyToMessage ? {
                _id: replyToMessage._id || replyToMessage.id,
                content: replyToMessage.content,
                sender: replyToMessage.sender,
                timestamp: replyToMessage.timestamp
              } : null
            } : msg));

            setSendingMessages(prev => {
              const newSet = new Set(prev);
              newSet.delete(optimisticId);
              return newSet;
            });

          } catch (uploadErr) {
            console.error('❌ [WriterChat] File upload error:', uploadErr);
            
            setMessages(prev => prev.map(msg => msg.id === optimisticId ? {
              ...msg,
              content: `Failed to upload: ${file.name}`,
              isUploading: false,
              uploadError: true,
              replyTo: replyToMessage ? {
                _id: replyToMessage._id || replyToMessage.id,
                content: replyToMessage.content,
                sender: replyToMessage.sender,
                timestamp: replyToMessage.timestamp
              } : null
            } : msg));
            
            setSendingMessages(prev => {
              const newSet = new Set(prev);
              newSet.delete(optimisticId);
              return newSet;
            });
            showSnackbar(`Failed to upload: ${file.name}`);
          }
        }
      } else if (messageContent) {
        const optimisticId = `temp-${Date.now()}`;
        const optimisticMessage = {
          id: optimisticId,
          content: messageContent,
          sender: { _id: user._id, name: user.name, avatar: user.avatar },
          timestamp: new Date().toISOString(),
          replyTo: replyToMessage ? {
            _id: replyToMessage._id || replyToMessage.id,
            content: replyToMessage.content,
            sender: replyToMessage.sender,
            timestamp: replyToMessage.timestamp
          } : null,
          isOptimistic: true
        };

        setMessages(prev => {
          const updated = [...prev, optimisticMessage];
          (async () => { 
            try { 
              if (currentChat?.id) {
                await AsyncStorage.setItem(`chat_messages_${currentChat.id}`, JSON.stringify(updated)); 
              }
            } catch (e) {} 
          })();
          return updated;
        });
        setSendingMessages(prev => new Set([...prev, optimisticId]));
        scrollToBottom();

        try {
          const realMessage = await sendChatMessage({
            chatId: currentChat.id,
            content: messageContent,
            replyTo: replyToMessage?._id || replyToMessage?.id
          });

          setMessages(prev => prev.map(msg => msg.id === optimisticId ? {
            ...realMessage,
            id: realMessage._id,
            isOptimistic: false,
            // Preserve reply context from server or fallback to original
            replyTo: realMessage.replyTo || (replyToMessage ? {
              _id: replyToMessage._id || replyToMessage.id,
              content: replyToMessage.content,
              sender: replyToMessage.sender,
              timestamp: replyToMessage.timestamp
            } : null)
          } : msg));

          setSendingMessages(prev => {
            const newSet = new Set(prev);
            newSet.delete(optimisticId);
            return newSet;
          });
        } catch (errSend) {
          setMessages(prev => prev.map(msg => msg.id === optimisticId ? {
            ...msg,
            content: `Failed to send: ${messageContent}`,
            sendError: true,
            isOptimistic: false,
            replyTo: replyToMessage ? {
              _id: replyToMessage._id || replyToMessage.id,
              content: replyToMessage.content,
              sender: replyToMessage.sender,
              timestamp: replyToMessage.timestamp
            } : null
          } : msg));

          setSendingMessages(prev => {
            const newSet = new Set(prev);
            newSet.delete(optimisticId);
            return newSet;
          });
          showSnackbar('Failed to send message');
        }
      }
    } catch (e) {
      showSnackbar('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Chat navigation and selection
  const handleSelectChat = (chat) => {
    if (leaveChat && currentChat?.id) leaveChat(currentChat.id);
    setCurrentChat(chat);
    setShowChatList(false);
    fetchMessages(chat.id);
    
    if (chat.id !== chatId) {
      router.setParams({ chatId: chat.id });
    }
    if (joinChat) joinChat(chat.id);
    // Proactively mark as read on open
    if (socket) {
      try { socket.emit('markMessagesAsRead', { chatId: chat.id, userId: user._id }); } catch {}
    }
  };

  // Message interaction handlers
  const handleReply = (message) => setReplyingTo(message);
  const cancelReply = () => setReplyingTo(null);

  // keep index map up to date
  useEffect(() => {
    const map = new Map();
    messages.forEach((m, idx) => {
      const key = m.id || m._id;
      if (key) map.set(key, idx);
    });
    messageIndexMapRef.current = map;
  }, [messages]);

  const scrollToMessage = (messageId) => {
    const index = messageIndexMapRef.current.get(messageId);
    if (index !== -1 && flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.3, // Show message slightly above center
          viewOffset: 20 // Add some offset for better visibility
        });

        // Highlight the message with animation
        setHighlightedMessageId(messageId);

        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedMessageId(null);
        }, 3000);

        // Add a subtle flash animation
        const highlightAnim = new Animated.Value(0);
        Animated.sequence([
          Animated.timing(highlightAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(highlightAnim, {
            toValue: 0,
            duration: 300,
            delay: 1000,
            useNativeDriver: true,
          })
        ]).start();

      } catch (error) {
        console.warn('Failed to scroll to message:', error);
        // Fallback: scroll to bottom if scrollToIndex fails
        scrollToBottom();
      }
    }
  };

  // File handling functionality
  const handleFileSelect = async (type) => {
    try {
      console.log(`📎 [WriterChat] Selecting file of type: ${type}`);
      let result;
      
      if (type === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          quality: 0.8,
          base64: false,
          exif: false
        });
      } else if (type === 'gallery') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsMultipleSelection: true,
          quality: 0.8,
          base64: false,
          exif: false
        });
      } else {
        // Document selection
        result = await DocumentPicker.getDocumentAsync({
          type: '*/*',
          multiple: true,
          copyToCacheDirectory: true
        });
      }
      
      console.log('📂 [WriterChat] File selection result:', result);
      
      if (!result.canceled) {
        let assets = [];
        
        if (result.assets) {
          // New format with assets array
          assets = result.assets;
        } else if (result.uri) {
          // Old format with direct properties
          assets = [result];
        }
        
        const newFiles = assets.map(asset => {
          const file = {
            uri: asset.uri,
            name: asset.name || asset.fileName || `file_${Date.now()}`,
            mimeType: asset.mimeType || asset.type || 'application/octet-stream',
            type: asset.mimeType || asset.type || 'application/octet-stream', // Also set type for compatibility
            size: asset.fileSize || asset.size || 0,
            duration: asset.duration || 0
          };
          
          console.log('📄 [WriterChat] Processed file:', file);
          return file;
        });
        
        setSelectedFiles(prev => [...prev, ...newFiles]);
        showSnackbar(`${newFiles.length} file(s) selected`);
      }
    } catch (error) {
      console.error('❌ [WriterChat] File selection failed:', error);
      showSnackbar('Failed to select file. Please try again.');
    }
  };

  const removeFile = (index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));

  // Voice recording functionality
  const startRecording = async () => {
    try {
      console.log('🎤 [WriterChat] Starting voice recording...');
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        showSnackbar('Recording permission denied');
        return;
      }
      
      console.log('✅ [WriterChat] Audio permission granted');
      
      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false
      });
      
      // Create recording with optimized settings for mobile
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm;codecs=opus',
          bitsPerSecond: 128000,
        },
      };
      
      const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      console.log('🎤 [WriterChat] Recording started successfully');
      
      // Start duration timer
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      newRecording.setOnRecordingStatusUpdate(status => {
        if (!status.isRecording) {
          clearInterval(timer);
        }
      });
      
    } catch (error) {
      console.error('❌ [WriterChat] Failed to start recording:', error);
      showSnackbar('Failed to start recording. Please check your microphone permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) {
        console.warn('⚠️ [WriterChat] No recording to stop');
        return;
      }
      
      console.log('🛑 [WriterChat] Stopping voice recording...');
      setIsRecording(false);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        console.log('✅ [WriterChat] Recording saved to:', uri);
        
        // Get file info
        const info = await FileSystem.getInfoAsync(uri);
        console.log('📊 [WriterChat] Recording file info:', info);
        
        const audioFile = {
          uri,
          name: `voice_${Date.now()}.m4a`,
          mimeType: 'audio/m4a',
          type: 'audio/m4a', // Also set type for compatibility
          size: info.size || 0,
          duration: recordingDuration
        };
        
        console.log('🎵 [WriterChat] Audio file prepared:', audioFile);
        setSelectedFiles(prev => [...prev, audioFile]);
        showSnackbar(`Voice message recorded (${recordingDuration}s)`);
      } else {
        console.error('❌ [WriterChat] Recording URI is null');
        showSnackbar('Failed to save recording - no file created');
      }
      
      setRecording(null);
      setRecordingDuration(0);
      
    } catch (error) {
      console.error('❌ [WriterChat] Failed to stop recording:', error);
      showSnackbar('Failed to save recording. Please try again.');
      setIsRecording(false);
      setRecording(null);
      setRecordingDuration(0);
    }
  };

  // Typing indicator handling
  const handleTypingChange = (text) => {
    setMessageText(text);
    if (currentChat && (sendTypingIndicator || socket)) {
      if (sendTypingIndicator) {
        sendTypingIndicator(currentChat.id, true);
      } else {
        socket.emit('typing', { chatId: currentChat.id, userId: user._id, userName: user.name });
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (sendTypingIndicator) {
          sendTypingIndicator(currentChat.id, false);
        } else {
          socket.emit('stopTyping', { chatId: currentChat.id, userId: user._id });
        }
      }, 2000);
    }
  };

  // WhatsApp-style swipe to reply with PanResponder + Animated for stability
  const SwipeableMessage = ({ children, onSwipeReply, message }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const replied = useRef(false);
    const replyIconOpacity = useRef(new Animated.Value(0)).current;
    const replyIconScale = useRef(new Animated.Value(0.8)).current;

    const resetPosition = () => {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
        }),
        Animated.timing(replyIconOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(replyIconScale, {
          toValue: 0.8,
          useNativeDriver: true,
        })
      ]).start(() => {
        replied.current = false;
      });
    };

    const showReplyIcon = (progress) => {
      const opacity = Math.min(progress / swipeThreshold, 1);
      const scale = 0.8 + (opacity * 0.2);
      replyIconOpacity.setValue(opacity);
      replyIconScale.setValue(scale);
    };

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const { dx, dy } = gestureState;
          return Math.abs(dx) > 10 && Math.abs(dy) < 20;
        },
        onPanResponderGrant: () => {
          replied.current = false;
        },
        onPanResponderMove: (_, gestureState) => {
          const { dx } = gestureState;
          const clampedDx = Math.max(Math.min(dx, 120), -120);
          translateX.setValue(clampedDx);

          // Show reply icon with progress
          showReplyIcon(Math.abs(dx));
        },
        onPanResponderRelease: (_, gestureState) => {
          const { dx } = gestureState;

          if (Math.abs(dx) > swipeThreshold && !replied.current) {
            replied.current = true;
            // Trigger haptic feedback if available
            if (Platform.OS === 'ios') {
              // Add haptic feedback for iOS
            }
            onSwipeReply?.(message);

            // Animate to show success
            Animated.sequence([
              Animated.timing(replyIconOpacity, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(replyIconOpacity, {
                toValue: 0,
                duration: 300,
                delay: 500,
                useNativeDriver: true,
              })
            ]).start();
          }

          resetPosition();
        },
        onPanResponderTerminate: resetPosition,
      })
    ).current;

    return (
      <View style={{ position: 'relative' }}>
        {/* Reply indicator that appears on swipe */}
        <Animated.View
          style={[
            styles.replyIndicator,
            {
              opacity: replyIconOpacity,
              transform: [{ scale: replyIconScale }],
            }
          ]}
        >
          <Icon name="reply" size={20} color="#22C55E" />
          <Text style={styles.replyIndicatorText}>Reply</Text>
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateX }],
            backgroundColor: translateX.interpolate({
              inputRange: [0, 80],
              outputRange: ['transparent', 'rgba(34, 197, 94, 0.1)'],
            }),
          }}
          {...panResponder.panHandlers}
        >
          {children}
        </Animated.View>
      </View>
    );
  };


  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const term = searchQuery.toLowerCase();
    const results = messages.filter(m => m.content?.toLowerCase().includes(term));
    setSearchResults(results);
  }, [searchQuery, messages]);

  // Agreement handling
  const handleAcceptAgreement = async (agreementId) => {
    try {
      setProcessingAction(true);
      console.log('📱 [WriterChat] Accepting agreement:', agreementId);
      
      const result = await agreementApi.acceptAgreement(agreementId);
      console.log('📱 [WriterChat] Agreement accepted:', result);
      
      // Refresh both agreements and chats
      await Promise.all([
        fetchAgreements(),
        fetchChats()
      ]);

      // Close modal
      setShowReviewModal(false);
      setSelectedAgreement(null);
      
      Alert.alert(
        'Success! 🎉',
        'Agreement accepted successfully! You can now start working on this project.',
        [
          {
            text: 'View Dashboard',
            onPress: () => {
              setShowChatList(true);
              setActiveTab('agreements');
            }
          },
          {
            text: 'Continue Chat',
            style: 'cancel'
          }
        ]
      );
    } catch (err) {
      console.error('📱 [WriterChat] Error accepting agreement:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to accept agreement. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessingAction(false);
    }
  };

  const handleCancelAgreement = async (agreementId) => {
    try {
      setProcessingAction(true);
      console.log('📱 [WriterChat] Cancelling agreement:', agreementId);
      
      const result = await agreementApi.cancelAgreement(agreementId);
      console.log('📱 [WriterChat] Agreement cancelled:', result);
      
      // Refresh both agreements and chats
      await Promise.all([
        fetchAgreements(),
        fetchChats()
      ]);

      // Close modal
      setShowReviewModal(false);
      setSelectedAgreement(null);
      
      Alert.alert('Agreement Cancelled', 'The agreement has been cancelled successfully.');
    } catch (err) {
      console.error('📱 [WriterChat] Error cancelling agreement:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to cancel agreement. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReviewAgreement = (agreement) => {
    console.log('📱 [WriterChat] Reviewing agreement:', agreement._id);
    setSelectedAgreement(agreement);
    setShowReviewModal(true);
  };

  const handleCompleteAssignment = (agreementId) => {
    console.log('📱 [WriterChat] Initiating assignment completion:', agreementId);
    const agreement = agreements.find(a => a._id === agreementId);
    setSelectedAgreement(agreement);
    setShowCompleteModal(true);
  };

  const handleConfirmComplete = async () => {
    if (!selectedAgreement) return;

    try {
      setProcessingAction(true);
      console.log('📱 [WriterChat] Completing assignment:', selectedAgreement._id);
      
      const result = await agreementApi.completeAgreement(selectedAgreement._id);
      console.log('📱 [WriterChat] Agreement completed:', result);
      
      // Close modal and refresh data
      setShowCompleteModal(false);
      setSelectedAgreement(null);
      
      // Refresh agreements and chats
      await Promise.all([
        fetchAgreements(),
        fetchChats()
      ]);
      
      Alert.alert(
        'Success! 🎉',
        'Assignment marked as completed! The student will be notified.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('📱 [WriterChat] Error completing agreement:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to complete assignment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessingAction(false);
    }
  };

  const handleCloseModals = () => {
    setShowReviewModal(false);
    setShowCompleteModal(false);
    setSelectedAgreement(null);
  };

  // File handling utility functions
  const getFileIcon = (fileName) => {
    if (!fileName) return '📄';
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf': return '📕';
      case 'doc':
      case 'docx': return '📘';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📽️';
      case 'txt': return '📝';
      case 'zip':
      case 'rar': return '🗜️';
      case 'mp3':
      case 'm4a':
      case 'wav': return '🎵';
      case 'mp4':
      case 'mov':
      case 'avi': return '🎬';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      default: return '📄';
    }
  };

  const getFileExtension = (fileName) => {
    if (!fileName) return 'File';
    const extension = fileName.toLowerCase().split('.').pop();
    return extension ? extension.toUpperCase() : 'FILE';
  };

  const handleFileDownload = async (fileUrl, fileName) => {
    try {
      console.log('📥 [WriterChat] Downloading file:', { fileUrl, fileName });
      
      if (!fileUrl) {
        showSnackbar('File URL not available');
        return;
      }
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        try {
          const link = document.createElement('a');
          link.href = fileUrl;
          link.download = fileName || 'download';
          link.target = '_blank'; // Open in new tab as fallback
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showSnackbar('Download started');
        } catch (webError) {
          // Fallback: open in new tab
          window.open(fileUrl, '_blank');
          showSnackbar('File opened in new tab');
        }
      } else {
        // For mobile, try to open the file
        try {
          const supported = await Linking.canOpenURL(fileUrl);
          if (supported) {
            await Linking.openURL(fileUrl);
            showSnackbar('Opening file...');
          } else {
            // Try alternative approach
            console.log('🔄 [WriterChat] Direct link not supported, trying alternative...');
            await Linking.openURL(fileUrl);
          }
        } catch (linkingError) {
          console.error('❌ [WriterChat] Linking failed:', linkingError);
          showSnackbar('Unable to open file. File URL copied to clipboard.');
          // On mobile web, we can try navigator share
          if (navigator.share) {
            try {
              await navigator.share({
                title: fileName || 'Shared File',
                url: fileUrl
              });
            } catch (shareError) {
              console.error('❌ [WriterChat] Share failed:', shareError);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ [WriterChat] Download failed:', error);
      showSnackbar('Failed to access file. Please try again.');
    }
  };

  const handleAudioPlay = async (audioUrl, messageId) => {
    try {
      console.log('🎵 [WriterChat] Audio action for:', audioUrl, messageId);
      
      if (!audioUrl) {
        showSnackbar('Audio URL not available');
        return;
      }

      // If currently playing this audio, pause it
      if (playingAudioId === messageId && currentSound) {
        await currentSound.pauseAsync();
        setPlayingAudioId(null);
        setCurrentSound(null);
        showSnackbar('Audio paused');
        return;
      }

      // If playing another audio, stop it first
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      }
      
      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false
      });
      
      // Create and play audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: true,
          volume: 1.0,
          rate: 1.0,
          shouldCorrectPitch: true,
          progressUpdateIntervalMillis: 100,
          positionMillis: 0
        }
      );
      
      setCurrentSound(sound);
      setPlayingAudioId(messageId);
      
      // Track when audio finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          setPlayingAudioId(null);
          setCurrentSound(null);
          console.log('🎵 [WriterChat] Audio playback finished');
        }
        if (status.error) {
          console.error('❌ [WriterChat] Audio playback error:', status.error);
          sound.unloadAsync();
          setPlayingAudioId(null);
          setCurrentSound(null);
        }
      });
      
      showSnackbar('Playing voice message');
    } catch (error) {
      console.error('❌ [WriterChat] Audio playback failed:', error);
      setPlayingAudioId(null);
      setCurrentSound(null);
      
      // Fallback: try to open audio URL directly
      try {
        if (Platform.OS === 'web') {
          // For web, try HTML5 audio
          const audio = new Audio(audioUrl);
          audio.play().catch(() => {
            // Final fallback: open in new tab
            window.open(audioUrl, '_blank');
          });
        } else {
          await Linking.openURL(audioUrl);
        }
        showSnackbar('Opening audio file...');
      } catch (fallbackError) {
        console.error('❌ [WriterChat] Audio fallback failed:', fallbackError);
        showSnackbar('Failed to play audio. Try downloading the file.');
      }
    }
  };

  // Audio Call Functions
  const requestCallPermissions = async () => {
    try {
      console.log('📞 [WriterChat] Requesting call permissions...');
      
      // Request microphone permission
      const { status: micStatus } = await Audio.requestPermissionsAsync();
      if (micStatus !== 'granted') {
        throw new Error('Microphone permission denied');
      }
      
      // Set audio mode for calls
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true
      });
      
      console.log('✅ [WriterChat] Call permissions granted');
      return true;
    } catch (error) {
      console.error('❌ [WriterChat] Call permission error:', error);
      Alert.alert('Permission Required', 'Microphone access is required for audio calls.');
      return false;
    }
  };

  const playRingtone = async () => {
    try {
      if (ringtoneSound) {
        await ringtoneSound.unloadAsync();
      }
      
      // Use a simple ringtone sound (you can replace with actual ringtone file)
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/live-the-moment-67986.mp3'), // Using existing audio file
        { shouldPlay: true, isLooping: true, volume: 0.5 }
      );
      
      setRingtoneSound(sound);
    } catch (error) {
      console.error('❌ [WriterChat] Ringtone error:', error);
    }
  };

  const stopRingtone = async () => {
    try {
      if (ringtoneSound) {
        await ringtoneSound.unloadAsync();
        setRingtoneSound(null);
      }
    } catch (error) {
      console.error('❌ [WriterChat] Stop ringtone error:', error);
    }
  };

  const startCallTimer = () => {
    const timer = setInterval(() => {
      if (callStartTime) {
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        setCallDuration(duration);
      }
    }, 1000);
    setCallTimer(timer);
  };

  const stopCallTimer = () => {
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
  };

  const initiateCall = async (otherUser) => {
    try {
      console.log('📞 [WriterChat] Initiating call to:', otherUser.name);
      
      const hasPermissions = await requestCallPermissions();
      if (!hasPermissions) return;
      
      const callId = `call_${Date.now()}_${user._id}`;

      // Emit call initiation before navigating
      if (socket) {
        socket.emit('initiateCall', {
          to: otherUser._id || otherUser.id,
          from: user._id,
          fromName: user.name,
          fromAvatar: user.avatar,
          chatId: currentChat?.id,
          callId,
          // Legacy keys
          recipientId: otherUser._id || otherUser.id,
          callerId: user._id,
          callerName: user.name,
          callerAvatar: user.avatar,
        });
      }

      // Navigate to WebRTC audio call screen
      router.push({
        pathname: '/audio-call',
        params: {
          userId: otherUser._id || otherUser.id,
          userName: otherUser.name,
          userAvatar: otherUser.avatar,
          isIncoming: 'false',
          chatId: currentChat?.id,
          callId
        }
      });
      
      showSnackbar(`Calling ${otherUser.name}...`);
    } catch (error) {
      console.error('❌ [WriterChat] Call initiation error:', error);
      setCallState('failed');
      Alert.alert('Call Failed', 'Unable to initiate call. Please try again.');
    }
  };

  const acceptCall = async () => {
    try {
      console.log('📞 [WriterChat] Accepting call...');
      
      const hasPermissions = await requestCallPermissions();
      if (!hasPermissions) return;
      
      setCallState('connected');
      setCallStartTime(Date.now());
      stopRingtone();
      startCallTimer();
      
      // Start simulated audio streaming
      startAudioStreaming();
      
      // Emit call accepted event
      if (socket && incomingCall) {
        socket.emit('callAccepted', {
          callId: incomingCall.id,
          recipientId: user._id,
          timestamp: Date.now()
        });
      }
      
      showSnackbar('Call connected');
    } catch (error) {
      console.error('❌ [WriterChat] Call accept error:', error);
      setCallState('failed');
      Alert.alert('Call Failed', 'Unable to accept call. Please try again.');
    }
  };

  const rejectCall = () => {
    try {
      console.log('📞 [WriterChat] Rejecting call...');
      
      setCallState('idle');
      stopRingtone();
      
      // Emit call rejected event
      if (socket && incomingCall) {
        socket.emit('callRejected', {
          callId: incomingCall.id,
          recipientId: user._id
        });
      }
      
      setIncomingCall(null);
      showSnackbar('Call rejected');
    } catch (error) {
      console.error('❌ [WriterChat] Call reject error:', error);
    }
  };

  const endCall = () => {
    try {
      console.log('📞 [WriterChat] Ending call...');
      
      setCallState('idle');
      setCallDuration(0);
      setCallStartTime(null);
      stopCallTimer();
      stopRingtone();
      stopAudioStreaming();
      
      // Emit call ended event
      if (socket) {
        socket.emit('callEnded', {
          callId: incomingCall?.id || outgoingCall?.id,
          userId: user._id,
          timestamp: Date.now()
        });
      }
      
      setIncomingCall(null);
      setOutgoingCall(null);
      setIsMuted(false);
      setIsSpeakerOn(false);
      
      showSnackbar('Call ended');
    } catch (error) {
      console.error('❌ [WriterChat] Call end error:', error);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    showSnackbar(isMuted ? 'Microphone unmuted' : 'Microphone muted');
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(prev => !prev);
    showSnackbar(isSpeakerOn ? 'Speaker off' : 'Speaker on');
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced audio streaming simulation for real-time calls
  const startAudioStreaming = async () => {
    try {
      console.log('🎵 [WriterChat] Starting audio streaming simulation...');
      
      // Set up audio mode for real-time streaming
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      });

      // Simulate real-time audio streaming
      // In a real implementation, this would handle WebRTC audio streams
      console.log('✅ [WriterChat] Audio streaming started');
      
    } catch (error) {
      console.error('❌ [WriterChat] Audio streaming error:', error);
    }
  };

  const stopAudioStreaming = () => {
    try {
      console.log('🎵 [WriterChat] Stopping audio streaming...');
      // Clean up audio streaming resources
      console.log('✅ [WriterChat] Audio streaming stopped');
    } catch (error) {
      console.error('❌ [WriterChat] Stop audio streaming error:', error);
    }
  };

  // Utility functions
  const scrollToBottom = (animated = true) => {
    if (isMountedRef.current && flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        try {
          if (isMountedRef.current && flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated });
          }
        } catch (error) {
          console.warn('Failed to scroll to bottom:', error);
        }
      }, animated ? 100 : 50);
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };


  const formatTime = (timestamp) => {
    try {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      const now = new Date();
      const diff = now.getTime() - date.getTime();

      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (error) {
      return '';
    }
  };

  const formatCurrency = (amount, agreement = null) => {
    // Detect currency from agreement if available
    let currency = 'USD';

    if (agreement?.paymentPreferences) {
      const prefs = agreement.paymentPreferences;

      // Check for explicit currency setting
      if (prefs.currency === 'ngn') {
        currency = 'NGN';
      }
      // Check for Paystack gateway (typically NGN)
      else if (prefs.gateway === 'paystack') {
        currency = 'NGN';
      }
      // Check for native amount indicators
      else if (prefs.nativeAmount && prefs.nativeAmount !== agreement.totalAmount && prefs.exchangeRate === 1) {
        currency = 'NGN';
      }
      else if (prefs.nativeAmount && prefs.nativeAmount > 5000) {
        currency = 'NGN';
      }
      // Default to explicit currency or USD
      else {
        currency = (prefs.currency || 'USD').toUpperCase();
      }
    }

    console.log('💵 [WriterChat] Formatting currency:', {
      amount,
      currency,
      agreementId: agreement?._id
    });

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'active': return '#10b981';
      case 'completed': return '#6366f1';
      case 'disputed': return '#ef4444';
      default: return '#64748b';
    }
  };

  // Render functions
  const renderChatListItem = ({ item: chat }) => (
    <TouchableOpacity
      style={[
        styles.chatItem,
        chat.unreadCount > 0 && styles.unreadChatItem
      ]}
      onPress={() => handleSelectChat(chat)}
    >
      <View style={styles.chatAvatar}>
        <Avatar.Image
          size={50}
          source={{
            uri: chat.otherParticipant?.avatar ||
                 `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(chat.otherParticipant?.name || 'User')}`
          }}
        />
        {chat.otherParticipant?.isOnline && (
          <Badge size={12} style={styles.onlineBadge} />
        )}
        {chat.unreadCount > 0 && (
          <Badge size={18} style={styles.unreadBadge}>
            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
          </Badge>
        )}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {chat.otherParticipant?.name || 'Unknown User'}
          </Text>
          <Text style={styles.chatTime}>
            {formatTime(chat.lastMessageTime)}
          </Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={2}>
          {chat.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderAgreementItem = ({ item: agreement }) => (
    <Card style={styles.agreementCard}>
      <View style={styles.agreementHeader}>
        <View style={styles.agreementInfo}>
          <Text style={styles.agreementTitle} numberOfLines={2}>
            {agreement.title}
          </Text>
          <Text style={styles.agreementStudent}>
            Student: {agreement.studentName}
          </Text>
          <Text style={styles.agreementAmount}>
            {formatCurrency(agreement.amount, agreement)}
          </Text>
        </View>
        
        <Chip
          style={[styles.statusChip, { backgroundColor: getStatusColor(agreement.status) }]}
          textStyle={styles.statusChipText}
        >
          {agreement.status.toUpperCase()}
        </Chip>
      </View>

      {agreement.deadline && (
        <Text style={styles.agreementDeadline}>
          Due: {new Date(agreement.deadline).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </Text>
      )}

      <View style={styles.agreementActions}>
        {agreement.status === 'pending' && (
          <>
            <Button
              mode="contained"
              onPress={() => handleReviewAgreement(agreement)}
              style={styles.acceptButton}
              labelStyle={styles.acceptButtonText}
              icon="check-circle"
            >
              Review Agreement
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.push(`/agreement/${agreement.id}`)}
              style={styles.viewButton}
              icon="eye"
            >
              View Details
            </Button>
          </>
        )}
        
        {agreement.status === 'active' && (
          <>
            <Button
              mode="contained"
              onPress={() => handleCompleteAssignment(agreement.id)}
              style={styles.completeButton}
              labelStyle={styles.completeButtonText}
              icon="check"
            >
              Mark Complete
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.push(`/agreement/${agreement.id}`)}
              style={styles.viewButton}
              icon="eye"
            >
              View Details
            </Button>
          </>
        )}
        
        {agreement.status === 'completed' && (
          <Button
            mode="outlined"
            onPress={() => router.push(`/agreement/${agreement.id}`)}
            style={styles.viewButton}
            icon="file-document"
          >
            View Completed Project
          </Button>
        )}
      </View>
    </Card>
  );

  const renderMessageStatus = (message) => {
    if (message.sender?._id !== user._id) return null;
    const isSending = sendingMessages.has(message.id);
    if (isSending) return (<Text style={{ marginLeft: 4, fontSize: 10, color: '#9ca3af' }}>⏳</Text>);
    if (message.read) return (<Text style={{ marginLeft: 4, fontSize: 10, color: '#2563EB' }}>✓✓</Text>);
    return (<Text style={{ marginLeft: 4, fontSize: 10, color: '#9ca3af' }}>✓</Text>);
  };

  const renderMessage = ({ item: message, index }) => {
    const isOwn = message.sender?._id === user._id;
    const isHighlighted = highlightedMessageId === message.id;
    const showAvatar = !isOwn && (index === messages.length - 1 || messages[index + 1]?.sender?._id !== message.sender?._id);

    const MessageContent = () => (
      <View style={[
        styles.messageContainer,
        isOwn ? styles.ownMessageContainer : styles.otherMessageContainer,
        isHighlighted && styles.highlightedMessage
      ]}>
        {!isOwn && showAvatar && (
          <Avatar.Image
            size={32}
            source={{
              uri: message.sender?.avatar ||
                   `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(message.sender?.name || 'User')}`
            }}
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble, 
          isOwn ? styles.ownBubble : styles.otherBubble,
          !isOwn && !showAvatar && { marginLeft: 40 }
        ]}>
          {message.replyTo && (
            <TouchableOpacity
              style={styles.replyPreview}
              onPress={() => scrollToMessage(message.replyTo._id)}
            >
              <View style={styles.replyBar} />
              <View style={{ flex: 1, flexShrink: 1 }}>
                <Text style={[styles.replyAuthor, { color: isOwn ? 'rgba(255,255,255,0.9)' : '#1F2937' }]} numberOfLines={1}>
                  {message.replyTo.sender?.name}
                </Text>
                <Text style={[styles.replyText, { color: isOwn ? 'rgba(255,255,255,0.7)' : '#6B7280' }]} numberOfLines={2}>
                  {message.replyTo.content}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {message.fileUrl ? (
            <View>
              {message.fileType?.startsWith('image/') ? (
                <TouchableOpacity onPress={() => Linking.openURL(message.fileUrl)}>
                  <Image source={{ uri: message.fileUrl }} style={styles.messageImage} resizeMode="cover" />
                </TouchableOpacity>
              ) : message.fileType?.startsWith('audio/') ? (
                <TouchableOpacity style={styles.audioContainer} onPress={() => handleAudioPlay(message.fileUrl, message.id)}>
                  <View style={styles.audioPlay}>
                    <Icon 
                      name={playingAudioId === message.id ? "pause" : "play"} 
                      size={16} 
                      color="white" 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.audioTitle, { color: isOwn ? 'white' : '#1F2937' }]}>Voice message</Text>
                    {message.voiceDuration && (
                      <Text style={[styles.audioDuration, { color: isOwn ? 'rgba(255,255,255,0.7)' : '#6B7280' }]}>
                        {Math.floor(message.voiceDuration / 60)}:{(message.voiceDuration % 60).toString().padStart(2, '0')}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity style={{ padding: 4 }} onPress={() => handleFileDownload(message.fileUrl, message.fileName)}>
                    <Icon name="download" size={16} color={isOwn ? 'rgba(255,255,255,0.8)' : '#667EEA'} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.documentRow} onPress={() => handleFileDownload(message.fileUrl, message.fileName)}>
                  <View style={styles.documentIcon}>
                    <Text style={{ color: 'white', fontSize: 18 }}>{getFileIcon(message.fileName)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.documentName, { color: isOwn ? 'white' : '#1F2937' }]} numberOfLines={1}>
                      {message.fileName || 'Unknown file'}
                    </Text>
                    <Text style={[styles.documentMeta, { color: isOwn ? 'rgba(255,255,255,0.7)' : '#6B7280' }]}>
                      {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(1)}MB` : 'File'} • {getFileExtension(message.fileName)}
                    </Text>
                  </View>
                  <TouchableOpacity style={{ padding: 4 }} onPress={() => handleFileDownload(message.fileUrl, message.fileName)}>
                    <Icon name="download" size={16} color={isOwn ? 'rgba(255,255,255,0.8)' : '#667EEA'} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}

              {message.content ? (
                <Text style={[
                  styles.messageText,
                  isOwn ? styles.ownMessageText : styles.otherMessageText,
                  { marginTop: 8 }
                ]}>
                  {message.content}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
              {message.content}
            </Text>
          )}

          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isOwn ? styles.ownMessageTime : styles.otherMessageTime]}>
              {formatTime(message.timestamp) || ' '}
            </Text>
            {isOwn && renderMessageStatus(message)}
          </View>
        </View>

        {!isOwn && (
          <TouchableOpacity style={styles.replyButton} onPress={() => handleReply(message)}>
            <Icon name="reply" size={14} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    );

    // Wrap in swipeable for reply functionality
    return (
      <SwipeableMessage
        message={message}
        onSwipeReply={handleReply}
      >
        <MessageContent />
      </SwipeableMessage>
    );
  };

  const renderMainList = () => {
    if (activeTab === 'chats') {
      return (
        <View style={styles.listContainer}>
          {chats.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>No Conversations Yet</Text>
              <Text style={styles.emptyText}>
                Your student conversations will appear here
              </Text>
            </View>
          ) : (
            <FlatList
              data={chats}
              renderItem={renderChatListItem}
              keyExtractor={(item, index) => `${String(item._id || item.id || item.chatId || (item?.otherParticipant && (item?.otherParticipant?._id || item?.otherParticipant?.id)) || 'chat')}-${index}`}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {agreements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Agreements Yet</Text>
            <Text style={styles.emptyText}>
              Project agreements from students will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={agreements}
            renderItem={renderAgreementItem}
            keyExtractor={(item, index) => `${String(item._id || item.id || item.agreementId || 'agreement')}-${index}`}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.agreementsList}
          />
        )}
      </View>
    );
  };

  const renderMainView = () => (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#015382', '#017DB0']} style={styles.mainHeader}>
        <Text style={styles.mainTitle}>Writer Dashboard</Text>
        <Text style={styles.mainSubtitle}>Manage your conversations and agreements</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
          onPress={() => setActiveTab('chats')}
        >
          <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>
            💬 Messages ({chats.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'agreements' && styles.activeTab]}
          onPress={() => setActiveTab('agreements')}
        >
          <Text style={[styles.tabText, activeTab === 'agreements' && styles.activeTabText]}>
            📋 Agreements ({agreements.filter(a => a.status === 'pending').length})
          </Text>
        </TouchableOpacity>
      </View>

      {renderMainList()}
    </View>
  );

  const renderChatView = () => (
    <View style={styles.chatContainer}>
      {/* Professional Chat Header */}
      <LinearGradient colors={['#015382', '#017DB0']} style={styles.chatHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setShowChatList(true)}
        >
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.chatHeaderInfo}>
          <Avatar.Image
            size={42}
            source={{
              uri: currentChat?.otherParticipant?.avatar ||
                   `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentChat?.otherParticipant?.name || 'User')}`
            }}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>
              {currentChat?.otherParticipant?.name || 'Unknown User'}
            </Text>
            <View style={styles.statusContainer}>
              {otherUserTyping ? (
                <Text style={styles.typingText}>typing...</Text>
              ) : (
                <Text style={styles.headerStatus}>
                  {onlineUsers.has(currentChat?.otherParticipant?._id) ? 'Online' : 'Offline'}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={() => initiateCall(currentChat?.otherParticipant)}
            disabled={callState !== 'idle' || !currentChat?.otherParticipant}
          >
            <Icon name="phone" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <Icon name="dots-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      {searchQuery || searchResults.length > 0 ? (
        <View style={{
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
          paddingHorizontal: 16,
          paddingVertical: 12
        }}>
          <Searchbar
            placeholder="Search messages..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ backgroundColor: '#F1F5F9', borderRadius: 12 }}
          />
          {searchResults.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {searchResults.map(result => (
                <TouchableOpacity
                  key={result.id}
                  style={{
                    backgroundColor: '#F0F9FF',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: '#0EA5E9'
                  }}
                  onPress={() => scrollToMessage(result.id)}
                >
                  <Text style={{ fontSize: 12, color: '#0EA5E9' }} numberOfLines={1}>
                    {result.content.substring(0, 30)}...
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      ) : null}

      {/* Messages */}
      <View style={styles.messagesContainer}>
        {loadingMessages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#015382" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyMessages}>
            <Icon name="message-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyMessagesText}>
              Start the conversation with {currentChat?.otherParticipant?.name}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => `${String(item._id || item.id || item.messageId || item.timestamp || 'msg')}-${index}`}
            contentContainerStyle={[styles.messagesList, { paddingBottom: 24 }]}
            onContentSizeChange={() => scrollToBottom(true)}
            onLayout={() => scrollToBottom(true)}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={(info) => {
              try {
                const wait = new Promise(resolve => setTimeout(resolve, 300));
                wait.then(() => {
                  if (flatListRef.current) {
                    flatListRef.current.scrollToOffset({ offset: Math.max(0, info.averageItemLength * info.index), animated: true });
                  }
                });
              } catch (e) {}
            }}
            getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
            onScroll={(e) => {
              const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
              const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;
              setShowScrollToBottom(!isAtBottom);
            }}
            removeClippedSubviews={false}
            maxToRenderPerBatch={15}
            windowSize={15}
            initialNumToRender={25}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10
            }}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
          />
        )}
        
        {/* Typing Indicator */}
        {otherUserTyping && (
          <View style={styles.typingIndicator}>
            <Avatar.Image
              size={24}
              source={{
                uri: currentChat?.otherParticipant?.avatar ||
                     `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentChat?.otherParticipant?.name || 'User')}`
              }}
            />
            <View style={styles.typingBubble}>
              <Text style={styles.typingDotsText}>•••</Text>
            </View>
          </View>
        )}
      </View>

      {/* Reply Banner */}
      {replyingTo && (
        <View style={styles.replyBanner}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => scrollToMessage(replyingTo.id || replyingTo._id)}>
            <Text style={styles.replyBannerTitle}>Replying to {replyingTo.sender?.name}</Text>
            <Text style={styles.replyBannerText} numberOfLines={1}>{replyingTo.content}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={cancelReply}>
            <Text style={{ color: '#6B7280' }}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Files Preview */}
      {selectedFiles.length > 0 && (
        <View style={styles.filesPreview}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedFiles.map((file, index) => (
              <View key={`${file.name}-${index}`} style={styles.filePreviewItem}>
                {file.mimeType?.startsWith('image/') ? (
                  <Image source={{ uri: file.uri }} style={styles.previewImage} />
                ) : (
                  <View style={[styles.previewFileIcon, { backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 20 }}>{getFileIcon(file.name)}</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => removeFile(index)}
                  style={{ position: 'absolute', top: -6, right: -6 }}
                >
                  <Text style={{ fontSize: 18, color: '#EF4444' }}>✕</Text>
                </TouchableOpacity>
                <Text numberOfLines={1} style={{ fontSize: 11, marginTop: 4, maxWidth: 70 }}>
                  {file.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Professional Input Area */}
      <View style={[styles.inputContainer, { paddingBottom: keyboardHeight > 0 ? 5 : 20 }]}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => handleFileSelect('document')}
          >
            <Icon name="attachment" size={18} color="#667EEA" />
          </TouchableOpacity>

          <View style={styles.textInputContainer}>
            <RNTextInput
              value={messageText}
              onChangeText={handleTypingChange}
              placeholder="Type a message..."
              multiline
              style={styles.textInput}
              placeholderTextColor="#9CA3AF"
              maxLength={1000}
              textAlignVertical="top"
            />
          </View>

          {isRecording ? (
            <TouchableOpacity
              style={styles.recordingButton}
              onPress={stopRecording}
            >
              <Icon name="stop" size={18} color="white" />
              <Text style={styles.recordingTime}>
                {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          ) : messageText.trim() || selectedFiles.length > 0 ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon name="send" size={16} color="white" />
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.micButton}
              onPress={startRecording}
            >
              <Icon name="microphone" size={16} color="#22C55E" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showScrollToBottom && (
        <TouchableOpacity style={styles.scrollToBottomButton} onPress={scrollToBottom}>
          <Text style={{ color: 'white', fontSize: 18 }}>⌄</Text>
        </TouchableOpacity>
      )}

      {/* Audio Call UI */}
      {callState !== 'idle' && (
        <View style={styles.callContainer}>
          <LinearGradient colors={['#1F2937', '#374151']} style={styles.callHeader}>
            <View style={styles.callInfo}>
              <Avatar.Image
                size={60}
                source={{
                  uri: incomingCall?.callerAvatar || outgoingCall?.recipientAvatar ||
                       `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                         incomingCall?.callerName || outgoingCall?.recipientName || 'User'
                       )}`
                }}
              />
              <View style={styles.callDetails}>
                <Text style={styles.callName}>
                  {incomingCall?.callerName || outgoingCall?.recipientName || 'Unknown User'}
                </Text>
                <Text style={styles.callStatus}>
                  {callState === 'calling' && 'Calling...'}
                  {callState === 'ringing' && 'Incoming call'}
                  {callState === 'connected' && `Connected • ${formatCallDuration(callDuration)}`}
                  {callState === 'ended' && 'Call ended'}
                  {callState === 'failed' && 'Call failed'}
                </Text>
                {callQuality !== 'good' && callState === 'connected' && (
                  <Text style={styles.callQuality}>
                    Call quality: {callQuality}
                  </Text>
                )}
              </View>
            </View>
          </LinearGradient>

          <View style={styles.callControls}>
            {callState === 'ringing' && (
              <>
                <TouchableOpacity style={styles.rejectButton} onPress={rejectCall}>
                  <Icon name="phone-hangup" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton} onPress={acceptCall}>
                  <Icon name="phone" size={24} color="white" />
                </TouchableOpacity>
              </>
            )}

            {callState === 'calling' && (
              <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
                <Icon name="phone-hangup" size={24} color="white" />
              </TouchableOpacity>
            )}

            {callState === 'connected' && (
              <>
                <TouchableOpacity 
                  style={[styles.callControlButton, isMuted && styles.callControlButtonActive]} 
                  onPress={toggleMute}
                >
                  <Icon name={isMuted ? "microphone-off" : "microphone"} size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.callControlButton, isSpeakerOn && styles.callControlButtonActive]} 
                  onPress={toggleSpeaker}
                >
                  <Icon name={isSpeakerOn ? "volume-high" : "volume-low"} size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
                  <Icon name="phone-hangup" size={24} color="white" />
                </TouchableOpacity>
              </>
            )}

            {(callState === 'ended' || callState === 'failed') && (
              <TouchableOpacity style={styles.closeCallButton} onPress={endCall}>
                <Icon name="close" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#015382" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#015382" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        style={styles.container}
      >
        {showChatList ? renderMainView() : renderChatView()}
      </KeyboardAvoidingView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>

      {/* Review Agreement Modal */}
      <ReviewAgreementModal
        visible={showReviewModal}
        agreement={selectedAgreement}
        onClose={handleCloseModals}
        onAccept={handleAcceptAgreement}
        onCancel={handleCancelAgreement}
        loading={processingAction}
      />

      {/* Complete Assignment Modal */}
      <CompleteAssignmentModal
        visible={showCompleteModal}
        onClose={handleCloseModals}
        onConfirm={handleConfirmComplete}
        projectTitle={selectedAgreement?.projectDetails?.title || 'this assignment'}
        loading={processingAction}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  
  // Main View Styles
  mainContainer: {
    flex: 1,
  },
  mainHeader: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 5,
  },
  mainSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#015382',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#015382',
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  list: {
    flex: 1,
  },
  
  // Chat List Styles
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  unreadChatItem: {
    backgroundColor: '#fef3c7',
  },
  chatAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#22c55e',
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: '#64748b',
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  
  // Agreement Styles
  agreementsList: {
    padding: 15,
  },
  agreementCard: {
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
  },
  agreementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 15,
    paddingBottom: 10,
  },
  agreementInfo: {
    flex: 1,
    marginRight: 10,
  },
  agreementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 5,
  },
  agreementStudent: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  agreementAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#015382',
  },
  statusChip: {
    borderRadius: 20,
  },
  statusChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  agreementDeadline: {
    fontSize: 12,
    color: '#f59e0b',
    paddingHorizontal: 15,
    marginBottom: 10,
    fontWeight: '500',
  },
  agreementActions: {
    flexDirection: 'row',
    padding: 15,
    paddingTop: 10,
    gap: 10,
  },
  acceptButton: {
    backgroundColor: '#059669',
    flex: 1,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#3b82f6',
    flex: 1,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  viewButton: {
    borderColor: '#015382',
    flex: 1,
  },
  
  // Chat View Styles
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 15,
  },
  headerTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  headerStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  
  // Messages Styles
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesList: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 6,
    marginHorizontal: 12,
    alignItems: 'flex-end',
  },

  // Reply Styles
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#22C55E',
    alignSelf: 'stretch',
    maxWidth: '90%',
    flexShrink: 1,
  },
  replyBar: {
    width: 3,
    backgroundColor: '#22C55E',
    borderRadius: 1.5,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0, // Allow text to wrap properly
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
    lineHeight: 16,
    flexShrink: 1,
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    maxWidth: width * 0.8,
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    maxWidth: width * 0.8,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageAvatar: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: '100%',
    flexShrink: 1,
  },
  highlightedMessage: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
    padding: 4,
    margin: 2,
  },
  ownBubble: {
    backgroundColor: '#015382',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    flex: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#1e293b',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#64748b',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 8,
  },
  audioPlay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  audioTitle: { 
    fontSize: 14, 
    fontWeight: '500' 
  },
  audioDuration: { 
    fontSize: 12, 
    marginTop: 2 
  },
  documentRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 10, 
    padding: 10
  },
  documentIcon: {
    width: 40, 
    height: 40, 
    borderRadius: 8, 
    backgroundColor: '#667EEA', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10
  },
  documentName: { 
    fontSize: 14, 
    fontWeight: '600' 
  },
  documentMeta: { 
    fontSize: 12 
  },
  messageFooter: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 6 
  },

  replyPreview: {
    flexDirection: 'row', 
    marginBottom: 8, 
    backgroundColor: 'rgba(34,197,94,0.10)', 
    borderRadius: 8, 
    padding: 8,
    alignSelf: 'stretch',
    flexShrink: 1,
    minWidth: width * 0.5
  },
  replyBar: { 
    width: 3, 
    backgroundColor: '#22C55E', 
    borderRadius: 2, 
    marginRight: 8 
  },
  replyAuthor: { 
    fontSize: 12, 
    fontWeight: '600', 
    marginBottom: 2 
  },
  replyText: { 
    fontSize: 13 
  },
  
  // Input Styles
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8fafc',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
    minHeight: 36,
    maxHeight: 120,
  },
  textInput: {
    fontSize: 14,
    color: '#1f2937',
    textAlignVertical: 'top',
    lineHeight: 18,
    paddingVertical: 6,
    minHeight: 24,
    maxHeight: 96,
    backgroundColor: 'transparent',
  },
  sendFab: { 
    backgroundColor: '#015382', 
    borderRadius: 16, 
    width: 32, 
    height: 32, 
    alignItems: 'center', 
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#015382',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  micButton: { 
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  recordingButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scrollToBottomButton: { 
    position: 'absolute', 
    bottom: 20, 
    right: 20, 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#667EEA', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },

  // Reply indicator styles for swipe gesture
  replyIndicator: {
    position: 'absolute',
    left: -60,
    top: '50%',
    transform: [{ translateY: -15 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  replyIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Reply Banner & Files Preview
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  replyBannerTitle: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#0EA5E9', 
    marginBottom: 2 
  },
  replyBannerText: { 
    fontSize: 14, 
    color: '#64748B' 
  },
  filesPreview: { 
    backgroundColor: 'white', 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0', 
    paddingVertical: 10, 
    paddingHorizontal: 16 
  },
  filePreviewItem: { 
    width: 80, 
    alignItems: 'center', 
    marginRight: 12 
  },
  previewImage: { 
    width: 60, 
    height: 60, 
    borderRadius: 8 
  },
  previewFileIcon: { 
    width: 60, 
    height: 60, 
    borderRadius: 8, 
    backgroundColor: '#EEF2FF', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  
  // Empty States
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMessagesIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyMessagesText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
  },
  
  // Professional Chat Styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
  },
  statusContainer: {
    marginTop: 2,
  },
  headerStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  typingText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Professional Input Styles
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 4,
  },
  attachButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    maxHeight: 120,
    minHeight: 36,
    justifyContent: 'center',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#015382',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#015382',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  recordingTime: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Typing Indicator
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  typingBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 1,
  },
  typingDotsText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  
  // Audio Call Styles
  callContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1F2937',
    zIndex: 1000,
  },
  callHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  callInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  callDetails: {
    alignItems: 'center',
    marginTop: 20,
  },
  callName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  callQuality: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 30,
  },
  callControlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callControlButtonActive: {
    backgroundColor: '#3B82F6',
  },
  acceptButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  rejectButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  closeCallButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WriterChat;