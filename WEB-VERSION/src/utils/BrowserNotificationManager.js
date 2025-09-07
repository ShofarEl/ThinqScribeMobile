/**
 * BrowserNotificationManager.js
 * 
 * Utility to manage browser notifications using the Web Notifications API.
 * Handles permission requests, notification creation, and click events.
 */

import pageVisibilityTracker from './PageVisibilityTracker';

class BrowserNotificationManager {
  constructor() {
    // Track if we've already asked for permission
    this.hasRequestedPermission = false;
    
    // Store notification permission status
    this.permissionStatus = this.getPermissionStatus();
    
    // Default notification options
    this.defaultOptions = {
      icon: '/App-Icon-Dark.png', // Default app icon
      badge: '/App-Icon-Light.png',
      silent: true, // We'll handle sound ourselves
      requireInteraction: false // Auto-close after a while
    };
    
    // Track active notifications
    this.activeNotifications = {};
  }

  /**
   * Get current notification permission status
   * @returns {string} - 'granted', 'denied', or 'default'
   */
  getPermissionStatus() {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  /**
   * Check if notifications are supported in this browser
   * @returns {boolean} - Whether notifications are supported
   */
  isSupported() {
    return 'Notification' in window;
  }

  /**
   * Check if notifications are currently permitted
   * @returns {boolean} - Whether notifications are permitted
   */
  isPermissionGranted() {
    return this.getPermissionStatus() === 'granted';
  }

  /**
   * Request permission to show notifications
   * @returns {Promise<boolean>} - Whether permission was granted
   */
  async requestPermission() {
    if (!this.isSupported()) {
      console.warn('🔔 [BrowserNotifications] Notifications not supported in this browser');
      return false;
    }
    
    // Don't ask again if already denied
    if (Notification.permission === 'denied') {
      console.warn('🔔 [BrowserNotifications] Permission previously denied');
      return false;
    }
    
    // Don't ask again if already granted
    if (Notification.permission === 'granted') {
      return true;
    }
    
    // Mark that we've asked
    this.hasRequestedPermission = true;
    
    try {
      const permission = await Notification.requestPermission();
      this.permissionStatus = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('🔔 [BrowserNotifications] Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Show a browser notification if conditions are met
   * @param {Object} options - Notification options
   * @param {string} options.title - Notification title
   * @param {string} options.body - Notification body text
   * @param {string} options.tag - Unique tag to prevent duplicate notifications
   * @param {string} options.icon - Icon URL
   * @param {Function} options.onClick - Function to call when notification is clicked
   * @returns {Promise<Notification|null>} - The notification object or null
   */
  async showNotification({ title, body, tag, icon, onClick }) {
    // Only show notifications when page is not visible
    if (pageVisibilityTracker.isPageVisible()) {
      return null;
    }
    
    // Ensure we have permission
    if (!this.isPermissionGranted()) {
      const granted = await this.requestPermission();
      if (!granted) return null;
    }
    
    try {
      // Merge with default options
      const options = {
        ...this.defaultOptions,
        body,
        tag,
        icon: icon || this.defaultOptions.icon
      };
      
      // Create the notification
      const notification = new Notification(title, options);
      
      // Store active notification
      if (tag) {
        this.activeNotifications[tag] = notification;
      }
      
      // Handle click event
      notification.onclick = (event) => {
        event.preventDefault();
        
        // Focus the window
        if (window.parent) {
          window.parent.focus();
        }
        window.focus();
        
        // Call custom click handler if provided
        if (typeof onClick === 'function') {
          onClick(notification);
        }
        
        // Close the notification
        notification.close();
      };
      
      // Clean up when closed
      notification.onclose = () => {
        if (tag) {
          delete this.activeNotifications[tag];
        }
      };
      
      return notification;
    } catch (error) {
      console.error('🔔 [BrowserNotifications] Error showing notification:', error);
      return null;
    }
  }

  /**
   * Show a message notification
   * @param {Object} message - Message data
   * @param {string} senderName - Name of the sender
   * @param {string} chatId - ID of the chat
   * @returns {Promise<Notification|null>} - The notification object or null
   */
  async showMessageNotification(message, senderName, chatId) {
    const title = senderName ? `New message from ${senderName}` : 'New message';
    
    // Format message preview based on content type
    let body = 'You have a new message';
    if (message) {
      if (message.fileUrl) {
        body = message.content ? `${message.content} [attachment]` : 'Sent an attachment';
      } else if (message.content) {
        // Limit preview length
        body = message.content.length > 100 
          ? `${message.content.substring(0, 97)}...` 
          : message.content;
      }
    }
    
    return this.showNotification({
      title,
      body,
      tag: `chat-${chatId}`,
      onClick: () => {
        // Navigate to the chat when clicked
        const userType = localStorage.getItem('userType') || 'student';
        window.location.href = `/chat/${userType}/${chatId}`;
      }
    });
  }

  /**
   * Close a specific notification by tag
   * @param {string} tag - Tag of the notification to close
   */
  closeNotification(tag) {
    if (this.activeNotifications[tag]) {
      this.activeNotifications[tag].close();
      delete this.activeNotifications[tag];
    }
  }

  /**
   * Close all active notifications
   */
  closeAllNotifications() {
    Object.values(this.activeNotifications).forEach(notification => {
      notification.close();
    });
    this.activeNotifications = {};
  }
}

// Create singleton instance
const browserNotificationManager = new BrowserNotificationManager();

export default browserNotificationManager;



