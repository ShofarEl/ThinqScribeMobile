// Audio Call Screen for ThinqScribe Mobile
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebRTCAudioCall from '../src/components/WebRTCAudioCall';

const AudioCallScreen: React.FC = () => {
  const { userId, userName, userAvatar, isIncoming = 'false', chatId, callId } = useLocalSearchParams();
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <WebRTCAudioCall
        visible={visible}
        onClose={handleClose}
        targetUserId={userId as string}
        targetUserName={userName as string}
        targetUserAvatar={userAvatar as string}
        chatId={chatId as string}
        isIncoming={isIncoming === 'true'}
        callId={callId as string}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#000',
  },
});

export default AudioCallScreen;