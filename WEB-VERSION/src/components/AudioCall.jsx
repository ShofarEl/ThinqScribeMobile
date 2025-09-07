import React, { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { Button, Modal, Tooltip, message as Msg } from 'antd';
import { PhoneOutlined, PhoneFilled, PhoneTwoTone, AudioMutedOutlined, AudioOutlined, CloseCircleOutlined, MinusOutlined } from '@ant-design/icons';
import { useNotifications } from '../context/NotificationContext.jsx';
import './AudioCall.css';

// Enhanced WebRTC audio call component with comprehensive fixes
const AudioCall = forwardRef(function AudioCall({ chatId, selfUser, peerUser, onIncomingCall }, ref) {
  const { socket } = useNotifications();

  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isIncoming, setIsIncoming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callId, setCallId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState('excellent'); // excellent, good, fair, poor
  const [retryCount, setRetryCount] = useState(0);
  const [panelPos, setPanelPos] = useState({ 
    x: typeof window !== 'undefined' ? Math.max(24, window.innerWidth - 320) : 24, 
    y: typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 44 : 24 
  });

  // Refs for WebRTC and audio management
  const callIdRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const ringAudioRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const disconnectTimerRef = useRef(null);
  const callTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const qualityCheckTimerRef = useRef(null);
  const isCallerRef = useRef(false);
  const madeOfferRef = useRef(false);
  const audioContextRef = useRef(null);
  const isCleaningUpRef = useRef(false);
  const userInteractedRef = useRef(false);

  const targetUserId = peerUser?._id;
  const selfUserId = selfUser?._id;
  const MAX_RETRY_ATTEMPTS = 3;
  const CONNECTION_TIMEOUT = 10000; // Increased for mobile networks
  const ICE_GATHERING_TIMEOUT = 15000;

  // Enhanced utility functions
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const logDebug = (message, data = {}) => {
    console.log(`[AudioCall] ${message}`, data);
  };

  const logError = (message, error = null) => {
    console.error(`[AudioCall] ${message}`, error);
  };

  // Enhanced audio context initialization with fallbacks
  const initializeAudioContext = async () => {
    try {
      if (!window.AudioContext && !window.webkitAudioContext) {
        logError('AudioContext not supported');
        return false;
      }

      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        logDebug('Audio context resumed');
      }
      
      return true;
    } catch (err) {
      logError('Audio context initialization failed:', err);
      return false;
    }
  };

  // Enhanced connection quality monitoring
  const monitorConnectionQuality = useCallback(() => {
    if (!pcRef.current) return;

    pcRef.current.getStats().then(stats => {
      let packetsLost = 0;
      let packetsReceived = 0;
      let jitter = 0;

      stats.forEach(report => {
        if (report.type === 'inbound-rtp' && report.mediaType === 'audio') {
          packetsLost = report.packetsLost || 0;
          packetsReceived = report.packetsReceived || 0;
          jitter = report.jitter || 0;
        }
      });

      const lossRate = packetsReceived > 0 ? (packetsLost / packetsReceived) * 100 : 0;
      
      let quality = 'excellent';
      if (lossRate > 5 || jitter > 0.1) quality = 'poor';
      else if (lossRate > 2 || jitter > 0.05) quality = 'fair';
      else if (lossRate > 0.5 || jitter > 0.02) quality = 'good';

      setConnectionQuality(quality);
      
      if (quality === 'poor' && retryCount < MAX_RETRY_ATTEMPTS) {
        logDebug('Poor connection detected, considering reconnection');
      }
    }).catch(err => {
      logError('Failed to get connection stats:', err);
    });
  }, [retryCount]);

  // Enhanced peer connection creation with better error handling
  const createPeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };
    
    try {
      const pc = new RTCPeerConnection(configuration);
      
      // Initialize remote stream container
      remoteStreamRef.current = new MediaStream();
      
      // Enhanced negotiation handling
      pc.onnegotiationneeded = async () => {
        if (isCleaningUpRef.current) return;
        
        try {
          if (!pcRef.current || pcRef.current.signalingState === 'closed') return;
          if (!isCallerRef.current || madeOfferRef.current) return;
          
          logDebug('Creating offer...');
          const offer = await pcRef.current.createOffer({ 
            offerToReceiveAudio: true,
            voiceActivityDetection: true
          });
          
          if (pcRef.current.signalingState === 'stable') {
            await pcRef.current.setLocalDescription(offer);
            madeOfferRef.current = true;
            
            const activeCallId = callIdRef.current;
            if (socket && targetUserId && activeCallId) {
              socket.emit('webrtc:signal', { 
                to: targetUserId, 
                from: selfUserId, 
                callId: activeCallId, 
                signal: { type: 'offer', sdp: offer } 
              });
              logDebug('Offer sent');
            }
          }
        } catch (err) {
          logError('Error in negotiation:', err);
          handleConnectionError(err);
        }
      };

      // Enhanced ICE candidate handling
      pc.onicecandidate = (event) => {
        if (isCleaningUpRef.current) return;
        
        const activeCallId = callIdRef.current;
        if (event.candidate && socket && targetUserId && activeCallId) {
          socket.emit('webrtc:signal', { 
            to: targetUserId, 
            from: selfUserId, 
            callId: activeCallId, 
            signal: { type: 'ice-candidate', candidate: event.candidate } 
          });
          logDebug('ICE candidate sent');
        } else if (!event.candidate) {
          logDebug('ICE gathering complete');
        }
      };

      // Enhanced track handling with better audio management
      pc.ontrack = (event) => {
        if (isCleaningUpRef.current) return;
        
        logDebug('Received remote track:', { 
          kind: event.track.kind, 
          id: event.track.id,
          readyState: event.track.readyState
        });
        
        const localStream = localStreamRef.current;
        
        // Avoid local loopback
        if (localAudioTrackRef.current && event.track && event.track.id === localAudioTrackRef.current.id) {
          logDebug('Ignoring local track loopback');
          return;
        }
        if (event.streams && event.streams[0] && localStream && event.streams[0].id === localStream.id) {
          logDebug('Ignoring local stream loopback');
          return;
        }

        // Enhanced remote stream management
        if (remoteStreamRef.current && event.track && event.track.kind === 'audio') {
          const existingTrack = remoteStreamRef.current.getAudioTracks().find(t => t.id === event.track.id);
          if (!existingTrack) {
            try {
              remoteStreamRef.current.addTrack(event.track);
              logDebug('Added remote audio track to stream');
              
              // Enhanced audio element management
              setupRemoteAudio();
            } catch (err) {
              logError('Failed to add remote track:', err);
            }
          }
        }
      };

      // Enhanced connection state monitoring
      pc.onconnectionstatechange = () => {
        if (isCleaningUpRef.current) return;
        
        const state = pc.connectionState;
        logDebug('Connection state changed:', state);
        
        if (state === 'connected') {
          setIsInCall(true);
          setConnecting(false);
          setIsRinging(false);
          setRetryCount(0);
          
          // Start call timer
          if (!callTimerRef.current) {
            callTimerRef.current = setInterval(() => {
              setCallDuration(prev => prev + 1);
            }, 1000);
          }
          
          // Start quality monitoring
          if (!qualityCheckTimerRef.current) {
            qualityCheckTimerRef.current = setInterval(monitorConnectionQuality, 3000);
          }
          
          clearTimeout(disconnectTimerRef.current);
          clearTimeout(reconnectTimerRef.current);
          
        } else if (state === 'disconnected') {
          logDebug('Connection disconnected, starting recovery timer');
          clearTimeout(disconnectTimerRef.current);
          disconnectTimerRef.current = setTimeout(() => {
            if (pcRef.current && pcRef.current.connectionState === 'disconnected') {
              logDebug('Connection timeout, attempting recovery');
              handleConnectionError(new Error('Connection timeout'));
            }
          }, CONNECTION_TIMEOUT);
          
        } else if (state === 'failed') {
          logError('Connection failed');
          handleConnectionError(new Error('Connection failed'));
          
        } else if (state === 'closed') {
          logDebug('Connection closed');
          if (!isCleaningUpRef.current) {
            endCall();
          }
        }
      };

      // ICE connection state monitoring
      pc.oniceconnectionstatechange = () => {
        if (isCleaningUpRef.current) return;
        
        const state = pc.iceConnectionState;
        logDebug('ICE connection state:', state);
        
        if (state === 'failed' && retryCount < MAX_RETRY_ATTEMPTS) {
          logDebug('ICE failed, attempting restart');
          restartIce();
        }
      };

      // ICE gathering state monitoring
      pc.onicegatheringstatechange = () => {
        logDebug('ICE gathering state:', pc.iceGatheringState);
      };

      return pc;
    } catch (err) {
      logError('Failed to create peer connection:', err);
      throw err;
    }
  };

  // Enhanced audio setup for remote stream
  const setupRemoteAudio = () => {
    if (!remoteAudioRef.current || !remoteStreamRef.current) return;
    
    try {
      const audioElement = remoteAudioRef.current;
      
      // Set stream
      audioElement.srcObject = remoteStreamRef.current;
      audioElement.autoplay = true;
      audioElement.playsInline = true;
      audioElement.muted = false;
      audioElement.volume = 1.0;
      
      // Handle audio events
      const handleLoadedMetadata = () => {
        logDebug('Remote audio metadata loaded');
        if (userInteractedRef.current) {
          audioElement.play().catch(err => {
            logError('Remote audio autoplay failed:', err);
            // Show user notification to enable audio
            Msg.warning('Please click to enable audio');
          });
        }
      };
      
      const handlePlay = () => {
        logDebug('Remote audio started playing');
      };
      
      const handleError = (e) => {
        logError('Remote audio error:', e);
      };
      
      audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.addEventListener('play', handlePlay);
      audioElement.addEventListener('error', handleError);
      
      // Cleanup function
      return () => {
        audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioElement.removeEventListener('play', handlePlay);
        audioElement.removeEventListener('error', handleError);
      };
    } catch (err) {
      logError('Failed to setup remote audio:', err);
    }
  };

  // ICE restart for connection recovery
  const restartIce = async () => {
    if (!pcRef.current || isCleaningUpRef.current) return;
    
    try {
      logDebug('Restarting ICE...');
      setRetryCount(prev => prev + 1);
      
      if (isCallerRef.current) {
        const offer = await pcRef.current.createOffer({ iceRestart: true });
        await pcRef.current.setLocalDescription(offer);
        
        const activeCallId = callIdRef.current;
        if (socket && targetUserId && activeCallId) {
          socket.emit('webrtc:signal', { 
            to: targetUserId, 
            from: selfUserId, 
            callId: activeCallId, 
            signal: { type: 'offer', sdp: offer } 
          });
        }
      }
    } catch (err) {
      logError('ICE restart failed:', err);
    }
  };

  // Enhanced connection error handling
  const handleConnectionError = (error) => {
    logError('Connection error:', error);
    
    if (retryCount < MAX_RETRY_ATTEMPTS && !isCleaningUpRef.current) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
      logDebug(`Retrying connection in ${delay}ms (attempt ${retryCount + 1})`);
      
      reconnectTimerRef.current = setTimeout(() => {
        if (!isCleaningUpRef.current) {
          restartIce();
        }
      }, delay);
    } else {
      Msg.error('Connection failed. Please try again.');
      endCall();
    }
  };

  // Enhanced cleanup with comprehensive resource management
  const cleanup = useCallback(() => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    logDebug('Starting comprehensive cleanup');
    
    try {
      // Clear all timers
      [disconnectTimerRef, callTimerRef, reconnectTimerRef, qualityCheckTimerRef].forEach(timer => {
        if (timer.current) {
          clearTimeout(timer.current);
          clearInterval(timer.current);
          timer.current = null;
        }
      });

      // Clean up peer connection
      if (pcRef.current) {
        pcRef.current.onicecandidate = null;
        pcRef.current.ontrack = null;
        pcRef.current.onconnectionstatechange = null;
        pcRef.current.oniceconnectionstatechange = null;
        pcRef.current.onnegotiationneeded = null;
        pcRef.current.onicegatheringstatechange = null;
        
        // Close connection
        pcRef.current.close();
        pcRef.current = null;
        logDebug('Peer connection closed');
      }

      // Stop local media
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
          logDebug('Stopped local track:', track.kind);
        });
        localStreamRef.current = null;
      }
      localAudioTrackRef.current = null;

      // Clean up remote stream
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        remoteStreamRef.current = null;
      }

      // Clear remote audio
      if (remoteAudioRef.current) {
        try {
          remoteAudioRef.current.pause();
          remoteAudioRef.current.srcObject = null;
        } catch (err) {
          logError('Error clearing remote audio:', err);
        }
      }

      // Stop ringtone
      if (ringAudioRef.current) {
        try {
          ringAudioRef.current.pause();
          ringAudioRef.current.currentTime = 0;
        } catch (err) {
          logError('Error stopping ringtone:', err);
        }
      }

      // Reset all state
      setIsInCall(false);
      setConnecting(false);
      setIsIncoming(false);
      setIsMuted(false);
      setCallId(null);
      callIdRef.current = null;
      setHasAccepted(false);
      setCallDuration(0);
      setRetryCount(0);
      setConnectionQuality('excellent');
      pendingOfferRef.current = null;
      pendingCandidatesRef.current = [];
      isCallerRef.current = false;
      madeOfferRef.current = false;
      setIsMinimized(false);
      
      logDebug('Cleanup completed');
    } catch (err) {
      logError('Error during cleanup:', err);
    } finally {
      isCleaningUpRef.current = false;
    }
  }, []);

  // Enhanced call termination
  const endCall = useCallback(() => {
    logDebug('Ending call');
    
    if (socket && callIdRef.current) {
      socket.emit('webrtc:call-ended', { 
        from: selfUserId, 
        callId: callIdRef.current 
      });
    }
    
    cleanup();
    setIsOpen(false);
  }, [socket, cleanup, selfUserId]);

  // Enhanced local audio initialization with mobile support
  const startLocalAudio = async () => {
    try {
      logDebug('Starting local audio capture...');
      
      // Initialize audio context
      const audioContextReady = await initializeAudioContext();
      if (!audioContextReady) {
        throw new Error('Audio context initialization failed');
      }
      
      // Request microphone with enhanced constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 44100, min: 16000 },
          sampleSize: { ideal: 16 },
          channelCount: { ideal: 1 }
        }
      };

      // Add mobile-specific constraints
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        constraints.audio.sampleRate = { ideal: 22050, min: 8000 };
        constraints.audio.latency = { ideal: 0.01 };
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      
      const pc = pcRef.current || createPeerConnection();
      pcRef.current = pc;
      
      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        localAudioTrackRef.current = track;
        pc.addTrack(track, stream);
        logDebug('Added local track to peer connection');
        
        // Monitor track state
        track.addEventListener('ended', () => {
          logDebug('Local track ended');
          if (!isCleaningUpRef.current) {
            handleConnectionError(new Error('Microphone track ended'));
          }
        });
      });
      
      logDebug('Local audio capture successful');
      return true;
    } catch (err) {
      logError('Microphone access failed:', err);
      
      let errorMessage = 'Microphone access denied or unavailable';
      if (err.name === 'NotFoundError') {
        errorMessage = 'No microphone found';
      } else if (err.name === 'NotAllowedError') {
        errorMessage = 'Microphone permission denied';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Microphone is being used by another application';
      }
      
      Msg.error(errorMessage);
      return false;
    }
  };

  // Enhanced call placement with retry logic
  const placeCall = useCallback(async () => {
    if (!socket || !targetUserId || !selfUserId) {
      logError('Missing required parameters for call');
      return;
    }
    
    // Mark user interaction for autoplay
    userInteractedRef.current = true;
    
    logDebug('Placing call to:', targetUserId);
    isCallerRef.current = true;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setCallId(id);
    callIdRef.current = id;
    setConnecting(true);
    setIsOpen(true);
    setIsRinging(true);
    setIsMinimized(false);
    setRetryCount(0);
    
    // Setup ringtone with fallback
    try {
      if (!ringAudioRef.current) {
        ringAudioRef.current = new Audio();
        ringAudioRef.current.loop = true;
        ringAudioRef.current.volume = 0.7;
        ringAudioRef.current.preload = 'auto';
        
        // Try multiple ringtone sources
        const ringtones = ['/ringtone.mp3', '/assets/ringtone.mp3', 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjaOyOjLdSAGI3bI5L1xSgsZYaG87Y5IExlPp+Ht'];
        
        for (const src of ringtones) {
          try {
            ringAudioRef.current.src = src;
            await ringAudioRef.current.load();
            break;
          } catch (e) {
            continue;
          }
        }
      }
      
      const playPromise = ringAudioRef.current.play();
      if (playPromise) {
        playPromise.catch(err => logError('Ringtone play failed:', err));
      }
    } catch (err) {
      logError('Ringtone setup failed:', err);
    }
    
    // Notify callee
    socket.emit('webrtc:call-request', {
      to: targetUserId,
      from: selfUserId,
      fromName: selfUser?.name || 'Unknown User',
      toName: peerUser?.name || 'Unknown User',
      chatId,
      callId: id,
      callType: 'audio'
    });
    
    logDebug('Call request sent');
    
    // Start local audio with retry
    const audioStarted = await startLocalAudio();
    if (!audioStarted) {
      setConnecting(false);
      endCall();
    }
  }, [socket, targetUserId, selfUserId, selfUser?.name, peerUser?.name, chatId]);

  // Enhanced incoming call acceptance
  const acceptIncoming = useCallback(async () => {
    if (!socket || !callIdRef.current) {
      logError('Cannot accept call - missing socket or call ID');
      return;
    }
    
    userInteractedRef.current = true;
    
    logDebug('Accepting incoming call');
    setConnecting(true);
    setIsIncoming(false);
    setHasAccepted(true);
    setIsOpen(true);
    setIsMinimized(false);

    const audioStarted = await startLocalAudio();
    if (!audioStarted) {
      setConnecting(false);
      Msg.error('Could not access microphone');
      return;
    }

    socket.emit('webrtc:call-accepted', { 
      to: targetUserId, 
      from: selfUserId, 
      callId: callIdRef.current 
    });

    // Process pending offer with enhanced error handling
    const pending = pendingOfferRef.current;
    if (pending && pending.type === 'offer') {
      try {
        const pc = pcRef.current;
        if (pc && pc.signalingState === 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(pending.sdp));
          const answer = await pc.createAnswer({
            offerToReceiveAudio: true,
            voiceActivityDetection: true
          });
          await pc.setLocalDescription(answer);
          
          socket.emit('webrtc:signal', { 
            to: targetUserId, 
            from: selfUserId, 
            callId: callIdRef.current, 
            signal: { type: 'answer', sdp: answer } 
          });
          
          await flushPendingIce();
          logDebug('Answer sent successfully');
        }
      } catch (err) {
        logError('Error handling pending offer:', err);
        Msg.error('Failed to connect to call');
        endCall();
      }
      pendingOfferRef.current = null;
    }

    // Stop ringtone
    try { 
      if (ringAudioRef.current) { 
        ringAudioRef.current.pause(); 
        ringAudioRef.current.currentTime = 0; 
      } 
    } catch (err) {
      logError('Error stopping ringtone:', err);
    }
    setIsRinging(false);
  }, [socket, selfUserId, targetUserId]);

  // Enhanced call rejection
  const rejectIncoming = useCallback(() => {
    logDebug('Rejecting incoming call');
    if (socket && callIdRef.current) {
      socket.emit('webrtc:call-rejected', { 
        to: targetUserId, 
        from: selfUserId, 
        callId: callIdRef.current 
      });
    }
    cleanup();
    setIsOpen(false);
  }, [socket, cleanup, selfUserId, targetUserId]);

  // Enhanced ICE candidate flushing
  const flushPendingIce = async () => {
    const pc = pcRef.current;
    if (!pc || !pc.remoteDescription) {
      logDebug('Cannot flush ICE - no peer connection or remote description');
      return;
    }
    
    const queued = pendingCandidatesRef.current;
    if (queued.length > 0) {
      logDebug(`Flushing ${queued.length} pending ICE candidates`);
      
      for (const candidate of queued) {
        try { 
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          logDebug('Added ICE candidate');
        } catch (err) {
          logError('Failed to add ICE candidate:', err);
        }
      }
      pendingCandidatesRef.current = [];
    }
  };

  // Enhanced socket event handlers
  useEffect(() => {
    if (!socket || !selfUserId) return;

    const onCallRequest = (data) => {
      const { from, fromName, callId: incomingId, chatId: cid, callType } = data || {};
      logDebug('📞 Incoming call received:', { from, fromName, incomingId, callType });
      
      if (!from || from === selfUserId || (callType && callType !== 'audio')) {
        logDebug('Ignoring call request');
        return;
      }
      
      setCallId(incomingId);
      callIdRef.current = incomingId;
      setIsIncoming(true);
      setIsOpen(true);
      setIsMinimized(false);
      setConnecting(false);
      setIsRinging(true);
      
      if (onIncomingCall && from && cid) {
        const callerUser = { _id: from, name: fromName };
        onIncomingCall(callerUser, cid, incomingId);
      }
      
      // Setup ringtone for incoming call
      try {
        if (!ringAudioRef.current) {
          ringAudioRef.current = new Audio();
          ringAudioRef.current.loop = true;
          ringAudioRef.current.volume = 0.8;
        }
        
        // Try to play ringtone (may fail due to autoplay policy)
        const playPromise = ringAudioRef.current.play();
        if (playPromise) {
          playPromise.catch(err => {
            logDebug('Incoming call ringtone blocked by autoplay policy');
          });
        }
      } catch (err) {
        logError('Ringtone setup failed:', err);
      }
      
      Msg.info(`${fromName || 'Someone'} is calling…`, 5);
    };

    const onCallAccepted = ({ callId: id }) => {
      if (id !== callIdRef.current) return;
      logDebug('Call accepted by peer');
      
      try { 
        if (ringAudioRef.current) { 
          ringAudioRef.current.pause(); 
          ringAudioRef.current.currentTime = 0; 
        } 
      } catch (err) {
        logError('Error stopping ringtone:', err);
      }
      setIsRinging(false);
    };

    const onCallRejected = ({ callId: id }) => {
      if (id !== callIdRef.current) return;
      logDebug('Call rejected by peer');
      Msg.warning('Call declined');
      endCall();
    };

    const onCallEnded = ({ callId: id }) => {
      if (id !== callIdRef.current) return;
      logDebug('Call ended by peer');
      Msg.info('Call ended');
      endCall();
    };

    const onSignal = async ({ signal, callId: id, from }) => {
      if (!signal || id !== callIdRef.current || from !== targetUserId) {
        logDebug('Ignoring signal:', { hasSignal: !!signal, correctCallId: id === callIdRef.current, correctFrom: from === targetUserId });
        return;
      }
      
      try {
        if (signal.type === 'offer') {
          logDebug('Received offer');
          const pc = pcRef.current || createPeerConnection();
          pcRef.current = pc;
          
          if (hasAccepted && pc.signalingState === 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            const answer = await pc.createAnswer({
              offerToReceiveAudio: true,
              voiceActivityDetection: true
            });
            await pc.setLocalDescription(answer);
            
            socket.emit('webrtc:signal', { 
              to: targetUserId, 
              from: selfUserId, 
              callId: callIdRef.current, 
              signal: { type: 'answer', sdp: answer } 
            });
            
            await flushPendingIce();
            setConnecting(false);
            logDebug('Answer sent in response to offer');
          } else {
            // Store offer for later processing
            pendingOfferRef.current = { type: 'offer', sdp: signal.sdp };
            logDebug('Offer stored for later processing');
          }
          
        } else if (signal.type === 'answer') {
          logDebug('Received answer');
          const pc = pcRef.current;
          if (pc && pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            setIsInCall(true);
            setIsRinging(false);
            setConnecting(false);
            await flushPendingIce();
            logDebug('Answer processed successfully');
          } else {
            logError('Received answer in wrong state:', pc?.signalingState);
          }
          
        } else if (signal.type === 'ice-candidate' && signal.candidate) {
          logDebug('Received ICE candidate');
          const pc = pcRef.current;
          if (pc && pc.remoteDescription) {
            try { 
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
              logDebug('ICE candidate added successfully');
            } catch (err) {
              logError('Failed to add ICE candidate:', err);
            }
          } else {
            // Queue candidate for later
            pendingCandidatesRef.current.push(signal.candidate);
            logDebug('ICE candidate queued');
          }
        }
      } catch (err) {
        logError('Signaling error:', err);
        handleConnectionError(err);
      }
    };

    // Register socket event listeners
    socket.on('webrtc:call-request', onCallRequest);
    socket.on('webrtc:call-accepted', onCallAccepted);
    socket.on('webrtc:call-rejected', onCallRejected);
    socket.on('webrtc:call-ended', onCallEnded);
    socket.on('webrtc:signal', onSignal);

    logDebug('Socket event listeners registered');

    return () => {
      // Cleanup socket listeners
      socket.off('webrtc:call-request', onCallRequest);
      socket.off('webrtc:call-accepted', onCallAccepted);
      socket.off('webrtc:call-rejected', onCallRejected);
      socket.off('webrtc:call-ended', onCallEnded);
      socket.off('webrtc:signal', onSignal);
      
      logDebug('Socket event listeners cleaned up');
    };
  }, [socket, selfUserId, targetUserId, chatId, hasAccepted]);

  // Enhanced mute toggle with better track management
  const toggleMute = useCallback(() => {
    const track = localAudioTrackRef.current;
    if (!track) {
      logError('No local audio track to mute/unmute');
      return;
    }
    
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
    logDebug('Mute toggled:', !track.enabled);
    
    // Provide user feedback
    Msg.info(!track.enabled ? 'Microphone muted' : 'Microphone unmuted', 1);
  }, []);

  // Imperative handle for external control
  useImperativeHandle(ref, () => ({
    open: placeCall,
    endCall,
    toggleMute,
    getCallState: () => ({
      isOpen,
      isInCall,
      isConnecting: connecting,
      callDuration,
      connectionQuality,
      isMuted
    })
  }), [placeCall, endCall, toggleMute, isOpen, isInCall, connecting, callDuration, connectionQuality, isMuted]);

  // Enhanced dragging with proper position calculation and touch support
  const onDragStart = useCallback((e) => {
    e.preventDefault();
    userInteractedRef.current = true;
    
    const isTouch = e.type === 'touchstart';
    const startX = isTouch ? e.touches[0].clientX : e.clientX;
    const startY = isTouch ? e.touches[0].clientY : e.clientY;
    const { x, y } = panelPos;
    
    const onMove = (ev) => {
      const isTouch = ev.type === 'touchmove';
      const currentX = isTouch ? ev.touches[0].clientX : ev.clientX;
      const currentY = isTouch ? ev.touches[0].clientY : ev.clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isIPhoneX = /iPhone/i.test(navigator.userAgent) && (window.screen.height >= 812 || window.screen.width >= 812);
      const minY = isIPhoneX ? 44 : 8;
      const panelWidth = isMobile ? 280 : 320;
      const panelHeight = 80; // Approximate height of minimized panel
      
      const newX = Math.max(8, Math.min(window.innerWidth - panelWidth, x + deltaX));
      const newY = Math.max(minY, Math.min(window.innerHeight - panelHeight, y + deltaY));
      
      setPanelPos({ x: newX, y: newY });
    };
    
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  }, [panelPos]);

  // Enhanced minimize toggle
  const handleMinimizeToggle = useCallback(() => {
    userInteractedRef.current = true;
    setIsMinimized(!isMinimized);
    logDebug('Minimize toggled:', !isMinimized);
  }, [isMinimized]);

  // User interaction handler for autoplay enablement
  const handleUserInteraction = useCallback(() => {
    userInteractedRef.current = true;
    
    // Try to play remote audio if it exists
    if (remoteAudioRef.current && remoteAudioRef.current.srcObject) {
      remoteAudioRef.current.play().catch(err => {
        logDebug('Could not autoplay remote audio:', err);
      });
    }
  }, []);

  // Connection quality indicator component
  const ConnectionQualityIndicator = () => (
    <div className={`connection-indicator connection-${connectionQuality}`} title={`Connection: ${connectionQuality}`}>
      {[1,2,3,4].map(i => (
        <div key={i} className="connection-bar" />
      ))}
    </div>
  );

  // Audio wave visualization component
  const AudioWaveIndicator = () => (
    <div className="audio-wave">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="audio-wave-bar" />
      ))}
    </div>
  );

  // Check if device is mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIPhoneX = /iPhone/i.test(navigator.userAgent) && (window.screen.height >= 812 || window.screen.width >= 812);

  return (
    <>
      {/* CRITICAL: Single persistent audio element for remote stream */}
      <audio 
        ref={remoteAudioRef} 
        autoPlay 
        playsInline 
        style={{ display: 'none' }}
        onLoadedMetadata={() => logDebug('Remote audio metadata loaded')}
        onPlay={() => logDebug('Remote audio playing')}
        onError={(e) => logError('Remote audio error:', e)}
        onCanPlay={() => logDebug('Remote audio can play')}
        onWaiting={() => logDebug('Remote audio waiting')}
      />
      
      {/* Main Call Modal */}
      {isOpen && !isMinimized && (
        <Modal
          open={true}
          onCancel={() => {}}
          footer={null}
          centered
          destroyOnClose={false}
          maskClosable={false}
          keyboard={false}
          closable={false}
          title={null}
          className={`professional-call-modal audio-call-modal ${isMobile ? 'mobile-call-modal' : ''} ${isIPhoneX ? 'iphonex-call-modal' : ''}`}
          bodyStyle={{ 
            padding: 0, 
            overflow: 'hidden', 
            borderRadius: isMobile ? 16 : 20,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
            maxWidth: isMobile ? '95vw' : '420px',
            width: isMobile ? '95vw' : '420px',
            margin: isMobile ? 'auto' : undefined,
          }}
          style={{
            borderRadius: isMobile ? 16 : 20,
            overflow: 'hidden',
            top: isIPhoneX ? 'env(safe-area-inset-top, 44px)' : undefined,
          }}
          maskStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            paddingTop: isIPhoneX ? 'env(safe-area-inset-top, 44px)' : undefined,
            paddingBottom: isIPhoneX ? 'env(safe-area-inset-bottom, 34px)' : undefined,
          }}
        >
          <div 
            onClick={handleUserInteraction}
            style={{ 
              padding: isMobile ? '24px 20px' : '32px 36px', 
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
              borderRadius: isMobile ? 16 : 20,
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              minWidth: isMobile ? 'auto' : '420px',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {/* Enhanced Header with connection quality */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: isMobile ? '20px' : '28px',
              paddingBottom: isMobile ? '16px' : '20px',
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              gap: isMobile ? '12px' : '0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '20px', flex: isMobile ? '1' : 'auto' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: isMobile ? '56px' : '64px', 
                  height: isMobile ? '56px' : '64px', 
                  borderRadius: '50%',
                  background: isIncoming 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : isInCall 
                      ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  fontSize: isMobile ? '22px' : '26px',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  animation: isRinging ? 'pulse 2s infinite, phoneRing 0.5s infinite' : 'none',
                  position: 'relative',
                  className: isIncoming ? 'incoming-call-avatar' : ''
                }}>
                  <PhoneOutlined />
                  {isInCall && (
                    <div style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '3px solid white',
                      animation: 'pulse 2s infinite'
                    }} />
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ 
                    fontSize: isMobile ? '11px' : '13px', 
                    color: '#64748b',
                    fontWeight: '600',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}>
                    {isIncoming ? '📞 Incoming Audio Call' : isInCall ? '🔊 Audio Call Active' : '📞 Calling...'}
                  </div>
                  <div style={{ 
                    fontSize: isMobile ? '18px' : '22px', 
                    fontWeight: '800', 
                    color: '#1e293b',
                    letterSpacing: '-0.7px',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {peerUser?.name || 'User'}
                  </div>
                  {isInCall && callDuration > 0 && (
                    <div style={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#10b981',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFeatureSettings: '"tnum"',
                      className: 'call-duration'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        animation: 'pulse 1.5s infinite'
                      }} />
                      {formatDuration(callDuration)}
                      {isInCall && <ConnectionQualityIndicator />}
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', flexShrink: 0 }}>
                {isInCall && <AudioWaveIndicator />}
                {(isInCall || (!isIncoming && !connecting)) && (
                  <button 
                    onClick={handleMinimizeToggle}
                    className="professional-call-button minimize-button"
                    style={{
                      padding: isMobile ? '10px' : '12px',
                      borderRadius: isMobile ? '10px' : '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.1) 0%, rgba(100, 116, 139, 0.05) 100%)',
                      color: '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? '16px' : '18px',
                      boxShadow: '0 4px 12px rgba(100, 116, 139, 0.1)',
                      minWidth: isMobile ? '40px' : '44px',
                      minHeight: isMobile ? '40px' : '44px'
                    }}
                  >
                    <MinusOutlined />
                  </button>
                )}
              </div>
            </div>

            {/* Enhanced Status Indicator */}
            {(isRinging || connecting || (!isInCall && !isIncoming)) && (
              <div style={{
                textAlign: 'center',
                marginBottom: isMobile ? '20px' : '24px',
                padding: isMobile ? '16px' : '20px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
                borderRadius: isMobile ? '12px' : '16px',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
                  animation: 'shimmer 2s infinite'
                }} />
                <div className="connecting-dots" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginBottom: '12px'
                }}>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <div style={{
                  fontSize: isMobile ? '14px' : '15px',
                  color: '#475569',
                  fontWeight: '600',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {connecting ? 
                    `Establishing secure connection...${retryCount > 0 ? ` (Attempt ${retryCount + 1})` : ''}` : 
                    'Ringing...'
                  }
                </div>
                {connectionQuality !== 'excellent' && isInCall && (
                  <div style={{
                    fontSize: isMobile ? '12px' : '13px',
                    color: connectionQuality === 'poor' ? '#ef4444' : '#f59e0b',
                    marginTop: '8px',
                    fontWeight: '500'
                  }}>
                    Connection: {connectionQuality}
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Control Buttons */}
            {isIncoming ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: isMobile ? '16px' : '20px',
                marginTop: isMobile ? '20px' : '24px',
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}>
                <button
                  onClick={acceptIncoming}
                  disabled={connecting}
                  className="professional-call-button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: isMobile ? '10px' : '14px',
                    borderRadius: '60px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    padding: isMobile ? '14px 24px' : '16px 28px',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    cursor: connecting ? 'not-allowed' : 'pointer',
                    fontSize: isMobile ? '15px' : '16px',
                    fontWeight: '700',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minWidth: isMobile ? '120px' : '140px',
                    justifyContent: 'center',
                    opacity: connecting ? 0.7 : 1,
                    position: 'relative',
                    overflow: 'hidden',
                    flex: isMobile ? '1' : 'auto'
                  }}
                >
                  <PhoneFilled style={{ fontSize: isMobile ? '18px' : '20px' }} />
                  <span>Accept</span>
                </button>
                <button
                  onClick={rejectIncoming}
                  className="professional-call-button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: isMobile ? '10px' : '14px',
                    borderRadius: '60px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    padding: isMobile ? '14px 24px' : '16px 28px',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    fontSize: isMobile ? '15px' : '16px',
                    fontWeight: '700',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minWidth: isMobile ? '120px' : '140px',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    flex: isMobile ? '1' : 'auto'
                  }}
                >
                  <CloseCircleOutlined style={{ fontSize: isMobile ? '18px' : '20px' }} />
                  <span>Decline</span>
                </button>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: isMobile ? '12px' : '16px',
                marginTop: isMobile ? '20px' : '24px',
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}>
                {isInCall ? (
                  <>
                    <button
                      onClick={toggleMute}
                      className="professional-call-button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: isMobile ? '8px' : '12px',
                        borderRadius: '50px',
                        background: isMuted 
                          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        padding: isMobile ? '12px 18px' : '14px 22px',
                        color: isMuted ? 'white' : '#475569',
                        border: isMuted ? 'none' : '2px solid #e2e8f0',
                        boxShadow: isMuted 
                          ? '0 8px 20px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                          : '0 6px 16px rgba(100, 116, 139, 0.15)',
                        cursor: 'pointer',
                        fontSize: isMobile ? '14px' : '15px',
                        fontWeight: '700',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        minWidth: isMobile ? '100px' : '120px',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        flex: isMobile ? '1' : 'auto'
                      }}
                    >
                      <div className={`mute-indicator ${isMuted ? 'muted' : ''}`}>
                        {isMuted ? <AudioMutedOutlined style={{ fontSize: isMobile ? '16px' : '18px' }} /> : <AudioOutlined style={{ fontSize: isMobile ? '16px' : '18px' }} />}
                      </div>
                      <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>
                    <button
                      onClick={endCall}
                      className="professional-call-button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: isMobile ? '8px' : '12px',
                        borderRadius: '50px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        padding: isMobile ? '12px 18px' : '14px 22px',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        fontSize: isMobile ? '14px' : '15px',
                        fontWeight: '700',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        minWidth: isMobile ? '100px' : '120px',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        flex: isMobile ? '1' : 'auto'
                      }}
                    >
                      <PhoneTwoTone twoToneColor="#fff" style={{ fontSize: isMobile ? '16px' : '18px' }} />
                      <span>End Call</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={endCall}
                    className="professional-call-button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: isMobile ? '10px' : '14px',
                      borderRadius: '60px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      padding: isMobile ? '14px 28px' : '16px 32px',
                      color: 'white',
                      border: 'none',
                      boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                      fontSize: isMobile ? '15px' : '16px',
                      fontWeight: '700',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      minWidth: isMobile ? '140px' : '160px',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <PhoneTwoTone twoToneColor="#fff" style={{ fontSize: isMobile ? '18px' : '20px' }} />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Enhanced Minimized Call UI */}
      {isOpen && isMinimized && (
        <div
          style={{
            position: 'fixed',
            top: isIPhoneX ? Math.max(panelPos.y, 44) : panelPos.y,
            left: isMobile ? Math.max(8, Math.min(window.innerWidth - (isMobile ? 280 : 320), panelPos.x)) : panelPos.x,
            zIndex: 2000,
            width: isMobile ? 280 : 320,
            borderRadius: isMobile ? 16 : 20,
            overflow: 'hidden',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(20px)',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
          className={`audio-call-minimized ${isMobile ? 'mobile-minimized' : ''} ${isIPhoneX ? 'iphonex-minimized' : ''}`}
        >
          <div
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
            onClick={handleUserInteraction}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: isMobile ? '12px 16px' : '16px 20px',
              background: isInCall 
                ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              cursor: 'grab',
              userSelect: 'none',
              borderRadius: isMobile ? '16px 16px 0 0' : '20px 20px 0 0',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: isInCall ? '-100%' : '0',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              animation: isInCall ? 'none' : 'shimmer 3s infinite'
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 16, position: 'relative', zIndex: 1, flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? '36px' : '40px',
                height: isMobile ? '36px' : '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.25)',
                animation: isInCall ? 'none' : 'pulse 2s infinite',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                flexShrink: 0
              }}>
                <PhoneOutlined style={{ fontSize: isMobile ? 16 : 18 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                <span style={{ 
                  fontWeight: 800, 
                  fontSize: isMobile ? 14 : 16,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 4,
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}>
                  {peerUser?.name || 'User'}
                </span>
                <span style={{
                  fontSize: isMobile ? 11 : 12,
                  opacity: 0.95,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isInCall ? '#10b981' : '#fbbf24',
                    animation: 'pulse 1.5s infinite',
                    boxShadow: '0 0 4px currentColor'
                  }} />
                  {isInCall ? (callDuration > 0 ? formatDuration(callDuration) : 'Active call') : 'Connecting...'}
                  {connectionQuality !== 'excellent' && isInCall && (
                    <span style={{ fontSize: '10px', opacity: 0.8 }}>
                      ({connectionQuality})
                    </span>
                  )}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: isMobile ? 8 : 10, alignItems: 'center', position: 'relative', zIndex: 1, flexShrink: 0 }}>
              {isInCall && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  style={{ 
                    border: 0, 
                    background: isMuted 
                      ? 'rgba(239, 68, 68, 0.95)' 
                      : 'rgba(255, 255, 255, 0.25)', 
                    color: 'white', 
                    borderRadius: isMobile ? 8 : 10, 
                    padding: isMobile ? '6px 8px' : '8px 10px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '12px' : '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: isMobile ? '28px' : '32px',
                    height: isMobile ? '28px' : '32px',
                    transition: 'all 0.2s ease',
                    fontWeight: 700,
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  <div className={`mute-indicator ${isMuted ? 'muted' : ''}`}>
                    {isMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
                  </div>
                </button>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleMinimizeToggle();
                }} 
                style={{ 
                  border: 0, 
                  background: 'rgba(255, 255, 255, 0.25)', 
                  color: 'white', 
                  borderRadius: isMobile ? 8 : 10, 
                  padding: isMobile ? '6px 10px' : '8px 12px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  minHeight: isMobile ? '28px' : '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
                  minWidth: isMobile ? '28px' : '32px'
                }}
                title="Expand"
              >
                ↗
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  endCall();
                }}
                style={{ 
                  border: 0, 
                  background: 'rgba(239, 68, 68, 0.95)', 
                  color: 'white', 
                  borderRadius: isMobile ? 8 : 10, 
                  padding: isMobile ? '6px 12px' : '8px 14px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '11px' : '13px',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  minHeight: isMobile ? '28px' : '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                title="End Call"
              >
                End
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default AudioCall;