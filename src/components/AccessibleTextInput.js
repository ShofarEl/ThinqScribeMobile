import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Text, HelperText, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * Accessible TextInput component designed for elderly users
 * Features:
 * - Larger font size
 * - Clear error messages
 * - Show/hide password functionality
 * - Optional icon support
 * - High contrast mode
 * - Clear button for easy text clearing
 */
const AccessibleTextInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  error,
  helperText,
  icon,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  maxLength,
  editable = true,
  onBlur,
  onFocus,
  returnKeyType,
  blurOnSubmit,
  onSubmitEditing,
  showClearButton = true,
  highContrast = false,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleClear = () => {
    onChangeText('');
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text 
          style={[
            styles.label, 
            { color: error ? theme.colors.error : theme.colors.text },
            highContrast && styles.highContrastLabel,
          ]}
        >
          {label}
        </Text>
      )}
      
      <View style={styles.inputContainer}>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          onSubmitEditing={onSubmitEditing}
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            multiline && styles.multilineInput,
            error && styles.inputError,
            highContrast && styles.highContrastInput,
            !editable && styles.disabledInput,
            inputStyle,
            { 
              borderColor: error 
                ? theme.colors.error 
                : isFocused 
                  ? theme.colors.primary 
                  : theme.colors.border,
            },
          ]}
          theme={{
            colors: {
              text: theme.colors.text,
              placeholder: theme.colors.textSecondary,
              primary: theme.colors.primary,
              error: theme.colors.error,
            },
          }}
          mode="outlined"
          outlineColor={error ? theme.colors.error : theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          error={!!error}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={togglePasswordVisibility}
            accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
          >
            <MaterialIcons
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        
        {showClearButton && value && value.length > 0 && !secureTextEntry && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleClear}
            accessibilityLabel="Clear text"
          >
            <MaterialIcons
              name="cancel"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <HelperText
          type={error ? "error" : "info"}
          visible={true}
          style={[
            styles.helperText,
            { color: error ? theme.colors.error : theme.colors.textSecondary },
            highContrast && styles.highContrastHelper,
          ]}
        >
          {error || helperText}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  highContrastLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  multilineInput: {
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  inputError: {
    borderWidth: 2,
  },
  highContrastInput: {
    fontSize: 18,
    borderWidth: 2,
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  iconContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  iconButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
    zIndex: 1,
  },
  helperText: {
    fontSize: 14,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  highContrastHelper: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AccessibleTextInput;
