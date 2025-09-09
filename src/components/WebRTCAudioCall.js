import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    PermissionsAndroid,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import { ActivityIndicator, Avatar, IconButton } from 'react-native-paper';
import { useAuth } from '../context/MobileAuthContext';
import { useSocket } from '../context/SocketContext';
import { installWebRTCPolyfill } from '../utils/WebRTCPolyfill';

const { width, height } = Dimensions.get('window');

// WebRTC Configuration
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

const WebRTCAudioCall = ({
  visible,
  onClose,
  targetUserId,
  targetUserName,
  targetUserAvatar,
  chatId,
  isIncoming = false,
  callId: initialCallId,
}) => {
  const { user } = useAuth();
  const { socket, initiateCall, acceptCall: socketAcceptCall, rejectCall: socketRejectCall, endCall: socketEndCall, sendWebRTCSignal } = useSocket();

  // Call States
  const [callState, setCallState] = useState(isIncoming ? 'incoming' : 'calling');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [error, setError] = useState(null);

  // WebRTC Refs
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const callIdRef = useRef(initialCallId);
  const timerRef = useRef(null);
  const isCleaningUpRef = useRef(false);

  // Animation Refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Initialize call
  useEffect(() => {
    if (!visible) return;

    isCleaningUpRef.current = false;
    installWebRTCPolyfill(); // Install WebRTC polyfill for React Native
    setupAudio();
    startPulseAnimation();
    setupSocketListeners();

    if (isIncoming) {
      Vibration.vibrate([1000, 1000], true);
    } else {
      // Initiate outgoing call
      const newCallId = initiateCall(targetUserId, chatId);
      if (newCallId) {
        callIdRef.current = newCallId;
        initializeWebRTC();
      }
    }

    return () => {
      cleanup();
    };
  }, [visible, isIncoming]);

  // Call timer
  useEffect(() => {
    if (callState === 'connected') {
      startCallTimer();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      stopCallTimer();
    }
  }, [callState]);

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: !isSpeakerOn,
        staysActiveInBackground: true,
      });
    } catch (error) {
      console.error('Audio setup error:', error);
      setError('Failed to setup audio');
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    const handleCallAccepted = ({ callId }) => {
      if (callId !== callIdRef.current) return;
      console.log('📞 Call accepted');
      setCallState('connecting');
      setIsConnecting(true);
      initializeWebRTC();
    };

    const handleCallRejected = ({ callId }) => {
      if (callId !== callIdRef.current) return;
      console.log('📞 Call rejected');
      setCallState('rejected');
      setTimeout(() => onClose(), 2000);
    };

    const handleCallEnded = ({ callId }) => {
      if (callId !== callIdRef.current) return;
      console.log('📞 Call ended by remote user');
      setCallState('ended');
      setTimeout(() => onClose(), 2000);
    };

    const handleWebRTCSignal = async ({ signal, callId, from }) => {
      if (callId !== callIdRef.current || from !== targetUserId) return;
      
      try {
        await handleIncomingSignal(signal);
      } catch (error) {
        console.error('Error handling WebRTC signal:', error);
        setError('Connection failed');
      }
    };

    socket.on('callAccepted', handleCallAccepted);
    socket.on('callRejected', handleCallRejected);
    socket.on('callEnded', handleCallEnded);
    socket.on('webrtc:signal', handleWebRTCSignal);

    return () => {
      socket.off('callAccepted', handleCallAccepted);
      socket.off('callRejected', handleCallRejected);
      socket.off('callEnded', handleCallEnded);
      socket.off('webrtc:signal', handleWebRTCSignal);
    };
  };

  const initializeWebRTC = async () => {
    try {
      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        setError('Microphone permission required');
        return;
      }

      // Create peer connection
      const configuration = {
        iceServers: ICE_SERVERS,
        iceCandidatePoolSize: 10,
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Setup peer connection event handlers
      setupPeerConnectionHandlers();

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      localStreamRef.current = stream;

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      if (!isIncoming) {
        // Create offer for outgoing call
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        sendWebRTCSignal({
          type: 'offer',
          sdp: offer,
        }, targetUserId, callIdRef.current);
      }

    } catch (error) {
      console.error('WebRTC initialization error:', error);
      setError('Failed to initialize call');
    }
  };

  const setupPeerConnectionHandlers = () => {
    const pc = peerConnectionRef.current;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWebRTCSignal({
          type: 'ice-candidate',
          candidate: event.candidate,
        }, targetUserId, callIdRef.current);
      }
    };

    pc.ontrack = (event) => {
      console.log('📡 Received remote stream');
      remoteStreamRef.current = event.streams[0];
      setCallState('connected');
      setIsConnecting(false);
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('🔗 Connection state:', state);
      
      switch (state) {
        case 'connected':
          setConnectionQuality('excellent');
          break;
        case 'connecting':
          setConnectionQuality('good');
          break;
        case 'disconnected':
          setConnectionQuality('poor');
          break;
        case 'failed':
          setError('Connection failed');
          break;
        case 'closed':
          if (!isCleaningUpRef.current) {
            setCallState('ended');
          }
          break;
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      console.log('🧊 ICE connection state:', state);
    };
  };

  const handleIncomingSignal = async (signal) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      if (signal.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        sendWebRTCSignal({
          type: 'answer',
          sdp: answer,
        }, targetUserId, callIdRef.current);
      } else if (signal.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      } else if (signal.type === 'ice-candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    } catch (error) {
      console.error('Error handling signal:', error);
    }
  };

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to make calls',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startCallTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAcceptCall = async () => {
    Vibration.cancel();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    socketAcceptCall(callIdRef.current, targetUserId);
    setCallState('connecting');
    setIsConnecting(true);
    await initializeWebRTC();
  };

  const handleRejectCall = () => {
    Vibration.cancel();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    socketRejectCall(callIdRef.current, targetUserId);
    setCallState('rejected');
    setTimeout(() => onClose(), 1500);
  };

  const handleEndCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    socketEndCall(callIdRef.current, targetUserId);
    setCallState('ended');
    cleanup();
    setTimeout(() => onClose(), 2000);
  };

  const toggleMute = async () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleSpeaker = async () => {
    setIsSpeakerOn(!isSpeakerOn);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: isSpeakerOn,
      staysActiveInBackground: true,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const cleanup = () => {
    isCleaningUpRef.current = true;
    
    stopCallTimer();
    Vibration.cancel();
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
      remoteStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const renderCallState = () => {
    switch (callState) {
      case 'calling':
        return (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Calling...</Text>
            <ActivityIndicator size="small" color="white" style={styles.loadingIndicator} />
          </View>
        );
      case 'incoming':
        return (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Incoming call</Text>
          </View>
        );
      case 'connecting':
        return (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Connecting...</Text>
            <ActivityIndicator size="small" color="white" style={styles.loadingIndicator} />
          </View>
        );
      case 'connected':
        return (
          <Animated.View style={[styles.stateContainer, { opacity: fadeAnim }]}>
            <Text style={styles.stateText}>{formatCallDuration(callDuration)}</Text>
            <Text style={styles.qualityText}>
              Quality: {connectionQuality}
            </Text>
          </Animated.View>
        );
      case 'rejected':
        return (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Call declined</Text>
          </View>
        );
      case 'ended':
        return (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Call ended</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderCallActions = () => {
    if (callState === 'incoming') {
      return (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={handleRejectCall}>
            <IconButton icon="phone-hangup" iconColor="white" size={32} />
          </TouchableOpacity>
          
          {isConnecting ? (
            <View style={[styles.actionButton, styles.acceptButton]}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : (
            <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={handleAcceptCall}>
              <IconButton icon="phone" iconColor="white" size={32} />
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (callState === 'calling' || callState === 'connecting' || callState === 'connected') {
      return (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
          >
            <IconButton icon={isMuted ? "microphone-off" : "microphone"} iconColor="white" size={24} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.endButton]} onPress={handleEndCall}>
            <IconButton icon="phone-hangup" iconColor="white" size={32} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
            onPress={toggleSpeaker}
          >
            <IconButton icon={isSpeakerOn ? "volume-high" : "phone"} iconColor="white" size={24} />
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e3a8a', '#3b82f6', '#60a5fa']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <IconButton icon="chevron-down" iconColor="white" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voice Call</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.userContainer}>
          <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Avatar.Text
              size={120}
              label={targetUserName?.charAt(0) || 'U'}
              style={styles.avatar}
            />
          </Animated.View>
          
          <Text style={styles.userName}>{targetUserName || 'Unknown User'}</Text>
          {renderCallState()}
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>

        <View style={styles.actionsWrapper}>
          {renderCallActions()}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  userContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  avatarContainer: {
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  stateContainer: {
    alignItems: 'center',
  },
  stateText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  qualityText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 5,
  },
  loadingIndicator: {
    marginTop: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 10,
  },
  actionsWrapper: {
    paddingBottom: 60,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 40,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  acceptButton: {
    backgroundColor: '#22c55e',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  endButton: {
    backgroundColor: '#ef4444',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: 'white',
  },
});

export default WebRTCAudioCall;
