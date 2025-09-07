/**
 * NotificationSettingsManager.js
 * 
 * Utility to manage user notification preferences and settings.
 * Provides a centralized way to access and update notification settings.
 */

// Storage keys
const STORAGE_KEYS = {
  SOUND_ENABLED: 'notificationSoundEnabled',
  SOUND_VOLUME: 'notificationVolume',
  SOUND_URL: 'notificationSoundUrl',
  BROWSER_NOTIFICATIONS_ENABLED: 'browserNotificationsEnabled',
  NOTIFICATION_SETTINGS: 'notificationSettings'
};

// Default settings
const DEFAULT_SETTINGS = {
  sound: {
    enabled: true,
    volume: 0.7,
    soundId: 'message'
  },
  browser: {
    enabled: true
  },
  types: {
    message: {
      sound: true,
      browser: true,
      inApp: true
    },
    agreement: {
      sound: true,
      browser: true,
      inApp: true
    },
    payment: {
      sound: true,
      browser: true,
      inApp: true
    }
  }
};

class NotificationSettingsManager {
  constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * Load settings from localStorage
   * @returns {Object} - The loaded settings
   */
  loadSettings() {
    try {
      // Try to load comprehensive settings object
      const settingsStr = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      if (settingsStr) {
        return JSON.parse(settingsStr);
      }

      // Fall back to individual settings for backward compatibility
      const settings = { ...DEFAULT_SETTINGS };
      
      // Sound settings
      const soundEnabled = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
      if (soundEnabled !== null) {
        settings.sound.enabled = soundEnabled !== 'false';
      }
      
      const volume = localStorage.getItem(STORAGE_KEYS.SOUND_VOLUME);
      if (volume !== null) {
        settings.sound.volume = parseFloat(volume);
      }
      
      const soundUrl = localStorage.getItem(STORAGE_KEYS.SOUND_URL);
      if (soundUrl) {
        // Map URL back to sound ID if possible
        if (soundUrl.includes('message-pop')) {
          settings.sound.soundId = 'message';
        } else if (soundUrl.includes('long-pop')) {
          settings.sound.soundId = 'longPop';
        } else if (soundUrl.includes('happy-bells')) {
          settings.sound.soundId = 'happyBells';
        } else if (soundUrl.includes('ringtone')) {
          settings.sound.soundId = 'ringtone';
        }
      }
      
      return settings;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      // Save comprehensive settings object
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_SETTINGS, 
        JSON.stringify(this.settings)
      );
      
      // Also save individual settings for backward compatibility
      localStorage.setItem(
        STORAGE_KEYS.SOUND_ENABLED, 
        this.settings.sound.enabled.toString()
      );
      
      localStorage.setItem(
        STORAGE_KEYS.SOUND_VOLUME, 
        this.settings.sound.volume.toString()
      );
      
      // Map sound ID to URL
      const soundMap = {
        message: '/mixkit-message-pop-alert-2354.mp3',
        longPop: '/mixkit-long-pop-2358.wav',
        happyBells: '/mixkit-happy-bells-notification-937.wav',
        ringtone: '/ringtone.mp3'
      };
      
      localStorage.setItem(
        STORAGE_KEYS.SOUND_URL, 
        soundMap[this.settings.sound.soundId] || soundMap.message
      );
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  /**
   * Get all notification settings
   * @returns {Object} - All notification settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Update notification settings
   * @param {Object} newSettings - New settings to apply
   */
  updateSettings(newSettings) {
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    this.saveSettings();
  }

  /**
   * Check if sounds are enabled
   * @returns {boolean} - Whether sounds are enabled
   */
  isSoundEnabled() {
    return this.settings.sound.enabled;
  }

  /**
   * Set whether sounds are enabled
   * @param {boolean} enabled - Whether sounds should be enabled
   */
  setSoundEnabled(enabled) {
    this.settings.sound.enabled = enabled;
    this.saveSettings();
  }

  /**
   * Get the current volume
   * @returns {number} - Volume between 0 and 1
   */
  getVolume() {
    return this.settings.sound.volume;
  }

  /**
   * Set the volume
   * @param {number} volume - Volume between 0 and 1
   */
  setVolume(volume) {
    this.settings.sound.volume = Math.min(1, Math.max(0, volume));
    this.saveSettings();
  }

  /**
   * Get the current sound ID
   * @returns {string} - Sound ID
   */
  getSoundId() {
    return this.settings.sound.soundId;
  }

  /**
   * Set the sound ID
   * @param {string} soundId - Sound ID
   */
  setSoundId(soundId) {
    this.settings.sound.soundId = soundId;
    this.saveSettings();
  }

  /**
   * Check if notifications are enabled for a specific type
   * @param {string} type - Notification type (message, agreement, payment)
   * @param {string} channel - Notification channel (sound, browser, inApp)
   * @returns {boolean} - Whether notifications are enabled for this type and channel
   */
  isEnabledForType(type, channel) {
    if (!this.settings.types[type]) {
      return true; // Default to enabled for unknown types
    }
    
    if (!this.settings.types[type][channel]) {
      return true; // Default to enabled for unknown channels
    }
    
    return this.settings.types[type][channel];
  }

  /**
   * Set whether notifications are enabled for a specific type
   * @param {string} type - Notification type (message, agreement, payment)
   * @param {string} channel - Notification channel (sound, browser, inApp)
   * @param {boolean} enabled - Whether notifications should be enabled
   */
  setEnabledForType(type, channel, enabled) {
    if (!this.settings.types[type]) {
      this.settings.types[type] = {};
    }
    
    this.settings.types[type][channel] = enabled;
    this.saveSettings();
  }
}

// Create singleton instance
const notificationSettingsManager = new NotificationSettingsManager();

export default notificationSettingsManager;



