import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import { ActivityIndicator, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/MobileAuthContext';
import { useSocket } from '../context/SocketContext';

const { width, height } = Dimensions.get('window');

const AudioCall = () => {
  const { userId, userName, userAvatar, isIncoming = 'false', chatId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocket() || {};

  // Call state
  const [callState, setCallState] = useState(isIncoming === 'true' ? 'incoming' : 'calling'); // 'calling', 'incoming', 'connected', 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Audio handling
  const [sound, setSound] = useState(null);
  const [recording, setRecording] = useState(null);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Timer ref
  const timerRef = useRef(null);

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    setupAudio();
    startPulseAnimation();

    // Handle incoming call
    if (isIncoming === 'true') {
      playRingtone();
      Vibration.vibrate([1000, 1000], true);
    }

    // Socket listeners for call events
    if (socket) {
      socket.on('callAccepted', handleCallAccepted);
      socket.on('callRejected', handleCallRejected);
      socket.on('callEnded', handleCallEnded);
      socket.on('audioData', handleAudioData);
    }

    return () => {
      cleanup();
      if (socket) {
        socket.off('callAccepted', handleCallAccepted);
        socket.off('callRejected', handleCallRejected);
        socket.off('callEnded', handleCallEnded);
        socket.off('audioData', handleAudioData);
      }
    };
  }, []);

  useEffect(() => {
    if (callState === 'connected') {
      startCallTimer();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
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
      });
    } catch (error) {
      console.error('Audio setup error:', error);
    }
  };

  const playRingtone = async () => {
    try {
      // Note: In a real app, you would use an actual ringtone file
      // For now, we'll use vibration as the primary notification
      console.log('Playing ringtone...');
      // const { sound: ringtone } = await Audio.Sound.createAsync(
      //   require('../../assets/sounds/ringtone.mp3'),
      //   { shouldPlay: true, isLooping: true }
      // );
      // setSound(ringtone);
    } catch (error) {
      console.log('Ringtone error:', error);
    }
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

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Socket event handlers
  const handleCallAccepted = () => {
    setCallState('connected');
    setIsConnecting(false);
    stopRingtone();
    Vibration.cancel();
    startAudioStreaming();
  };

  const handleCallRejected = () => {
    setCallState('ended');
    stopRingtone();
    Vibration.cancel();
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const handleCallEnded = () => {
    endCall();
  };

  const handleAudioData = (data) => {
    // Handle incoming audio stream data
    playAudioStream(data);
  };

  // Call actions
  const acceptCall = async () => {
    setIsConnecting(true);
    stopRingtone();
    Vibration.cancel();
    
    if (socket && chatId) {
      socket.emit('acceptCall', {
        chatId,
        callerId: userId,
        receiverId: user._id
      });
    }
    
    await startAudioStreaming();
  };

  const rejectCall = () => {
    if (socket && chatId) {
      socket.emit('rejectCall', {
        chatId,
        callerId: userId,
        receiverId: user._id
      });
    }
    
    setCallState('ended');
    stopRingtone();
    Vibration.cancel();
    
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  const endCall = () => {
    if (socket && chatId) {
      socket.emit('endCall', {
        chatId,
        callerId: user._id,
        receiverId: userId
      });
    }
    
    setCallState('ended');
    cleanup();
    
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const toggleMute = async () => {
    setIsMuted(!isMuted);
    if (recording) {
      if (!isMuted) {
        await recording.pauseAsync();
      } else {
        await recording.startAsync();
      }
    }
  };

  const toggleSpeaker = async () => {
    setIsSpeakerOn(!isSpeakerOn);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: isSpeakerOn, // Toggle speaker
    });
  };

  const startAudioStreaming = async () => {
    try {
      const { recording: newRecording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      setRecording(newRecording);

      // Stream audio chunks via socket
      newRecording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && socket) {
          // This would need implementation for streaming audio chunks
          // socket.emit('audioStream', { audioData: status.uri, chatId });
        }
      });

    } catch (error) {
      console.error('Audio streaming error:', error);
    }
  };

  const playAudioStream = async (audioData) => {
    try {
      // Implementation for playing received audio stream
      // This would need proper audio streaming setup
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const stopRingtone = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    stopRingtone();
    if (recording) {
      recording.stopAndUnloadAsync();
    }
    Vibration.cancel();
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
      case 'connected':
        return (
          <Animated.View style={[styles.stateContainer, { opacity: fadeAnim }]}>
            <Text style={styles.stateText}>{formatCallDuration(callDuration)}</Text>
          </Animated.View>
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
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={rejectCall}
          >
            <Icon name="phone-hangup" size={32} color="white" />
          </TouchableOpacity>
          
          {isConnecting ? (
            <View style={[styles.actionButton, styles.acceptButton]}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={acceptCall}
            >
              <Icon name="phone" size={32} color="white" />
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (callState === 'calling' || callState === 'connected') {
      return (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
          >
            <Icon name={isMuted ? "microphone-off" : "microphone"} size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.endButton]}
            onPress={endCall}
          >
            <Icon name="phone-hangup" size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
            onPress={toggleSpeaker}
          >
            <Icon name={isSpeakerOn ? "volume-high" : "phone-in-talk"} size={24} color="white" />
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
        style={styles.gradient}
      >
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="chevron-down" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voice Call</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* User Info */}
        <View style={styles.userContainer}>
          <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Avatar.Image
              size={120}
              source={{
                uri: userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName || 'User')}`
              }}
            />
          </Animated.View>
          
          <Text style={styles.userName}>{userName || 'Unknown User'}</Text>
          {renderCallState()}
        </View>

        {/* Actions */}
        <View style={styles.actionsWrapper}>
          {renderCallActions()}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
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
  loadingIndicator: {
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
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

export default AudioCall;
