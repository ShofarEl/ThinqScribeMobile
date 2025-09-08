// SimpleCalendarPicker.js
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const SimpleCalendarPicker = ({
  value,
  onDateChange,
  placeholder = "Select Date",
  minimumDate,
  maximumDate,
  disabled = false,
  size = "normal", // "normal" or "small"
  style
}) => {

  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value ? new Date(value) : new Date());

  // Update tempDate when value prop changes
  useEffect(() => {
    if (value) {
      setTempDate(new Date(value));
    }
  }, [value]);

  // Format date for display (long format)
  const formatDateTime = (date) => {
    if (!date) return placeholder;
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return placeholder;

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const day = d.getDate().toString().padStart(2, '0');
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${month} ${day}, ${year} at ${hours}:${minutes}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return placeholder;
    }
  };

  // Format date for display (short format for small size)
  const formatDate = (date) => {
    if (!date) return placeholder;
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return placeholder;

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const day = d.getDate().toString().padStart(2, '0');
      return `${month} ${day}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return placeholder;
    }
  };

  // Handle date picker change
  const handleDateChange = (event, selectedDate) => {
    try {
      if (selectedDate) {
        const selected = new Date(selectedDate);

        // Validate the selected date
        if (isNaN(selected.getTime())) {
          Alert.alert('Error', 'Invalid date selected');
          setShowPicker(false);
          return;
        }

        // Check minimum date
        if (minimumDate) {
          const minDate = new Date(minimumDate);
          // Set minimum date to start of day to allow today's date
          minDate.setHours(0, 0, 0, 0);
          const selectedStartOfDay = new Date(selected);
          selectedStartOfDay.setHours(0, 0, 0, 0);

          if (selectedStartOfDay < minDate) {
            Alert.alert('Error', 'Date cannot be before minimum date');
            setShowPicker(false);
            return;
          }
        }

        // Check maximum date
        if (maximumDate) {
          const maxDate = new Date(maximumDate);
          if (selected > maxDate) {
            Alert.alert('Error', 'Date cannot be after maximum date');
            setShowPicker(false);
            return;
          }
        }

        // Update temp date for real-time preview
        setTempDate(selected);

        // For iOS, just update temp date - user confirms with "Done" button
        if (Platform.OS === 'ios') {
          // Date will be confirmed when user taps "Done"
          setTempDate(selected);
        }
        // For Android, only update when user confirms (event.type === 'set')
        else if (event && event.type === 'set') {
          onDateChange(selected);
          setShowPicker(false);
        }
      } else {
        // User cancelled (Android back button or iOS cancel)
        setShowPicker(false);
      }
    } catch (error) {
      console.error('Date picker error:', error);
      Alert.alert('Error', 'Failed to select date');
      setShowPicker(false);
    }
  };

  // Show date picker
  const showDatePicker = () => {
    if (disabled) return;

    try {
      const initialDate = value ? new Date(value) : new Date();
      setTempDate(initialDate);
      setShowPicker(true);
    } catch (error) {
      console.error('Error showing date picker:', error);
    }
  };


  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          size === "small" ? styles.smallDateButton : styles.dateButton,
          disabled && styles.disabledButton
        ]}
        onPress={showDatePicker}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Icon
          name="calendar"
          size={size === "small" ? 16 : 20}
          color={disabled ? "#9ca3af" : "#3b82f6"}
        />
        <Text style={[
          size === "small" ? styles.smallDateText : styles.dateText,
          disabled && styles.disabledText
        ]}>
          {size === "small" ? formatDate(value) : formatDateTime(value)}
        </Text>
        <Icon
          name="chevron-down"
          size={size === "small" ? 14 : 16}
          color={disabled ? "#9ca3af" : "#6b7280"}
        />
      </TouchableOpacity>

      {/* iOS Date Picker */}
      {showPicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.iosModalOverlay}>
            <View style={styles.iosModalContent}>
              <View style={styles.iosModalHeader}>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  style={styles.iosCancelButton}
                >
                  <Text style={styles.iosCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    onDateChange(tempDate);
                    setShowPicker(false);
                  }}
                  style={styles.iosDoneButton}
                >
                  <Text style={styles.iosDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={{paddingHorizontal: 20, paddingVertical: 10}}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={minimumDate ? (() => {
                    const minDate = new Date(minimumDate);
                    minDate.setHours(0, 0, 0, 0);
                    return minDate;
                  })() : undefined}
                  maximumDate={maximumDate}
                  style={[styles.iosPicker, {backgroundColor: '#f8f9fa'}]}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Android Date Picker Modal */}
      {showPicker && Platform.OS === 'android' && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={tempDate}
                mode="date"
                display="calendar"
                onChange={handleDateChange}
                minimumDate={minimumDate ? (() => {
                  const minDate = new Date(minimumDate);
                  minDate.setHours(0, 0, 0, 0);
                  return minDate;
                })() : undefined}
                maximumDate={maximumDate}
                style={styles.picker}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowPicker(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    setShowPicker(false);
                    onDateChange(tempDate);
                  }}
                >
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  smallDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  smallDateText: {
    flex: 1,
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '500',
  },
  disabledText: {
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Made more visible for debugging
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff', // Explicit white background
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  picker: {
    alignSelf: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  confirmText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  iosModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Made more visible for debugging
    justifyContent: 'flex-end',
  },
  iosModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
    minHeight: 350, // Ensure enough height for the picker
    maxHeight: '70%', // Don't take up too much screen space
  },
  iosModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  iosCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  iosDoneButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  iosCancelText: {
    fontSize: 17,
    color: '#ef4444',
    fontWeight: '600',
  },
  iosDoneText: {
    fontSize: 17,
    color: '#3b82f6',
    fontWeight: '600',
  },
  iosPicker: {
    height: 250,
    width: '100%',
  },
});

export default SimpleCalendarPicker;
