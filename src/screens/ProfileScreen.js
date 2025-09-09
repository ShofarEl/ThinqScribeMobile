// ThinqScribe/src/screens/ProfileScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Avatar, Card } from 'react-native-paper';
import { useAuth } from '../context/MobileAuthContext';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            try {
              await signOut();
              router.replace('/signin');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }, 
          style: 'destructive' 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            {user?.avatar ? (
              <Avatar.Image 
                size={80} 
                source={{ uri: user.avatar }} 
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text 
                size={80} 
                label={user?.name?.charAt(0) || 'U'} 
                style={styles.avatar}
              />
            )}
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            <Text style={styles.userRole}>
              {user?.role === 'writer' ? 'Writer' : 'Student'}
            </Text>
          </Card.Content>
        </Card>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.option}
            onPress={() => router.push('/profile-settings')}
          >
            <Ionicons name="person-outline" size={24} color="#015382" />
            <Text style={styles.optionText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#015382" />
            <Text style={styles.optionText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={() => router.push('/payment-history')}
          >
            <Ionicons name="card-outline" size={24} color="#015382" />
            <Text style={styles.optionText}>Payment History</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={() => router.push('/support')}
          >
            <Ionicons name="help-circle-outline" size={24} color="#015382" />
            <Text style={styles.optionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={() => router.push('/about')}
          >
            <Ionicons name="information-circle-outline" size={24} color="#015382" />
            <Text style={styles.optionText}>About ThinqScribe</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={() => router.push('/terms')}
          >
            <Ionicons name="document-text-outline" size={24} color="#015382" />
            <Text style={styles.optionText}>Terms & Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text style={[styles.optionText, { color: '#ef4444' }]}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>ThinqScribe v1.0.0</Text>
        </View>
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
    padding: 16,
  },
  profileCard: {
    marginBottom: 24,
    elevation: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileContent: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    backgroundColor: '#015382',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  userRole: {
    fontSize: 14,
    color: '#015382',
    fontWeight: '500',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 3,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
    fontWeight: '500',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  appVersion: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default ProfileScreen;
