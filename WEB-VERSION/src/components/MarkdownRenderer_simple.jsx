import React, { useState, useEffect, useRef } from 'react';
import { Typography, Card, Table, Button, Tag, Divider, Alert, Collapse, Tabs, Progress, Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined, LinkOutlined, ExpandOutlined, CompressOutlined, BarChartOutlined, LineChartOutlined, PieChartOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const MarkdownRenderer = ({ content, theme = 'dark' }) => {
  const [copiedStates, setCopiedStates] = useState({});

  if (!content) return null;

  // Enhanced language detection and syntax highlighting
  const getLanguageInfo = (lang) => {
    const languages = {
      javascript: { name: 'JavaScript', icon: '🟨', color: '#f7df1e' },
      typescript: { name: 'TypeScript', icon: '🔷', color: '#3178c6' },
      python: { name: 'Python', icon: '🐍', color: '#3776ab' },
      java: { name: 'Java', icon: '☕', color: '#ed8b00' },
      cpp: { name: 'C++', icon: '⚡', color: '#00599c' },
      c: { name: 'C', icon: '🔧', color: '#a8b9cc' },
      csharp: { name: 'C#', icon: '💎', color: '#239120' },
      php: { name: 'PHP', icon: '🐘', color: '#777bb4' },
      ruby: { name: 'Ruby', icon: '💎', color: '#cc342d' },
      go: { name: 'Go', icon: '🐹', color: '#00add8' },
      rust: { name: 'Rust', icon: '🦀', color: '#000000' },
      swift: { name: 'Swift', icon: '🦉', color: '#fa7343' },
      kotlin: { name: 'Kotlin', icon: '🎯', color: '#7f52ff' },
      html: { name: 'HTML', icon: '🌐', color: '#e34f26' },
      css: { name: 'CSS', icon: '🎨', color: '#1572b6' },
      scss: { name: 'SCSS', icon: '💅', color: '#cf649a' },
      json: { name: 'JSON', icon: '📋', color: '#000000' },
      xml: { name: 'XML', icon: '📄', color: '#0060ac' },
      yaml: { name: 'YAML', icon: '📝', color: '#cb171e' },
      sql: { name: 'SQL', icon: '🗄️', color: '#336791' },
      bash: { name: 'Bash', icon: '💻', color: '#4eaa25' },
      shell: { name: 'Shell', icon: '🐚', color: '#4eaa25' },
      powershell: { name: 'PowerShell', icon: '⚡', color: '#012456' },
      dockerfile: { name: 'Docker', icon: '🐳', color: '#2496ed' },
      markdown: { name: 'Markdown', icon: '📝', color: '#000000' },
      latex: { name: 'LaTeX', icon: '📄', color: '#008080' },
      r: { name: 'R', icon: '📊', color: '#276dc3' },
      matlab: { name: 'MATLAB', icon: '🧮', color: '#0076a8' },
      default: { name: 'Code', icon: '💻', color: '#6b7280' }
    };
    
    const langKey = lang?.toLowerCase() || 'default';
    return languages[langKey] || languages.default;
  };

  // Advanced syntax highlighting with better token recognition
  const renderCodeWithSyntaxHighlighting = (language, text) => {
    const syntaxRules = {
      javascript: {
        keywords: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'class', 'extends', 'async', 'await', 'from', 'default', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'static'],
        types: ['String', 'Number', 'Boolean', 'Array', 'Object', 'Promise', 'undefined', 'null'],
        operators: ['===', '!==', '==', '!=', '>=', '<=', '&&', '||', '=>', '...'],
      },
      python: {
        keywords: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'return', 'try', 'except', 'with', 'as', 'in', 'and', 'or', 'not', 'True', 'False', 'None', 'lambda', 'yield'],
        types: ['str', 'int', 'float', 'bool', 'list', 'dict', 'tuple', 'set'],
        operators: ['==', '!=', '>=', '<=', 'and', 'or', 'not', 'in', 'is'],
      },
      sql: {
        keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON', 'GROUP', 'ORDER', 'BY', 'HAVING', 'LIMIT'],
        types: ['VARCHAR', 'INT', 'INTEGER', 'DECIMAL', 'DATE', 'TIMESTAMP', 'BOOLEAN'],
        operators: ['=', '!=', '<>', '>=', '<=', 'LIKE', 'IN', 'BETWEEN'],
      }
    };

    const currentRules = syntaxRules[language?.toLowerCase()] || syntaxRules.javascript;
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      const tokens = [];
      let remaining = line;
      let tokenKey = 0;

      while (remaining.length > 0) {
        let matched = false;

        // Comments
        const commentMatch = remaining.match(/^(\/\/.*|#.*|--.*)/);
        if (commentMatch) {
          tokens.push(
            <span key={`cmt-${lineIndex}-${tokenKey++}`} style={{ 
              color: theme === 'dark' ? '#8b949e' : '#6a737d', 
              fontStyle: 'italic' 
            }}>
              {commentMatch[0]}
            </span>
          );
          remaining = remaining.slice(commentMatch[0].length);
          continue;
        }

        // String literals
        const stringMatch = remaining.match(/^(["'`])((?:(?!\1)[^\\]|\\.)*)(\1)/);
        if (stringMatch) {
          tokens.push(
            <span key={`str-${lineIndex}-${tokenKey++}`} style={{ 
              color: theme === 'dark' ? '#7ee787' : '#032f62' 
            }}>
              {stringMatch[0]}
            </span>
          );
          remaining = remaining.slice(stringMatch[0].length);
          continue;
        }

        // Numbers
        const numberMatch = remaining.match(/^\b(\d+\.?\d*([eE][+-]?\d+)?)\b/);
        if (numberMatch) {
          tokens.push(
            <span key={`num-${lineIndex}-${tokenKey++}`} style={{ 
              color: theme === 'dark' ? '#79c0ff' : '#005cc5' 
            }}>
              {numberMatch[0]}
            </span>
          );
          remaining = remaining.slice(numberMatch[0].length);
          continue;
        }

        // Keywords
        let keywordMatched = false;
        for (const keyword of currentRules.keywords) {
          const regex = new RegExp(`^\\b${keyword}\\b`, 'i');
          const match = remaining.match(regex);
          if (match) {
            tokens.push(
              <span key={`kw-${lineIndex}-${tokenKey++}`} style={{ 
                color: theme === 'dark' ? '#ff7b72' : '#d73a49', 
                fontWeight: 600 
              }}>
                {match[0]}
              </span>
            );
            remaining = remaining.slice(match[0].length);
            keywordMatched = true;
            break;
          }
        }
        if (keywordMatched) continue;

        // Functions
        const functionMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
        if (functionMatch) {
          tokens.push(
            <span key={`fn-${lineIndex}-${tokenKey++}`} style={{ 
              color: theme === 'dark' ? '#d2a8ff' : '#6f42c1' 
            }}>
              {functionMatch[1]}
            </span>
          );
          tokens.push(
            <span key={`fp-${lineIndex}-${tokenKey++}`}>
              (
            </span>
          );
          remaining = remaining.slice(functionMatch[0].length);
          continue;
        }

        // Operators
        const operatorMatch = remaining.match(/^(===|!==|==|!=|>=|<=|&&|\|\||=>|\.\.\.|\+\+|--|[+\-*\/=<>!&|{}()\[\];,.:])/);
        if (operatorMatch) {
          tokens.push(
            <span key={`op-${lineIndex}-${tokenKey++}`} style={{ 
              color: theme === 'dark' ? '#ff7b72' : '#d73a49',
              fontWeight: 500
            }}>
              {operatorMatch[0]}
            </span>
          );
          remaining = remaining.slice(operatorMatch[0].length);
          continue;
        }

        // Regular text/whitespace
        const textMatch = remaining.match(/^(\s+|[^\s+\-*\/=<>!&|{}()\[\];,.:"`'"#]+)/);
        if (textMatch) {
          tokens.push(
            <span key={`txt-${lineIndex}-${tokenKey++}`} style={{
              color: theme === 'dark' ? '#e6edf3' : '#24292f'
            }}>
              {textMatch[0]}
            </span>
          );
          remaining = remaining.slice(textMatch[0].length);
        } else {
          tokens.push(
            <span key={`chr-${lineIndex}-${tokenKey++}`}>
              {remaining.charAt(0)}
            </span>
          );
          remaining = remaining.slice(1);
        }
      }

      return (
        <div key={`line-${lineIndex}`} style={{ 
          minHeight: '1.4em',
          display: 'flex',
          alignItems: 'stretch'
        }}>
          <span style={{
            color: theme === 'dark' ? '#6e7681' : '#656d76',
            fontSize: '12px',
            marginRight: '16px',
            minWidth: '24px',
            textAlign: 'right',
            userSelect: 'none',
            opacity: 0.6
          }}>
            {lineIndex + 1}
          </span>
          <span style={{ flex: 1 }}>
            {tokens.length > 0 ? tokens : '\u00A0'}
          </span>
        </div>
      );
    });
  };

  // Copy to clipboard function
  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Enhanced Mermaid diagram renderer
  const renderMermaidDiagram = (diagramCode, diagramId) => {
    const diagramTypes = {
      graph: { name: 'Flowchart', icon: '📊', color: '#0969da' },
      sequenceDiagram: { name: 'Sequence', icon: '🔄', color: '#8b5cf6' },
      classDiagram: { name: 'Class Diagram', icon: '🏗️', color: '#059669' },
      erDiagram: { name: 'ER Diagram', icon: '🗃️', color: '#dc2626' },
      gitgraph: { name: 'Git Graph', icon: '🌳', color: '#ea580c' },
      pie: { name: 'Pie Chart', icon: '🥧', color: '#7c3aed' },
      journey: { name: 'User Journey', icon: '🗺️', color: '#0891b2' }
    };

    const diagramType = Object.keys(diagramTypes).find(type => 
      diagramCode.trim().startsWith(type)
    ) || 'graph';
    
    const typeInfo = diagramTypes[diagramType];

    return (
      <Card
        key={diagramId}
        style={{
          margin: '24px 0',
          backgroundColor: theme === 'dark' ? '#0d1117' : '#f6f8fa',
          border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: theme === 'dark' 
            ? '0 8px 32px rgba(0,0,0,0.4)' 
            : '0 4px 16px rgba(0,0,0,0.1)',
        }}
        title={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>{typeInfo.icon}</span>
              <span style={{
                fontSize: '16px',
                fontWeight: 600,
                color: theme === 'dark' ? '#e6edf3' : '#24292f'
              }}>
                {typeInfo.name}
              </span>
              <Tag 
                color={typeInfo.color}
                style={{ 
                  fontSize: '11px',
                  borderRadius: '12px'
                }}
              >
                DIAGRAM
              </Tag>
            </div>
            <Button
              type="text"
              size="small"
              icon={copiedStates[diagramId] ? <CheckOutlined /> : <CopyOutlined />}
              onClick={() => copyToClipboard(diagramCode, diagramId)}
              style={{
                color: copiedStates[diagramId] 
                  ? '#28a745' 
                  : theme === 'dark' ? '#8b949e' : '#656d76'
              }}
            >
              {copiedStates[diagramId] ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        }
      >
        <div style={{
          padding: '20px',
          backgroundColor: theme === 'dark' ? '#161b22' : '#ffffff',
          borderRadius: '8px',
          textAlign: 'center',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: `2px dashed ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <Text style={{ 
            fontSize: '16px', 
            color: theme === 'dark' ? '#e6edf3' : '#24292f',
            marginBottom: '8px'
          }}>
            <strong>Interactive {typeInfo.name}</strong>
          </Text>
          <Text style={{ 
            fontSize: '14px', 
            color: theme === 'dark' ? '#8b949e' : '#656d76',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            This diagram would be rendered using Mermaid.js in a production environment.
            The diagram shows: {diagramType} visualization
          </Text>
          <Button 
            type="primary" 
            style={{ 
              marginTop: '16px',
              background: typeInfo.color,
              border: 'none'
            }}
            onClick={() => {
              // In production, this would render the actual Mermaid diagram
              console.log('Rendering Mermaid diagram:', diagramCode);
            }}
          >
            🎨 Render Diagram
          </Button>
        </div>
      </Card>
    );
  };

  // Enhanced chart renderer for data visualization
  const renderDataVisualization = (chartData, chartType = 'bar') => {
    const chartId = `chart-${Date.now()}-${Math.random()}`;
    
    const chartTypes = {
      bar: { name: 'Bar Chart', icon: <BarChartOutlined />, color: '#0969da' },
      line: { name: 'Line Chart', icon: <LineChartOutlined />, color: '#8b5cf6' },
      pie: { name: 'Pie Chart', icon: <PieChartOutlined />, color: '#059669' },
      area: { name: 'Area Chart', icon: '📈', color: '#dc2626' },
      scatter: { name: 'Scatter Plot', icon: '⚡', color: '#ea580c' }
    };

    const typeInfo = chartTypes[chartType] || chartTypes.bar;

    return (
      <Card
        key={chartId}
        style={{
          margin: '24px 0',
          backgroundColor: theme === 'dark' ? '#0d1117' : '#f6f8fa',
          border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: theme === 'dark' 
            ? '0 8px 32px rgba(0,0,0,0.4)' 
            : '0 4px 16px rgba(0,0,0,0.1)',
        }}
        title={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>{typeInfo.icon}</span>
              <span style={{
                fontSize: '16px',
                fontWeight: 600,
                color: theme === 'dark' ? '#e6edf3' : '#24292f'
              }}>
                {typeInfo.name}
              </span>
              <Tag 
                color={typeInfo.color}
                style={{ 
                  fontSize: '11px',
                  borderRadius: '12px'
                }}
              >
                INTERACTIVE
              </Tag>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Tooltip title="Export as PNG">
                <Button type="text" size="small" icon="📷" />
              </Tooltip>
              <Tooltip title="Export Data">
                <Button type="text" size="small" icon="📊" />
              </Tooltip>
            </div>
          </div>
        }
      >
        <div style={{
          padding: '20px',
          backgroundColor: theme === 'dark' ? '#161b22' : '#ffffff',
          borderRadius: '8px',
          textAlign: 'center',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>📊</div>
          <Text style={{ 
            fontSize: '18px', 
            color: theme === 'dark' ? '#e6edf3' : '#24292f',
            marginBottom: '12px'
          }}>
            <strong>Interactive {typeInfo.name}</strong>
          </Text>
          <Text style={{ 
            fontSize: '14px', 
            color: theme === 'dark' ? '#8b949e' : '#656d76',
            textAlign: 'center',
            maxWidth: '500px',
            marginBottom: '20px'
          }}>
            This chart would be rendered using Chart.js or D3.js with full interactivity,
            animations, and data export capabilities in a production environment.
          </Text>
          
          {/* Sample chart preview */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            height: '200px',
            backgroundColor: theme === 'dark' ? '#0d1117' : '#f8f9fa',
            border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Simulated chart bars */}
            <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '120px' }}>
              {[65, 45, 80, 55, 70].map((height, index) => (
                <div
                  key={index}
                  style={{
                    width: '40px',
                    height: `${height}px`,
                    backgroundColor: typeInfo.color,
                    borderRadius: '4px 4px 0 0',
                    opacity: 0.8,
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Enhanced math equation renderer with proper mathematical formatting
  const renderMathEquation = (equation, isBlock = false) => {
    const mathId = `math-${Date.now()}-${Math.random()}`;
    
    // Convert LaTeX-style notation to better visual representation
    const formatMathContent = (text) => {
      if (!text) return text;
      
      let formatted = text
        // Fractions: \frac{a}{b} -> a/b with proper styling
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (match, numerator, denominator) => {
          return `(${numerator})/(${denominator})`;
        })
        // Superscripts: ^{...} or ^x
        .replace(/\^\{([^}]+)\}/g, (match, content) => `^(${content})`)
        .replace(/\^([a-zA-Z0-9])/g, '^$1')
        // Subscripts: _{...} or _x  
        .replace(/\_\{([^}]+)\}/g, (match, content) => `₍${content}₎`)
        .replace(/\_([a-zA-Z0-9])/g, (match, content) => {
          // Convert to unicode subscripts where possible
          const subscriptMap = {
            '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
            '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
            'a': 'ₐ', 'e': 'ₑ', 'i': 'ᵢ', 'o': 'ₒ', 'u': 'ᵤ',
            'x': 'ₓ', 'n': 'ₙ', 'm': 'ₘ', 'p': 'ₚ', 's': 'ₛ', 't': 'ₜ'
          };
          return subscriptMap[content] || `₍${content}₎`;
        })
        // Greek letters
        .replace(/\\alpha/g, 'α').replace(/\\beta/g, 'β').replace(/\\gamma/g, 'γ')
        .replace(/\\delta/g, 'δ').replace(/\\epsilon/g, 'ε').replace(/\\zeta/g, 'ζ')
        .replace(/\\eta/g, 'η').replace(/\\theta/g, 'θ').replace(/\\iota/g, 'ι')
        .replace(/\\kappa/g, 'κ').replace(/\\lambda/g, 'λ').replace(/\\mu/g, 'μ')
        .replace(/\\nu/g, 'ν').replace(/\\xi/g, 'ξ').replace(/\\pi/g, 'π')
        .replace(/\\rho/g, 'ρ').replace(/\\sigma/g, 'σ').replace(/\\tau/g, 'τ')
        .replace(/\\upsilon/g, 'υ').replace(/\\phi/g, 'φ').replace(/\\chi/g, 'χ')
        .replace(/\\psi/g, 'ψ').replace(/\\omega/g, 'ω')
        // Capital Greek letters
        .replace(/\\Gamma/g, 'Γ').replace(/\\Delta/g, 'Δ').replace(/\\Theta/g, 'Θ')
        .replace(/\\Lambda/g, 'Λ').replace(/\\Xi/g, 'Ξ').replace(/\\Pi/g, 'Π')
        .replace(/\\Sigma/g, 'Σ').replace(/\\Phi/g, 'Φ').replace(/\\Psi/g, 'Ψ')
        .replace(/\\Omega/g, 'Ω')
        // Mathematical operators
        .replace(/\\partial/g, '∂').replace(/\\nabla/g, '∇')
        .replace(/\\sum/g, '∑').replace(/\\int/g, '∫')
        .replace(/\\prod/g, '∏').replace(/\\sqrt/g, '√')
        .replace(/\\infty/g, '∞').replace(/\\pm/g, '±')
        .replace(/\\times/g, '×').replace(/\\div/g, '÷')
        .replace(/\\cdot/g, '·').replace(/\\neq/g, '≠')
        .replace(/\\leq/g, '≤').replace(/\\geq/g, '≥')
        .replace(/\\approx/g, '≈').replace(/\\equiv/g, '≡')
        .replace(/\\propto/g, '∝').replace(/\\in/g, '∈')
        .replace(/\\subset/g, '⊂').replace(/\\supset/g, '⊃')
        .replace(/\\cap/g, '∩').replace(/\\cup/g, '∪')
        .replace(/\\rightarrow/g, '→').replace(/\\leftarrow/g, '←')
        .replace(/\\Rightarrow/g, '⇒').replace(/\\Leftarrow/g, '⇐')
        // Remove remaining LaTeX commands
        .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
        .replace(/\\[a-zA-Z]+/g, '')
        // Clean up extra spaces and formatting
        .replace(/\s+/g, ' ')
        .trim();
      
      return formatted;
    };

    const formattedEquation = formatMathContent(equation);
    
    if (isBlock) {
      return (
        <Card
          key={mathId}
          style={{
            margin: '24px 0',
            backgroundColor: theme === 'dark' ? '#0d1117' : '#f6f8fa',
            border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: theme === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.4)' 
              : '0 4px 16px rgba(0,0,0,0.1)',
          }}
          title={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px' }}>🧮</span>
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: 600,
                  color: theme === 'dark' ? '#e6edf3' : '#24292f'
                }}>
                  Mathematical Expression
                </span>
                <Tag 
                  color="#7c3aed"
                  style={{ 
                    fontSize: '11px',
                    borderRadius: '12px'
                  }}
                >
                  EQUATION
                </Tag>
              </div>
              <Button
                type="text"
                size="small"
                icon={copiedStates[mathId] ? <CheckOutlined /> : <CopyOutlined />}
                onClick={() => copyToClipboard(equation, mathId)}
                style={{
                  color: copiedStates[mathId] 
                    ? '#28a745' 
                    : theme === 'dark' ? '#8b949e' : '#656d76'
                }}
              >
                {copiedStates[mathId] ? 'Copied!' : 'Copy LaTeX'}
              </Button>
            </div>
          }
        >
          <div style={{
            padding: '32px',
            textAlign: 'center',
            backgroundColor: theme === 'dark' ? '#161b22' : '#ffffff',
            borderRadius: '8px',
            minHeight: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              fontFamily: '"Times New Roman", "KaTeX_Main", "Computer Modern", serif',
              fontSize: '24px',
              lineHeight: '1.4',
              color: theme === 'dark' ? '#e6edf3' : '#24292f',
              fontWeight: 400,
              letterSpacing: '0.5px',
              textAlign: 'center',
              padding: '16px',
              border: `2px dashed ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
              borderRadius: '12px',
              backgroundColor: theme === 'dark' ? '#0d1117' : '#f8f9fa',
              maxWidth: '100%',
              wordBreak: 'break-word'
            }}>
              {formattedEquation}
            </div>
            <Text style={{
              fontSize: '13px',
              color: theme === 'dark' ? '#8b949e' : '#656d76',
              marginTop: '16px',
              textAlign: 'center'
            }}>
              📝 Mathematical notation rendered with Unicode symbols<br/>
              For full LaTeX rendering, a math library like KaTeX or MathJax would be integrated
            </Text>
          </div>
        </Card>
      );
    } else {
      return (
        <span
          key={mathId}
          style={{
            fontFamily: '"Times New Roman", "KaTeX_Main", serif',
            fontSize: '18px',
            color: theme === 'dark' ? '#d2a8ff' : '#6f42c1',
            backgroundColor: theme === 'dark' ? '#1c2128' : '#f6f8fa',
            padding: '4px 8px',
            borderRadius: '6px',
            border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
            fontWeight: 500,
            letterSpacing: '0.3px',
            margin: '0 2px'
          }}
          title={`LaTeX: ${equation}`}
        >
          {formattedEquation}
        </span>
      );
    }
  };

  // Interactive collapsible sections
  const renderCollapsibleSection = (title, content) => {
    return (
      <Collapse
        style={{
          margin: '20px 0',
          backgroundColor: theme === 'dark' ? '#0d1117' : '#ffffff',
          border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
          borderRadius: '12px'
        }}
        expandIconPosition="right"
      >
        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>📋</span>
              <span style={{ 
                fontSize: '16px', 
                fontWeight: 600,
                color: theme === 'dark' ? '#e6edf3' : '#24292f'
              }}>
                {title}
              </span>
            </div>
          }
          key="1"
          style={{
            backgroundColor: theme === 'dark' ? '#0d1117' : '#ffffff',
            border: 'none'
          }}
        >
          <div style={{
            color: theme === 'dark' ? '#e6edf3' : '#24292f',
            lineHeight: '1.6'
          }}>
            {parseInlineFormatting(content)}
          </div>
        </Panel>
      </Collapse>
    );
  };

  // Enhanced image renderer with zoom and captions
  const renderEnhancedImage = (src, alt, caption) => {
    const [isZoomed, setIsZoomed] = useState(false);
    const imageId = `img-${Date.now()}-${Math.random()}`;

    return (
      <div key={imageId} style={{ margin: '24px 0', textAlign: 'center' }}>
        <Card
          style={{
            backgroundColor: theme === 'dark' ? '#0d1117' : '#f6f8fa',
            border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
            borderRadius: '12px',
            overflow: 'hidden'
          }}
          bodyStyle={{ padding: '16px' }}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={src}
              alt={alt}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                transform: isZoomed ? 'scale(1.5)' : 'scale(1)'
              }}
              onClick={() => setIsZoomed(!isZoomed)}
            />
            <Button
              type="text"
              icon={isZoomed ? <CompressOutlined /> : <ExpandOutlined />}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none'
              }}
              onClick={() => setIsZoomed(!isZoomed)}
            />
          </div>
          {caption && (
            <div style={{
              marginTop: '12px',
              fontSize: '14px',
              color: theme === 'dark' ? '#8b949e' : '#656d76',
              fontStyle: 'italic'
            }}>
              {caption}
            </div>
          )}
        </Card>
      </div>
    );
  };

  // Progress bar renderer
  const renderProgressBar = (percentage, label, color) => {
    return (
      <div style={{ margin: '16px 0' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <Text style={{ 
            fontSize: '14px',
            color: theme === 'dark' ? '#e6edf3' : '#24292f',
            fontWeight: 600
          }}>
            {label}
          </Text>
          <Text style={{ 
            fontSize: '14px',
            color: theme === 'dark' ? '#8b949e' : '#656d76'
          }}>
            {percentage}%
          </Text>
        </div>
        <Progress
          percent={percentage}
          strokeColor={color || (theme === 'dark' ? '#58a6ff' : '#0969da')}
          trailColor={theme === 'dark' ? '#30363d' : '#d1d9e0'}
          showInfo={false}
          strokeWidth={8}
        />
      </div>
    );
  };

  // Enhanced table parsing with advanced features
  const parseTable = (lines, startIndex) => {
    const tableLines = [];
    let currentIndex = startIndex;
    
    // Collect all table lines
    while (currentIndex < lines.length && lines[currentIndex].includes('|')) {
      tableLines.push(lines[currentIndex]);
      currentIndex++;
    }

    if (tableLines.length < 2) return { element: null, endIndex: startIndex };

    try {
      // Parse header row
      const headerRow = tableLines[0]
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell);

      // Parse separator row for alignment
      const separatorRow = tableLines[1]
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell);

      // Parse data rows
      const dataRows = tableLines.slice(2).map(row => 
        row.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell)
      );

      // Determine column alignments from separator row
      const columnAlignments = separatorRow.map(sep => {
        if (sep.startsWith(':') && sep.endsWith(':')) return 'center';
        if (sep.endsWith(':')) return 'right';
        return 'left';
      });

      // Generate table ID for styling
      const tableId = `table-${Date.now()}-${Math.random()}`;

      // Create columns with enhanced styling and features
      const columns = headerRow.map((header, index) => {
        const alignment = columnAlignments[index] || 'left';
        
        return {
          title: (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
              gap: '8px',
              fontWeight: 700,
              fontSize: '14px',
              color: theme === 'dark' ? '#e6edf3' : '#24292f',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {index === 0 && '📊'}
              {parseInlineFormatting(header)}
            </div>
          ),
          dataIndex: `col${index}`,
          key: `col${index}`,
          align: alignment,
          width: 'auto',
          ellipsis: {
            showTitle: false,
          },
          render: (text, record, rowIndex) => {
            const cellContent = parseInlineFormatting(text || '');
            
            // Special formatting for different data types
            const isNumber = !isNaN(text) && !isNaN(parseFloat(text)) && text.trim() !== '';
            const isDate = text && /^\d{4}-\d{2}-\d{2}/.test(text);
            const isEmail = text && /@/.test(text);
            const isUrl = text && (text.startsWith('http') || text.startsWith('www.'));
            const isCurrency = text && /^\$[\d,]+(\.\d{2})?$/.test(text);
            const isPercentage = text && text.endsWith('%');
            
            let cellStyle = {
              fontSize: '14px',
              lineHeight: '1.5',
              color: theme === 'dark' ? '#e6edf3' : '#24292f',
              padding: '12px 16px',
              textAlign: alignment
            };

            // Apply special styling based on data type
            if (isNumber && !isDate) {
              cellStyle.fontFamily = '"JetBrains Mono", monospace';
              cellStyle.color = theme === 'dark' ? '#79c0ff' : '#005cc5';
              cellStyle.fontWeight = 600;
            } else if (isCurrency) {
              cellStyle.fontFamily = '"JetBrains Mono", monospace';
              cellStyle.color = theme === 'dark' ? '#7ee787' : '#28a745';
              cellStyle.fontWeight = 600;
            } else if (isPercentage) {
              cellStyle.fontFamily = '"JetBrains Mono", monospace';
              cellStyle.color = theme === 'dark' ? '#ffa657' : '#fd7e14';
              cellStyle.fontWeight = 600;
            } else if (isDate) {
              cellStyle.fontFamily = '"JetBrains Mono", monospace';
              cellStyle.color = theme === 'dark' ? '#d2a8ff' : '#6f42c1';
            } else if (isEmail || isUrl) {
              cellStyle.color = theme === 'dark' ? '#58a6ff' : '#0969da';
            }

            // Row striping for better readability
            if (rowIndex % 2 === 1) {
              cellStyle.backgroundColor = theme === 'dark' ? '#0d1117' : '#f8f9fa';
            }

            return (
              <div style={cellStyle}>
                {isUrl ? (
                  <a 
                    href={text.startsWith('http') ? text : `https://${text}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    🔗 {cellContent}
                  </a>
                ) : isEmail ? (
                  <a 
                    href={`mailto:${text}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    📧 {cellContent}
                  </a>
                ) : (
                  cellContent
                )}
              </div>
            );
          },
          onHeaderCell: () => ({
            style: {
              backgroundColor: theme === 'dark' ? '#161b22' : '#f6f8fa',
              borderBottom: `2px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
              borderRight: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
              padding: '16px',
              fontWeight: 700,
              textAlign: alignment
            }
          }),
          onCell: (record, rowIndex) => ({
            style: {
              borderRight: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
              borderBottom: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
              backgroundColor: rowIndex % 2 === 0 
                ? (theme === 'dark' ? '#0d1117' : '#ffffff')
                : (theme === 'dark' ? '#161b22' : '#f8f9fa'),
              transition: 'all 0.2s ease',
              padding: 0
            }
          })
        };
      });

      // Create data source with enhanced row keys
      const dataSource = dataRows.map((row, index) => {
        const rowData = { key: `row-${index}` };
        row.forEach((cell, cellIndex) => {
          rowData[`col${cellIndex}`] = cell;
        });
        return rowData;
      });

      // Calculate table statistics
      const totalRows = dataRows.length;
      const totalColumns = headerRow.length;
      const hasNumericData = dataRows.some(row => 
        row.some(cell => !isNaN(cell) && !isNaN(parseFloat(cell)) && cell.trim() !== '')
      );

      return {
        element: (
          <div style={{ 
            margin: '24px 0',
            border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: theme === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.4)' 
              : '0 4px 16px rgba(0,0,0,0.1)',
            background: theme === 'dark' ? '#0d1117' : '#ffffff'
          }}>
            {/* Table Header with Metadata */}
            <div style={{
              padding: '16px 20px',
              backgroundColor: theme === 'dark' ? '#161b22' : '#f6f8fa',
              borderBottom: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px' }}>📊</span>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: theme === 'dark' ? '#e6edf3' : '#24292f'
                }}>
                  Data Table
                </span>
                <Tag 
                  style={{ 
                    fontSize: '11px',
                    borderRadius: '12px',
                    backgroundColor: theme === 'dark' ? '#1c2128' : '#ffffff',
                    color: theme === 'dark' ? '#8b949e' : '#656d76',
                    border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`
                  }}
                >
                  {totalRows} rows × {totalColumns} columns
                </Tag>
                {hasNumericData && (
                  <Tag 
                    color="blue"
                    style={{ 
                      fontSize: '11px',
                      borderRadius: '12px'
                    }}
                  >
                    📈 Numeric Data
                  </Tag>
                )}
              </div>
              
              <Button
                type="text"
                size="small"
                icon={copiedStates[tableId] ? <CheckOutlined /> : <CopyOutlined />}
                onClick={() => {
                  // Convert table to CSV format for copying
                  const csvContent = [
                    headerRow.join(','),
                    ...dataRows.map(row => row.join(','))
                  ].join('\n');
                  copyToClipboard(csvContent, tableId);
                }}
                style={{
                  color: copiedStates[tableId] 
                    ? '#28a745' 
                    : theme === 'dark' ? '#8b949e' : '#656d76'
                }}
              >
                {copiedStates[tableId] ? 'Copied!' : 'Copy CSV'}
              </Button>
            </div>

            {/* Enhanced Table */}
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              size="small"
              bordered={false}
              className={`enhanced-ai-table ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}
              style={{
                backgroundColor: 'transparent',
                borderRadius: 0
              }}
              scroll={{ x: 'max-content' }}
              onRow={(record, rowIndex) => ({
                onMouseEnter: (e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1c2128' : '#f0f7ff';
                  e.currentTarget.style.transform = 'scale(1.002)';
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 
                    ? (theme === 'dark' ? '#0d1117' : '#ffffff')
                    : (theme === 'dark' ? '#161b22' : '#f8f9fa');
                  e.currentTarget.style.transform = 'scale(1)';
                },
                style: {
                  cursor: 'default',
                  transition: 'all 0.2s ease'
                }
              })}
            />

            {/* Table Footer with Additional Info */}
            {totalRows > 5 && (
              <div style={{
                padding: '12px 20px',
                backgroundColor: theme === 'dark' ? '#161b22' : '#f6f8fa',
                borderTop: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
                fontSize: '12px',
                color: theme === 'dark' ? '#8b949e' : '#656d76',
                textAlign: 'center'
              }}>
                💡 This table contains {totalRows} rows of data. Hover over rows for better readability.
              </div>
            )}
          </div>
        ),
        endIndex: currentIndex
      };
    } catch (error) {
      console.error('Table parsing error:', error);
      return { element: null, endIndex: startIndex + 1 };
    }
  };

  // Main content renderer
  const renderContent = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Skip empty lines
      if (!line.trim()) {
        i++;
        continue;
      }

      // Enhanced code block handling with special types
      if (line.startsWith('```')) {
        const codeLanguage = line.substring(3).trim();
        
        // Handle Mermaid diagrams
        if (codeLanguage === 'mermaid') {
          const diagramId = `mermaid-${Date.now()}-${Math.random()}`;
          let diagramContent = '';
          i++;
          
          while (i < lines.length && !lines[i].startsWith('```')) {
            diagramContent += (diagramContent ? '\n' : '') + lines[i];
            i++;
          }
          
          if (i < lines.length) i++; // Skip closing ```
          elements.push(renderMermaidDiagram(diagramContent, diagramId));
          continue;
        }
        
        // Handle chart/graph blocks
        if (['chart', 'graph', 'plot'].includes(codeLanguage.split(':')[0])) {
          const chartType = codeLanguage.split(':')[1] || 'bar';
          let chartData = '';
          i++;
          
          while (i < lines.length && !lines[i].startsWith('```')) {
            chartData += (chartData ? '\n' : '') + lines[i];
            i++;
          }
          
          if (i < lines.length) i++; // Skip closing ```
          elements.push(renderDataVisualization(chartData, chartType));
          continue;
        }
        
        // Handle math blocks
        if (codeLanguage === 'math' || codeLanguage === 'latex') {
          let mathContent = '';
          i++;
          
          while (i < lines.length && !lines[i].startsWith('```')) {
            mathContent += (mathContent ? '\n' : '') + lines[i];
            i++;
          }
          
          if (i < lines.length) i++; // Skip closing ```
          elements.push(renderMathEquation(mathContent, true));
          continue;
        }
        
        // Regular code blocks
        const codeId = `code-${Date.now()}-${Math.random()}`;
        let codeContent = '';
        i++;
        
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeContent += (codeContent ? '\n' : '') + lines[i];
          i++;
        }
        
        if (i < lines.length) i++; // Skip closing ```
        
        const langInfo = getLanguageInfo(codeLanguage);
        
        elements.push(
          <Card 
            key={codeId}
            style={{ 
              margin: '24px 0',
              backgroundColor: theme === 'dark' ? '#0d1117' : '#f6f8fa',
              border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: theme === 'dark' 
                ? '0 8px 24px rgba(0,0,0,0.4)' 
                : '0 4px 12px rgba(0,0,0,0.1)',
            }}
            bodyStyle={{ padding: '0' }}
            title={
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '16px 20px',
                backgroundColor: theme === 'dark' ? '#161b22' : '#ffffff',
                borderBottom: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>{langInfo.icon}</span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: theme === 'dark' ? '#e6edf3' : '#24292f'
                  }}>
                    {langInfo.name}
                  </span>
                  {codeLanguage && (
                    <Tag 
                      color={langInfo.color} 
                      style={{ 
                        fontSize: '11px',
                        borderRadius: '12px',
                        border: 'none'
                      }}
                    >
                      {codeLanguage.toUpperCase()}
                    </Tag>
                  )}
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={copiedStates[codeId] ? <CheckOutlined /> : <CopyOutlined />}
                  onClick={() => copyToClipboard(codeContent, codeId)}
                  style={{
                    color: copiedStates[codeId] 
                      ? '#28a745' 
                      : theme === 'dark' ? '#8b949e' : '#656d76'
                  }}
                >
                  {copiedStates[codeId] ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            }
          >
            <pre style={{
              backgroundColor: theme === 'dark' ? '#0d1117' : '#ffffff',
              color: theme === 'dark' ? '#e6edf3' : '#24292f',
              padding: '20px',
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.5',
              overflow: 'auto',
              fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace',
              border: 'none',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              tabSize: 2
            }}>
              <code style={{ display: 'block' }}>
                {renderCodeWithSyntaxHighlighting(codeLanguage, codeContent)}
              </code>
            </pre>
          </Card>
        );
        continue;
      }

      // Heading handling
      const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const headingText = headingMatch[2];
        const sizes = ['32px', '28px', '24px', '20px', '18px', '16px'];
        
        elements.push(
          <Title 
            key={`heading-${i}`} 
            level={Math.min(level, 4)}
            style={{ 
              color: theme === 'dark' ? '#e6edf3' : '#24292f',
              fontSize: sizes[level - 1] || '16px',
              fontWeight: 700,
              marginTop: level === 1 ? '40px' : '32px',
              marginBottom: '16px',
              borderBottom: level <= 2 
                ? `2px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}` 
                : 'none',
              paddingBottom: level <= 2 ? '12px' : '0',
              lineHeight: '1.2'
            }}
          >
            {parseInlineFormatting(headingText)}
          </Title>
        );
        i++;
        continue;
      }

      // Math equations (block style with $$)
      if (line.startsWith('$$')) {
        let mathContent = '';
        i++;
        
        while (i < lines.length && !lines[i].endsWith('$$')) {
          mathContent += (mathContent ? '\n' : '') + lines[i];
          i++;
        }
        
        if (i < lines.length) {
          mathContent += (mathContent ? '\n' : '') + lines[i].replace('$$', '');
          i++;
        }
        
        elements.push(renderMathEquation(mathContent, true));
        continue;
      }
      
      // Collapsible sections
      if (line.match(/^<details>/i)) {
        const titleMatch = lines[i + 1]?.match(/<summary>(.+?)<\/summary>/i);
        const title = titleMatch?.[1] || 'Details';
        
        let detailsContent = '';
        i += 2; // Skip <details> and <summary> lines
        
        while (i < lines.length && !lines[i].match(/<\/details>/i)) {
          detailsContent += (detailsContent ? '\n' : '') + lines[i];
          i++;
        }
        
        if (i < lines.length) i++; // Skip closing </details>
        elements.push(renderCollapsibleSection(title, detailsContent));
        continue;
      }
      
      // Progress bars
      const progressMatch = line.match(/^\[(.+?)\]\s*:\s*(\d+)%(?:\s*\(([^)]+)\))?/);
      if (progressMatch) {
        const [, label, percentage, color] = progressMatch;
        elements.push(renderProgressBar(parseInt(percentage), label, color));
        i++;
        continue;
      }
      
      // Enhanced images with captions
      const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\s*"([^"]*)")?/);
      if (imageMatch) {
        const [, alt, src, caption] = imageMatch;
        elements.push(renderEnhancedImage(src, alt, caption));
        i++;
        continue;
      }

      // Table detection
      if (line.includes('|') && lines[i + 1]?.includes('|')) {
        const tableResult = parseTable(lines, i);
        if (tableResult.element) {
          elements.push(tableResult.element);
          i = tableResult.endIndex;
          continue;
        }
      }

      // Blockquote handling
      if (line.startsWith('> ')) {
        const quoteContent = [];
        let quoteIndex = i;
        
        while (quoteIndex < lines.length && lines[quoteIndex].startsWith('> ')) {
          quoteContent.push(lines[quoteIndex].slice(2));
          quoteIndex++;
        }
        
        elements.push(
          <div
            key={`quote-${i}`}
            style={{
              margin: '20px 0',
              padding: '20px 24px',
              backgroundColor: theme === 'dark' ? '#1c2128' : '#f6f8fa',
              border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
              borderLeft: `4px solid ${theme === 'dark' ? '#58a6ff' : '#0969da'}`,
              borderRadius: '0 12px 12px 0',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              fontSize: '24px',
              opacity: 0.3
            }}>
              💡
            </div>
            <div style={{ marginLeft: '32px' }}>
              {quoteContent.map((quoteLine, idx) => (
                <Paragraph
                  key={idx}
                  style={{ 
                    color: theme === 'dark' ? '#e6edf3' : '#24292f',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    margin: idx === quoteContent.length - 1 ? 0 : '0 0 12px 0',
                    fontStyle: 'italic'
                  }}
                >
                  {parseInlineFormatting(quoteLine)}
                </Paragraph>
              ))}
            </div>
          </div>
        );
        i = quoteIndex;
        continue;
      }

      // List handling
      const listMatch = line.match(/^\s*[-*+]\s+(.+)/);
      if (listMatch) {
        const listItems = [];
        let listIndex = i;
        
        while (listIndex < lines.length && lines[listIndex].match(/^\s*[-*+]\s+/)) {
          const itemMatch = lines[listIndex].match(/^\s*[-*+]\s+(.+)/);
          if (itemMatch) {
            listItems.push(itemMatch[1]);
          }
          listIndex++;
        }
        
        elements.push(
          <ul key={`list-${i}`} style={{
            paddingLeft: '24px',
            marginBottom: '20px',
            color: theme === 'dark' ? '#e6edf3' : '#24292f',
            listStyleType: 'disc'
          }}>
            {listItems.map((item, index) => (
              <li key={index} style={{ 
                marginBottom: '8px', 
                lineHeight: '1.7',
                fontSize: '16px'
              }}>
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
        i = listIndex;
        continue;
      }

      // Numbered list handling
      const numberedListMatch = line.match(/^\s*\d+\.\s+(.+)/);
      if (numberedListMatch) {
        const listItems = [];
        let listIndex = i;
        
        while (listIndex < lines.length && lines[listIndex].match(/^\s*\d+\.\s+/)) {
          const itemMatch = lines[listIndex].match(/^\s*\d+\.\s+(.+)/);
          if (itemMatch) {
            listItems.push(itemMatch[1]);
          }
          listIndex++;
        }
        
        elements.push(
          <ol key={`list-${i}`} style={{
            paddingLeft: '24px',
            marginBottom: '20px',
            color: theme === 'dark' ? '#e6edf3' : '#24292f'
          }}>
            {listItems.map((item, index) => (
              <li key={index} style={{ 
                marginBottom: '8px', 
                lineHeight: '1.7',
                fontSize: '16px'
              }}>
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ol>
        );
        i = listIndex;
        continue;
      }

      // Regular paragraph handling
      if (line.trim()) {
        elements.push(
          <Paragraph 
            key={`p-${i}`} 
            style={{
              color: theme === 'dark' ? '#e6edf3' : '#24292f',
              fontSize: '16px',
              lineHeight: '1.7',
              marginBottom: '16px',
              textAlign: 'justify'
            }}
          >
            {parseInlineFormatting(line)}
          </Paragraph>
        );
      }

      i++;
    }

    return elements;
  };

  // Enhanced inline formatting
  const parseInlineFormatting = (text) => {
    if (!text || typeof text !== 'string') return text;

    const elements = [];
    let remaining = text;
    let keyCounter = 0;

    while (remaining.length > 0) {
      let matched = false;

      // Links
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        elements.push(
          <a
            key={`link-${keyCounter++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: theme === 'dark' ? '#58a6ff' : '#0969da',
              textDecoration: 'none',
              borderBottom: '1px dotted',
              transition: 'all 0.2s ease'
            }}
          >
            <LinkOutlined style={{ marginRight: '4px', fontSize: '12px' }} />
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        matched = true;
      }

      // Bold text
      if (!matched) {
        const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
        if (boldMatch) {
          elements.push(
            <strong 
              key={`bold-${keyCounter++}`}
              style={{ 
                fontWeight: 700,
                color: theme === 'dark' ? '#e6edf3' : '#24292f'
              }}
            >
              {boldMatch[1]}
            </strong>
          );
          remaining = remaining.slice(boldMatch[0].length);
          matched = true;
        }
      }

      // Italic text
      if (!matched) {
        const italicMatch = remaining.match(/^\*([^*]+)\*/);
        if (italicMatch) {
          elements.push(
            <em 
              key={`italic-${keyCounter++}`}
              style={{ 
                fontStyle: 'italic',
                color: theme === 'dark' ? '#e6edf3' : '#656d76'
              }}
            >
              {italicMatch[1]}
            </em>
          );
          remaining = remaining.slice(italicMatch[0].length);
          matched = true;
        }
      }

      // Inline math equations (both $...$ and `...` with math content)
      if (!matched) {
        // First check for $...$ math notation
        const mathMatch = remaining.match(/^\$([^$]+)\$/);
        if (mathMatch) {
          elements.push(renderMathEquation(mathMatch[1], false));
          remaining = remaining.slice(mathMatch[0].length);
          matched = true;
        }
      }

      // Enhanced inline code with math detection
      if (!matched) {
        const codeMatch = remaining.match(/^`([^`]+)`/);
        if (codeMatch) {
          const codeContent = codeMatch[1];
          
          // Check if this looks like math (contains LaTeX commands or mathematical symbols)
          const mathIndicators = /\\[a-zA-Z]+|[αβγδεζηθικλμνξπρστυφχψω]|[ΓΔΘΛΞΠΣΦΨΩ]|[∂∇∑∫∏√∞±×÷·≠≤≥≈≡∝∈⊂⊃∩∪→←⇒⇐]|\^[a-zA-Z0-9]|_[a-zA-Z0-9]/;
          
          if (mathIndicators.test(codeContent)) {
            // Render as math equation
            elements.push(renderMathEquation(codeContent, false));
          } else {
            // Render as regular code
            elements.push(
              <code 
                key={`code-${keyCounter++}`}
                style={{
                  backgroundColor: theme === 'dark' ? '#1c2128' : '#f6f8fa',
                  color: theme === 'dark' ? '#f0f6fc' : '#24292f',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '85%',
                  fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace',
                  border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
                  fontWeight: 500
                }}
              >
                {codeContent}
              </code>
            );
          }
          remaining = remaining.slice(codeMatch[0].length);
          matched = true;
        }
      }

      // Regular text
      if (!matched) {
        const textMatch = remaining.match(/^[^*`\[]+/);
        if (textMatch) {
          elements.push(textMatch[0]);
          remaining = remaining.slice(textMatch[0].length);
        } else {
          elements.push(remaining.charAt(0));
          remaining = remaining.slice(1);
        }
      }
    }

    return elements.length > 0 ? elements : text;
  };

  return (
    <div style={{
      background: 'transparent',
      color: theme === 'dark' ? '#e6edf3' : '#24292f',
      fontSize: '16px',
      lineHeight: '1.7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Text", Helvetica, Arial, sans-serif',
      maxWidth: '100%',
      wordWrap: 'break-word'
    }}>
      {renderContent(content)}
    </div>
  );
};

export default MarkdownRenderer; 