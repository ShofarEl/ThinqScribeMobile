import client from './client';

// Get all notifications for the current user
export const getNotifications = async () => {
  try {
    const response = await client.get('/notifications');
    return response; // Returns { notifications, unreadCount }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark a specific notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }
    
    const response = await client.put(`/notifications/${notificationId}/read`);
    return response; // Returns { notification, unreadCount }
  } catch (error) {
    console.error('Error marking notification read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await client.put('/notifications/read-all');
    return response; // Returns { success, modifiedCount }
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    throw error;
  }
};

// Delete a specific notification
export const deleteNotification = async (notificationId) => {
  try {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }
    
    const response = await client.delete(`/notifications/${notificationId}`);
    return response; // Returns { success, unreadCount }
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Get unread notifications count
export const getUnreadCount = async () => {
  try {
    const response = await client.get('/notifications/unread-count');
    return response; // Returns { unreadCount }
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};
