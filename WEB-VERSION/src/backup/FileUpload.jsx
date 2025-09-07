import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Button, 
  List, 
  Typography, 
  Space, 
  Tag, 
  Progress, 
  message,
  Card,
  Tooltip
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  FileOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAIChat } from '../context/AIChatContext';
import { formatFileSize, isFileTypeSupported } from '../api/aiChat';

const { Text } = Typography;
const { Dragger } = Upload;

const FileUpload = ({ files, setFiles, maxFiles = 10 }) => {
  const { selectedModel, getModelInfo } = useAIChat();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const modelInfo = getModelInfo(selectedModel);
  const capabilities = modelInfo?.capabilities || {};
  const supportedTypes = capabilities.supportedFileTypes || [];
  const maxFileSize = capabilities.maxFileSize || 10 * 1024 * 1024; // Default 10MB

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <PictureOutlined style={{ color: '#52c41a' }} />;
    } else if (['mp4', 'mov', 'avi'].includes(ext)) {
      return <VideoCameraOutlined style={{ color: '#1890ff' }} />;
    } else if (['mp3', 'wav'].includes(ext)) {
      return <AudioOutlined style={{ color: '#722ed1' }} />;
    } else if (ext === 'pdf') {
      return <FilePdfOutlined style={{ color: '#f5222d' }} />;
    } else if (['txt', 'md'].includes(ext)) {
      return <FileTextOutlined style={{ color: '#faad14' }} />;
    } else {
      return <FileOutlined />;
    }
  };

  const beforeUpload = (file) => {
    // Check file type
    if (supportedTypes.length > 0 && !isFileTypeSupported(file, supportedTypes)) {
      message.error(`File type .${file.name.split('.').pop()} is not supported by ${modelInfo.name}`);
      return false;
    }

    // Check file size
    if (file.size > maxFileSize) {
      message.error(`File size exceeds ${formatFileSize(maxFileSize)} limit`);
      return false;
    }

    // Check max files
    if (files.length >= maxFiles) {
      message.error(`Maximum ${maxFiles} files allowed`);
      return false;
    }

    // Add file to list
    const fileWithId = {
      ...file,
      uid: file.uid || Date.now() + Math.random(),
      status: 'done'
    };
    
    setFiles(prev => [...prev, fileWithId]);
    return false; // Prevent auto upload
  };

  const removeFile = (file) => {
    setFiles(prev => prev.filter(f => f.uid !== file.uid));
  };

  const previewFile = (file) => {
    if (file.type?.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      const imgWindow = window.open('');
      imgWindow.document.write(img.outerHTML);
    } else if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    } else {
      message.info('Preview not available for this file type');
    }
  };

  if (!capabilities.multimodal) {
    return (
      <Card size="small" style={{ marginBottom: 12, backgroundColor: '#fafafa' }}>
        <Text type="secondary">
          📝 {modelInfo?.name} supports text-only conversations
        </Text>
      </Card>
    );
  }

  return (
    <div className="file-upload-container">
      {files.length === 0 ? (
        <Dragger
          multiple
          beforeUpload={beforeUpload}
          showUploadList={false}
          disabled={uploading}
          style={{ marginBottom: 12 }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag files here to upload
          </p>
          <p className="ant-upload-hint">
            Supports: {supportedTypes.join(', ').toUpperCase()} | 
            Max: {formatFileSize(maxFileSize)} | 
            Limit: {maxFiles} files
          </p>
        </Dragger>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <Space>
              <Button
                type="dashed"
                icon={<UploadOutlined />}
                onClick={() => fileInputRef.current?.click()}
                disabled={files.length >= maxFiles}
                size="small"
              >
                Add More Files
              </Button>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {files.length}/{maxFiles} files
              </Text>
            </Space>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                Array.from(e.target.files).forEach(beforeUpload);
                e.target.value = '';
              }}
            />
          </div>

          <List
            size="small"
            dataSource={files}
            renderItem={(file) => (
              <List.Item
                actions={[
                  <Tooltip title="Preview">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => previewFile(file)}
                      size="small"
                    />
                  </Tooltip>,
                  <Tooltip title="Remove">
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => removeFile(file)}
                      size="small"
                      danger
                    />
                  </Tooltip>
                ]}
                style={{ 
                  padding: '8px 12px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '6px',
                  marginBottom: '4px',
                  backgroundColor: '#fafafa'
                }}
              >
                <List.Item.Meta
                  avatar={getFileIcon(file.name)}
                  title={
                    <Space>
                      <Text style={{ fontSize: '13px' }}>{file.name}</Text>
                      <Tag size="small">{formatFileSize(file.size)}</Tag>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </>
      )}

      {supportedTypes.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            💡 {modelInfo?.name} can analyze: {formatFileTypes(supportedTypes)}
          </Text>
        </div>
      )}
    </div>
  );
};

const formatFileTypes = (types) => {
  const groups = {
    'Images': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    'Documents': ['pdf', 'docx', 'doc', 'txt', 'md'],
    'Audio': ['mp3', 'wav'],
    'Video': ['mp4', 'mov', 'avi']
  };

  const supportedGroups = [];
  Object.entries(groups).forEach(([group, groupTypes]) => {
    if (groupTypes.some(type => types.includes(type))) {
      supportedGroups.push(group);
    }
  });

  return supportedGroups.join(', ') || 'Text files';
};

export default FileUpload;