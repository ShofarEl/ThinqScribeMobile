import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Button, Typography, message, Tooltip, Tag, Card, Divider } from 'antd';
import { 
  CopyOutlined, 
  DownloadOutlined, 
  ExpandOutlined, 
  CompressOutlined,
  BugOutlined,
  CodeOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  StarOutlined,
  EyeOutlined
} from '@ant-design/icons';
import 'katex/dist/katex.min.css';

const { Text, Title } = Typography;

const MarkdownRenderer = ({ content, className = '', theme = 'light' }) => {
  const [expandedBlocks, setExpandedBlocks] = useState(new Set());
  const [copiedBlocks, setCopiedBlocks] = useState(new Set());

  // Debug content being passed
  console.log('MarkdownRenderer received content:', content?.substring(0, 200));
  console.log('Content includes **bold**?', content?.includes('**'));

  // Ensure KaTeX CSS is loaded
  useEffect(() => {
    const katexLink = document.querySelector('link[href*="katex"]');
    if (!katexLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
      link.integrity = 'sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }, []);

  const copyToClipboard = async (text, blockId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlocks(prev => new Set([...prev, blockId]));
      message.success('Code copied to clipboard!', 2);
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const newSet = new Set(prev);
          newSet.delete(blockId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      message.error('Failed to copy code');
    }
  };

  const downloadCode = (code, language, blockId) => {
    const fileExtensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      sql: 'sql',
      html: 'html',
      css: 'css',
      json: 'json',
      xml: 'xml',
      yaml: 'yml',
      bash: 'sh',
      shell: 'sh'
    };

    const extension = fileExtensions[language] || 'txt';
    const filename = `code_${blockId}.${extension}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    message.success(`Code downloaded as ${filename}`);
  };

  const toggleExpand = (blockId) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  const getLanguageIcon = (language) => {
    const icons = {
      javascript: '🟨',
      typescript: '🔷',
      python: '🐍',
      java: '☕',
      cpp: '⚡',
      c: '🔧',
      csharp: '💜',
      php: '🐘',
      ruby: '💎',
      go: '🐹',
      rust: '🦀',
      sql: '🗃️',
      html: '🌐',
      css: '🎨',
      json: '📋',
      xml: '📄',
      yaml: '⚙️',
      bash: '💻',
      shell: '🖥️',
      markdown: '📝',
      dockerfile: '🐳',
      git: '📋'
    };
    return icons[language?.toLowerCase()] || '📄';
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: '#f7df1e',
      typescript: '#3178c6',
      python: '#3776ab',
      java: '#ed8b00',
      cpp: '#00599c',
      c: '#a8b9cc',
      csharp: '#239120',
      php: '#777bb4',
      ruby: '#cc342d',
      go: '#00add8',
      rust: '#000000',
      sql: '#336791',
      html: '#e34f26',
      css: '#1572b6',
      json: '#000000',
      xml: '#0060ac',
      yaml: '#cb171e',
      bash: '#4eaa25',
      shell: '#89e051'
    };
    return colors[language?.toLowerCase()] || '#666666';
  };

  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const code = String(children).replace(/\n$/, '');
    const blockId = `code-${Math.random().toString(36).substr(2, 9)}`;
    const isExpanded = expandedBlocks.has(blockId);
    const isCopied = copiedBlocks.has(blockId);
    const lineCount = code.split('\n').length;
    const shouldShowExpand = lineCount > 10;

    // Only apply styled code blocks for actual code with explicit language specification
    // This prevents regular text or code without language from getting the fancy styling
    if (!inline && language && className && className.includes('language-') && language !== 'text' && language !== 'plain') {
      return (
        <div style={{ 
          position: 'relative', 
          marginBottom: '24px',
          borderRadius: '16px',
          background: theme === 'dark' ? '#0d1117' : '#f6f8fa',
          border: '1px solid ' + (theme === 'dark' ? '#21262d' : '#d8dee4'),
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          {/* Enhanced Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: theme === 'dark' ? 
              'linear-gradient(135deg, #161b22 0%, #21262d 100%)' : 
              'linear-gradient(135deg, #f6f8fa 0%, #e1e8ed 100%)',
            padding: '12px 16px',
            borderBottom: '1px solid ' + (theme === 'dark' ? '#21262d' : '#d8dee4')
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: '#ff5f57' 
                }} />
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: '#ffbd2e' 
                }} />
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: '#28ca42' 
                }} />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>
                  {getLanguageIcon(language)}
                </span>
                <Tag 
                  color={getLanguageColor(language)}
                  style={{ 
                    margin: 0,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    color: 'white'
                  }}
                >
                  {language}
                </Tag>
                <Text style={{ 
                  fontSize: '12px', 
                  color: theme === 'dark' ? '#8b949e' : '#656d76',
                  fontFamily: 'SF Mono, Monaco, Menlo, monospace'
                }}>
                  {lineCount} lines
                </Text>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {shouldShowExpand && (
                <Tooltip title={isExpanded ? 'Collapse' : 'Expand'}>
                  <Button
                    type="text"
                    size="small"
                    icon={isExpanded ? <CompressOutlined /> : <ExpandOutlined />}
                    onClick={() => toggleExpand(blockId)}
                    style={{ 
                      color: theme === 'dark' ? '#8b949e' : '#656d76',
                      border: 'none',
                      padding: '4px'
                    }}
                  />
                </Tooltip>
              )}
              
              <Tooltip title="Download code">
                <Button
                  type="text"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => downloadCode(code, language, blockId)}
                  style={{ 
                    color: theme === 'dark' ? '#8b949e' : '#656d76',
                    border: 'none',
                    padding: '4px'
                  }}
                />
              </Tooltip>

              <Tooltip title={isCopied ? 'Copied!' : 'Copy code'}>
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(code, blockId)}
                  style={{ 
                    color: isCopied ? '#28a745' : (theme === 'dark' ? '#8b949e' : '#656d76'),
                    border: 'none',
                    padding: '4px',
                    transition: 'color 0.3s ease'
                  }}
                />
              </Tooltip>
            </div>
          </div>

          {/* Code Content */}
          <div style={{ 
            maxHeight: shouldShowExpand && !isExpanded ? '300px' : 'none',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <SyntaxHighlighter
              style={theme === 'dark' ? vscDarkPlus : oneLight}
              language={language}
              PreTag="div"
              customStyle={{
                margin: 0,
                background: 'transparent',
                fontSize: '14px',
                lineHeight: '1.6',
                padding: '20px',
                fontFamily: 'SF Mono, Monaco, Menlo, Consolas, monospace'
              }}
              showLineNumbers
              lineNumberStyle={{
                color: theme === 'dark' ? '#484f58' : '#8c959f',
                fontSize: '12px',
                minWidth: '3em',
                paddingRight: '16px',
                textAlign: 'right',
                userSelect: 'none'
              }}
              wrapLines
              {...props}
            >
              {code}
            </SyntaxHighlighter>
            
            {shouldShowExpand && !isExpanded && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: theme === 'dark' ? 
                  'linear-gradient(transparent, #0d1117)' : 
                  'linear-gradient(transparent, #f6f8fa)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '12px'
              }}>
                <Button
                  size="small"
                  type="primary"
                  ghost
                  icon={<ExpandOutlined />}
                  onClick={() => toggleExpand(blockId)}
                  style={{
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                >
                  Show {lineCount - 10} more lines
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // For inline code or code without proper language specification, use simple styling
    return (
      <code 
        className={className} 
        style={{
          background: theme === 'dark' ? '#161b22' : '#f6f8fa',
          color: theme === 'dark' ? '#e6edf3' : '#24292f',
          padding: '3px 6px',
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: 'SF Mono, Monaco, Menlo, Consolas, monospace',
          border: '1px solid ' + (theme === 'dark' ? '#21262d' : '#d8dee4')
        }}
        {...props}
      >
        {children}
      </code>
    );
  };

  // Enhanced Math component for better mathematical rendering
  const MathComponent = ({ children, displayMode = false }) => (
    <span 
      className={`katex-math ${displayMode ? 'katex-display' : 'katex-inline'}`}
      style={{
        fontSize: displayMode ? '1.2em' : '1em',
        margin: displayMode ? '20px 0' : '0 4px',
        display: displayMode ? 'block' : 'inline-block',
        textAlign: displayMode ? 'center' : 'inherit',
        lineHeight: displayMode ? '1.5' : 'inherit',
        background: displayMode ? (theme === 'dark' ? '#0d1117' : '#f6f8fa') : 'transparent',
        padding: displayMode ? '16px' : '2px 4px',
        borderRadius: displayMode ? '8px' : '4px',
        border: displayMode ? '1px solid ' + (theme === 'dark' ? '#21262d' : '#d8dee4') : 'none'
      }}
    >
      {children}
    </span>
  );

  // Enhanced Table Component
  const TableComponent = ({ children, ...props }) => (
    <div style={{ 
      overflowX: 'auto', 
      marginBottom: '24px',
      borderRadius: '12px',
      border: '1px solid ' + (theme === 'dark' ? '#21262d' : '#d8dee4'),
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
    }}>
      <table 
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: theme === 'dark' ? '#0d1117' : 'white',
          fontSize: '14px'
        }}
        {...props}
      >
        {children}
      </table>
    </div>
  );

  const TableCell = ({ isHeader, children, ...props }) => {
    const Component = isHeader ? 'th' : 'td';
    return (
      <Component
        style={{
          padding: '12px 16px',
          border: '1px solid ' + (theme === 'dark' ? '#21262d' : '#e1e8ed'),
          backgroundColor: isHeader ? 
            (theme === 'dark' ? '#161b22' : '#f6f8fa') : 
            (theme === 'dark' ? '#0d1117' : 'white'),
          fontWeight: isHeader ? '600' : '400',
          textAlign: 'left',
          color: theme === 'dark' ? '#e6edf3' : '#24292f'
        }}
        {...props}
      >
        {children}
      </Component>
    );
  };

  // Enhanced Blockquote Component
  const BlockquoteComponent = ({ children, ...props }) => (
    <div style={{
      background: theme === 'dark' ? 
        'linear-gradient(135deg, #161b22 0%, #1c2128 100%)' : 
        'linear-gradient(135deg, #f6f8fa 0%, #e1e8ed 100%)',
      borderLeft: '4px solid #1890ff',
      margin: '20px 0',
      padding: '16px 20px',
      borderRadius: '0 12px 12px 0',
      fontStyle: 'italic',
      color: theme === 'dark' ? '#8b949e' : '#656d76',
      boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '16px',
        fontSize: '24px',
        opacity: 0.3
      }}>
        💬
      </div>
      {children}
    </div>
  );

  // Enhanced components with proper text formatting
  const components = {
    // Bold text formatting
    strong: ({ children, ...props }) => (
      <strong style={{ 
        fontWeight: '700',
        color: theme === 'dark' ? '#e6edf3' : '#24292f'
      }} {...props}>
        {children}
      </strong>
    ),
    // Italic text formatting
    em: ({ children, ...props }) => (
      <em style={{ 
        fontStyle: 'italic',
        color: theme === 'dark' ? '#e6edf3' : '#24292f'
      }} {...props}>
        {children}
      </em>
    ),
    // Regular paragraphs
    p: ({ children, ...props }) => (
      <p style={{ 
        marginBottom: '16px', 
        lineHeight: '1.7', 
        color: theme === 'dark' ? '#e6edf3' : '#24292f',
        fontSize: '15px'
      }} {...props}>
        {children}
      </p>
    ),
    // Lists
    ul: (props) => (
      <ul style={{ 
        paddingLeft: '24px', 
        marginBottom: '16px',
        color: theme === 'dark' ? '#e6edf3' : '#24292f'
      }} {...props} />
    ),
    ol: (props) => (
      <ol style={{ 
        paddingLeft: '24px', 
        marginBottom: '16px',
        color: theme === 'dark' ? '#e6edf3' : '#24292f'
      }} {...props} />
    ),
    li: ({ children, ...props }) => (
      <li style={{ marginBottom: '6px', lineHeight: '1.6' }} {...props}>
        {children}
      </li>
    ),
    // Headings
    h1: (props) => (
      <Title level={1} style={{ 
        fontSize: '32px', 
        fontWeight: '700', 
        marginBottom: '20px', 
        marginTop: '32px',
        color: theme === 'dark' ? '#e6edf3' : '#24292f',
        borderBottom: '2px solid ' + (theme === 'dark' ? '#21262d' : '#d8dee4'),
        paddingBottom: '12px'
      }} {...props} />
    ),
    h2: (props) => (
      <Title level={2} style={{ 
        fontSize: '26px', 
        fontWeight: '600', 
        marginBottom: '16px', 
        marginTop: '28px',
        color: theme === 'dark' ? '#e6edf3' : '#24292f'
      }} {...props} />
    ),
    h3: (props) => (
      <Title level={3} style={{ 
        fontSize: '22px', 
        fontWeight: '600', 
        marginBottom: '14px', 
        marginTop: '24px',
        color: theme === 'dark' ? '#e6edf3' : '#24292f'
      }} {...props} />
    ),
    h4: (props) => (
      <Title level={4} style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        marginBottom: '12px', 
        marginTop: '20px',
        color: theme === 'dark' ? '#8b949e' : '#656d76'
      }} {...props} />
    ),
    // Links
    a: ({ href, children, ...props }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#1890ff',
          textDecoration: 'none',
          borderBottom: '1px solid transparent',
          transition: 'all 0.3s ease'
        }}
        {...props}
      >
        {children}
      </a>
    ),
    // Code blocks - simplified
    code: ({ node, inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code style={{
            backgroundColor: theme === 'dark' ? '#161b22' : '#f6f8fa',
            color: theme === 'dark' ? '#e6edf3' : '#24292f',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace'
          }} {...props}>
            {children}
          </code>
        );
      }
      
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const code = String(children).replace(/\n$/, '');
      
      return (
        <div style={{ 
          backgroundColor: theme === 'dark' ? '#0d1117' : '#f6f8fa',
          border: '1px solid ' + (theme === 'dark' ? '#21262d' : '#d8dee4'),
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          overflow: 'auto'
        }}>
          <SyntaxHighlighter
            style={theme === 'dark' ? vscDarkPlus : oneLight}
            language={language || 'text'}
            PreTag="div"
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    },
    table: TableComponent,
    th: (props) => <TableCell isHeader={true} {...props} />,
    td: (props) => <TableCell isHeader={false} {...props} />,
    blockquote: BlockquoteComponent,
    hr: (props) => (
      <Divider style={{ 
        margin: '32px 0',
        borderColor: theme === 'dark' ? '#21262d' : '#d8dee4'
      }} {...props} />
    ),
    // Enhanced math components
    math: (props) => <MathComponent displayMode={true} {...props} />,
    inlineMath: (props) => <MathComponent displayMode={false} {...props} />
  };

  // Preprocess content to ensure proper mathematical notation
  const preprocessContent = (text) => {
    if (!text) return '';
    
    return text
      // Improve mathematical symbol replacement
      .replace(/\b(alpha|α)\b/g, 'α')
      .replace(/\b(beta|β)\b/g, 'β')
      .replace(/\b(gamma|γ)\b/g, 'γ')
      .replace(/\b(delta|δ)\b/g, 'δ')
      .replace(/\b(epsilon|ε)\b/g, 'ε')
      .replace(/\b(theta|θ)\b/g, 'θ')
      .replace(/\b(lambda|λ)\b/g, 'λ')
      .replace(/\b(mu|μ)\b/g, 'μ')
      .replace(/\b(pi|π)\b/g, 'π')
      .replace(/\b(rho|ρ)\b/g, 'ρ')
      .replace(/\b(sigma|σ)\b/g, 'σ')
      .replace(/\b(tau|τ)\b/g, 'τ')
      .replace(/\b(phi|φ)\b/g, 'φ')
      .replace(/\b(chi|χ)\b/g, 'χ')
      .replace(/\b(psi|ψ)\b/g, 'ψ')
      .replace(/\b(omega|ω)\b/g, 'ω')
      // Enhanced mathematical symbols
      .replace(/\+\/-/g, '±')
      .replace(/-\/\+/g, '∓')
      .replace(/\*\*/g, '×')
      .replace(/\binfinity\b/g, '∞')
      .replace(/\bsum\b/g, '∑')
      .replace(/\bproduct\b/g, '∏')
      .replace(/\bintegral\b/g, '∫')
      .replace(/\bpartial\b/g, '∂')
      .replace(/\bnabla\b/g, '∇')
      .replace(/\bsqrt\b/g, '√')
      .replace(/\bapprox\b/g, '≈')
      .replace(/\bneq\b/g, '≠')
      .replace(/\bleq\b/g, '≤')
      .replace(/\bgeq\b/g, '≥')
      .replace(/\bin\b/g, '∈')
      .replace(/\bnotin\b/g, '∉')
      .replace(/\bsubset\b/g, '⊂')
      .replace(/\bsuperset\b/g, '⊃')
      .replace(/\bunion\b/g, '∪')
      .replace(/\bintersection\b/g, '∩')
      .replace(/\bdegrees?\b/g, '°');
  };

  const processedContent = preprocessContent(content);

  return (
    <div 
      className={`markdown-content ${className}`} 
      style={{ 
        lineHeight: '1.7',
        color: theme === 'dark' ? '#e6edf3' : '#24292f',
        background: 'transparent',
        fontSize: '15px'
      }}
    >
      <style>{`
        .markdown-content .katex {
          font-size: 1.1em !important;
          line-height: 1.5 !important;
        }
        .markdown-content .katex-display {
          margin: 20px 0 !important;
          text-align: center !important;
        }
        .markdown-content .katex-inline {
          margin: 0 4px !important;
        }
        .markdown-content .katex .base {
          display: inline-block !important;
        }
        .markdown-content p {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .markdown-content pre {
          background: transparent !important;
        }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer; 