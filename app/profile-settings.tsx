// Profile Settings Screen for ThinqScribe Mobile - Enhanced with Writer Features
/*import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ActivityIndicator as RNActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Avatar, Button, Card, IconButton, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateUserProfile, uploadProfilePicture } from '../src/api/user';
import { useAuth } from '../src/context/MobileAuthContext';
import { useNotifications } from '../src/context/NotificationContext';

const { width } = Dimensions.get('window');

const ProfileSettingsScreen: React.FC = () => {
  const { user, signOut, updateUser } = useAuth();
  const { socket } = useNotifications();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [specialtySuggestions, setSpecialtySuggestions] = useState([
    'Academic Writing', 'Research Papers', 'Essays', 'Business Writing', 
    'Technical Writing', 'Creative Writing', 'Thesis Writing', 'Dissertations'
  ]);
  const [showResponseTimeModal, setShowResponseTimeModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    writerBio: '',
    writerSpecialties: [] as string[],
    responseTime: 24
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    assignmentUpdates: true,
    paymentReminders: true,
    marketingEmails: false,
  });

  // Generate fallback avatar URL
  const getFallbackAvatar = () => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=015382&textColor=ffffff`;
  };

  // Initialize form data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        writerBio: user?.writerProfile?.bio || '',
        writerSpecialties: Array.isArray(user?.writerProfile?.specialties) ? user.writerProfile.specialties : [],
        responseTime: user?.writerProfile?.responseTime || 24,
      });
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  // Handle specialty search and suggestions
  const handleSpecialtySearch = (value: string) => {
    setNewSpecialty(value);
    if (value.trim().length > 0) {
      const allSpecialties = [
        'Academic Writing', 'Research Papers', 'Essays', 'Business Writing', 
        'Technical Writing', 'Creative Writing', 'Thesis Writing', 'Dissertations',
        'Literature Review', 'Case Studies', 'Lab Reports', 'Book Reviews',
        'Annotated Bibliography', 'Proposal Writing', 'Grant Writing', 'Editing & Proofreading',
        'Data Analysis', 'Statistics', 'Psychology', 'Sociology', 'History', 'Philosophy',
        'Economics', 'Political Science', 'Marketing', 'Management', 'Finance', 'Accounting'
      ];
      
      const filtered = allSpecialties.filter(specialty => 
        specialty.toLowerCase().includes(value.toLowerCase()) &&
        !formData.writerSpecialties.includes(specialty)
      ).slice(0, 6);
      
      setSpecialtySuggestions(filtered);
    } else {
      setSpecialtySuggestions([
        'Academic Writing', 'Research Papers', 'Essays', 'Business Writing', 
        'Technical Writing', 'Creative Writing', 'Thesis Writing', 'Dissertations'
      ]);
    }
  };

  // Handle adding specialty
  const handleAddSpecialty = (specialty?: string) => {
    const specialtyToAdd = specialty || newSpecialty.trim();
    if (specialtyToAdd && !formData.writerSpecialties.includes(specialtyToAdd)) {
      setFormData(prev => ({
        ...prev,
        writerSpecialties: [...prev.writerSpecialties, specialtyToAdd]
      }));
      setNewSpecialty('');
      setSpecialtySuggestions([
        'Academic Writing', 'Research Papers', 'Essays', 'Business Writing', 
        'Technical Writing', 'Creative Writing', 'Thesis Writing', 'Dissertations'
      ]);
    }
  };

  // Handle removing specialty
  const handleRemoveSpecialty = (specialtyToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      writerSpecialties: prev.writerSpecialties.filter(specialty => specialty !== specialtyToRemove)
    }));
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Camera roll permission is needed to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Check file size (2MB limit)
        if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
          Alert.alert('File too large', 'Image must be smaller than 2MB.');
          return;
        }

        setImageLoading(true);
        
        // Upload image
        const uploadFormData = new FormData();
        uploadFormData.append('file', {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'profile.jpg',
        } as any);

        const avatarUrl = await uploadProfilePicture(uploadFormData);
        
        // Update user profile with new avatar
        const updatedUser = await updateUserProfile({ avatar: avatarUrl });
        updateUser(updatedUser.data || updatedUser);
        
        setSuccess('Profile picture updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const profileUpdateData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
      };

      // Add writer profile data if user is a writer
      if (user?.role === 'writer') {
        (profileUpdateData as any).writerProfile = {
          ...user.writerProfile,
          bio: formData.writerBio.trim(),
          specialties: formData.writerSpecialties || [],
          responseTime: parseInt(formData.responseTime.toString()) || 24
        };
      }

      const updatedUserData = await updateUserProfile(profileUpdateData);
      const userData = updatedUserData.data || updatedUserData;
      updateUser(userData);
      
      setFormData({
        name: userData.name || '',
        email: userData.email || formData.email,
        phone: userData.phone || '',
        bio: userData.bio || '',
        writerBio: userData.writerProfile?.bio || '',
        writerSpecialties: Array.isArray(userData.writerProfile?.specialties) ? userData.writerProfile.specialties : [],
        responseTime: userData.writerProfile?.responseTime || 24,
      });

      // Emit socket event for real-time marketplace updates
      if (socket && user?.role === 'writer') {
        socket.emit('writerProfileUpdate', {
          writerId: user._id,
          updatedFields: {
            name: userData.name,
            avatar: userData.avatar,
            bio: formData.writerBio,
            specialties: formData.writerSpecialties,
            responseTime: parseInt(formData.responseTime.toString())
          }
        });
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/signin');
          }
        }
      ]
    );
  };

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      {/* Success/Error Messages 
      {success && (
        <View style={styles.successMessage}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.successText}>{success}</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorMessage}>
          <Ionicons name="alert-circle" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {imageLoading && (
            <View style={styles.loadingOverlay}>
              <RNActivityIndicator size="large" color="#667eea" />
            </View>
          )}
          <Avatar.Text
            size={100}
            label={`${user?.name?.[0] || ''}${user?.name?.[1] || ''}`}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.cameraButton} onPress={handleImagePicker}>
            <IconButton icon="camera" iconColor="#ffffff" size={20} />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>{user?.role}</Text>
        <Text style={styles.helperText}>JPG, PNG • Max 2MB</Text>
      </View>

      <Card style={styles.formCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <TextInput
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            mode="outlined"
            style={styles.input}
            placeholder="Enter your full name"
          />

          <TextInput
            label="Email Address"
            value={formData.email}
            mode="outlined"
            disabled
            style={styles.input}
          />
          <Text style={styles.helperText}>Email cannot be changed</Text>

          <TextInput
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            mode="outlined"
            style={styles.input}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <TextInput
            label="Bio"
            value={formData.bio}
            onChangeText={(text) => handleInputChange('bio', text)}
            mode="outlined"
            multiline
            numberOfLines={4}
            maxLength={200}
            style={styles.input}
            placeholder="Tell us a bit about yourself..."
          />
          <Text style={styles.helperText}>{formData.bio.length}/200 characters</Text>

          {/* Writer-specific bio field 
          {user?.role === 'writer' && (
            <>
              <TextInput
                label="Professional Bio (Marketplace)"
                value={formData.writerBio}
                onChangeText={(text) => handleInputChange('writerBio', text)}
                mode="outlined"
                multiline
                numberOfLines={6}
                maxLength={1000}
                style={[styles.input, { height: 120 }]}
                placeholder="Describe your professional experience, skills, and what makes you stand out as a writer. This will be displayed in the marketplace..."
              />
              <Text style={styles.helperText}>
                {formData.writerBio.length}/1000 characters - This appears in the marketplace
              </Text>
            </>
          )}

          {/* Writer Specialties
          {user?.role === 'writer' && (
            <>
              <Text style={styles.sectionTitle}>Specialties & Expertise Areas</Text>
              
              {/* Current Specialties 
              <View style={styles.specialtiesContainer}>
                {formData.writerSpecialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={styles.specialtyTagText}>{specialty}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveSpecialty(specialty)}
                      style={styles.removeSpecialtyButton}
                    >
                      <Ionicons name="close" size={14} color="#667eea" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Add Specialty Input 
              <View style={styles.addSpecialtyContainer}>
                <TextInput
                  label="Add a specialty"
                  value={newSpecialty}
                  onChangeText={handleSpecialtySearch}
                  mode="outlined"
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="e.g., Academic Writing"
                  onSubmitEditing={() => handleAddSpecialty()}
                />
                <TouchableOpacity
                  style={styles.addSpecialtyButton}
                  onPress={() => handleAddSpecialty()}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Specialty Suggestions 
              {newSpecialty.trim().length > 0 && specialtySuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {specialtySuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => {
                        handleAddSpecialty(suggestion);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.helperText}>
                Add your areas of expertise to help students find you
              </Text>
            </>
          )}

          {/* Response Time 
          {user?.role === 'writer' && (
            <>
              <Text style={styles.sectionTitle}>Response Time Commitment</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>
                  {formData.responseTime <= 1 ? 'Within 1 hour' :
                   formData.responseTime <= 2 ? 'Within 2 hours' :
                   formData.responseTime <= 4 ? 'Within 4 hours' :
                   formData.responseTime <= 8 ? 'Within 8 hours' :
                   formData.responseTime <= 12 ? 'Within 12 hours' :
                   formData.responseTime <= 24 ? 'Within 24 hours' :
                   formData.responseTime <= 48 ? 'Within 2 days' : 'Within 3 days'}
                </Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowResponseTimeModal(true)}
                >
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>
                How quickly you typically respond to new messages
              </Text>
            </>
          )}

          <Button
            mode="contained"
            onPress={handleUpdateProfile}
            loading={isLoading}
            style={styles.saveButton}
          >
            Save Changes
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.formCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          
          {Object.entries(notificationSettings).map(([key, value]) => (
            <View key={key} style={styles.notificationItem}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <Text style={styles.notificationDescription}>
                  {getNotificationDescription(key)}
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={(newValue) => {
                  setNotificationSettings(prev => ({ ...prev, [key]: newValue }));
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              />
            </View>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  const getNotificationDescription = (key: string) => {
    const descriptions: { [key: string]: string } = {
      emailNotifications: 'Receive notifications via email',
      pushNotifications: 'Receive push notifications',
      assignmentUpdates: 'Get notified about assignment progress',
      paymentReminders: 'Reminders for upcoming payments',
      marketingEmails: 'Receive updates about new features',
    };
    return descriptions[key] || '';
  };

  const renderAccountTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.formCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <Button
            mode="outlined"
            onPress={() => router.push('/change-password')}
            style={styles.actionButton}
            icon="lock"
          >
            Change Password
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push('/privacy')}
            style={styles.actionButton}
            icon="shield-account"
          >
            Privacy Policy
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push('/terms')}
            style={styles.actionButton}
            icon="file-document"
          >
            Terms of Service
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push('/support')}
            style={styles.actionButton}
            icon="help-circle"
          >
            Help & Support
          </Button>

          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <Button
              mode="contained"
              onPress={handleSignOut}
              style={styles.signOutButton}
              buttonColor="#ef4444"
              icon="logout"
            >
              Sign Out
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const tabs = [
    { key: 'profile', label: 'Profile', icon: 'account' },
    { key: 'notifications', label: 'Notifications', icon: 'bell' },
    { key: 'account', label: 'Account', icon: 'cog' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton icon="arrow-left" iconColor="#ffffff" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Account Settings</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => {
              setActiveTab(tab.key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === 'account' && renderAccountTab()}
      </ScrollView>

      {/* Response Time Modal 
      <Modal
        visible={showResponseTimeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResponseTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Response Time Commitment</Text>
              <TouchableOpacity
                onPress={() => setShowResponseTimeModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalOptions}>
              {[
                { label: 'Within 1 hour', value: 1 },
                { label: 'Within 2 hours', value: 2 },
                { label: 'Within 4 hours', value: 4 },
                { label: 'Within 8 hours', value: 8 },
                { label: 'Within 12 hours', value: 12 },
                { label: 'Within 24 hours', value: 24 },
                { label: 'Within 2 days', value: 48 },
                { label: 'Within 3 days', value: 72 }
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    formData.responseTime === option.value && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    handleInputChange('responseTime', option.value);
                    setShowResponseTimeModal(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    formData.responseTime === option.value && styles.modalOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {formData.responseTime === option.value && (
                    <Ionicons name="checkmark" size={20} color="#667eea" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingVertical: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' },
  headerSpacer: { width: 48 },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#667eea' },
  tabText: { fontSize: 14, color: '#666' },
  activeTabText: { color: '#ffffff', fontWeight: '600' },
  content: { flex: 1 },
  tabContent: { padding: 16 },
  
  // Success/Error Messages
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successText: {
    color: '#166534',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { backgroundColor: '#667eea' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 50, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  cameraButton: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#667eea', borderRadius: 20, borderWidth: 3, borderColor: '#ffffff' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  userRole: { fontSize: 16, color: '#666', textTransform: 'capitalize' },
  formCard: { borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#333' },
  input: { marginBottom: 16 },
  helperText: { fontSize: 12, color: '#666', marginTop: -12, marginBottom: 16 },
  saveButton: { marginTop: 8, backgroundColor: '#667eea' },
  
  // Specialties Styles
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  specialtyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyTagText: {
    fontSize: 12,
    color: '#3730a3',
    fontWeight: '600',
    marginRight: 6,
  },
  removeSpecialtyButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#c7d2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSpecialtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addSpecialtyButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    maxHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionText: {
    fontSize: 14,
    color: '#374151',
  },
  
  // Response Time Picker Styles
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerLabel: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  pickerButton: {
    padding: 4,
  },
  
  notificationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  notificationInfo: { flex: 1, marginRight: 16 },
  notificationLabel: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  notificationDescription: { fontSize: 12, color: '#666' },
  actionButton: { marginBottom: 12 },
  dangerZone: { marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  dangerTitle: { fontSize: 16, fontWeight: '600', color: '#ef4444', marginBottom: 12 },
  signOutButton: { backgroundColor: '#ef4444' },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalOptions: {
    flex: 1,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  modalOptionSelected: {
    backgroundColor: '#f0f4ff',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#667eea',
    fontWeight: '600',
  },
});

export default ProfileSettingsScreen;
*/
import ProfileSettings from '../src/screens/ProfileSettings';

export default ProfileSettings