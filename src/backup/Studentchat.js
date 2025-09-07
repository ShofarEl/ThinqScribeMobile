import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {
    ActivityIndicator,
    Avatar,
    Badge,
    Button,
    Chip,
    Menu,
    Provider as PaperProvider,
    Portal,
    Searchbar,
    Snackbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { agreementApi } from '../api/agreement';
import { getChatMessages, getChats, sendChatFile, sendMessage as sendChatMessage } from '../api/chat';
import CreateAgreementModal from '../components/CreateAgreementModal';
import { useAppLoading } from '../context/AppLoadingContext';
import { useAuth } from '../context/MobileAuthContext';
import { useSocket } from '../context/SocketContext';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 88 : 64;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Loading states
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
  
  // Chat List Styles
  chatListContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatListHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  chatListTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  chatListSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    elevation: 2,
  },
  searchBarInput: {
    fontSize: 14,
  },
  chatListContent: {
    paddingVertical: 8,
  },
  
  // Chat Item Styles
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedChatItem: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  chatAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: 'white',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 18,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  specializationChip: {
    height: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  specializationText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  
  // Chat View Styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerUserInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
  },
  statusContainer: {
    marginTop: 2,
  },
  statusText: {
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
  
  // Search Styles
  searchContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageSearchBar: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    elevation: 0,
  },
  searchResults: {
    marginTop: 8,
  },
  searchResultItem: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  searchResultText: {
    fontSize: 12,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  
  // Messages Styles
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  highlightedMessage: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
    padding: 4,
    margin: 2,
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
  ownBubble: {
    backgroundColor: '#015382',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#1E293B',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  messageTime: {
    fontSize: 11,
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherMessageTime: {
    color: '#64748B',
  },
  replyButton: {
    padding: 8,
    opacity: 0.6,
  },
  
  // Reply Styles
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  replyBar: {
    width: 3,
    backgroundColor: '#22C55E',
    borderRadius: 1.5,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
    lineHeight: 16,
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  replyBannerContent: {
    flex: 1,
  },
  replyBannerAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0EA5E9',
    marginBottom: 2,
  },
  replyBannerText: {
    fontSize: 14,
    color: '#64748B',
  },
  
  // File Styles
  fileContainer: {
    minWidth: 200,
  },
  messageImage: {
    width: 240,
    height: 180,
    borderRadius: 12,
    marginBottom: 4,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 8,
  },
  audioButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  audioInfo: {
    flex: 1,
  },
  audioText: {
    fontSize: 14,
    fontWeight: '500',
  },
  audioDuration: {
    fontSize: 12,
    marginTop: 2,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  documentSize: {
    fontSize: 12,
  },
  downloadButton: {
    padding: 4,
  },
  
  // File Preview Styles
  filesPreview: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filePreviewItem: {
    width: 80,
    alignItems: 'center',
    marginRight: 12,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
  },
  fileIconContainer: {
    width: 60,
    height: 60,
  },
  
  // Enhanced Input Area Styles
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
  textInput: {
    fontSize: 14,
    color: '#1f2937',
    textAlignVertical: 'top',
    lineHeight: 18,
    paddingVertical: 6,
    minHeight: 24,
    maxHeight: 96,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  recordingTime: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#015382',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#015382',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  
  // File Modal Styles
  fileModalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 24,
  },
  fileModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  fileOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  fileOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fileOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 8,
  },
  
  // Enhanced File Preview Styles
  removeFileButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
  },
  fileName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 70,
  },
  
  // Enhanced Message Styles
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
  
  // Empty states
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyMessagesText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  findWritersButton: {
    backgroundColor: '#015382',
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  
  // Snackbar
  snackbar: {
    backgroundColor: '#374151',
    borderRadius: 8,
  },
});

const StudentChat = () => {
  const { chatId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { setLoading: setGlobalLoading } = useAppLoading();
  const { socket, joinChat, leaveChat } = useSocket() || {};

  // State
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [selectedWriter, setSelectedWriter] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showChatList, setShowChatList] = useState(!chatId);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageStatuses, setMessageStatuses] = useState(new Map());
  const [sendingMessages, setSendingMessages] = useState(new Set());
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Modal states
  const [showCreateAgreementModal, setShowCreateAgreementModal] = useState(false);
  const [creatingAgreement, setCreatingAgreement] = useState(false);

  // Refs
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const scrollOffset = useRef(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Initialize component
  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    requestPermissions();
    fetchChats();
    
    if (chatId) {
      fetchMessages(chatId);
      setShowChatList(false);
    }

    // Keyboard listeners
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShow?.remove();
      keyboardWillHide?.remove();
    };
  }, [chatId]);

  // Socket real-time listeners
  useEffect(() => {
    if (!socket || !user?._id) return;

    socket.emit('joinUserRoom', user._id);

    const handleReceiveMessage = (data) => {
      try {
        if (!data?.message || data.message.sender._id === user._id) return;

        if (currentChat && data.chatId === currentChat.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === data.message._id)) return prev;
            
            const newMessage = {
              id: data.message._id,
              content: data.message.content,
              sender: data.message.sender,
              timestamp: data.message.timestamp || data.message.createdAt,
              fileUrl: data.message.fileUrl,
              fileName: data.message.fileName,
              fileType: data.message.fileType,
              fileSize: data.message.fileSize,
              voiceDuration: data.message.voiceDuration,
              replyTo: data.message.replyTo,
              read: true
            };
            
            return [...prev, newMessage];
          });

          socket.emit('markMessagesAsRead', { 
            chatId: currentChat.id, 
            userId: user._id 
          });
          
          setTimeout(() => scrollToBottom(true), 100);
        }

        updateChatList(data);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };

    const handleTyping = ({ chatId: cId, userId, userName }) => {
      if (currentChat?.id === cId && userId !== user._id) {
        setOtherUserTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setOtherUserTyping(false);
        }, 3000);
      }
    };

    const handleStopTyping = ({ chatId: cId, userId }) => {
      if (currentChat?.id === cId && userId !== user._id) {
        setOtherUserTyping(false);
        clearTimeout(typingTimeoutRef.current);
      }
    };

    const handleOnlineStatuses = (statuses) => {
      const onlineIds = Object.keys(statuses || {}).filter(id => statuses[id]);
      setOnlineUsers(new Set(onlineIds));
    };

    const handleUserOnline = ({ userId }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    const handleIncomingCall = (callData) => {
      if (callData.receiverId === user._id) {
        Alert.alert(
          'Incoming Call',
          `${callData.callerName} is calling you`,
          [
            {
              text: 'Decline',
              style: 'cancel',
              onPress: () => {
                socket.emit('rejectCall', {
                  chatId: callData.chatId,
                  callerId: callData.callerId,
                  receiverId: user._id
                });
              }
            },
            {
              text: 'Answer',
              onPress: () => {
                router.push({
                  pathname: '/audio-call',
                  params: {
                    userId: callData.callerId,
                    userName: callData.callerName,
                    userAvatar: callData.callerAvatar,
                    isIncoming: 'true',
                    chatId: callData.chatId
                  }
                });
              }
            }
          ],
          { cancelable: false }
        );
      }
    };

    const handleMessagesRead = ({ chatId: cId, readBy }) => {
      if (currentChat?.id === cId && readBy !== user._id) {
        setMessages(prev => prev.map(msg => 
          msg.sender._id === user._id ? { ...msg, read: true } : msg
        ));
      }
    };

    socket.on('messageBroadcast', handleReceiveMessage);
    socket.on('newMessage', handleReceiveMessage);
    socket.on('messageSent', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('onlineStatuses', handleOnlineStatuses);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('messagesRead', handleMessagesRead);
    socket.on('incomingCall', handleIncomingCall);

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
      socket.off('incomingCall', handleIncomingCall);
    };
  }, [socket, user?._id, currentChat]);

  // Chat filtering
  useEffect(() => {
    if (!chatSearchQuery.trim()) {
      setFilteredChats(chats);
      return;
    }

    const term = chatSearchQuery.toLowerCase();
    const filtered = chats.filter(chat => {
      const otherParticipant = chat.participants?.find(p => p._id !== user._id);
      const name = otherParticipant?.name?.toLowerCase() || '';
      const lastMessage = chat.lastMessage?.toLowerCase() || '';
      return name.includes(term) || lastMessage.includes(term);
    });
    
    setFilteredChats(filtered);
  }, [chatSearchQuery, chats, user._id]);

  // Message searching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchQuery.toLowerCase();
    const results = messages.filter(msg => 
      msg.content?.toLowerCase().includes(term)
    );
    setSearchResults(results);
  }, [searchQuery, messages]);

  const requestPermissions = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      await ImagePicker.requestCameraPermissionsAsync();
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const chatsData = await getChats();
      const chatsArray = Array.isArray(chatsData) ? chatsData : chatsData?.chats || [];
      
      const enhancedChats = chatsArray.map(chat => ({
        ...chat,
        id: chat._id || chat.id,
        participants: chat.participants || [],
        lastMessage: chat.lastMessage || 'No messages yet',
        lastMessageTime: chat.lastMessageTime || chat.updatedAt || new Date().toISOString(),
        unreadCount: chat.unreadCount || 0,
        otherParticipant: chat.participants?.find(p => p._id !== user._id && p.id !== user._id) || {
          name: 'Unknown User',
          avatar: null,
          isOnline: false
        }
      }));
      
      setChats(enhancedChats);
      setFilteredChats(enhancedChats);
      
      if (chatId) {
        const chat = enhancedChats.find(c => c.id === chatId);
        if (chat) {
          setCurrentChat(chat);
          const writer = chat.participants.find(p => p.role === 'writer');
          setSelectedWriter(writer);
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      showSnackbar('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (selectedChatId = chatId) => {
    if (!selectedChatId) return;
    
    try {
      setLoadingMessages(true);
      const messagesData = await getChatMessages(selectedChatId);
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
      
      setMessages(enhancedMessages.reverse());
      setTimeout(() => scrollToBottom(false), 50);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      showSnackbar('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!messageText.trim() && selectedFiles.length === 0) || !currentChat || sending) return;

    const messageContent = messageText.trim();
    const filesToSend = [...selectedFiles];
    const replyToMessage = replyingTo;

    // Clear input immediately
    setMessageText('');
    setSelectedFiles([]);
    setReplyingTo(null);
    setSending(true);

    // Stop typing indicator
    if (socket) {
      socket.emit('stopTyping', {
        chatId: currentChat.id,
        userId: user._id
      });
    }

    try {
      if (filesToSend.length > 0) {
        // Handle file messages
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
              file: {
                uri: file.uri,
                name: file.name,
                type: file.mimeType,
                size: file.size
              },
              content: messageContent,
              replyTo: replyToMessage?._id,
              voiceDuration: file.duration
            });

            setMessages(prev => prev.map(msg => 
              msg.id === optimisticId ? {
                ...realMessage,
                id: realMessage._id,
                isOptimistic: false,
                isUploading: false
              } : msg
            ));

            setSendingMessages(prev => {
              const newSet = new Set(prev);
              newSet.delete(optimisticId);
              return newSet;
            });

            updateChatList({ chatId: currentChat.id, message: realMessage });

          } catch (uploadError) {
            console.error('❌ [StudentChat] File upload error:', uploadError);
            console.error('❌ [StudentChat] Error details:', {
              message: uploadError.message,
              status: uploadError.status,
              response: uploadError.response?.data
            });

            let errorMessage = `Failed to upload: ${file.name}`;
            if (uploadError.response?.data?.message) {
              errorMessage += ` - ${uploadError.response.data.message}`;
            } else if (uploadError.message) {
              errorMessage += ` - ${uploadError.message}`;
            }

            setMessages(prev => prev.map(msg => 
              msg.id === optimisticId ? {
                ...msg,
                content: errorMessage,
                isUploading: false,
                uploadError: true
              } : msg
            ));

            setSendingMessages(prev => {
              const newSet = new Set(prev);
              newSet.delete(optimisticId);
              return newSet;
            });

            showSnackbar(errorMessage);
          }
        }
      } else if (messageContent) {
        // Handle text message
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
        scrollToBottom(true);

        try {
          console.log('📤 [StudentChat] Sending message to chat:', currentChat.id);
          console.log('📤 [StudentChat] Message content:', messageContent);
          
          const realMessage = await sendChatMessage({
            chatId: currentChat.id,
            content: messageContent,
            replyTo: replyToMessage?._id
          });

          console.log('✅ [StudentChat] Message sent successfully:', realMessage);

          setMessages(prev => prev.map(msg => 
            msg.id === optimisticId ? {
              ...realMessage,
              id: realMessage._id,
              isOptimistic: false,
              replyTo: realMessage.replyTo || replyToMessage  // Preserve replyTo data
            } : msg
          ));

          setSendingMessages(prev => {
            const newSet = new Set(prev);
            newSet.delete(optimisticId);
            return newSet;
          });

          updateChatList({ chatId: currentChat.id, message: realMessage });

        } catch (textError) {
          console.error('❌ [StudentChat] Failed to send message:', textError);
          console.error('❌ [StudentChat] Error details:', {
            chatId: currentChat.id,
            messageContent,
            error: textError.message || textError
          });

          setMessages(prev => prev.map(msg => 
            msg.id === optimisticId ? {
              ...msg,
              content: `Failed to send: ${messageContent}`,
              sendError: true,
              isOptimistic: false
            } : msg
          ));

          setSendingMessages(prev => {
            const newSet = new Set(prev);
            newSet.delete(optimisticId);
            return newSet;
          });

          // Show more detailed error message
          const errorMessage = textError?.response?.data?.message || textError?.message || 'Network error';
          showSnackbar(`Failed to send message: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showSnackbar('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const updateChatList = (data) => {
    setChats(prevChats => {
      const updated = prevChats.map(chat => {
        if (chat.id === data.chatId) {
          return {
            ...chat,
            lastMessage: data.message?.content || chat.lastMessage,
            lastMessageTime: data.message?.timestamp || new Date().toISOString(),
            updatedAt: new Date()
          };
        }
        return chat;
      });

      const chatToMove = updated.find(c => c.id === data.chatId);
      if (chatToMove) {
        return [chatToMove, ...updated.filter(c => c.id !== data.chatId)];
      }
      return updated;
    });
  };

  const handleSelectChat = (chat) => {
    if (leaveChat && currentChat?.id) leaveChat(currentChat.id);
    
    setCurrentChat(chat);
    setShowChatList(false);
    const writer = chat.participants?.find(p => p.role === 'writer');
    setSelectedWriter(writer);
    
    fetchMessages(chat.id);
    
    if (chat.id !== chatId) {
      router.setParams({ chatId: chat.id });
    }

    if (joinChat) joinChat(chat.id);
  };

  const scrollToBottom = (animated = false) => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated });
      }, animated ? 100 : 50);
    }
  };

  const scrollToMessage = (messageId) => {
    const index = messages.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ 
        index, 
        animated: true, 
        viewPosition: 0.5 
      });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 2000);
    }
  };

  const handleTyping = () => {
    if (!currentChat || !socket) return;
    
    socket.emit('typing', {
      chatId: currentChat.id,
      userId: user._id,
      userName: user.name
    });
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', {
        chatId: currentChat.id,
        userId: user._id
      });
    }, 2000);
  };

  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  // Create Agreement Modal Handlers
  const handleCreateAgreementWithWriter = () => {
    if (!currentChat?.otherParticipant) {
      showSnackbar('Writer information not available');
      return;
    }
    console.log('📱 [StudentChat] Creating agreement with writer:', currentChat.otherParticipant.name);
    setShowCreateAgreementModal(true);
  };

  const handleCreateAgreement = async (agreementData) => {
    try {
      setCreatingAgreement(true);
      console.log('📱 [StudentChat] Creating agreement:', agreementData);

      const result = await agreementApi.createAgreement(agreementData);
      console.log('📱 [StudentChat] Agreement created successfully:', result);

      // Close modal
      setShowCreateAgreementModal(false);

      Alert.alert(
        'Success! 🎉',
        `Agreement created successfully!\n\nThe writer will be notified and can accept your project proposal. You'll receive updates on your dashboard.`,
        [
          {
            text: 'OK',
            onPress: () => console.log('Agreement creation acknowledged')
          }
        ]
      );

    } catch (error) {
      console.error('📱 [StudentChat] Error creating agreement:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create agreement. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setCreatingAgreement(false);
    }
  };

  const handleCloseCreateAgreementModal = () => {
    setShowCreateAgreementModal(false);
  };

  // Audio call functionality
  const initiateCall = () => {
    if (!currentChat?.otherParticipant) {
      showSnackbar('Unable to start call');
      return;
    }

    const otherUser = currentChat.otherParticipant;
    
    // Check if user is online
    if (!onlineUsers.has(otherUser._id)) {
      Alert.alert(
        'User Offline',
        'The user is currently offline. The call may not connect.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Call Anyway', 
            onPress: () => startCall(otherUser)
          }
        ]
      );
      return;
    }

    startCall(otherUser);
  };

  const startCall = (otherUser) => {
    // Emit call initiation to socket
    if (socket && currentChat) {
      socket.emit('initiateCall', {
        chatId: currentChat.id,
        callerId: user._id,
        callerName: user.name,
        callerAvatar: user.avatar,
        receiverId: otherUser._id,
        receiverName: otherUser.name,
        receiverAvatar: otherUser.avatar,
        callType: 'audio'
      });

      // Navigate to call screen
      router.push({
        pathname: '/audio-call',
        params: {
          userId: otherUser._id,
          userName: otherUser.name,
          userAvatar: otherUser.avatar,
          isIncoming: 'false',
          chatId: currentChat.id
        }
      });
    } else {
      showSnackbar('Unable to start call - connection error');
    }
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
      console.log('📥 [StudentChat] Downloading file:', { fileUrl, fileName });
      
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
            console.log('🔄 [StudentChat] Direct link not supported, trying alternative...');
            await Linking.openURL(fileUrl);
          }
        } catch (linkingError) {
          console.error('❌ [StudentChat] Linking failed:', linkingError);
          showSnackbar('Unable to open file. File URL copied to clipboard.');
          // On mobile web, we can try navigator share
          if (navigator.share) {
            try {
              await navigator.share({
                title: fileName || 'Shared File',
                url: fileUrl
              });
            } catch (shareError) {
              console.error('❌ [StudentChat] Share failed:', shareError);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ [StudentChat] Download failed:', error);
      showSnackbar('Failed to access file. Please try again.');
    }
  };

  const handleAudioPlay = async (audioUrl) => {
    try {
      console.log('🎵 [StudentChat] Playing audio:', audioUrl);
      
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
          console.log('🎵 [StudentChat] Audio playback finished');
        }
        if (status.error) {
          console.error('❌ [StudentChat] Audio playback error:', status.error);
          sound.unloadAsync();
        }
      });
      
      showSnackbar('Playing voice message');
    } catch (error) {
      console.error('❌ [StudentChat] Audio playback failed:', error);
      
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
        console.error('❌ [StudentChat] Audio fallback failed:', fallbackError);
        showSnackbar('Failed to play audio. Try downloading the file.');
      }
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

  const handleFileSelect = async (type) => {
    try {
      console.log(`📎 [StudentChat] Selecting file of type: ${type}`);
      let result;
      
      if (type === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: false,
          exif: false
        });
      } else if (type === 'gallery') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: false,
          quality: 0.8,
          allowsMultipleSelection: true,
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

      console.log('📂 [StudentChat] File selection result:', result);
      
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
          
          console.log('📄 [StudentChat] Processed file:', file);
          return file;
        });

        setSelectedFiles(prev => [...prev, ...newFiles]);
        showSnackbar(`${newFiles.length} file(s) selected`);
      }
      
      setShowFileModal(false);
    } catch (error) {
      console.error('❌ [StudentChat] File selection failed:', error);
      showSnackbar('Failed to select file. Please try again.');
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      console.log('🎤 [StudentChat] Starting voice recording...');
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        showSnackbar('Recording permission denied');
        return;
      }
      
      console.log('✅ [StudentChat] Audio permission granted');

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
      
      console.log('🎤 [StudentChat] Recording started successfully');

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
      console.error('❌ [StudentChat] Failed to start recording:', error);
      showSnackbar('Failed to start recording. Please check your microphone permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) {
        console.warn('⚠️ [StudentChat] No recording to stop');
        return;
      }

      console.log('🛑 [StudentChat] Stopping voice recording...');
      setIsRecording(false);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        console.log('✅ [StudentChat] Recording saved to:', uri);
        
        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log('📊 [StudentChat] Recording file info:', fileInfo);
        
        const fileName = `voice_${Date.now()}.m4a`;
        
        const audioFile = {
          uri,
          name: fileName,
          mimeType: 'audio/m4a',
          type: 'audio/m4a', // Also set type for compatibility
          size: fileInfo.size || 0,
          duration: recordingDuration
        };
        
        console.log('🎵 [StudentChat] Audio file prepared:', audioFile);
        setSelectedFiles(prev => [...prev, audioFile]);
        showSnackbar(`Voice message recorded (${recordingDuration}s)`);
      } else {
        console.error('❌ [StudentChat] Recording URI is null');
        showSnackbar('Failed to save recording - no file created');
      }

      setRecording(null);
      setRecordingDuration(0);
      
    } catch (error) {
      console.error('❌ [StudentChat] Failed to stop recording:', error);
      showSnackbar('Failed to save recording. Please try again.');
      setIsRecording(false);
      setRecording(null);
      setRecordingDuration(0);
    }
  };

  const renderMessageStatus = (message) => {
    if (message.sender._id !== user._id) return null;

    const isSending = sendingMessages.has(message.id);
    if (isSending) {
      return (
        <Icon name="clock-outline" size={12} color="#9CA3AF" style={{ marginLeft: 4 }} />
      );
    }

    if (message.read) {
      return (
        <Icon name="check-all" size={12} color="#2563EB" style={{ marginLeft: 4 }} />
      );
    }

    return (
      <Icon name="check" size={12} color="#9CA3AF" style={{ marginLeft: 4 }} />
    );
  };

  const renderMessage = ({ item: message, index }) => {
    const isOwn = message.sender._id === user._id;
    const isHighlighted = highlightedMessageId === message.id;
    const showAvatar = !isOwn && (index === messages.length - 1 || 
      messages[index + 1]?.sender._id !== message.sender._id);

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
              style={styles.replyContainer}
              onPress={() => scrollToMessage(message.replyTo._id)}
            >
              <View style={styles.replyBar} />
              <View style={styles.replyContent}>
                <Text style={[styles.replyAuthor, { color: 'rgba(255,255,255,0.9)' }]}>
                  {message.replyTo.sender?.name}
                </Text>
                <Text style={[styles.replyText, { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={2}>
                  {message.replyTo.content}
                </Text>
              </View>
            </TouchableOpacity>
          )}

            {message.fileUrl ? (
              <View style={styles.fileContainer}>
                {message.fileType?.startsWith('image/') ? (
                  <TouchableOpacity onPress={() => {
                    Linking.openURL(message.fileUrl);
                  }}>
                    <Image
                      source={{ uri: message.fileUrl }}
                      style={styles.messageImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ) : message.fileType?.startsWith('audio/') ? (
                  <TouchableOpacity style={styles.audioContainer} onPress={() => handleAudioPlay(message.fileUrl)}>
                    <TouchableOpacity style={styles.audioButton} onPress={() => handleAudioPlay(message.fileUrl)}>
                      <Icon name="play" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.audioInfo}>
                      <Text style={[styles.audioText, { color: 'white' }]}>
                        Voice message
                      </Text>
                      {message.voiceDuration && (
                        <Text style={[styles.audioDuration, { color: 'rgba(255,255,255,0.7)' }]}>
                          {Math.floor(message.voiceDuration / 60)}:{(message.voiceDuration % 60).toString().padStart(2, '0')}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity style={styles.downloadButton} onPress={() => handleFileDownload(message.fileUrl, message.fileName)}>
                      <Icon name="download" size={20} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.documentContainer}
                    onPress={() => handleFileDownload(message.fileUrl, message.fileName)}
                  >
                    <View style={styles.documentIcon}>
                      <Text style={{ color: 'white', fontSize: 18 }}>{getFileIcon(message.fileName)}</Text>
                    </View>
                    <View style={styles.documentInfo}>
                      <Text style={[styles.documentName, { color: 'white' }]} numberOfLines={1}>
                        {message.fileName || 'Unknown file'}
                      </Text>
                      <Text style={[styles.documentSize, { color: 'rgba(255,255,255,0.7)' }]}>
                        {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(1)}MB` : 'File'} • {getFileExtension(message.fileName)}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.downloadButton} onPress={() => handleFileDownload(message.fileUrl, message.fileName)}>
                      <Icon name="download" size={20} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
                
                {message.content && (
                  <Text style={[
                    styles.messageText,
                    styles.ownMessageText,
                    { marginTop: 8 }
                  ]}>
                    {message.content}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={[
                styles.messageText,
                styles.ownMessageText
              ]}>
                {message.content}
              </Text>
            )}

            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                styles.ownMessageTime
              ]}>
                {formatTime(message.timestamp)}
              </Text>
              {renderMessageStatus(message)}
            </View>
          </View>
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
                uri: message.sender.avatar || 
                     `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(message.sender.name)}` 
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
              style={styles.replyContainer}
              onPress={() => scrollToMessage(message.replyTo._id)}
            >
              <View style={styles.replyBar} />
              <View style={styles.replyContent}>
                <Text style={[styles.replyAuthor, { color: '#1F2937' }]}>
                  {message.replyTo.sender?.name}
                </Text>
                <Text style={[styles.replyText, { color: '#6B7280' }]} numberOfLines={2}>
                  {message.replyTo.content}
                </Text>
              </View>
            </TouchableOpacity>
          )}

            {message.fileUrl ? (
              <View style={styles.fileContainer}>
                {message.fileType?.startsWith('image/') ? (
                  <TouchableOpacity onPress={() => {
                    Linking.openURL(message.fileUrl);
                  }}>
                    <Image
                      source={{ uri: message.fileUrl }}
                      style={styles.messageImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ) : message.fileType?.startsWith('audio/') ? (
                  <TouchableOpacity style={styles.audioContainer} onPress={() => handleAudioPlay(message.fileUrl)}>
                    <TouchableOpacity style={styles.audioButton} onPress={() => handleAudioPlay(message.fileUrl)}>
                      <Icon name="play" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.audioInfo}>
                      <Text style={[styles.audioText, { color: '#1F2937' }]}>
                        Voice message
                      </Text>
                      {message.voiceDuration && (
                        <Text style={[styles.audioDuration, { color: '#6B7280' }]}>
                          {Math.floor(message.voiceDuration / 60)}:{(message.voiceDuration % 60).toString().padStart(2, '0')}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity style={styles.downloadButton} onPress={() => handleFileDownload(message.fileUrl, message.fileName)}>
                      <Icon name="download" size={20} color="#667EEA" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.documentContainer}
                    onPress={() => handleFileDownload(message.fileUrl, message.fileName)}
                  >
                    <View style={styles.documentIcon}>
                      <Text style={{ color: 'white', fontSize: 18 }}>{getFileIcon(message.fileName)}</Text>
                    </View>
                    <View style={styles.documentInfo}>
                      <Text style={[styles.documentName, { color: '#1F2937' }]} numberOfLines={1}>
                        {message.fileName || 'Unknown file'}
                      </Text>
                      <Text style={[styles.documentSize, { color: '#6B7280' }]}>
                        {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(1)}MB` : 'File'} • {getFileExtension(message.fileName)}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.downloadButton} onPress={() => handleFileDownload(message.fileUrl, message.fileName)}>
                      <Icon name="download" size={20} color="#667EEA" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
                
                {message.content && (
                  <Text style={[
                    styles.messageText,
                    styles.otherMessageText,
                    { marginTop: 8 }
                  ]}>
                    {message.content}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={[
                styles.messageText,
                styles.otherMessageText
              ]}>
                {message.content}
              </Text>
            )}

            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                styles.otherMessageTime
              ]}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.replyButton}
            onPress={() => handleReply(message)}
          >
            <Icon name="reply" size={14} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderChatItem = ({ item: chat }) => {
    const isSelected = currentChat?.id === chat.id;
    const hasUnread = chat.unreadCount > 0;
    const isOnline = onlineUsers.has(chat.otherParticipant?._id);

    return (
      <TouchableOpacity
        style={[styles.chatItem, isSelected && styles.selectedChatItem]}
        onPress={() => handleSelectChat(chat)}
        activeOpacity={0.7}
      >
        <View style={styles.chatAvatarContainer}>
          <Avatar.Image
            size={52}
            source={{ 
              uri: chat.otherParticipant?.avatar || 
                   `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(chat.otherParticipant?.name || 'User')}` 
            }}
          />
          {isOnline && <View style={styles.onlineIndicator} />}
          {hasUnread && (
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
          
          {chat.otherParticipant?.specializations?.length > 0 && (
            <View style={styles.specializationsContainer}>
              {chat.otherParticipant.specializations.slice(0, 2).map((spec, index) => (
                <Chip key={index} style={styles.specializationChip} textStyle={styles.specializationText}>
                  {spec}
                </Chip>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderChatList = () => (
    <View style={styles.chatListContainer}>
      <LinearGradient colors={['#015382', '#017DB0']} style={styles.chatListHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Icon name="message-text" size={24} color="white" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.chatListTitle}>Messages</Text>
              <Text style={styles.chatListSubtitle}>Connect with your writers</Text>
            </View>
          </View>
        </View>

        <Searchbar
          placeholder="Search conversations..."
          value={chatSearchQuery}
          onChangeText={setChatSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchBarInput}
          iconColor="#667EEA"
        />
      </LinearGradient>

      {filteredChats.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="message-outline" size={64} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>No Conversations Yet</Text>
          <Text style={styles.emptyText}>
            Start chatting with writers to see your conversations here
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/writers')}
            style={styles.findWritersButton}
            contentStyle={styles.buttonContent}
          >
            Find Writers
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatListContent}
        />
      )}
    </View>
  );

  const renderChatView = () => (
    <View style={styles.chatContainer}>
      {/* Chat Header */}
      <LinearGradient colors={['#015382', '#017DB0']} style={styles.chatViewHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setShowChatList(true)}
        >
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.chatHeaderInfo}>
          <Avatar.Image
            size={40}
            source={{ 
              uri: currentChat?.otherParticipant?.avatar || 
                   `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentChat?.otherParticipant?.name || 'User')}` 
            }}
          />
          <View style={styles.headerUserInfo}>
            <Text style={styles.headerUserName}>
              {currentChat?.otherParticipant?.name || 'Unknown User'}
            </Text>
            <View style={styles.statusContainer}>
              {otherUserTyping ? (
                <Text style={styles.typingText}>typing...</Text>
              ) : (
                <Text style={styles.statusText}>
                  {onlineUsers.has(currentChat?.otherParticipant?._id) ? 'Online' : 'Offline'}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={initiateCall}
          >
            <Icon name="phone" size={20} color="white" />
          </TouchableOpacity>
          
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity 
                style={styles.headerActionButton}
                onPress={() => setMenuVisible(true)}
              >
                <Icon name="dots-vertical" size={20} color="white" />
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleCreateAgreementWithWriter();
              }}
              title="Create Agreement"
              leadingIcon="file-document"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                // Add search functionality
                console.log('Search messages');
              }}
              title="Search Messages"
              leadingIcon="magnify"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                // Add view agreement functionality
                router.push('/agreements');
              }}
              title="View Agreements"
              leadingIcon="file-multiple"
            />
          </Menu>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      {searchQuery || searchResults.length > 0 ? (
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search messages..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.messageSearchBar}
            inputStyle={styles.searchBarInput}
          />
          {searchResults.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.searchResults}>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.searchResultItem}
                  onPress={() => scrollToMessage(result.id)}
                >
                  <Text style={styles.searchResultText} numberOfLines={1}>
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
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
            showsVerticalScrollIndicator={false}
            onScroll={(event) => {
              const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
              const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;
              setShowScrollToBottom(!isAtBottom);
            }}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={20}
          />
        )}
        
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
          <View style={styles.replyBannerContent}>
            <Text style={styles.replyBannerAuthor}>
              Replying to {replyingTo.sender.name}
            </Text>
            <Text style={styles.replyBannerText} numberOfLines={1}>
              {replyingTo.content}
            </Text>
          </View>
          <TouchableOpacity onPress={cancelReply}>
            <Icon name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <View style={styles.filesPreview}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedFiles.map((file, index) => (
              <View key={index} style={styles.filePreviewItem}>
                {file.mimeType?.startsWith('image/') ? (
                  <Image source={{ uri: file.uri }} style={styles.previewImage} />
                ) : (
                  <View style={[styles.fileIconContainer, { backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', borderRadius: 8 }]}>
                    <Text style={{ fontSize: 20 }}>{getFileIcon(file.name)}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeFileButton}
                  onPress={() => removeFile(index)}
                >
                  <Icon name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Area */}
      <View style={[styles.inputContainer, { paddingBottom: keyboardHeight > 0 ? 5 : 20 }]}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowFileModal(true)}
          >
            <Icon name="attachment" size={18} color="#667EEA" />
          </TouchableOpacity>

          <View style={styles.textInputContainer}>
            <TextInput
              value={messageText}
              onChangeText={(text) => {
                setMessageText(text);
                handleTyping();
              }}
              placeholder="Type a message..."
              multiline
              style={styles.textInput}
              placeholderTextColor="#9CA3AF"
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
        <TouchableOpacity
          style={styles.scrollToBottomButton}
          onPress={scrollToBottom}
        >
          <Icon name="chevron-down" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <PaperProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#015382" />
            <Text style={styles.loadingText}>Loading chats...</Text>
          </View>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#015382" />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          {showChatList ? renderChatList() : renderChatView()}
        </KeyboardAvoidingView>

        {/* File Selection Modal */}
        <Portal>
          <Modal
            visible={showFileModal}
            onDismiss={() => setShowFileModal(false)}
            contentContainerStyle={styles.fileModalContainer}
          >
            <Text style={styles.fileModalTitle}>Select File</Text>
            <View style={styles.fileOptions}>
              <TouchableOpacity
                style={styles.fileOption}
                onPress={() => handleFileSelect('camera')}
              >
                <Icon name="camera" size={32} color="#667EEA" />
                <Text style={styles.fileOptionText}>Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.fileOption}
                onPress={() => handleFileSelect('gallery')}
              >
                <Icon name="image" size={32} color="#667EEA" />
                <Text style={styles.fileOptionText}>Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.fileOption}
                onPress={() => handleFileSelect('document')}
              >
                <Icon name="file-document" size={32} color="#667EEA" />
                <Text style={styles.fileOptionText}>Document</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>

        {/* Create Agreement Modal */}
        <CreateAgreementModal
          visible={showCreateAgreementModal}
          onClose={handleCloseCreateAgreementModal}
          onSubmit={handleCreateAgreement}
          loading={creatingAgreement}
          writer={currentChat?.otherParticipant}
        />
      </SafeAreaView>
    </PaperProvider>
  );
};

export default StudentChat;