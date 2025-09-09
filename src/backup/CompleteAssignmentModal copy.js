// ThinqScribe/src/components/CompleteAssignmentModal.js
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Card } from 'react-native-paper';

const { width } = Dimensions.get('window');

const CompleteAssignmentModal = ({
  visible,
  onClose,
  onConfirm,
  projectTitle = "this assignment",
  loading = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error completing assignment:', error);
    } finally {
      setIsProcessing(false);
    }
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
            colors={['#015382', '#017DB0']}
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
            <Card style={styles.processCard} elevation={1}>
              <Card.Content>
                <View style={styles.processHeader}>
                  <Icon name="check-circle" size={20} color="#015382" />
                  <Text style={styles.processTitle}>What happens next:</Text>
                </View>
                
                <View style={styles.processList}>
                  <View style={styles.processItem}>
                    <Icon name="check" size={16} color="#015382" style={styles.bulletPoint} />
                    <Text style={styles.processText}>Assignment will be marked as completed</Text>
                  </View>
                  
                  <View style={styles.processItem}>
                    <Icon name="check" size={16} color="#015382" style={styles.bulletPoint} />
                    <Text style={styles.processText}>Payment will be processed automatically</Text>
                  </View>
                  
                  <View style={styles.processItem}>
                    <Icon name="check" size={16} color="#015382" style={styles.bulletPoint} />
                    <Text style={styles.processText}>Student will be notified immediately</Text>
                  </View>
                  
                  <View style={styles.processItem}>
                    <Icon name="check" size={16} color="#015382" style={styles.bulletPoint} />
                    <Text style={styles.processText}>Project will move to completed section</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Warning note */}
            <Card style={styles.warningCard} elevation={1}>
              <Card.Content>
                <View style={styles.warningHeader}>
                  <Icon name="lightning-bolt" size={18} color="#f59e0b" />
                  <Text style={styles.warningTitle}>Note:</Text>
                </View>
                <Text style={styles.warningText}>This action cannot be undone.</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onClose}
              disabled={loading || isProcessing}
            >
              <Text style={[styles.actionButtonText, { color: '#6b7280' }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton, (loading || isProcessing) && styles.disabledButton]}
              onPress={handleConfirm}
              disabled={loading || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon name="check" size={18} color="white" />
              )}
              <Text style={[styles.actionButtonText, { color: 'white' }]}>
                {isProcessing ? 'Completing...' : 'Yes, Complete Assignment'}
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
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4
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
    padding: 24
  },
  questionText: {
    fontSize: 17,
    color: '#374151',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500'
  },
  projectTitleText: {
    fontWeight: '600',
    color: '#1f2937'
  },
  processCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
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
    color: '#015382'
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
    color: '#015382',
    lineHeight: 20,
    flex: 1
  },
  warningCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
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
    backgroundColor: '#015382'
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
