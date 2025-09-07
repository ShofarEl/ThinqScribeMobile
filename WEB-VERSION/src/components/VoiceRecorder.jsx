import React, { useState, useRef, useEffect } from 'react';
import { Button, message as Msg, Tooltip } from 'antd';
import {
  AudioOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SendOutlined,
  DeleteOutlined,
  StopOutlined
} from '@ant-design/icons';

const VoiceRecorder = ({ onRecordingComplete, onCancel, disabled = false, maxDurationSeconds = 180 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);

  // Format time helper
  const formatTime = (seconds) => {
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

  const pickMimeType = () => {
    // Prefer broadly playable formats first (m4a/mp4, then mp3),
    // fall back to webm/ogg for browsers that only support them
    const candidates = [
      'audio/mp4;codecs=mp4a.40.2',
      'audio/mp4',
      'audio/mpeg',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg'
    ];
    if (window.MediaRecorder && typeof MediaRecorder.isTypeSupported === 'function') {
      for (const t of candidates) {
        if (MediaRecorder.isTypeSupported(t)) return t;
      }
    }
    return '';
  };

  const getFileExtension = (mime) => {
    if (!mime) return 'webm';
    if (mime.includes('webm')) return 'webm';
    if (mime.includes('ogg')) return 'ogg';
    if (mime.includes('mp4')) return 'm4a';
    if (mime.includes('mpeg')) return 'mp3';
    return 'webm';
  };

  // Start recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        Msg.error('Your browser does not support audio recording.');
        return;
      }

      // iOS Safari is sensitive to constraints; start minimal
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (_) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true }
        });
      }
      
      streamRef.current = stream;
      const mimeType = pickMimeType();
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      } catch (err) {
        console.warn('MediaRecorder init failed with selected mimeType, retrying without type', err);
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const type = mediaRecorderRef.current?.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type });
        setAudioBlob(audioBlob);
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDurationSeconds) {
            stopRecording();
            return maxDurationSeconds;
          }
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      Msg.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setPlaybackTime(0);
    setAudioDuration(0);
    setIsPlaying(false);
    onCancel();
  };

  const sendRecording = () => {
    if (audioBlob && recordingTime > 0) {
      const mime = audioBlob.type || 'audio/webm';
      const ext = getFileExtension(mime);
      const audioFile = new File([audioBlob], `voice-note-${Date.now()}.${ext}`, { type: mime });
      // attach duration metadata for optimistic client use
      audioFile.duration = recordingTime;
      
      // Ensure recording time is a valid number
      const safeDuration = isFinite(recordingTime) && recordingTime > 0 ? recordingTime : 1;
      
      onRecordingComplete(audioFile, safeDuration);
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      setPlaybackTime(0);
      setAudioDuration(0);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setPlaybackTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setPlaybackTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (isRecording) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: '#fff3f3',
        border: '2px solid #ff4d4f',
        borderRadius: '24px',
        boxShadow: '0 4px 12px rgba(255, 77, 79, 0.2)'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#ff4d4f',
          borderRadius: '50%'
        }} />
        
        <AudioOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />
        
        <span style={{
          fontWeight: '600',
          color: '#ff4d4f',
          fontSize: '14px',
          minWidth: '60px'
        }}>
          {formatTime(recordingTime)}
        </span>
        
        <div style={{
          flex: 1,
          height: '4px',
          backgroundColor: '#ffe7e7',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
              height: '100%',
              backgroundColor: '#ff4d4f',
              width: `${(() => {
                if (!recordingTime || isNaN(recordingTime) || !isFinite(recordingTime)) return 0;
                const progress = (recordingTime / maxDurationSeconds) * 100;
                if (isNaN(progress) || !isFinite(progress)) return 0;
                return Math.max(0, Math.min(100, progress));
              })()}%`,
              transition: 'width 0.5s ease'
            }} />
        </div>
        
        <Tooltip title="Stop Recording">
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<StopOutlined />}
            onClick={stopRecording}
            size="large"
          />
        </Tooltip>
      </div>
    );
  }

  if (audioBlob && audioUrl) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: '#f6ffed',
        border: '2px solid #52c41a',
        borderRadius: '24px',
        boxShadow: '0 4px 12px rgba(82, 196, 26, 0.2)'
      }}>
        <Tooltip title={isPlaying ? "Pause" : "Play"}>
          <Button
            type="primary"
            shape="circle"
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={togglePlayback}
            style={{
              backgroundColor: '#52c41a',
              borderColor: '#52c41a'
            }}
          />
        </Tooltip>
        
        <div style={{ flex: 1 }}>
          <div style={{
            height: '4px',
            backgroundColor: '#d9f7be',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '4px'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: '#52c41a',
              width: `${(() => {
                if (!audioDuration || !isFinite(audioDuration) || audioDuration <= 0) return 0;
                if (!playbackTime || !isFinite(playbackTime)) return 0;
                
                const progress = (playbackTime / audioDuration) * 100;
                if (isNaN(progress) || !isFinite(progress)) return 0;
                
                return Math.max(0, Math.min(100, progress));
              })()}%`,
              transition: 'width 0.1s ease'
            }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#52c41a',
            fontWeight: '500'
          }}>
            <span>{formatTime(playbackTime)}</span>
            <span>{formatTime(recordingTime)}</span>
          </div>
        </div>
        
        <Tooltip title="Delete Recording">
          <Button
            type="text"
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={deleteRecording}
            style={{ color: '#ff4d4f' }}
          />
        </Tooltip>
        
        <Tooltip title="Send Voice Note">
          <Button
            type="primary"
            shape="circle"
            icon={<SendOutlined />}
            onClick={sendRecording}
            disabled={disabled}
            style={{
              backgroundColor: '#1890ff',
              borderColor: '#1890ff'
            }}
          />
        </Tooltip>
        
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
        />
      </div>
    );
  }

  return (
    <Tooltip title="Record Voice Note">
      <Button
        type="primary"
        shape="circle"
        icon={<AudioOutlined />}
        onClick={startRecording}
        disabled={disabled}
        size="large"
        style={{
          backgroundColor: '#1890ff',
          borderColor: '#1890ff',
          boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
        }}
      />
    </Tooltip>
  );
};

export default VoiceRecorder; 