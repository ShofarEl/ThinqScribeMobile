// Audio Call Screen for ThinqScribe Mobile
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { ActivityIndicator, Avatar, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/MobileAuthContext';

const { width, height } = Dimensions.get('window');

const AudioCallScreen: React.FC = () => {
  const { userId, userName, userAvatar, isIncoming = 'false', chatId } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [callState, setCallState] = useState(isIncoming === 'true' ? 'incoming' : 'calling');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setupAudio();
    startPulseAnimation();

    if (isIncoming === 'true') {
      Vibration.vibrate([1000, 1000], true);
    }

    return () => {
      cleanup();
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

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const acceptCall = async () => {
    setIsConnecting(true);
    Vibration.cancel();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Simulate connection delay
    setTimeout(() => {
      setCallState('connected');
      setIsConnecting(false);
    }, 2000);
  };

  const rejectCall = () => {
    setCallState('ended');
    Vibration.cancel();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  const endCall = () => {
    setCallState('ended');
    cleanup();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const toggleMute = async () => {
    setIsMuted(!isMuted);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleSpeaker = async () => {
    setIsSpeakerOn(!isSpeakerOn);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: isSpeakerOn,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
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
          <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={rejectCall}>
            <IconButton icon="phone-hangup" iconColor="white" size={32} />
          </TouchableOpacity>
          
          {isConnecting ? (
            <View style={[styles.actionButton, styles.acceptButton]}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : (
            <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={acceptCall}>
              <IconButton icon="phone" iconColor="white" size={32} />
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
            <IconButton icon={isMuted ? "microphone-off" : "microphone"} iconColor="white" size={24} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.endButton]} onPress={endCall}>
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1e3a8a', '#3b82f6', '#60a5fa']} style={styles.gradient}>
        <StatusBar style="light" />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconButton icon="chevron-down" iconColor="white" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voice Call</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.userContainer}>
          <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Avatar.Text
              size={120}
              label={(userName as string)?.charAt(0) || 'U'}
              style={styles.avatar}
            />
          </Animated.View>
          
          <Text style={styles.userName}>{userName || 'Unknown User'}</Text>
          {renderCallState()}
        </View>

        <View style={styles.actionsWrapper}>
          {renderCallActions()}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backButton: { padding: 8 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: 'white' },
  headerSpacer: { width: 40 },
  userContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  avatarContainer: { marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  avatar: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  userName: { fontSize: 28, fontWeight: '700', color: 'white', textAlign: 'center', marginBottom: 10 },
  stateContainer: { alignItems: 'center' },
  stateText: { fontSize: 18, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  loadingIndicator: { marginTop: 10 },
  actionsWrapper: { paddingBottom: 60 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 40 },
  actionButton: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  acceptButton: { backgroundColor: '#22c55e' },
  rejectButton: { backgroundColor: '#ef4444' },
  endButton: { backgroundColor: '#ef4444' },
  controlButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  controlButtonActive: { backgroundColor: 'rgba(255,255,255,0.3)', borderColor: 'white' },
});

export default AudioCallScreen;