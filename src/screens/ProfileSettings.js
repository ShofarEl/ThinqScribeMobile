// ThinqScribe/src/screens/ProfileSettings.js - Mobile Profile Settings

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { updateUserProfile, uploadProfilePicture } from '../api/user';
import { useAuth } from '../context/MobileAuthContext';
import { useNotifications } from '../context/NotificationContext';

// Import premium design system
import { borderRadius, colors, shadows, spacing, typography } from '../styles/designSystem';
import {
    premiumButtons,
    premiumLayout,
    premiumText
} from '../styles/premiumComponents';

const { width, height } = Dimensions.get('window');

const ProfileSettings = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { socket } = useNotifications();

  // Generate fallback avatar URL
  const getFallbackAvatar = () => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=015382&textColor=ffffff`;
  };

  // State management
  const [activeTab, setActiveTab] = useState('profile');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [specialtySuggestions, setSpecialtySuggestions] = useState([
    'Academic Writing', 'Research Papers', 'Essays', 'Business Writing', 
    'Technical Writing', 'Creative Writing', 'Thesis Writing', 'Dissertations'
  ]);
  const [showResponseTimeModal, setShowResponseTimeModal] = useState(false);
  const [isRouterReady, setIsRouterReady] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    writerBio: '',
    writerSpecialties: [],
    responseTime: 24
  });

  // Notification preferences
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    assignmentUpdates: true,
    paymentReminders: true,
    marketingEmails: false,
  });

  // Initialize router ready state
  useEffect(() => {
    setIsRouterReady(true);
  }, []);

  // Initialize form data
  useEffect(() => {
    if (isRouterReady && !isAuthenticated) {
      router.replace('/signin');
      return;
    }

    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      writerBio: user?.writerProfile?.bio || '',
      writerSpecialties: Array.isArray(user?.writerProfile?.specialties) ? user.writerProfile.specialties : [],
      responseTime: user?.writerProfile?.responseTime || 24,
    });

    // Set preview URL
    if (user?.avatar) {
      setPreviewUrl(user.avatar);
    } else if (user?.name) {
      setPreviewUrl(getFallbackAvatar());
    }
  }, [isAuthenticated, user, isRouterReady]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  // Handle specialty search and suggestions
  const handleSpecialtySearch = (value) => {
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
  const handleAddSpecialty = (specialty = null) => {
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
  const handleRemoveSpecialty = (specialtyToRemove) => {
    setFormData(prev => ({
      ...prev,
      writerSpecialties: prev.writerSpecialties.filter(specialty => specialty !== specialtyToRemove)
    }));
  };

  // Handle image selection
  const handleImagePicker = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Camera roll permission is needed to select photos.');
        return;
      }

      // Launch image picker
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
        setPreviewUrl(asset.uri);
        
        // Upload image
        await handleImageUpload(asset);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      setImageLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (asset) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'profile.jpg',
      });

      const avatarUrl = await uploadProfilePicture(formData);
      
      // Update user profile with new avatar
      const updatedUser = await updateUserProfile({ avatar: avatarUrl });
      updateUser(updatedUser);
      
      setSuccess('Profile picture updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Image upload error:', error);
      setError('Failed to upload image. Please try again.');
      setPreviewUrl(user?.avatar || getFallbackAvatar());
    } finally {
      setImageLoading(false);
    }
  };

  // Handle profile update
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
        profileUpdateData.writerProfile = {
          ...user.writerProfile,
          bio: formData.writerBio.trim(),
          specialties: formData.writerSpecialties || [],
          responseTime: parseInt(formData.responseTime) || 24
        };
      }

      const updatedUserData = await updateUserProfile(profileUpdateData);
      updateUser(updatedUserData);
      
      setFormData({
        name: updatedUserData.name || '',
        phone: updatedUserData.phone || '',
        bio: updatedUserData.bio || '',
        writerBio: updatedUserData.writerProfile?.bio || '',
        writerSpecialties: Array.isArray(updatedUserData.writerProfile?.specialties) ? updatedUserData.writerProfile.specialties : [],
        responseTime: updatedUserData.writerProfile?.responseTime || 24,
      });

      // Emit socket event for real-time marketplace updates
      if (socket && user?.role === 'writer') {
        socket.emit('writerProfileUpdate', {
          writerId: user._id,
          updatedFields: {
            name: updatedUserData.name,
            avatar: updatedUserData.avatar,
            bio: formData.writerBio,
            specialties: formData.writerSpecialties,
            responseTime: parseInt(formData.responseTime)
          }
        });
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle notification settings change
  const handleNotificationChange = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSuccess('Notification preferences updated!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: 'person-outline' },
    { key: 'notifications', label: 'Notifications', icon: 'notifications-outline' }
  ];

  // Show loading while router is not ready
  if (!isRouterReady) {
    return (
      <SafeAreaView style={[premiumLayout.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={[premiumText.bodyMedium, { color: colors.neutral[600], marginTop: spacing.md }]}>
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  const renderTabButton = (tab) => (
    <TouchableOpacity
      key={tab.key}
      style={[
        styles.tabButton,
        activeTab === tab.key && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab.key)}
    >
      <Ionicons 
        name={tab.icon} 
        size={20} 
        color={activeTab === tab.key ? colors.primary[600] : colors.neutral[500]} 
      />
      <Text style={[
        premiumText.bodySemibold,
        { 
          color: activeTab === tab.key ? colors.primary[600] : colors.neutral[500],
          marginLeft: spacing.xs
        }
      ]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  const renderProfileTab = () => (
    <View style={{ flex: 1 }}>
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {imageLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
          )}
          <Image
            source={{ uri: previewUrl || getFallbackAvatar() }}
            style={styles.avatar}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setPreviewUrl(getFallbackAvatar());
            }}
          />
          <TouchableOpacity 
            style={styles.cameraButton}
            onPress={handleImagePicker}
          >
            <Ionicons name="camera" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={[premiumText.headingMedium, { textAlign: 'center', marginTop: spacing.md }]}>
          {user?.name}
        </Text>
        <Text style={[premiumText.bodyMedium, { textAlign: 'center', color: colors.neutral[500], textTransform: 'capitalize' }]}>
          {user?.role}
        </Text>
        <Text style={[premiumText.caption, { textAlign: 'center', color: colors.neutral[400], marginTop: spacing.xs }]}>
          JPG, PNG • Max 2MB
        </Text>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholder="Enter your full name"
            placeholderTextColor={colors.neutral[400]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={[styles.textInput, styles.disabledInput]}
            value={formData.email}
            placeholder="Enter your email"
            placeholderTextColor={colors.neutral[400]}
            editable={false}
          />
          <Text style={[premiumText.caption, { color: colors.neutral[400], marginTop: spacing.xs }]}>
            Email cannot be changed
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            placeholder="Enter your phone number"
            placeholderTextColor={colors.neutral[400]}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.bio}
            onChangeText={(text) => handleInputChange('bio', text)}
            placeholder="Tell us a bit about yourself..."
            placeholderTextColor={colors.neutral[400]}
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={[premiumText.caption, { color: colors.neutral[500], marginTop: spacing.xs }]}>
            {formData.bio.length}/200 characters
          </Text>
        </View>

        {/* Writer-specific bio field */}
        {user?.role === 'writer' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Professional Bio (Marketplace)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea, { height: 120 }]}
              value={formData.writerBio}
              onChangeText={(text) => handleInputChange('writerBio', text)}
              placeholder="Describe your professional experience, skills, and what makes you stand out as a writer. This will be displayed in the marketplace..."
              placeholderTextColor={colors.neutral[400]}
              multiline
              numberOfLines={6}
              maxLength={1000}
            />
            <Text style={[premiumText.caption, { color: colors.neutral[500], marginTop: spacing.xs }]}>
              {formData.writerBio.length}/1000 characters - This appears in the marketplace
            </Text>
          </View>
        )}

        {/* Writer Specialties */}
        {user?.role === 'writer' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Specialties & Expertise Areas</Text>
            
            {/* Current Specialties */}
            <View style={styles.specialtiesContainer}>
              {formData.writerSpecialties.map((specialty, index) => (
                <View key={index} style={styles.specialtyTag}>
                  <Text style={styles.specialtyTagText}>{specialty}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveSpecialty(specialty)}
                    style={styles.removeSpecialtyButton}
                  >
                    <Ionicons name="close" size={14} color={colors.primary[600]} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Add Specialty Input */}
            <View style={styles.addSpecialtyContainer}>
              <TextInput
                style={[styles.textInput, { flex: 1, marginRight: spacing.sm }]}
                value={newSpecialty}
                onChangeText={handleSpecialtySearch}
                placeholder="Add a specialty (e.g., Academic Writing)"
                placeholderTextColor={colors.neutral[400]}
                onSubmitEditing={() => handleAddSpecialty()}
              />
              <TouchableOpacity
                style={styles.addSpecialtyButton}
                onPress={() => handleAddSpecialty()}
              >
                <Ionicons name="add" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Specialty Suggestions */}
            {newSpecialty.trim().length > 0 && specialtySuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {specialtySuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleAddSpecialty(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[premiumText.caption, { color: colors.neutral[500], marginTop: spacing.xs }]}>
              Add your areas of expertise to help students find you
            </Text>
          </View>
        )}

        {/* Response Time */}
        {user?.role === 'writer' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Response Time Commitment</Text>
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
                <Ionicons name="chevron-down" size={20} color={colors.neutral[600]} />
              </TouchableOpacity>
            </View>
            <Text style={[premiumText.caption, { color: colors.neutral[500], marginTop: spacing.xs }]}>
              How quickly you typically respond to new messages
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            premiumButtons.primary,
            { marginTop: spacing.lg },
            isLoading && { opacity: 0.7 }
          ]}
          onPress={handleUpdateProfile}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={premiumButtons.buttonTextPrimary}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.notificationHeader}>
        <Text style={[premiumText.headingLarge, { marginBottom: spacing.sm }]}>
          Notification Preferences
        </Text>
        <Text style={[premiumText.bodyMedium, { color: colors.neutral[500] }]}>
          Choose what notifications you'd like to receive
        </Text>
      </View>

      <View style={styles.notificationList}>
        {Object.entries(notificationSettings).map(([key, value]) => (
          <View key={key} style={styles.notificationItem}>
            <View style={{ flex: 1 }}>
              <Text style={[premiumText.bodySemibold, { marginBottom: spacing.xs }]}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Text>
              <Text style={[premiumText.bodySmall, { color: colors.neutral[500] }]}>
                {key === 'emailNotifications' && 'Receive notifications via email'}
                {key === 'pushNotifications' && 'Receive push notifications'}
                {key === 'assignmentUpdates' && 'Get notified about assignment progress'}
                {key === 'paymentReminders' && 'Reminders for upcoming payments'}
                {key === 'marketingEmails' && 'Receive updates about new features and offers'}
              </Text>
            </View>
            <Switch
              value={value}
              onValueChange={(newValue) => handleNotificationChange(key, newValue)}
              trackColor={{ false: colors.neutral[300], true: colors.primary[200] }}
              thumbColor={value ? colors.primary[500] : colors.neutral[400]}
              ios_backgroundColor={colors.neutral[300]}
            />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[premiumLayout.screen]}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={[premiumText.headingLarge, { color: colors.white, fontWeight: '700' }]}>
            Account Settings
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <View style={{ flex: 1 }}>
        {/* Success/Error Messages */}
        {success && (
          <View style={styles.successMessage}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success[600]} />
            <Text style={[premiumText.bodyMedium, { color: colors.success[700], marginLeft: spacing.sm }]}>
              {success}
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorMessage}>
            <Ionicons name="alert-circle" size={20} color={colors.error[600]} />
            <Text style={[premiumText.bodyMedium, { color: colors.error[700], marginLeft: spacing.sm }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map(renderTabButton)}
        </View>

        {/* Tab Content */}
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.tabContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'profile' ? renderProfileTab() : renderNotificationsTab()}
        </ScrollView>
      </View>

      {/* Response Time Modal */}
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
                <Ionicons name="close" size={24} color={colors.neutral[600]} />
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
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    formData.responseTime === option.value && styles.modalOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {formData.responseTime === option.value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary[500]} />
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.base,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success[50],
    padding: spacing.base,
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.success[200],
  },
  
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error[50],
    padding: spacing.base,
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    marginHorizontal: spacing.base,
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  
  activeTabButton: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  
  tabContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  avatarContainer: {
    position: 'relative',
  },
  
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral[200],
    borderWidth: 4,
    borderColor: colors.white,
    ...shadows.lg,
  },
  
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.md,
  },
  
  formSection: {
    flex: 1,
  },
  
  inputGroup: {
    marginBottom: spacing.lg,
  },
  
  inputLabel: {
    ...typography.fonts.bodySemibold,
    fontSize: typography.sizes.sm,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.neutral[800],
    ...shadows.sm,
  },
  
  disabledInput: {
    backgroundColor: colors.neutral[100],
    color: colors.neutral[500],
  },
  
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  notificationHeader: {
    marginBottom: spacing.xl,
  },
  
  notificationList: {
    flex: 1,
  },
  
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },

  // Specialties Styles
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },

  specialtyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },

  specialtyTagText: {
    fontSize: 12,
    color: colors.primary[700],
    fontWeight: '600',
    marginRight: spacing.xs,
  },

  removeSpecialtyButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary[200],
    justifyContent: 'center',
    alignItems: 'center',
  },

  addSpecialtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  addSpecialtyButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },

  suggestionsContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing.sm,
    maxHeight: 120,
    ...shadows.sm,
  },

  suggestionItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },

  suggestionText: {
    fontSize: 14,
    color: colors.neutral[700],
  },

  // Response Time Picker Styles
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },

  pickerLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.neutral[800],
  },

  pickerButton: {
    padding: spacing.xs,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalOptions: {
    flex: 1,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  modalOptionSelected: {
    backgroundColor: colors.primary[50],
  },
  modalOptionText: {
    fontSize: typography.sizes.base,
    color: colors.neutral[700],
  },
  modalOptionTextSelected: {
    color: colors.primary[600],
    fontWeight: '600',
  },
});

export default ProfileSettings;