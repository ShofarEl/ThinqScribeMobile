import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Typography, Table, Card, Button, Space } from 'antd';
import { DownloadOutlined, EyeOutlined, BarChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Chart.js Dynamic Import and Chart Components
const ChartComponent = ({ type, data, options = {} }) => {
  const [Chart, setChart] = useState(null);
  const [chartInstance, setChartInstance] = useState(null);
  const canvasRef = React.useRef(null);

  useEffect(() => {
    // Dynamically import Chart.js to avoid SSR issues
    import('chart.js/auto').then((ChartJS) => {
      setChart(ChartJS.default);
    });
  }, []);

  useEffect(() => {
    if (Chart && canvasRef.current && data) {
      // Destroy existing chart
      if (chartInstance) {
        chartInstance.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      
      // Enhanced chart configuration with beautiful defaults
      const chartConfig = {
        type: type || 'bar',
        data: {
          ...data,
          datasets: data.datasets?.map(dataset => ({
            ...dataset,
            backgroundColor: dataset.backgroundColor || [
              'rgba(102, 126, 234, 0.8)',
              'rgba(118, 75, 162, 0.8)',
              'rgba(6, 182, 212, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(251, 146, 60, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ],
            borderColor: dataset.borderColor || [
              'rgba(102, 126, 234, 1)',
              'rgba(118, 75, 162, 1)',
              'rgba(6, 182, 212, 1)',
              'rgba(139, 92, 246, 1)',
              'rgba(236, 72, 153, 1)',
              'rgba(34, 197, 94, 1)',
              'rgba(251, 146, 60, 1)',
              'rgba(239, 68, 68, 1)'
            ],
            borderWidth: dataset.borderWidth || 2,
            borderRadius: dataset.borderRadius || 8,
            tension: dataset.tension || 0.4
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12,
                  weight: '500'
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: 'rgba(102, 126, 234, 0.5)',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true
            }
          },
          scales: type !== 'pie' && type !== 'doughnut' ? {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            }
          } : {},
          ...options
        }
      };

      const newChart = new Chart(ctx, chartConfig);
      setChartInstance(newChart);
    }

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [Chart, data, type, options]);

  if (!Chart) {
    return (
      <div style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '2px dashed #e2e8f0'
      }}>
        <Text>Loading chart...</Text>
      </div>
    );
  }

  return (
    <Card 
      style={{ margin: '16px 0', borderRadius: '12px' }}
      bodyStyle={{ padding: '20px' }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChartOutlined style={{ color: '#667eea' }} />
          <Text strong>Data Visualization</Text>
        </div>
      }
      extra={
        <Space>
          <Button 
            size="small" 
            icon={<DownloadOutlined />}
            onClick={() => {
              const link = document.createElement('a');
              link.download = 'chart.png';
              link.href = canvasRef.current.toDataURL();
              link.click();
            }}
          >
            Download
          </Button>
        </Space>
      }
    >
      <div style={{ height: '400px', position: 'relative' }}>
        <canvas ref={canvasRef} />
      </div>
    </Card>
  );
};

// Enhanced Table Component with better styling
const EnhancedTable = ({ headers, rows }) => {
  const columns = headers.map((header, index) => ({
    title: header,
    dataIndex: `col_${index}`,
    key: `col_${index}`,
    sorter: (a, b) => {
      const aVal = a[`col_${index}`];
      const bVal = b[`col_${index}`];
      
      // Try to sort as numbers first
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      
      // Fallback to string sorting
      return String(aVal).localeCompare(String(bVal));
    },
    render: (text) => {
      // Enhanced cell rendering with number formatting
      if (typeof text === 'number' || !isNaN(parseFloat(text))) {
        const num = parseFloat(text);
        if (num > 1000) {
          return num.toLocaleString();
        }
      }
      return text;
    }
  }));

  const dataSource = rows.map((row, index) => {
    const rowData = { key: index };
    row.forEach((cell, cellIndex) => {
      rowData[`col_${cellIndex}`] = cell;
    });
    return rowData;
  });

  return (
    <Card 
      style={{ margin: '16px 0', borderRadius: '12px' }}
      bodyStyle={{ padding: '20px' }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EyeOutlined style={{ color: '#667eea' }} />
          <Text strong>Data Table</Text>
        </div>
      }
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
        }}
        size="middle"
        bordered
        style={{
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
    </Card>
  );
};

// Chart Detection and Parsing
const parseChartData = (content) => {
  // Look for chart blocks with various formats
  const chartPatterns = [
    // JSON chart data
    /```(?:chart|graph|plot)\s*\n([\s\S]*?)\n```/gi,
    // Table that can be converted to chart
    /\|(.+)\|\s*\n\|[-\s|:]+\|\s*\n((?:\|.+\|\s*\n?)+)/gi,
    // CSV-like data
    /```(?:csv|data)\s*\n([\s\S]*?)\n```/gi
  ];

  const charts = [];
  
  chartPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      try {
        if (pattern.source.includes('chart|graph|plot')) {
          // Try to parse as JSON chart configuration
          const chartData = JSON.parse(match[1]);
          charts.push({
            type: 'chart',
            data: chartData,
            originalText: match[0]
          });
        } else if (pattern.source.includes('csv|data')) {
          // Parse CSV data and convert to chart
          const lines = match[1].trim().split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim()));
          
          // Convert to chart data if numeric
          if (headers.length >= 2 && rows.length > 0) {
            const isNumeric = rows.every(row => 
              row.slice(1).every(cell => !isNaN(parseFloat(cell)))
            );
            
            if (isNumeric) {
              const chartData = {
                type: 'bar',
                data: {
                  labels: rows.map(row => row[0]),
                  datasets: headers.slice(1).map((header, i) => ({
                    label: header,
                    data: rows.map(row => parseFloat(row[i + 1]))
                  }))
                }
              };
              
              charts.push({
                type: 'chart',
                data: chartData,
                originalText: match[0]
              });
            }
          }
        }
      } catch (error) {
        console.warn('Failed to parse chart data:', error);
      }
    }
  });

  return charts;
};

const MarkdownRenderer = ({ content, className = '', theme = 'light' }) => {
  const [processedContent, setProcessedContent] = useState(content);
  const [detectedCharts, setDetectedCharts] = useState([]);

  useEffect(() => {
    if (content) {
      // Detect and extract charts
      const charts = parseChartData(content);
      setDetectedCharts(charts);

      // Remove chart blocks from content and replace with placeholders
      let processed = content;
      charts.forEach((chart, index) => {
        processed = processed.replace(chart.originalText, `[CHART_${index}]`);
      });

      setProcessedContent(processed);
    }
  }, [content]);

  // Debug the content being passed
  console.log('MarkdownRenderer content:', content?.substring(0, 200));

  const components = {
    // BOLD TEXT - this is the key missing component
    strong: ({ children, ...props }) => (
      <strong style={{ 
        fontWeight: '700',
        color: theme === 'dark' ? '#e6edf3' : '#24292f'
      }} {...props}>
        {children}
      </strong>
    ),
    
    // ITALIC TEXT - this is also missing
    em: ({ children, ...props }) => (
      <em style={{ 
        fontStyle: 'italic',
        color: theme === 'dark' ? '#e6edf3' : '#24292f'
      }} {...props}>
        {children}
      </em>
    ),
    
    // Enhanced Table Support
    table: ({ children, ...props }) => {
      // Extract table data for enhanced rendering
      const tableElement = React.Children.toArray(children).find(child => child.type === 'tbody');
      const headerElement = React.Children.toArray(children).find(child => child.type === 'thead');
      
      if (headerElement && tableElement) {
        try {
          // Convert to enhanced table format
          const headers = [];
          const rows = [];
          
          // This is a simplified extraction - in practice you'd need more robust parsing
          return (
            <Card style={{ margin: '16px 0', borderRadius: '8px' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                {children}
              </table>
            </Card>
          );
        } catch (error) {
          console.warn('Table parsing error:', error);
        }
      }
      
      return (
        <Card style={{ margin: '16px 0', borderRadius: '8px' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            {children}
          </table>
        </Card>
      );
    },
    
    // Fallback table components for simple rendering
    thead: ({ children, ...props }) => (
      <thead style={{ backgroundColor: theme === 'dark' ? '#21262d' : '#f6f8fa' }} {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => (
      <tbody {...props}>{children}</tbody>
    ),
    tr: ({ children, ...props }) => (
      <tr style={{ borderBottom: '1px solid ' + (theme === 'dark' ? '#21262d' : '#d8dee4') }} {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th style={{
        padding: '12px',
        fontWeight: '600',
        backgroundColor: theme === 'dark' ? '#21262d' : '#f6f8fa',
        color: theme === 'dark' ? '#e6edf3' : '#24292f',
        border: '1px solid ' + (theme === 'dark' ? '#21262d' : '#d8dee4')
      }} {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td style={{
        padding: '12px',
        color: theme === 'dark' ? '#e6edf3' : '#24292f',
        border: '1px solid ' + (theme === 'dark' ? '#21262d' : '#d8dee4')
      }} {...props}>
        {children}
      </td>
    ),
    
    // Paragraphs
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
    
    // Headings
    h1: (props) => (
      <Title level={1} style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        marginBottom: '16px', 
        marginTop: '24px',
        color: theme === 'dark' ? '#e6edf3' : '#24292f',
        borderBottom: '2px solid ' + (theme === 'dark' ? '#21262d' : '#d8dee4'),
        paddingBottom: '8px'
      }} {...props} />
    ),
    h2: (props) => (
      <Title level={2} style={{ 
        fontSize: '24px', 
        fontWeight: '600', 
        marginBottom: '14px', 
        marginTop: '20px',
        color: theme === 'dark' ? '#e6edf3' : '#24292f'
      }} {...props} />
    ),
    h3: (props) => (
      <Title level={3} style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        marginBottom: '12px', 
        marginTop: '18px',
        color: theme === 'dark' ? '#e6edf3' : '#24292f'
      }} {...props} />
    ),
    h4: (props) => (
      <Title level={4} style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        marginBottom: '10px', 
        marginTop: '16px',
        color: theme === 'dark' ? '#8b949e' : '#656d76'
      }} {...props} />
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
      <li style={{ 
        marginBottom: '4px', 
        lineHeight: '1.6',
        color: theme === 'dark' ? '#e6edf3' : '#24292f'
      }} {...props}>
        {children}
      </li>
    ),
    
    // Links
    a: ({ href, children, ...props }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#1890ff',
          textDecoration: 'underline'
        }}
        {...props}
      >
        {children}
      </a>
    ),
    
    // Code - inline and blocks
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
    
    // Blockquotes
    blockquote: ({ children, ...props }) => (
      <blockquote style={{
        margin: '16px 0',
        padding: '12px 16px',
        borderLeft: '4px solid #1890ff',
        backgroundColor: theme === 'dark' ? '#161b22' : '#f6f8fa',
        color: theme === 'dark' ? '#8b949e' : '#656d76',
        fontStyle: 'italic'
      }} {...props}>
        {children}
      </blockquote>
    ),

    // Horizontal rules
    hr: (props) => (
      <hr style={{
        margin: '24px 0',
        border: 'none',
        borderTop: '2px solid ' + (theme === 'dark' ? '#21262d' : '#d8dee4')
      }} {...props} />
    )
  };

  // Render content with chart replacements
  const renderContentWithCharts = () => {
    let parts = [processedContent];
    
    detectedCharts.forEach((chart, index) => {
      const placeholder = `[CHART_${index}]`;
      const newParts = [];
      
      parts.forEach(part => {
        if (typeof part === 'string' && part.includes(placeholder)) {
          const splitParts = part.split(placeholder);
          newParts.push(splitParts[0]);
          newParts.push(
            <ChartComponent 
              key={`chart-${index}`}
              type={chart.data.type}
              data={chart.data.data}
              options={chart.data.options}
            />
          );
          newParts.push(splitParts[1]);
        } else {
          newParts.push(part);
        }
      });
      
      parts = newParts;
    });
    
    return parts;
  };

  if (!content) {
    return <div style={{ color: '#999' }}>No content to display</div>;
  }

  return (
    <div 
      className={`markdown-content ${className}`} 
      style={{ 
        lineHeight: '1.7',
        color: theme === 'dark' ? '#e6edf3' : '#24292f',
        background: 'transparent',
        fontSize: '15px',
        wordWrap: 'break-word'
      }}
    >
      {renderContentWithCharts()}
    </div>
  );
};

export default MarkdownRenderer; 