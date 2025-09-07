// src/context/CallContext.jsx

import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import AudioCall from '../components/AudioCall';

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentCall, setCurrentCall] = useState(null);
  const [callPeerUser, setCallPeerUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [isAudioCallReady, setIsAudioCallReady] = useState(false);
  const audioCallRef = useRef(null);
  const pendingCallRef = useRef(null);

  // Start a new call
  const startCall = (peerUser, chatId) => {
    // Validation checks
    if (!peerUser || !peerUser._id) {
      console.error('❌ Cannot start call: Invalid peer user', peerUser);
      return;
    }
    
    if (!chatId) {
      console.error('❌ Cannot start call: Invalid chat ID', chatId);
      return;
    }
    
    if (!user || !user._id) {
      console.error('❌ Cannot start call: No authenticated user');
      return;
    }
    
    // Prevent starting multiple calls
    if (currentCall) {
      console.warn('⚠️ Call already in progress, ending previous call first');
      endCall();
    }
    
    console.log('🔄 Starting call with:', peerUser?.name, 'in chat:', chatId);
    
    // Set all call data immediately
    const newCallId = `call-${Date.now()}`;
    setCurrentCall({
      id: newCallId,
      peerUser,
      chatId,
      startTime: Date.now()
    });
    setCallPeerUser(peerUser);
    setChatId(chatId);
    
    console.log('📞 Call context updated:', { 
      callId: newCallId, 
      peerUserName: peerUser?.name, 
      chatId,
      isAudioCallReady 
    });
    
    // Store pending call if component not ready yet
    pendingCallRef.current = { peerUser, chatId };
    
    // Trigger the audio call component with proper error handling
    setTimeout(() => {
      if (audioCallRef.current?.open) {
        console.log('🔄 Triggering call with chatId:', chatId);
        audioCallRef.current.open();
        pendingCallRef.current = null;
      } else if (isAudioCallReady) {
        console.error('❌ AudioCall component ready but open method not available');
      } else {
        console.log('⏳ AudioCall component not ready yet, call will start when ready');
      }
    }, 100);
  };

  // Handle incoming call (called from AudioCall component)
  const handleIncomingCall = (peerUser, incomingChatId, callId) => {
    console.log('📞 Handling incoming call in context:', { peerUser: peerUser?.name, incomingChatId, callId });
    
    // Set call data for incoming call
    setCurrentCall({
      id: callId,
      peerUser,
      chatId: incomingChatId,
      startTime: Date.now(),
      isIncoming: true
    });
    setCallPeerUser(peerUser);
    setChatId(incomingChatId);
    
    console.log('📞 Call context updated for incoming call:', { 
      callId, 
      peerUserName: peerUser?.name, 
      chatId: incomingChatId 
    });
  };

  // End the current call
  const endCall = () => {
    console.log('🔄 Ending call');
    
    try {
      if (audioCallRef.current?.endCall) {
        audioCallRef.current.endCall();
      }
    } catch (error) {
      console.error('❌ Error ending call:', error);
    } finally {
      // Always clean up state
      console.log('🧹 Cleaning up call context state');
      setCurrentCall(null);
      setCallPeerUser(null);
      setChatId(null);
      pendingCallRef.current = null;
    }
  };

  // Check if currently in a call
  const isInCall = currentCall !== null;

  // Cleanup effect for when user logs out or component unmounts
  useEffect(() => {
    if (!user && currentCall) {
      console.log('🧹 User logged out, cleaning up call state');
      endCall();
    }
  }, [user]);

  // Handle pending calls when component becomes ready
  useEffect(() => {
    if (isAudioCallReady && pendingCallRef.current && audioCallRef.current?.open) {
      console.log('🔄 AudioCall ready, starting pending call');
      audioCallRef.current.open();
      pendingCallRef.current = null;
    }
  }, [isAudioCallReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentCall) {
        console.log('🧹 CallProvider unmounting, cleaning up call');
        endCall();
      }
    };
  }, []);

  return (
    <CallContext.Provider value={{
      currentCall,
      callPeerUser,
      chatId,
      isInCall,
      startCall,
      endCall,
      handleIncomingCall,
      audioCallRef
    }}>
      {children}
      
      {/* Global Audio Call Component */}
      {user && (
        <AudioCall
          key="global-audio-call"
          ref={(ref) => {
            audioCallRef.current = ref;
            if (ref && !isAudioCallReady) {
              setIsAudioCallReady(true);
            }
          }}
          chatId={chatId}
          selfUser={user}
          peerUser={callPeerUser}
          onIncomingCall={handleIncomingCall}
        />
      )}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export default CallContext;
