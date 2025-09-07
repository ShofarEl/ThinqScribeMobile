import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  Button,
  Typography,
  Spin,
  message as Msg,
  Image,
  Card,
  Space,
  Progress,
  Tooltip
} from 'antd';
import {
  DownloadOutlined,
  CloseOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SoundOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
  EyeOutlined,
  FullscreenOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const FileViewer = ({ 
  visible, 
  onClose, 
  fileUrl, 
  fileName, 
  fileType, 
  fileSize,
  content // caption/message content
}) => {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [imageRotation, setImageRotation] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setImageRotation(0);
      setImageScale(1);
      setVideoPlaying(false);
      setAudioPlaying(false);
      setAudioCurrentTime(0);
      setVideoCurrentTime(0);
    }
  }, [visible]);

  // Download file with progress
  const downloadFile = async () => {
    if (downloading) return;
    
    setDownloading(true);
    setDownloadProgress(0);
    
    try {
      const response = await fetch(fileUrl, { 
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentLength = response.headers.get('content-length');
      const total = parseInt(contentLength, 10);
      let loaded = 0;

      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (total) {
          const progress = Math.round((loaded / total) * 100);
          setDownloadProgress(progress);
        }
      }

      const blob = new Blob(chunks, { type: fileType || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      Msg.success('File downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      Msg.error('Download failed. Please try again.');
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  // Get file type category
  const getFileCategory = () => {
    if (!fileType) return 'unknown';
    
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('audio/')) return 'audio';
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'powerpoint';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return 'archive';
    if (fileType.includes('text')) return 'text';
    
    return 'unknown';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format time for audio/video
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Video controls
  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  // Audio controls
  const toggleAudioPlay = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  // Get file icon
  const getFileIcon = () => {
    const category = getFileCategory();
    const iconStyle = { fontSize: 48, color: '#667eea' };
    
    switch (category) {
      case 'pdf': return <FilePdfOutlined style={{ ...iconStyle, color: '#ef4444' }} />;
      case 'word': return <FileWordOutlined style={{ ...iconStyle, color: '#2563eb' }} />;
      case 'excel': return <FileExcelOutlined style={{ ...iconStyle, color: '#16a34a' }} />;
      case 'powerpoint': return <FilePptOutlined style={{ ...iconStyle, color: '#ea580c' }} />;
      case 'archive': return <FileZipOutlined style={{ ...iconStyle, color: '#7c3aed' }} />;
      case 'text': return <FileTextOutlined style={{ ...iconStyle, color: '#64748b' }} />;
      default: return <FileTextOutlined style={iconStyle} />;
    }
  };

  // Render file content based on type
  const renderFileContent = () => {
    const category = getFileCategory();
    
    switch (category) {
      case 'image':
        return (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            maxHeight: '80vh'
          }}>
            {/* Image Controls */}
            <div style={{ 
              marginBottom: '16px',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <Tooltip title="Rotate Left">
                <Button 
                  icon={<RotateLeftOutlined />} 
                  size="small"
                  onClick={() => setImageRotation(prev => prev - 90)}
                />
              </Tooltip>
              <Tooltip title="Rotate Right">
                <Button 
                  icon={<RotateRightOutlined />} 
                  size="small"
                  onClick={() => setImageRotation(prev => prev + 90)}
                />
              </Tooltip>
              <Tooltip title="Zoom In">
                <Button 
                  icon={<ZoomInOutlined />} 
                  size="small"
                  onClick={() => setImageScale(prev => Math.min(prev + 0.2, 3))}
                />
              </Tooltip>
              <Tooltip title="Zoom Out">
                <Button 
                  icon={<ZoomOutOutlined />} 
                  size="small"
                  onClick={() => setImageScale(prev => Math.max(prev - 0.2, 0.2))}
                />
              </Tooltip>
              <Tooltip title="Reset">
                <Button 
                  size="small"
                  onClick={() => {
                    setImageRotation(0);
                    setImageScale(1);
                  }}
                >
                  Reset
                </Button>
              </Tooltip>
            </div>
            
            {/* Image */}
            <div style={{ 
              maxHeight: 'calc(80vh - 120px)', 
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src={fileUrl}
                alt={fileName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  transform: `rotate(${imageRotation}deg) scale(${imageScale})`,
                  transition: 'transform 0.3s ease',
                  objectFit: 'contain'
                }}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  Msg.error('Failed to load image');
                }}
              />
            </div>
          </div>
        );
        
      case 'video':
        return (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}>
            <video
              ref={videoRef}
              src={fileUrl}
              controls
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: '8px'
              }}
              onLoadedMetadata={() => {
                setLoading(false);
                if (videoRef.current) {
                  setVideoDuration(videoRef.current.duration);
                }
              }}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setVideoCurrentTime(videoRef.current.currentTime);
                }
              }}
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              onError={() => {
                setLoading(false);
                Msg.error('Failed to load video');
              }}
            />
            
            {/* Video Info */}
            <div style={{ 
              marginTop: '16px', 
              textAlign: 'center',
              width: '100%',
              maxWidth: '400px'
            }}>
              <Text type="secondary">
                {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {formatFileSize(fileSize)}
              </Text>
            </div>
          </div>
        );
        
      case 'audio':
        return (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            padding: '40px 20px',
            minWidth: '300px'
          }}>
            {/* Audio Visualization */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              animation: audioPlaying ? 'pulse 2s infinite' : 'none'
            }}>
              <SoundOutlined style={{ fontSize: 48, color: 'white' }} />
            </div>
            
            {/* Audio Controls */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              marginBottom: '16px'
            }}>
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={audioPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={toggleAudioPlay}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              />
            </div>
            
            {/* Progress Bar */}
            <div style={{ width: '100%', marginBottom: '16px' }}>
              <Progress
                percent={audioDuration ? (audioCurrentTime / audioDuration) * 100 : 0}
                showInfo={false}
                strokeColor={{
                  '0%': '#667eea',
                  '100%': '#764ba2',
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '8px'
              }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {formatTime(audioCurrentTime)}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {formatTime(audioDuration)}
                </Text>
              </div>
            </div>
            
            {/* Hidden Audio Element */}
            <audio
              ref={audioRef}
              src={fileUrl}
              onLoadedMetadata={() => {
                setLoading(false);
                if (audioRef.current) {
                  setAudioDuration(audioRef.current.duration);
                }
              }}
              onTimeUpdate={() => {
                if (audioRef.current) {
                  setAudioCurrentTime(audioRef.current.currentTime);
                }
              }}
              onEnded={() => setAudioPlaying(false)}
              onError={() => {
                setLoading(false);
                Msg.error('Failed to load audio');
              }}
            />
            
            {/* Audio Info */}
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatFileSize(fileSize)}
            </Text>
          </div>
        );
        
      default:
        // Documents and other files
        return (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '24px' }}>
              {getFileIcon()}
            </div>
            
            <Title level={4} style={{ marginBottom: '8px', wordBreak: 'break-word' }}>
              {fileName}
            </Title>
            
            <Text type="secondary" style={{ marginBottom: '24px' }}>
              {formatFileSize(fileSize)} • {fileType}
            </Text>
            
            <Space>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => window.open(fileUrl, '_blank')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Open
              </Button>
              
              <Button
                icon={<DownloadOutlined />}
                onClick={downloadFile}
                loading={downloading}
              >
                Download
              </Button>
            </Space>
          </div>
        );
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90vw"
      style={{ maxWidth: '1200px' }}
      bodyStyle={{ 
        padding: 0, 
        background: '#000',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
      closable={false}
    >
      {/* Header */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ flex: 1 }}>
          <Text strong style={{ color: 'white', fontSize: '16px' }}>
            {fileName}
          </Text>
          {content && !content.startsWith('File: ') && (
            <div style={{ marginTop: '4px' }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                {content}
              </Text>
            </div>
          )}
        </div>
        
        <Space>
          {/* Download Progress */}
          {downloading && (
            <div style={{ marginRight: '16px' }}>
              <Progress
                type="circle"
                size={32}
                percent={downloadProgress}
                strokeColor={{
                  '0%': '#667eea',
                  '100%': '#764ba2',
                }}
                format={() => ''}
              />
            </div>
          )}
          
          {/* Download Button */}
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={downloadFile}
              loading={downloading}
              style={{ color: 'white' }}
            />
          </Tooltip>
          
          {/* Close Button */}
          <Tooltip title="Close">
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              style={{ color: 'white' }}
            />
          </Tooltip>
        </Space>
      </div>
      
      {/* Content */}
      <div style={{
        background: getFileCategory() === 'image' ? '#000' : '#fff',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        {loading ? (
          <Spin size="large" style={{ color: 'white' }} />
        ) : (
          renderFileContent()
        )}
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </Modal>
  );
};

export default FileViewer; 