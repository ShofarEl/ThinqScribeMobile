import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const MarkdownRenderer = ({ content, theme = 'light' }) => {
  if (!content) return null;

  // Simple and reliable markdown parsing
  const renderContent = (text) => {
    // Split content by lines for better processing
    const lines = text.split('\n');
    const elements = [];
    let currentList = [];
    let inCodeBlock = false;
    let codeContent = '';
    let codeLanguage = '';

    const processLine = (line, index) => {
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <Card 
              key={`code-${index}`}
              style={{ 
                margin: '16px 0',
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
              }}
              bodyStyle={{ padding: '0' }}
            >
              <pre style={{
                backgroundColor: theme === 'dark' ? '#0d1117' : '#ffffff',
                color: theme === 'dark' ? '#e6edf3' : '#24292f',
                padding: '16px',
                margin: 0,
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: '1.45',
                overflow: 'auto',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
              }}>
                {codeContent}
              </pre>
            </Card>
          );
          inCodeBlock = false;
          codeContent = '';
          codeLanguage = '';
        } else {
          // Start code block
          inCodeBlock = true;
          codeLanguage = line.substring(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeContent += (codeContent ? '\n' : '') + line;
        return;
      }

      // Flush pending list items
      const flushList = () => {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} style={{
              paddingLeft: '20px',
              marginBottom: '16px',
              color: theme === 'dark' ? '#e6edf3' : '#24292f'
            }}>
              {currentList}
            </ul>
          );
          currentList = [];
        }
      };

      // Handle headers (lines starting and ending with **)
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        flushList();
        const headerText = line.slice(2, -2);
        elements.push(
          <Title 
            key={`header-${index}`} 
            level={3} 
            style={{ 
              color: theme === 'dark' ? '#e6edf3' : '#24292f',
              fontSize: '20px',
              fontWeight: 600,
              marginTop: '32px',
              marginBottom: '16px',
              borderBottom: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
              paddingBottom: '8px'
            }}
          >
            {headerText}
          </Title>
        );
        return;
      }

      // Handle list items
      if (line.trim().startsWith('*   ') || line.trim().startsWith('* ')) {
        const listText = line.trim().startsWith('*   ') ? line.trim().slice(4) : line.trim().slice(2);
        currentList.push(
          <li key={`li-${index}`} style={{ 
            marginBottom: '8px', 
            lineHeight: '1.6'
          }}>
            {parseInlineFormatting(listText)}
          </li>
        );
        return;
      }

      // Handle regular paragraphs
      if (line.trim()) {
        flushList();
        elements.push(
          <p key={`p-${index}`} style={{
            color: theme === 'dark' ? '#e6edf3' : '#24292f',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            {parseInlineFormatting(line)}
          </p>
        );
      } else {
        flushList();
      }
    };

    // Process all lines
    lines.forEach((line, index) => {
      processLine(line, index);
    });

    // Flush any remaining list
    if (currentList.length > 0) {
      elements.push(
        <ul key="final-list" style={{
          paddingLeft: '20px',
          marginBottom: '16px',
          color: theme === 'dark' ? '#e6edf3' : '#24292f'
        }}>
          {currentList}
        </ul>
      );
    }

    return elements;
  };

  // Parse inline formatting (bold, italic, code)
  const parseInlineFormatting = (text) => {
    if (!text) return text;

    const elements = [];
    let remaining = text;
    let keyCounter = 0;

    // Process bold text first
    while (remaining.includes('**')) {
      const start = remaining.indexOf('**');
      const end = remaining.indexOf('**', start + 2);
      
      if (start !== -1 && end !== -1) {
        // Add text before bold
        if (start > 0) {
          elements.push(remaining.substring(0, start));
        }
        
        // Add bold text
        const boldText = remaining.substring(start + 2, end);
        elements.push(
          <strong 
            key={`bold-${keyCounter++}`}
            style={{ 
              fontWeight: 600,
              color: theme === 'dark' ? '#e6edf3' : '#24292f'
            }}
          >
            {boldText}
          </strong>
        );
        
        remaining = remaining.substring(end + 2);
      } else {
        break;
      }
    }

    // Add any remaining text
    if (remaining) {
      elements.push(remaining);
    }

    // If no formatting was found, process italic and inline code
    if (elements.length === 0) {
      return processItalicAndCode(text);
    }

    // Process each element for italic and code formatting
    return elements.map((element, index) => {
      if (typeof element === 'string') {
        return <span key={`span-${index}`}>{processItalicAndCode(element)}</span>;
      }
      return element;
    });
  };

  // Process italic and inline code
  const processItalicAndCode = (text) => {
    if (!text || typeof text !== 'string') return text;

    const elements = [];
    let remaining = text;
    let keyCounter = 0;

    // Process inline code first
    while (remaining.includes('`')) {
      const start = remaining.indexOf('`');
      const end = remaining.indexOf('`', start + 1);
      
      if (start !== -1 && end !== -1 && end > start + 1) {
        // Add text before code
        if (start > 0) {
          elements.push(remaining.substring(0, start));
        }
        
        // Add inline code
        const codeText = remaining.substring(start + 1, end);
        elements.push(
          <code 
            key={`code-${keyCounter++}`}
            style={{
              backgroundColor: theme === 'dark' ? '#161b22' : '#f6f8fa',
              color: theme === 'dark' ? '#f0f6fc' : '#24292f',
              padding: '2px 4px',
              borderRadius: '3px',
              fontSize: '85%',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
            }}
          >
            {codeText}
          </code>
        );
        
        remaining = remaining.substring(end + 1);
      } else {
        break;
      }
    }

    // Add remaining text and process for italic
    if (remaining) {
      elements.push(processItalic(remaining));
    }

    return elements.length > 0 ? elements : processItalic(text);
  };

  // Process italic formatting
  const processItalic = (text) => {
    if (!text || typeof text !== 'string') return text;

    const elements = [];
    let remaining = text;
    let keyCounter = 0;

    // Process single asterisk italic
    const italicRegex = /\*([^*]+)\*/g;
    let lastIndex = 0;
    let match;

    while ((match = italicRegex.exec(remaining)) !== null) {
      // Add text before italic
      if (match.index > lastIndex) {
        elements.push(remaining.substring(lastIndex, match.index));
      }
      
      // Add italic text
      elements.push(
        <em 
          key={`italic-${keyCounter++}`}
          style={{ 
            fontStyle: 'italic',
            color: theme === 'dark' ? '#e6edf3' : '#656d76'
          }}
        >
          {match[1]}
        </em>
      );
      
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < remaining.length) {
      elements.push(remaining.substring(lastIndex));
    }

    return elements.length > 0 ? elements : text;
  };

  return (
    <div style={{
      background: 'transparent',
      color: theme === 'dark' ? '#e6edf3' : '#24292f',
      fontSize: '16px',
      lineHeight: '1.6',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
    }}>
      {renderContent(content)}
    </div>
  );
};

export default MarkdownRenderer; 