// ThinqScribe/src/screens/ExploreScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView
} from 'react-native';

const ExploreScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover writers and projects</Text>
        <Text style={styles.comingSoon}>Coming Soon...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  comingSoon: {
    fontSize: 18,
    color: '#015382',
    fontWeight: '500',
  },
});

export default ExploreScreen;
