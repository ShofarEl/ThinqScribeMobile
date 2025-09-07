import React from 'react';
import { List, Typography, Divider } from 'antd';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const Notifications = () => {
  const { notifications, markNotificationAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (notif) => {
    if (!notif.read) {
      markNotificationAsRead(notif._id);
    }
    navigate(notif.link);
  };

  return (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <Text
          type="secondary"
          onClick={markAllAsRead}
          className="mark-all-read"
        >
          Mark all as read
        </Text>
      </div>
      <Divider className="notifications-divider" />
      <List
        itemLayout="vertical"
        dataSource={notifications}
        locale={{ emptyText: 'No notifications' }}
        renderItem={(notif) => (
          <List.Item
            onClick={() => handleClick(notif)}
            className={`notification-item ${notif.read ? 'read' : 'unread'}`}
          >
            <List.Item.Meta
              title={
                <Text strong={!notif.read} className="notification-title">
                  {notif.title}
                </Text>
              }
              description={
                <Text type="secondary" className="notification-content">
                  {notif.content}
                </Text>
              }
            />
            <div className="notification-time">
              {new Date(notif.createdAt).toLocaleString()}
            </div>
          </List.Item>
        )}
      />
      <style jsx>{`
        .notifications-dropdown {
          width: 350px;
          max-height: 500px;
          overflow-y: auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #eaeaea;
        }
        .notifications-header {
          text-align: right;
          padding: 12px 20px;
          background: linear-gradient(90deg, #f8f9fa, #ffffff);
          border-radius: 12px 12px 0 0;
        }
        .mark-all-read {
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 13px;
          font-weight: 500;
        }
        .mark-all-read:hover {
          color: #1890ff;
          text-decoration: underline;
        }
        .notifications-divider {
          margin: 0;
          background-color: #f0f0f0;
        }
        .notification-item {
          padding: 16px 20px;
          transition: all 0.2s ease;
          border-bottom: 1px solid #f5f5f5;
        }
        .notification-item:hover {
          background-color: #f9f9f9 !important;
        }
        .notification-item.unread {
          background-color: rgba(24, 144, 255, 0.05);
        }
        .notification-title {
          font-size: 14px;
          margin-bottom: 4px;
        }
        .notification-content {
          font-size: 13px;
          line-height: 1.4;
        }
        .notification-time {
          font-size: 11px;
          color: #888;
          margin-top: 6px;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
};

export default Notifications;