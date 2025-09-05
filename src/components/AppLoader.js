// ThinqScribe/src/components/AppLoader.js
import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAppLoading } from '../context/AppLoadingContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const AppLoader = () => {
  const { progress, loadingMessage } = useAppLoading();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = '#015382'; // Blue color as per design

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#0F0F23' : '#F8FAFC' }
    ]}>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        
        {loadingMessage ? (
          <Text style={[
            styles.loadingText,
            { color: isDark ? '#E5E7EB' : '#374151' }
          ]}>
            {loadingMessage}
          </Text>
        ) : (
          <Text style={[
            styles.loadingText,
            { color: isDark ? '#E5E7EB' : '#374151' }
          ]}>
            Loading...
          </Text>
        )}
        
        {progress > 0 && (
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar,
                { backgroundColor: primaryColor, width: `${progress}%` }
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  progressContainer: {
    height: 4,
    width: 200,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});

export default AppLoader;