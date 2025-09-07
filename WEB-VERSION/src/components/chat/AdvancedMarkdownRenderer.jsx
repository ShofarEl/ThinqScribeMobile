import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import { Table, Checkbox, Button, Collapse, Card } from 'antd';
import { CopyOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import 'katex/dist/katex.min.css';
import './AdvancedMarkdownRenderer.css';

const { Panel } = Collapse;

const AdvancedMarkdownRenderer = ({ content }) => {
  const [collapsedSections, setCollapsedSections] = useState({});
  const [taskStates, setTaskStates] = useState({});

  useEffect(() => {
    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose'
    });

    // Render mermaid diagrams
    const mermaidElements = document.querySelectorAll('.mermaid');
    mermaidElements.forEach((element, index) => {
      const id = `mermaid-${Date.now()}-${index}`;
      element.id = id;
      try {
        mermaid.render(id, element.textContent, (svgCode) => {
          element.innerHTML = svgCode;
        });
      } catch (error) {
        console.warn('Mermaid rendering error:', error);
        element.innerHTML = '<div class="mermaid-error">Invalid diagram syntax</div>';
      }
    });
  }, [content]);

  // Custom components for markdown rendering
  const components = {
    // Enhanced code blocks with copy functionality
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (!inline && language) {
        return (
          <div className="code-block-container">
            <div className="code-block-header">
              <span className="language-label">{language}</span>
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(String(children));
                  // Could add a toast notification here
                }}
                className="copy-code-btn"
              >
                Copy
              </Button>
            </div>
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={language}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderRadius: '0 0 8px 8px'
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        );
      }

      // Inline code
      return (
        <code className="inline-code" {...props}>
          {children}
        </code>
      );
    },

    // Enhanced tables with sorting
    table({ children }) {
      return (
        <div className="markdown-table-container">
          <table className="markdown-table">
            {children}
          </table>
        </div>
      );
    },

    // Task lists with interactive checkboxes
    li({ children, ...props }) {
      const childrenArray = React.Children.toArray(children);
      const firstChild = childrenArray[0];
      
      // Check if this is a task list item
      if (
        firstChild &&
        typeof firstChild === 'object' &&
        firstChild.props &&
        firstChild.props.type === 'checkbox'
      ) {
        const taskId = `task-${Math.random().toString(36).substr(2, 9)}`;
        const isChecked = firstChild.props.checked;
        
        return (
          <li className="task-list-item" {...props}>
            <Checkbox
              checked={taskStates[taskId] !== undefined ? taskStates[taskId] : isChecked}
              onChange={(e) => {
                setTaskStates(prev => ({
                  ...prev,
                  [taskId]: e.target.checked
                }));
              }}
              className="task-checkbox"
            />
            <span className={taskStates[taskId] ? 'task-completed' : ''}>
              {childrenArray.slice(1)}
            </span>
          </li>
        );
      }
      
      return <li {...props}>{children}</li>;
    },

    // Collapsible sections
    details({ children, ...props }) {
      const summaryChild = React.Children.toArray(children).find(
        child => child.type === 'summary'
      );
      const otherChildren = React.Children.toArray(children).filter(
        child => child.type !== 'summary'
      );
      
      const sectionId = `section-${Math.random().toString(36).substr(2, 9)}`;
      
      return (
        <Collapse
          className="markdown-collapse"
          expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
        >
          <Panel
            header={summaryChild ? summaryChild.props.children : 'Details'}
            key={sectionId}
          >
            {otherChildren}
          </Panel>
        </Collapse>
      );
    },

    // Mermaid diagrams
    pre({ children, ...props }) {
      const code = children.props?.children;
      const className = children.props?.className || '';
      
      if (className.includes('language-mermaid')) {
        return (
          <div className="mermaid-container">
            <div className="mermaid">{code}</div>
          </div>
        );
      }
      
      return <pre {...props}>{children}</pre>;
    },

    // Enhanced blockquotes
    blockquote({ children, ...props }) {
      const content = React.Children.toArray(children)[0];
      const text = content?.props?.children;
      
      // Check for different blockquote types
      if (typeof text === 'string') {
        if (text.startsWith('💡') || text.toLowerCase().includes('tip:')) {
          return (
            <Card className="blockquote-tip" size="small">
              <div className="blockquote-content">{children}</div>
            </Card>
          );
        }
        if (text.startsWith('⚠️') || text.toLowerCase().includes('warning:')) {
          return (
            <Card className="blockquote-warning" size="small">
              <div className="blockquote-content">{children}</div>
            </Card>
          );
        }
        if (text.startsWith('❌') || text.toLowerCase().includes('error:')) {
          return (
            <Card className="blockquote-error" size="small">
              <div className="blockquote-content">{children}</div>
            </Card>
          );
        }
        if (text.startsWith('ℹ️') || text.toLowerCase().includes('info:')) {
          return (
            <Card className="blockquote-info" size="small">
              <div className="blockquote-content">{children}</div>
            </Card>
          );
        }
      }
      
      return (
        <blockquote className="markdown-blockquote" {...props}>
          {children}
        </blockquote>
      );
    },

    // Enhanced headings with anchors
    h1: ({ children, ...props }) => (
      <h1 className="markdown-heading h1" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="markdown-heading h2" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="markdown-heading h3" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 className="markdown-heading h4" {...props}>
        {children}
      </h4>
    ),
    h5: ({ children, ...props }) => (
      <h5 className="markdown-heading h5" {...props}>
        {children}
      </h5>
    ),
    h6: ({ children, ...props }) => (
      <h6 className="markdown-heading h6" {...props}>
        {children}
      </h6>
    ),

    // Enhanced links
    a({ href, children, ...props }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="markdown-link"
          {...props}
        >
          {children}
        </a>
      );
    },

    // Enhanced images
    img({ src, alt, ...props }) {
      return (
        <div className="markdown-image-container">
          <img
            src={src}
            alt={alt}
            className="markdown-image"
            {...props}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="image-error" style={{ display: 'none' }}>
            Failed to load image: {alt || src}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="advanced-markdown-renderer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default AdvancedMarkdownRenderer; 