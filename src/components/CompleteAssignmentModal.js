// ThinqScribe/src/components/CompleteAssignmentModal.js
import React from 'react';
import {
  View,
  Text,
  Modal,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CompleteAssignmentModal = ({
  visible,
  onClose,
  onConfirm,
  projectTitle = "this assignment",
  loading = false
}) => {

  const handleConfirm = () => {
    Alert.alert(
      'Complete Assignment',
      `Are you sure you want to mark "${projectTitle}" as completed? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'default',
          onPress: onConfirm
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <LinearGradient
            colors={['#059669', '#10b981']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Icon name="check-circle" size={32} color="white" />
              <Text style={styles.headerTitle}>Complete Assignment</Text>
            </View>
          </LinearGradient>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.questionText}>
              Are you sure you want to mark{' '}
              <Text style={styles.projectTitleText}>"{projectTitle}"</Text>
              {' '}as completed?
            </Text>

            {/* What happens next section */}
            <View style={styles.processCard}>
              <View style={styles.processHeader}>
                <Icon name="check-circle" size={20} color="#059669" />
                <Text style={styles.processTitle}>What happens next:</Text>
              </View>
              
              <View style={styles.processList}>
                <View style={styles.processItem}>
                  <Icon name="circle" size={6} color="#059669" style={styles.bulletPoint} />
                  <Text style={styles.processText}>Assignment will be marked as completed</Text>
                </View>
                
                <View style={styles.processItem}>
                  <Icon name="circle" size={6} color="#059669" style={styles.bulletPoint} />
                  <Text style={styles.processText}>Payment will be processed automatically</Text>
                </View>
                
                <View style={styles.processItem}>
                  <Icon name="circle" size={6} color="#059669" style={styles.bulletPoint} />
                  <Text style={styles.processText}>Student will be notified immediately</Text>
                </View>
                
                <View style={styles.processItem}>
                  <Icon name="circle" size={6} color="#059669" style={styles.bulletPoint} />
                  <Text style={styles.processText}>Project will move to completed section</Text>
                </View>
              </View>
            </View>

            {/* Warning note */}
            <View style={styles.warningCard}>
              <View style={styles.warningHeader}>
                <Icon name="alert" size={18} color="#f59e0b" />
                <Text style={styles.warningTitle}>Note:</Text>
              </View>
              <Text style={styles.warningText}>This action cannot be undone.</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.actionButtonText, { color: '#6b7280' }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton, loading && styles.disabledButton]}
              onPress={handleConfirm}
              disabled={loading}
            >
              <Icon name="check" size={18} color="white" />
              <Text style={[styles.actionButtonText, { color: 'white' }]}>
                {loading ? 'Completing...' : 'Yes, Complete Assignment'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  headerContent: {
    alignItems: 'center',
    gap: 12
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center'
  },
  content: {
    padding: 20
  },
  questionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20
  },
  projectTitleText: {
    fontWeight: '600',
    color: '#1f2937'
  },
  processCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0'
  },
  processHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8
  },
  processTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669'
  },
  processList: {
    gap: 8
  },
  processItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  bulletPoint: {
    marginTop: 6
  },
  processText: {
    fontSize: 14,
    color: '#059669',
    lineHeight: 20,
    flex: 1
  },
  warningCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fed7aa'
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d97706'
  },
  warningText: {
    fontSize: 14,
    color: '#d97706',
    marginTop: 4
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db'
  },
  confirmButton: {
    backgroundColor: '#059669'
  },
  disabledButton: {
    opacity: 0.6
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600'
  }
});

export default CompleteAssignmentModal;
