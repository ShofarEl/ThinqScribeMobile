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

  // Download file with progress - Force download method
  const downloadFile = async () => {
    if (downloading) return;
    
    setDownloading(true);
    setDownloadProgress(0);
    
    try {
      setDownloadProgress(25);
      
      // For images and files that browsers try to display, force download
      if (fileType && fileType.startsWith('image/')) {
        // Force download for images by creating blob
        const response = await fetch(fileUrl, { mode: 'no-cors' });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'image-download';
        link.style.display = 'none';
        
        setDownloadProgress(75);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL
        window.URL.revokeObjectURL(url);
      } else {
        // For other files, use direct download
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName || 'download';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        setDownloadProgress(75);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Success feedback
      setTimeout(() => {
        setDownloadProgress(100);
        Msg.success('File downloaded successfully!');
        
        setTimeout(() => {
          setDownloadProgress(0);
        }, 1000);
      }, 300);
      
    } catch (error) {
      console.error('Download failed:', error);
      
      // Fallback method - direct link
      try {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Msg.success('Download started (fallback method)!');
      } catch (fallbackError) {
        Msg.error('Download failed. Please try right-click and "Save as".');
      }
    } finally {
      setTimeout(() => {
        setDownloading(false);
      }, 1000);
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
    if (!bytes || isNaN(bytes) || !isFinite(bytes) || bytes <= 0) {
      return 'Unknown size';
    }
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const safeBytes = Math.max(0, Number(bytes));
    
    if (safeBytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(safeBytes) / Math.log(1024));
    const sizeIndex = Math.min(i, sizes.length - 1);
    const size = safeBytes / Math.pow(1024, sizeIndex);
    
    // Ensure the calculated size is valid
    if (isNaN(size) || !isFinite(size)) return 'Unknown size';
    
    return Math.round(size * 100) / 100 + ' ' + sizes[sizeIndex];
  };

  // Format time for audio/video
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
              marginBottom: '24px',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <Tooltip title="Rotate Left">
                <Button 
                  icon={<RotateLeftOutlined />} 
                  size="middle"
                  onClick={() => setImageRotation(prev => prev - 90)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#015382',
                    fontWeight: '500'
                  }}
                />
              </Tooltip>
              <Tooltip title="Rotate Right">
                <Button 
                  icon={<RotateRightOutlined />} 
                  size="middle"
                  onClick={() => setImageRotation(prev => prev + 90)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#015382',
                    fontWeight: '500'
                  }}
                />
              </Tooltip>
              <Tooltip title="Zoom In">
                <Button 
                  icon={<ZoomInOutlined />} 
                  size="middle"
                  onClick={() => setImageScale(prev => Math.min(prev + 0.2, 3))}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#015382',
                    fontWeight: '500'
                  }}
                />
              </Tooltip>
              <Tooltip title="Zoom Out">
                <Button 
                  icon={<ZoomOutOutlined />} 
                  size="middle"
                  onClick={() => setImageScale(prev => Math.max(prev - 0.2, 0.2))}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#015382',
                    fontWeight: '500'
                  }}
                />
              </Tooltip>
              <Tooltip title="Reset">
                <Button 
                  size="middle"
                  onClick={() => {
                    setImageRotation(0);
                    setImageScale(1);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #015382 0%, #017DB0 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: '500'
                  }}
                >
                  Reset
                </Button>
              </Tooltip>
            </div>
            
            {/* Image */}
            <div style={{ 
              maxHeight: 'calc(75vh - 160px)', 
              maxWidth: '100%',
              overflow: imageScale > 1 ? 'auto' : 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              padding: '8px'
            }}>
              <img
                src={fileUrl}
                alt={fileName}
                style={{
                  maxWidth: imageScale > 1 ? 'none' : '100%',
                  maxHeight: imageScale > 1 ? 'none' : 'calc(75vh - 200px)',
                  width: imageScale > 1 ? `${imageScale * 100}%` : 'auto',
                  height: imageScale > 1 ? `${imageScale * 100}%` : 'auto',
                  transform: `rotate(${imageRotation}deg)`,
                  transition: 'transform 0.3s ease',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
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
                maxHeight: 'calc(70vh - 120px)',
                width: 'auto',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
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
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #015382 0%, #017DB0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px',
              animation: audioPlaying ? 'pulse 2s infinite' : 'none',
              boxShadow: '0 8px 32px rgba(1, 83, 130, 0.3)',
              border: '4px solid rgba(255, 255, 255, 0.2)'
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
                  background: 'linear-gradient(135deg, #015382 0%, #017DB0 100%)',
                  border: 'none',
                  width: '56px',
                  height: '56px',
                  fontSize: '24px',
                  boxShadow: '0 4px 16px rgba(1, 83, 130, 0.3)'
                }}
              />
            </div>
            
            {/* Progress Bar */}
            <div style={{ width: '100%', marginBottom: '16px' }}>
              <Progress
                percent={(() => {
                  if (!audioDuration || !isFinite(audioDuration) || audioDuration <= 0) return 0;
                  if (!audioCurrentTime || !isFinite(audioCurrentTime)) return 0;
                  
                  const progressPercent = (audioCurrentTime / audioDuration) * 100;
                  
                  if (isNaN(progressPercent) || !isFinite(progressPercent)) return 0;
                  
                  return Math.max(0, Math.min(100, progressPercent));
                })()}
                showInfo={false}
                strokeColor={{
                  '0%': '#015382',
                  '100%': '#017DB0',
                }}
                trailColor="rgba(255, 255, 255, 0.2)"
                strokeWidth={6}
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
            
            <Space size="large">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => window.open(fileUrl, '_blank')}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #015382 0%, #017DB0 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  boxShadow: '0 4px 16px rgba(1, 83, 130, 0.3)'
                }}
              >
                Open File
              </Button>
              
              <Button
                icon={<DownloadOutlined />}
                onClick={downloadFile}
                loading={downloading}
                size="large"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#015382',
                  fontWeight: '500'
                }}
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
      style={{ 
        maxWidth: '1000px',
        top: '8px'
      }}
      bodyStyle={{ 
        padding: 0, 
        background: 'linear-gradient(135deg, #015382 0%, #017DB0 100%)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
      closable={false}
    >
      {/* Header */}
      <div style={{
        background: 'rgba(1, 83, 130, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
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
                size={36}
                percent={downloadProgress}
                strokeColor={{
                  '0%': '#015382',
                  '100%': '#017DB0',
                }}
                trailColor="rgba(255, 255, 255, 0.3)"
                strokeWidth={6}
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
        background: getFileCategory() === 'image' 
          ? 'linear-gradient(135deg, #0b1220 0%, #132238 100%)' 
          : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        minHeight: '320px',
        maxHeight: 'calc(82vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'auto'
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