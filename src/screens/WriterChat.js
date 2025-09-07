import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
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
    Snackbar,
    TextInput
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { user } = useAuth();
  const { setLoading: setGlobalLoading } = useAppLoading();
  const { socket, joinChat, leaveChat, sendTypingIndicator } = useSocket() || {};

  // State management - comprehensive state for all features
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showChatList, setShowChatList] = useState(!chatId);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'agreements'
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
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

  // Initial data loading
  useEffect(() => {
    fetchChats();
    fetchAgreements();
    
    if (chatId) {
      fetchMessages(chatId);
      setShowChatList(false);
    }
  }, [chatId]);

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
        if (!data || !data.message) return;
        if (currentChat && data.chatId === currentChat.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === (data.message._id || data.message.id))) return prev;
            const mapped = {
              id: data.message._id || data.message.id,
              content: data.message?.content || '',
              sender: data.message?.sender || {},
              timestamp: data.message?.timestamp || data.message?.createdAt || new Date().toISOString(),
              fileUrl: data.message?.fileUrl,
              fileName: data.message?.fileName,
              fileType: data.message?.fileType,
              fileSize: data.message?.fileSize,
              voiceDuration: data.message?.voiceDuration,
              replyTo: data.message?.replyTo,
              read: true
            };
            return [...prev, mapped];
          });
          socket.emit('markMessagesAsRead', { chatId: currentChat.id, userId: user._id });
          setTimeout(() => scrollToBottom(), 50);
        }
        setChats(prev => prev.map(c => c.id === data.chatId ? {
          ...c,
          lastMessage: data.message?.content || c.lastMessage,
          lastMessageTime: data.message?.timestamp || new Date().toISOString()
        } : c));
      } catch (error) {
        console.error('Error handling received message:', error);
      }
    };

    const handleTyping = ({ chatId: cId, userId }) => {
      if (!currentChat || userId === user._id) return;
      if (currentChat.id === cId) {
        setTypingUsers(prev => new Set([...prev, userId]));
      }
    };

    const handleStopTyping = ({ chatId: cId, userId }) => {
      if (!currentChat || userId === user._id) return;
      if (currentChat.id === cId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
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

    return () => {
      socket.off('messageBroadcast', handleReceiveMessage);
      socket.off('newMessage', handleReceiveMessage);
      socket.off('messageSent', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('onlineStatuses', handleOnlineStatuses);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('messagesRead', handleMessagesRead);
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
      console.log('📱 [WriterChat] Fetching messages for chat:', selectedChatId);
      const messagesData = await getChatMessages(selectedChatId);
      console.log('📱 [WriterChat] Messages data:', messagesData);
      
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
        replyTo: msg.replyTo,
        read: msg.read || false
      }));
      
      setMessages(enhancedMessages.reverse()); // Most recent at bottom
      
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
    } catch (err) {
      console.error('📱 [WriterChat] Error fetching messages:', err);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  // Message sending with optimistic updates
  const handleSendMessage = async () => {
    if ((!messageText.trim() && selectedFiles.length === 0) || !currentChat || sending) return;

    const messageContent = messageText.trim();
    const filesToSend = [...selectedFiles];
    const replyToMessage = replyingTo;

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
            replyTo: replyToMessage,
            isOptimistic: true,
            isUploading: true
          };
          setMessages(prev => [...prev, optimisticMessage]);
          setSendingMessages(prev => new Set([...prev, optimisticId]));
          scrollToBottom();

          try {
            const realMessage = await sendChatFile({
              chatId: currentChat.id,
              file: { uri: file.uri, name: file.name, type: file.mimeType, size: file.size },
              content: messageContent,
              replyTo: replyToMessage?._id,
              voiceDuration: file.duration
            });

            setMessages(prev => prev.map(msg => msg.id === optimisticId ? {
            ...realMessage,
            id: realMessage._id,
            isOptimistic: false,
            isUploading: false,
            replyTo: realMessage.replyTo || replyToMessage
          } : msg));

            setSendingMessages(prev => {
              const newSet = new Set(prev);
              newSet.delete(optimisticId);
              return newSet;
            });

          } catch (uploadErr) {
            console.error('❌ [WriterChat] File upload error:', uploadErr);
            console.error('❌ [WriterChat] Error details:', {
              message: uploadErr.message,
              status: uploadErr.status,
              response: uploadErr.response?.data
            });

            let errorMessage = `Failed to upload: ${file.name}`;
            if (uploadErr.response?.data?.message) {
              errorMessage += ` - ${uploadErr.response.data.message}`;
            } else if (uploadErr.message) {
              errorMessage += ` - ${uploadErr.message}`;
            }

            setMessages(prev => prev.map(msg => msg.id === optimisticId ? {
              ...msg,
              content: errorMessage,
              isUploading: false,
              uploadError: true
            } : msg));
            setSendingMessages(prev => {
              const newSet = new Set(prev);
              newSet.delete(optimisticId);
              return newSet;
            });
            showSnackbar(errorMessage);
          }
        }
      } else if (messageContent) {
        const optimisticId = `temp-${Date.now()}`;
        const optimisticMessage = {
          id: optimisticId,
          content: messageContent,
          sender: { _id: user._id, name: user.name, avatar: user.avatar },
          timestamp: new Date().toISOString(),
          replyTo: replyToMessage,
          isOptimistic: true
        };
        setMessages(prev => [...prev, optimisticMessage]);
        setSendingMessages(prev => new Set([...prev, optimisticId]));
        scrollToBottom();

        try {
          const realMessage = await sendChatMessage({
            chatId: currentChat.id,
            content: messageContent,
            replyTo: replyToMessage?._id
          });
          setMessages(prev => prev.map(msg => msg.id === optimisticId ? {
            ...realMessage,
            id: realMessage._id,
            isOptimistic: false,
            replyTo: realMessage.replyTo || replyToMessage
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
            isOptimistic: false
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
  };

  // Message interaction handlers
  const handleReply = (message) => setReplyingTo(message);
  const cancelReply = () => setReplyingTo(null);

  const scrollToMessage = (messageId) => {
    const index = messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 2000);
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

  const handleAudioPlay = async (audioUrl) => {
    try {
      console.log('🎵 [WriterChat] Playing audio:', audioUrl);
      
      if (!audioUrl) {
        showSnackbar('Audio URL not available');
        return;
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
      
      // Track when audio finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          console.log('🎵 [WriterChat] Audio playback finished');
        }
        if (status.error) {
          console.error('❌ [WriterChat] Audio playback error:', status.error);
          sound.unloadAsync();
        }
      });
      
      showSnackbar('Playing voice message');
    } catch (error) {
      console.error('❌ [WriterChat] Audio playback failed:', error);
      
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

  // Utility functions
  const scrollToBottom = () => {
    if (isMountedRef.current && flatListRef.current && flatListRef.current.scrollToEnd && messages.length > 0) {
      setTimeout(() => {
        try {
          if (isMountedRef.current && flatListRef.current && flatListRef.current.scrollToEnd) {
            flatListRef.current.scrollToEnd({ animated: false });
          }
        } catch (error) {
          console.warn('Failed to scroll to bottom:', error);
        }
      }, 100);
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };


  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Now';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
            {formatCurrency(agreement.amount)}
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

    if (isOwn) {
      // Own message - right aligned
      return (
        <View style={[
          styles.messageContainer,
          styles.ownMessageContainer,
          isHighlighted && styles.highlightedMessage
        ]}>
          <View style={[styles.messageBubble, styles.ownBubble]}>
          {message.replyTo && (
            <TouchableOpacity
              style={styles.replyPreview}
              onPress={() => scrollToMessage(message.replyTo._id)}
            >
              <View style={styles.replyBar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.replyAuthor}>{message.replyTo.sender?.name}</Text>
                <Text style={styles.replyText} numberOfLines={2}>{message.replyTo.content}</Text>
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
                <TouchableOpacity style={styles.audioContainer} onPress={() => handleAudioPlay(message.fileUrl)}>
                  <View style={styles.audioPlay}>
                    <Text style={{ color: 'white', fontSize: 14 }}>▶</Text>
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
                    <Text style={{ color: isOwn ? 'rgba(255,255,255,0.8)' : '#667EEA', fontSize: 18 }}>⬇</Text>
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
                    <Text style={{ color: isOwn ? 'rgba(255,255,255,0.8)' : '#667EEA', fontSize: 16 }}>⬇</Text>
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

          <View style={styles.messageFooterRow}>
            <Text style={[styles.messageTime, isOwn ? styles.ownMessageTime : styles.otherMessageTime]}>
              {formatTime(message.timestamp)}
            </Text>
            {renderMessageStatus(message)}
          </View>
        </View>

        <TouchableOpacity style={{ padding: 8, opacity: 0.6 }} onPress={() => handleReply(message)}>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>↩</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    // Other's message - left aligned with avatar
    return (
      <View style={[
        styles.messageContainer,
        styles.otherMessageContainer,
        isHighlighted && styles.highlightedMessage
      ]}>
        {showAvatar && (
          <Avatar.Image
            size={28}
            source={{
              uri: message.sender?.avatar ||
                   `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(message.sender?.name || 'User')}`
            }}
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          styles.otherBubble,
          !showAvatar && { marginLeft: 36 }
        ]}>
          {message.replyTo && (
            <TouchableOpacity
              style={styles.replyPreview}
              onPress={() => scrollToMessage(message.replyTo._id)}
            >
              <View style={styles.replyBar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.replyAuthor}>{message.replyTo.sender?.name}</Text>
                <Text style={styles.replyText} numberOfLines={2}>{message.replyTo.content}</Text>
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
                <TouchableOpacity style={styles.audioContainer} onPress={() => handleAudioPlay(message.fileUrl)}>
                  <View style={styles.audioPlay}>
                    <Text style={{ color: 'white', fontSize: 14 }}>▶</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.audioTitle, { color: '#1F2937' }]}>Voice message</Text>
                    {message.voiceDuration && (
                      <Text style={[styles.audioDuration, { color: '#6B7280' }]}>
                        {Math.floor(message.voiceDuration / 60)}:{(message.voiceDuration % 60).toString().padStart(2, '0')}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity style={{ padding: 4 }} onPress={() => handleFileDownload(message.fileUrl, message.fileName)}>
                    <Text style={{ color: '#667EEA', fontSize: 18 }}>⬇</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.documentRow} onPress={() => handleFileDownload(message.fileUrl, message.fileName)}>
                  <View style={styles.documentIcon}>
                    <Text style={{ color: 'white', fontSize: 18 }}>{getFileIcon(message.fileName)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.documentName, { color: '#1F2937' }]} numberOfLines={1}>
                      {message.fileName || 'Unknown file'}
                    </Text>
                    <Text style={[styles.documentMeta, { color: '#6B7280' }]}>
                      {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(1)}MB` : 'File'} • {getFileExtension(message.fileName)}
                    </Text>
                  </View>
                  <TouchableOpacity style={{ padding: 4 }} onPress={() => handleFileDownload(message.fileUrl, message.fileName)}>
                    <Text style={{ color: '#667EEA', fontSize: 16 }}>⬇</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}

              {message.content ? (
                <Text style={[
                  styles.messageText,
                  styles.otherMessageText,
                  { marginTop: 8 }
                ]}>
                  {message.content}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text style={[styles.messageText, styles.otherMessageText]}>
              {message.content}
            </Text>
          )}

          <View style={styles.messageFooterRow}>
            <Text style={[styles.messageTime, styles.otherMessageTime]}>
              {formatTime(message.timestamp)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={{ padding: 8, opacity: 0.6 }} onPress={() => handleReply(message)}>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>↩</Text>
        </TouchableOpacity>
      </View>
    );
  }
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
              keyExtractor={(item) => item.id}
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
            keyExtractor={(item) => item.id}
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
      {/* Chat Header */}
      <LinearGradient colors={['#015382', '#017DB0']} style={styles.chatHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setShowChatList(true)}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.chatHeaderInfo}>
          <Avatar.Image
            size={40}
            source={{
              uri: currentChat?.otherParticipant?.avatar ||
                   `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentChat?.otherParticipant?.name || 'User')}`
            }}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>
              {currentChat?.otherParticipant?.name || 'Unknown User'}
            </Text>
            <Text style={styles.headerStatus}>
              {currentChat?.otherParticipant?.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
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
        {messages.length === 0 ? (
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyMessagesIcon}>💭</Text>
            <Text style={styles.emptyMessagesText}>
              Start the conversation with {currentChat?.otherParticipant?.name}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            onContentSizeChange={() => scrollToBottom()}
            onLayout={() => scrollToBottom()}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
              const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
              const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;
              setShowScrollToBottom(!isAtBottom);
            }}
          />
        )}
      </View>

      {/* Reply Banner */}
      {replyingTo && (
        <View style={styles.replyBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.replyBannerTitle}>Replying to {replyingTo.sender?.name}</Text>
            <Text style={styles.replyBannerText} numberOfLines={1}>{replyingTo.content}</Text>
          </View>
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

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity
            onPress={() => handleFileSelect('document')}
            style={{ padding: 6, marginRight: 4 }}
          >
            <Text style={{ fontSize: 22, color: '#667EEA' }}>📎</Text>
          </TouchableOpacity>
          <TextInput
            value={messageText}
            onChangeText={handleTypingChange}
            placeholder="Type a message..."
            style={styles.textInput}
            multiline
            maxLength={500}
            returnKeyType="send"
          />
          {isRecording ? (
            <TouchableOpacity onPress={stopRecording} style={styles.recordingButton}>
              <Text style={{ color: 'white', fontWeight: '700' }}>
                ■ {Math.floor(recordingDuration/60)}:{(recordingDuration%60).toString().padStart(2,'0')}
              </Text>
            </TouchableOpacity>
          ) : (messageText.trim() || selectedFiles.length > 0) ? (
            <TouchableOpacity onPress={handleSendMessage} disabled={sending} style={styles.sendFab}>
              <Text style={{ color: 'white', fontSize: 16 }}>➤</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startRecording} style={styles.micButton}>
              <Text style={{ fontSize: 20, color: '#667EEA' }}>🎤</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showScrollToBottom && (
        <TouchableOpacity style={styles.scrollToBottomButton} onPress={scrollToBottom}>
          <Text style={{ color: 'white', fontSize: 18 }}>⌄</Text>
        </TouchableOpacity>
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#64748b',
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
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 6,
    marginHorizontal: 12,
    alignItems: 'flex-end',
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
  messageFooterRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 6 
  },

  replyPreview: {
    flexDirection: 'row', 
    marginBottom: 8, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 8, 
    padding: 8
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
    flex: 1,
    fontSize: 14,
    maxHeight: 96,
    backgroundColor: 'transparent',
    paddingVertical: 6,
    minHeight: 24,
    color: '#1f2937',
    textAlignVertical: 'top',
    lineHeight: 18,
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
    backgroundColor: '#EF4444', 
    margin: 6, 
    borderRadius: 18, 
    paddingHorizontal: 12, 
    paddingVertical: 8 
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
    color: '#64748b',
    textAlign: 'center',
  },
});

export default WriterChat;