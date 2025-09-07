import React, { useState } from 'react';
import { Upload, Button, message as Msg } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const VideoUploadTest = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (file) => {
    console.log('🎥 VIDEO UPLOAD TEST - File selected:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      extension: file.name.split('.').pop().toLowerCase(),
      lastModified: file.lastModified,
      webkitRelativePath: file.webkitRelativePath
    });

    // Check if browser recognizes it as video
    const isRecognizedAsVideo = file.type.startsWith('video/');
    const extension = file.name.split('.').pop().toLowerCase();
    const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm', '3gp', 'flv', 'm4v'];
    const isVideoExtension = videoExtensions.includes(extension);

    console.log('🎥 VIDEO ANALYSIS:', {
      isRecognizedAsVideo,
      isVideoExtension,
      shouldBeAccepted: isRecognizedAsVideo || isVideoExtension
    });

    if (isRecognizedAsVideo || isVideoExtension) {
      setSelectedFiles(prev => [...prev, {
        name: file.name,
        type: file.type,
        size: file.size,
        extension
      }]);
      Msg.success(`Video file detected: ${file.name}`);
    } else {
      Msg.error(`Not recognized as video: ${file.name} (${file.type})`);
    }

    // Return false to prevent automatic upload
    return false;
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px dashed #d9d9d9', 
      borderRadius: '8px',
      margin: '20px',
      backgroundColor: '#fafafa'
    }}>
      <h3 style={{ color: '#1890ff' }}>🎥 Video Upload Debug Test</h3>
      <p>Use this component to test video file selection and see what's happening in the console.</p>
      
      <Upload
        accept="video/*,.mp4,.mov,.avi,.wmv,.mkv,.webm,.3gp"
        beforeUpload={handleFileSelect}
        showUploadList={false}
        multiple={true}
      >
        <Button icon={<UploadOutlined />} size="large">
          🎥 Select Video Files (Check Console)
        </Button>
      </Upload>

      <div style={{ marginTop: '20px' }}>
        <h4>Selected Files ({selectedFiles.length}):</h4>
        {selectedFiles.length > 0 ? (
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index} style={{ margin: '5px 0' }}>
                <strong>{file.name}</strong> - {file.type || 'Unknown MIME'} - {(file.size / 1024 / 1024).toFixed(2)}MB
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#999' }}>No files selected yet</p>
        )}
        
        {selectedFiles.length > 0 && (
          <Button onClick={clearFiles} style={{ marginTop: '10px' }}>
            Clear Files
          </Button>
        )}
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: '#e6f7ff',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <strong>Debug Instructions:</strong>
        <br />
        1. Try selecting a video file using the button above
        <br />
        2. Open your browser's Developer Tools (F12) and check the Console tab
        <br />
        3. Look for messages starting with "🎥 VIDEO UPLOAD TEST"
        <br />
        4. Share the console output to help debug the issue
      </div>
    </div>
  );
};

export default VideoUploadTest; 