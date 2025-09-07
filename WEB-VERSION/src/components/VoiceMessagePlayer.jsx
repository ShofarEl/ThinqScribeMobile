import React, { useState, useRef, useEffect } from 'react';
import { Button, Typography } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, AudioOutlined } from '@ant-design/icons';

const { Text } = Typography;

const VoiceMessagePlayer = ({ message, isCurrentUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(() => {
    const msgDuration = message.voiceDuration;
    return (msgDuration && isFinite(msgDuration) && msgDuration > 0) ? msgDuration : 0;
  });
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(message.fileUrl);
      
      const audio = audioRef.current;
      
      audio.addEventListener('loadedmetadata', () => {
        const audioDuration = audio.duration || 0;
        // Ensure duration is a valid positive number
        if (isFinite(audioDuration) && audioDuration > 0) {
          setDuration(audioDuration);
        } else {
          // Fallback to message duration or 0
          setDuration(message.voiceDuration || 0);
        }
      });
      
      audio.addEventListener('timeupdate', () => {
        const currentTime = audio.currentTime || 0;
        const duration = audio.duration || 0;
        
        setCurrentTime(currentTime);
        
        // Calculate progress safely to avoid NaN
        let progressPercent = 0;
        if (duration > 0 && isFinite(duration) && isFinite(currentTime)) {
          progressPercent = Math.max(0, Math.min(100, (currentTime / duration) * 100));
        }
        
        // Ensure progress is a valid number
        if (isNaN(progressPercent) || !isFinite(progressPercent)) {
          progressPercent = 0;
        }
        
        setProgress(progressPercent);
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Voice message audio error:', e);
        setIsPlaying(false);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadedmetadata', () => {});
        audioRef.current.removeEventListener('timeupdate', () => {});
        audioRef.current.removeEventListener('ended', () => {});
        audioRef.current.removeEventListener('error', () => {});
        // Don't set to null here to avoid memory leaks
      }
    };
  }, [message.fileUrl]);

  const togglePlayPause = async () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Pause any other playing audio first
        const allAudioElements = document.querySelectorAll('audio');
        allAudioElements.forEach(audio => {
          if (audio !== audioRef.current && !audio.paused) {
            audio.pause();
          }
        });
        
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing voice message:', error);
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds) => {
    // Handle all edge cases that can cause NaN
    if (!seconds || isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
      return '0:00';
    }
    
    const safeSeconds = Math.max(0, Math.floor(Number(seconds)));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    
    // Ensure mins and secs are valid numbers
    if (isNaN(mins) || isNaN(secs)) return '0:00';
    
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-message" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      background: isCurrentUser ? 'rgba(255,255,255,0.1)' : '#f0f8ff',
      borderRadius: '16px',
      minWidth: '200px',
      maxWidth: '300px',
      border: isPlaying ? `2px solid ${isCurrentUser ? 'rgba(255,255,255,0.5)' : '#1890ff'}` : 'none'
    }}>
      <Button
        type="text"
        shape="circle"
        icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        onClick={togglePlayPause}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: isCurrentUser ? 'rgba(255,255,255,0.2)' : '#1890ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          color: 'white',
          fontSize: '20px'
        }}
      />
      
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px'
        }}>
          <AudioOutlined style={{ 
            fontSize: '14px', 
            color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#1890ff'
          }} />
          <Text style={{ 
            fontSize: '12px', 
            color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#666'
          }}>
            Voice Message
          </Text>
        </div>
        
        {/* Progress bar */}
        <div style={{
          height: '3px',
          background: isCurrentUser ? 'rgba(255,255,255,0.3)' : '#e6f7ff',
          borderRadius: '2px',
          marginBottom: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#1890ff',
            width: `${progress}%`,
            borderRadius: '2px',
            transition: 'width 0.1s ease'
          }} />
        </div>
        
        {/* Time display */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text style={{ 
            fontSize: '11px', 
            color: isCurrentUser ? 'rgba(255,255,255,0.7)' : '#999'
          }}>
            {formatTime(currentTime)}
          </Text>
          <Text style={{ 
            fontSize: '11px', 
            color: isCurrentUser ? 'rgba(255,255,255,0.7)' : '#999'
          }}>
            {formatTime(duration)}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default VoiceMessagePlayer; 