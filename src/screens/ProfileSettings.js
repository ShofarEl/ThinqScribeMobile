import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TextInput,
  Button,
  Avatar,
  Card,
  Switch,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useAppLoading } from '../context/AppLoadingContext';
import { updateUserProfile, uploadProfilePicture } from '../api/user';

const ProfileSettings = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const { setLoading: setGlobalLoading } = useAppLoading();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  // UI state
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    assignmentUpdates: true,
    paymentReminders: true,
    marketingEmails: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });

      if (user.avatar) {
        setPreviewUrl(user.avatar);
      }

      // Load notification settings from user preferences
      if (user.notificationSettings) {
        setNotificationSettings({
          ...notificationSettings,
          ...user.notificationSettings,
        });
      }
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Check file size (2MB limit)
        if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select an image smaller than 2MB.');
          return;
        }

        setPreviewUrl(asset.uri);
        setSelectedFile(asset);
        setError('');
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPreviewUrl(asset.uri);
        setSelectedFile(asset);
        setError('');
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      console.log('📱 [ProfileSettings] Updating profile...');

      // Upload avatar if selected
      let avatarUrl = user?.avatar;
      
      if (selectedFile) {
        console.log('📱 [ProfileSettings] Uploading avatar...');
        
        const formData = new FormData();
        formData.append('file', {
          uri: selectedFile.uri,
          type: selectedFile.type || 'image/jpeg',
          name: selectedFile.fileName || 'avatar.jpg',
        });

        avatarUrl = await uploadProfilePicture(formData);
        console.log('📱 [ProfileSettings] Avatar uploaded:', avatarUrl);
        setSelectedFile(null);
      }

      // Update profile
      const profileUpdateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        avatar: avatarUrl,
        notificationSettings,
      };

      console.log('📱 [ProfileSettings] Updating profile data:', profileUpdateData);
      
      const updatedUserData = await updateUserProfile(profileUpdateData);
      console.log('📱 [ProfileSettings] Profile updated:', updatedUserData);
      
      updateUser(updatedUserData);
      setPreviewUrl(updatedUserData.avatar || avatarUrl);
      
      setFormData({
        name: updatedUserData.name,
        email: updatedUserData.email,
        phone: updatedUserData.phone,
        bio: updatedUserData.bio,
      });

      setSuccess('Profile updated successfully!');
      
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('📱 [ProfileSettings] Profile update error:', err);
      setError(err.message || 'Failed to update profile.');
      
      // Reset avatar on error
      if (user?.avatar) {
        setPreviewUrl(user.avatar);
      }
      setSelectedFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderProfileTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={showImageOptions} style={styles.avatarContainer}>
          <Avatar.Image 
            size={120} 
            source={{ 
              uri: previewUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}` 
            }}
            style={styles.avatar}
          />
          <View style={styles.avatarOverlay}>
            <Text style={styles.avatarOverlayText}>📷</Text>
          </View>
        </TouchableOpacity>
        
        <Text style={styles.avatarHint}>Tap to change photo</Text>
        <Text style={styles.avatarSubtext}>JPG, PNG • Max 2MB</Text>
      </View>

      {/* Form Fields */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <TextInput
          label="Full Name"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          style={styles.input}
          mode="outlined"
          outlineColor="#e2e8f0"
          activeOutlineColor="#015382"
        />

        <TextInput
          label="Email Address"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          style={styles.input}
          mode="outlined"
          outlineColor="#e2e8f0"
          activeOutlineColor="#015382"
          keyboardType="email-address"
          disabled
        />

        <TextInput
          label="Phone Number"
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          style={styles.input}
          mode="outlined"
          outlineColor="#e2e8f0"
          activeOutlineColor="#015382"
          keyboardType="phone-pad"
        />

        <TextInput
          label="Bio"
          value={formData.bio}
          onChangeText={(value) => handleInputChange('bio', value)}
          style={styles.input}
          mode="outlined"
          outlineColor="#e2e8f0"
          activeOutlineColor="#015382"
          multiline
          numberOfLines={4}
          maxLength={200}
        />
        
        <Text style={styles.charCount}>{formData.bio.length}/200 characters</Text>
      </View>

      {/* Save Button */}
      <Button
        mode="contained"
        onPress={handleUpdateProfile}
        loading={isLoading}
        disabled={isLoading}
        style={styles.saveButton}
        labelStyle={styles.saveButtonText}
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </ScrollView>
  );

  const renderNotificationsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Notification Preferences</Text>
      <Text style={styles.sectionSubtitle}>
        Choose what notifications you'd like to receive
      </Text>

      <View style={styles.notificationsList}>
        {Object.entries(notificationSettings).map(([key, value]) => (
          <Card key={key} style={styles.notificationCard}>
            <View style={styles.notificationItem}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <Text style={styles.notificationDescription}>
                  {getNotificationDescription(key)}
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={(newValue) => handleNotificationChange(key, newValue)}
                color="#015382"
              />
            </View>
          </Card>
        ))}
      </View>

      {/* Save Button */}
      <Button
        mode="contained"
        onPress={handleUpdateProfile}
        loading={isLoading}
        disabled={isLoading}
        style={styles.saveButton}
        labelStyle={styles.saveButtonText}
      >
        {isLoading ? 'Saving...' : 'Save Preferences'}
      </Button>
    </ScrollView>
  );

  const getNotificationDescription = (key) => {
    const descriptions = {
      emailNotifications: 'Receive notifications via email',
      pushNotifications: 'Receive push notifications on your device',
      assignmentUpdates: 'Get notified about assignment progress and updates',
      paymentReminders: 'Reminders for upcoming payments and due dates',
      marketingEmails: 'Receive updates about new features and special offers',
    };
    return descriptions[key] || '';
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#015382" />
          <Text style={styles.loadingText}>Loading profile...</Text>
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
        {/* Header */}
        <LinearGradient colors={['#015382', '#017DB0']} style={styles.header}>
          <Text style={styles.headerTitle}>Account Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your profile and preferences</Text>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
              👤 Profile
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
            onPress={() => setActiveTab('notifications')}
          >
            <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
              🔔 Notifications
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.contentContainer}>
          {activeTab === 'profile' ? renderProfileTab() : renderNotificationsTab()}
        </View>

        {/* Success/Error Messages */}
        <Snackbar
          visible={!!success}
          onDismiss={() => setSuccess('')}
          duration={3000}
          style={styles.successSnackbar}
        >
          ✅ {success}
        </Snackbar>

        <Snackbar
          visible={!!error}
          onDismiss={() => setError('')}
          duration={5000}
          style={styles.errorSnackbar}
        >
          ❌ {error}
        </Snackbar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getNotificationDescription = (key) => {
  const descriptions = {
    emailNotifications: 'Receive notifications via email',
    pushNotifications: 'Receive push notifications on your device',
    assignmentUpdates: 'Get notified about assignment progress and updates',
    paymentReminders: 'Reminders for upcoming payments and due dates',
    marketingEmails: 'Receive updates about new features and special offers',
  };
  return descriptions[key] || '';
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
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
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    borderWidth: 4,
    borderColor: '#e2e8f0',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#015382',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarOverlayText: {
    fontSize: 16,
  },
  avatarHint: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  avatarSubtext: {
    fontSize: 12,
    color: '#64748b',
  },
  formSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  charCount: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
    marginTop: -10,
    marginBottom: 10,
  },
  notificationsList: {
    marginBottom: 30,
  },
  notificationCard: {
    marginBottom: 12,
    elevation: 2,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 15,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#015382',
    borderRadius: 12,
    paddingVertical: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  successSnackbar: {
    backgroundColor: '#22c55e',
  },
  errorSnackbar: {
    backgroundColor: '#ef4444',
  },
});

export default ProfileSettings;
