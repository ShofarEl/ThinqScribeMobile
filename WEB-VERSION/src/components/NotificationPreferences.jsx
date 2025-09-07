import React, { useState, useEffect } from 'react';
import notificationSoundManager from '../utils/NotificationSoundManager';
import browserNotificationManager from '../utils/BrowserNotificationManager';

const NotificationPreferences = () => {
  // State for notification settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);
  const [browserNotificationsSupported, setBrowserNotificationsSupported] = useState(true);
  const [browserPermissionStatus, setBrowserPermissionStatus] = useState('default');
  
  // Sound options
  const soundOptions = [
    { id: 'message', name: 'Message Pop', path: '/mixkit-message-pop-alert-2354.mp3' },
    { id: 'longPop', name: 'Long Pop', path: '/mixkit-long-pop-2358.wav' },
    { id: 'happyBells', name: 'Happy Bells', path: '/mixkit-happy-bells-notification-937.wav' },
    { id: 'ringtone', name: 'Ringtone', path: '/ringtone.mp3' },
  ];
  
  const [selectedSound, setSelectedSound] = useState(soundOptions[0].id);
  
  // Load saved preferences on mount
  useEffect(() => {
    // Load sound preferences
    const savedSoundEnabled = localStorage.getItem('notificationSoundEnabled');
    setSoundEnabled(savedSoundEnabled !== 'false');
    
    const savedVolume = localStorage.getItem('notificationVolume');
    if (savedVolume !== null) {
      setVolume(parseFloat(savedVolume));
    }
    
    const savedSoundUrl = localStorage.getItem('notificationSoundUrl');
    if (savedSoundUrl) {
      const matchingSound = soundOptions.find(option => option.path === savedSoundUrl);
      if (matchingSound) {
        setSelectedSound(matchingSound.id);
      }
    }
    
    // Check browser notification support and status
    setBrowserNotificationsSupported(browserNotificationManager.isSupported());
    setBrowserPermissionStatus(browserNotificationManager.getPermissionStatus());
    setBrowserNotificationsEnabled(browserNotificationManager.isPermissionGranted());
  }, []);
  
  // Handle sound toggle
  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('notificationSoundEnabled', newValue.toString());
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('notificationVolume', newVolume.toString());
  };
  
  // Handle sound selection
  const handleSoundChange = (e) => {
    const soundId = e.target.value;
    setSelectedSound(soundId);
    
    const selectedOption = soundOptions.find(option => option.id === soundId);
    if (selectedOption) {
      localStorage.setItem('notificationSoundUrl', selectedOption.path);
    }
  };
  
  // Play selected sound for preview
  const playSelectedSound = () => {
    notificationSoundManager.playSound(selectedSound);
  };
  
  // Request browser notification permission
  const requestNotificationPermission = async () => {
    const granted = await browserNotificationManager.requestPermission();
    setBrowserNotificationsEnabled(granted);
    setBrowserPermissionStatus(browserNotificationManager.getPermissionStatus());
  };
  
  return (
    <div className="notification-preferences p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
      
      {/* Sound notifications */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="font-medium">Sound Notifications</label>
          <div className="relative inline-block w-12 align-middle select-none">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={handleSoundToggle}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
              className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            ></label>
          </div>
        </div>
        
        {soundEnabled && (
          <>
            <div className="mb-3">
              <label className="block text-sm mb-1">Volume</label>
              <div className="flex items-center">
                <span className="mr-2 text-sm">🔈</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full"
                />
                <span className="ml-2 text-sm">🔊</span>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm mb-1">Notification Sound</label>
              <div className="flex items-center">
                <select
                  value={selectedSound}
                  onChange={handleSoundChange}
                  className="form-select block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {soundOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={playSelectedSound}
                  className="ml-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Play sound"
                >
                  ▶️
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Browser notifications */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="font-medium">Browser Notifications</label>
          {browserNotificationsSupported ? (
            browserPermissionStatus === 'granted' ? (
              <span className="text-sm text-green-500">Enabled</span>
            ) : browserPermissionStatus === 'denied' ? (
              <span className="text-sm text-red-500">Blocked in browser settings</span>
            ) : (
              <button
                onClick={requestNotificationPermission}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Enable
              </button>
            )
          ) : (
            <span className="text-sm text-gray-500">Not supported in this browser</span>
          )}
        </div>
        
        <p className="text-sm text-gray-500">
          Browser notifications will appear when you receive messages while the tab is not active.
        </p>
      </div>
      
      <div className="text-xs text-gray-500 mt-4">
        <p>
          Note: Some browsers may restrict notification sounds until you interact with the page.
        </p>
      </div>
    </div>
  );
};

export default NotificationPreferences;



