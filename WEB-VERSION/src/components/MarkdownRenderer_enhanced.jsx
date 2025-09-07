import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Typography, Progress, Statistic, Row, Col, Tag, Tooltip, Alert } from 'antd';
import { 
  DownloadOutlined, 
  EyeOutlined, 
  BarChartOutlined, 
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
  CopyOutlined,
  CheckOutlined
} from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;

// Built-in SVG Chart Components
const BarChart = ({ data, width = 600, height = 400, title = "Bar Chart" }) => {
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = chartWidth / data.length * 0.8;
  const barSpacing = chartWidth / data.length * 0.2;

  const colors = [
    '#667eea', '#764ba2', '#06b6d4', '#8b5cf6', 
    '#ec4899', '#22c55e', '#fb923c', '#ef4444'
  ];

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChartOutlined style={{ color: '#667eea' }} />
          <Text strong>{title}</Text>
        </div>
      }
      style={{ margin: '16px 0', borderRadius: '12px' }}
    >
      <svg width={width} height={height} style={{ border: '1px solid #f0f0f0', borderRadius: '8px' }}>
        {/* Chart Background */}
        <rect width={width} height={height} fill="#fafafa" />
        
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = margin.top + chartHeight * ratio;
          return (
            <g key={i}>
              <line 
                x1={margin.left} 
                y1={y} 
                x2={width - margin.right} 
                y2={y} 
                stroke="#e0e0e0" 
                strokeWidth="1"
              />
              <text 
                x={margin.left - 10} 
                y={y + 4} 
                textAnchor="end" 
                fontSize="12" 
                fill="#666"
              >
                {Math.round(maxValue * (1 - ratio))}
              </text>
            </g>
          );
        })}
        
        {/* Bars */}
        {data.map((item, index) => {
          const x = margin.left + index * (barWidth + barSpacing) + barSpacing / 2;
          const barHeight = (item.value / maxValue) * chartHeight;
          const y = margin.top + chartHeight - barHeight;
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={colors[index % colors.length]}
                rx="4"
                ry="4"
              />
              <text
                x={x + barWidth / 2}
                y={height - margin.bottom + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {item.label}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fontSize="12"
                fill="#333"
                fontWeight="bold"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
};

const LineChart = ({ data, width = 600, height = 400, title = "Line Chart" }) => {
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue;

  const points = data.map((item, index) => {
    const x = margin.left + (index / (data.length - 1)) * chartWidth;
    const y = margin.top + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LineChartOutlined style={{ color: '#667eea' }} />
          <Text strong>{title}</Text>
        </div>
      }
      style={{ margin: '16px 0', borderRadius: '12px' }}
    >
      <svg width={width} height={height} style={{ border: '1px solid #f0f0f0', borderRadius: '8px' }}>
        <rect width={width} height={height} fill="#fafafa" />
        
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = margin.top + chartHeight * ratio;
          return (
            <g key={i}>
              <line 
                x1={margin.left} 
                y1={y} 
                x2={width - margin.right} 
                y2={y} 
                stroke="#e0e0e0" 
                strokeWidth="1"
              />
              <text 
                x={margin.left - 10} 
                y={y + 4} 
                textAnchor="end" 
                fontSize="12" 
                fill="#666"
              >
                {Math.round(minValue + (maxValue - minValue) * (1 - ratio))}
              </text>
            </g>
          );
        })}
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#667eea"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data Points */}
        {data.map((item, index) => {
          const x = margin.left + (index / (data.length - 1)) * chartWidth;
          const y = margin.top + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
          
          return (
            <g key={index}>
              <circle cx={x} cy={y} r="6" fill="#667eea" stroke="#fff" strokeWidth="2" />
              <text
                x={x}
                y={height - margin.bottom + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
};

const PieChart = ({ data, width = 400, height = 400, title = "Pie Chart" }) => {
  const radius = Math.min(width, height) / 2 - 40;
  const centerX = width / 2;
  const centerY = height / 2;
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = [
    '#667eea', '#764ba2', '#06b6d4', '#8b5cf6', 
    '#ec4899', '#22c55e', '#fb923c', '#ef4444'
  ];

  let currentAngle = 0;
  const slices = data.map((item, index) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    currentAngle += sliceAngle;
    
    return {
      path: pathData,
      color: colors[index % colors.length],
      label: item.label,
      value: item.value,
      percentage: ((item.value / total) * 100).toFixed(1)
    };
  });

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChartOutlined style={{ color: '#667eea' }} />
          <Text strong>{title}</Text>
        </div>
      }
      style={{ margin: '16px 0', borderRadius: '12px' }}
    >
      <Row>
        <Col span={12}>
          <svg width={width} height={height}>
            <rect width={width} height={height} fill="#fafafa" />
            {slices.map((slice, index) => (
              <path
                key={index}
                d={slice.path}
                fill={slice.color}
                stroke="#fff"
                strokeWidth="2"
              />
            ))}
          </svg>
        </Col>
        <Col span={12}>
          <div style={{ padding: '20px' }}>
            {slices.map((slice, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div 
                  style={{ 
                    width: '16px', 
                    height: '16px', 
                    backgroundColor: slice.color, 
                    borderRadius: '4px',
                    marginRight: '12px'
                  }} 
                />
                <div>
                  <Text strong>{slice.label}</Text>
                  <br />
                  <Text type="secondary">{slice.value} ({slice.percentage}%)</Text>
                </div>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

// Enhanced Table Component
const EnhancedTable = ({ headers, rows, title = "Data Table" }) => {
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    setSortedData(rows);
  }, [rows]);

  const columns = headers.map((header, index) => ({
    title: header,
    dataIndex: `col_${index}`,
    key: `col_${index}`,
    sorter: (a, b) => {
      const aVal = a[`col_${index}`];
      const bVal = b[`col_${index}`];
      
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      
      return String(aVal).localeCompare(String(bVal));
    },
    render: (text) => {
      if (typeof text === 'number' || !isNaN(parseFloat(text))) {
        const num = parseFloat(text);
        if (num > 1000) {
          return (
            <Statistic 
              value={num} 
              precision={0} 
              valueStyle={{ fontSize: '14px' }}
            />
          );
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

  // Check if we can create a chart from this data
  const canCreateChart = headers.length >= 2 && rows.length > 0;
  const hasNumericData = canCreateChart && rows.every(row => 
    row.slice(1).some(cell => !isNaN(parseFloat(cell)))
  );

  const createChartData = () => {
    if (!hasNumericData) return null;
    
    return rows.map(row => ({
      label: row[0],
      value: parseFloat(row[1]) || 0
    }));
  };

  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState('bar');

  return (
    <div style={{ margin: '16px 0' }}>
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TableOutlined style={{ color: '#667eea' }} />
            <Text strong>{title}</Text>
          </div>
        }
        extra={
          <Space>
            {hasNumericData && (
              <Space>
                <Button
                  size="small"
                  type={showChart ? 'primary' : 'default'}
                  icon={<BarChartOutlined />}
                  onClick={() => {
                    setShowChart(!showChart);
                    setChartType('bar');
                  }}
                >
                  Bar Chart
                </Button>
                <Button
                  size="small"
                  type={showChart && chartType === 'line' ? 'primary' : 'default'}
                  icon={<LineChartOutlined />}
                  onClick={() => {
                    setShowChart(!showChart);
                    setChartType('line');
                  }}
                >
                  Line Chart
                </Button>
                <Button
                  size="small"
                  type={showChart && chartType === 'pie' ? 'primary' : 'default'}
                  icon={<PieChartOutlined />}
                  onClick={() => {
                    setShowChart(!showChart);
                    setChartType('pie');
                  }}
                >
                  Pie Chart
                </Button>
              </Space>
            )}
            <Button 
              size="small" 
              icon={<CopyOutlined />}
              onClick={() => {
                const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
                navigator.clipboard.writeText(csvContent);
              }}
            >
              Copy CSV
            </Button>
          </Space>
        }
        style={{ borderRadius: '12px' }}
      >
        {showChart && hasNumericData && (
          <div style={{ marginBottom: '24px' }}>
            {chartType === 'bar' && <BarChart data={createChartData()} title={`${title} - Bar Chart`} />}
            {chartType === 'line' && <LineChart data={createChartData()} title={`${title} - Line Chart`} />}
            {chartType === 'pie' && <PieChart data={createChartData()} title={`${title} - Pie Chart`} />}
          </div>
        )}
        
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
          style={{ borderRadius: '8px', overflow: 'hidden' }}
        />
      </Card>
    </div>
  );
};

// Chart Detection and Data Parsing
const parseChartData = (content) => {
  const charts = [];
  
  // Parse table markdown and convert to charts
  const tableRegex = /\|(.+)\|\s*\n\|[-\s|:]+\|\s*\n((?:\|.+\|\s*\n?)+)/g;
  let match;
  
  while ((match = tableRegex.exec(content)) !== null) {
    try {
      const headers = match[1].split('|').map(h => h.trim()).filter(h => h);
      const rowsText = match[2].trim();
      const rows = rowsText.split('\n').map(row => 
        row.split('|').map(cell => cell.trim()).filter(cell => cell)
      );
      
      if (headers.length >= 2 && rows.length > 0) {
        // Check if we have numeric data for charting
        const hasNumericData = rows.every(row => 
          row.slice(1).some(cell => !isNaN(parseFloat(cell)))
        );
        
        if (hasNumericData) {
          const chartData = rows.map(row => ({
            label: row[0],
            value: parseFloat(row[1]) || 0
          }));
          
          charts.push({
            type: 'chart',
            data: chartData,
            headers: headers,
            rows: rows,
            originalText: match[0]
          });
        } else {
          charts.push({
            type: 'table',
            headers: headers,
            rows: rows,
            originalText: match[0]
          });
        }
      }
    } catch (error) {
      console.warn('Failed to parse table:', error);
    }
  }
  
  // Parse CSV-like data blocks
  const csvRegex = /```(?:csv|data)\s*\n([\s\S]*?)\n```/g;
  while ((match = csvRegex.exec(content)) !== null) {
    try {
      const lines = match[1].trim().split('\n');
      if (lines.length >= 2) {
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim()));
        
        const hasNumericData = rows.every(row => 
          row.slice(1).some(cell => !isNaN(parseFloat(cell)))
        );
        
        if (hasNumericData && headers.length >= 2) {
          const chartData = rows.map(row => ({
            label: row[0],
            value: parseFloat(row[1]) || 0
          }));
          
          charts.push({
            type: 'chart',
            data: chartData,
            headers: headers,
            rows: rows,
            originalText: match[0]
          });
        }
      }
    } catch (error) {
      console.warn('Failed to parse CSV data:', error);
    }
  }
  
  return charts;
};

const MarkdownRenderer = ({ content, theme = 'light' }) => {
  const [processedContent, setProcessedContent] = useState(content);
  const [detectedCharts, setDetectedCharts] = useState([]);
  const [copiedStates, setCopiedStates] = useState({});

  useEffect(() => {
    if (content) {
      const charts = parseChartData(content);
      setDetectedCharts(charts);

      let processed = content;
      charts.forEach((chart, index) => {
        processed = processed.replace(chart.originalText, `[CHART_${index}]`);
      });

      setProcessedContent(processed);
    }
  }, [content]);

  // Enhanced syntax highlighting colors
  const getSyntaxHighlighting = (language, text) => {
    const keywords = {
      javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'class', 'extends'],
      python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'return', 'try', 'except', 'with'],
      java: ['public', 'private', 'class', 'interface', 'extends', 'implements', 'static', 'final', 'void', 'int', 'String'],
      css: ['background', 'color', 'border', 'margin', 'padding', 'display', 'position', 'font-size', 'width', 'height'],
      html: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'body', 'head', 'html', 'script', 'style'],
      sql: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE']
    };

    const langKeywords = keywords[language?.toLowerCase()] || [];
    let highlightedText = text;

    // Apply syntax highlighting
    langKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<span style="color: ${theme === 'dark' ? '#f97583' : '#d73a49'}; font-weight: 600;">${keyword}</span>`);
    });

    // Highlight strings
    highlightedText = highlightedText.replace(
      /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g,
      `<span style="color: ${theme === 'dark' ? '#9ecbff' : '#032f62'};">$1$2$3</span>`
    );

    // Highlight comments
    highlightedText = highlightedText.replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
      `<span style="color: ${theme === 'dark' ? '#6a737d' : '#6a737d'}; font-style: italic;">$1</span>`
    );

    // Highlight numbers
    highlightedText = highlightedText.replace(
      /\b(\d+\.?\d*)\b/g,
      `<span style="color: ${theme === 'dark' ? '#79b8ff' : '#005cc5'};">$1</span>`
    );

    return highlightedText;
  };

  // Copy to clipboard function
  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Enhanced table parsing
  const parseTable = (lines, startIndex) => {
    const tableLines = [];
    let currentIndex = startIndex;
    
    // Collect table lines
    while (currentIndex < lines.length && lines[currentIndex].includes('|')) {
      tableLines.push(lines[currentIndex]);
      currentIndex++;
    }

    if (tableLines.length < 2) return { element: null, endIndex: startIndex };

    // Parse header
    const headerRow = tableLines[0].split('|').map(cell => cell.trim()).filter(cell => cell);
    
    // Parse separator (skip it)
    const dataRows = tableLines.slice(2).map(row => 
      row.split('|').map(cell => cell.trim()).filter(cell => cell)
    );

    const columns = headerRow.map((header, index) => ({
      title: header,
      dataIndex: `col${index}`,
      key: `col${index}`,
      render: (text) => parseInlineFormatting(text || ''),
    }));

    const dataSource = dataRows.map((row, index) => {
      const rowData = { key: index };
      row.forEach((cell, cellIndex) => {
        rowData[`col${cellIndex}`] = cell;
      });
      return rowData;
    });

    const tableElement = (
      <div style={{ margin: '20px 0' }}>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size="small"
          bordered
          style={{
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          }}
        />
      </div>
    );

    return { element: tableElement, endIndex: currentIndex };
  };

  // Enhanced chart detection and rendering
  const renderChart = (content) => {
    // Simple bar chart detection
    if (content.includes('Bar Chart:') || content.includes('bar_chart')) {
      return renderBarChart(content);
    }
    
    // Line chart detection
    if (content.includes('Line Chart:') || content.includes('line_chart')) {
      return renderLineChart(content);
    }
    
    // Pie chart detection
    if (content.includes('Pie Chart:') || content.includes('pie_chart')) {
      return renderPieChart(content);
    }

    return null;
  };

  // Simple SVG bar chart renderer
  const renderBarChart = (content) => {
    const data = extractChartData(content);
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const chartWidth = 400;
    const chartHeight = 300;
    const barWidth = chartWidth / data.length * 0.8;
    const spacing = chartWidth / data.length * 0.2;

    return (
      <Card style={{ margin: '20px 0' }} title="📊 Bar Chart">
        <svg width={chartWidth} height={chartHeight + 50} style={{ overflow: 'visible' }}>
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = index * (barWidth + spacing) + spacing / 2;
            const y = chartHeight - barHeight;
            
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={`hsl(${index * 60}, 70%, 50%)`}
                  rx={4}
                />
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill={theme === 'dark' ? '#e6edf3' : '#24292f'}
                >
                  {item.label}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill={theme === 'dark' ? '#e6edf3' : '#24292f'}
                >
                  {item.value}
                </text>
              </g>
            );
          })}
        </svg>
      </Card>
    );
  };

  // Simple line chart renderer
  const renderLineChart = (content) => {
    const data = extractChartData(content);
    if (!data || data.length === 0) return null;

    const chartWidth = 400;
    const chartHeight = 300;
    const maxValue = Math.max(...data.map(d => d.value));
    const stepX = chartWidth / (data.length - 1);

    const points = data.map((item, index) => {
      const x = index * stepX;
      const y = chartHeight - (item.value / maxValue) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <Card style={{ margin: '20px 0' }} title="📈 Line Chart">
        <svg width={chartWidth} height={chartHeight + 50}>
          <polyline
            points={points}
            fill="none"
            stroke={theme === 'dark' ? '#58a6ff' : '#0969da'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((item, index) => {
            const x = index * stepX;
            const y = chartHeight - (item.value / maxValue) * chartHeight;
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={theme === 'dark' ? '#58a6ff' : '#0969da'}
                />
                <text
                  x={x}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill={theme === 'dark' ? '#e6edf3' : '#24292f'}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </Card>
    );
  };

  // Extract chart data from content
  const extractChartData = (content) => {
    // Look for data patterns like "Label: Value" or "Label | Value"
    const lines = content.split('\n');
    const data = [];
    
    for (const line of lines) {
      const match = line.match(/([^:|\d]+)[:|\s]+(\d+\.?\d*)/);
      if (match) {
        data.push({
          label: match[1].trim(),
          value: parseFloat(match[2])
        });
      }
    }
    
    return data.length > 0 ? data : [
      { label: 'Sample A', value: 10 },
      { label: 'Sample B', value: 20 },
      { label: 'Sample C', value: 15 }
    ];
  };

  // Enhanced content renderer
  const renderContent = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let currentList = [];
    let inCodeBlock = false;
    let codeContent = '';
    let codeLanguage = '';
    let i = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${i}`} style={{
            paddingLeft: '24px',
            marginBottom: '20px',
            color: theme === 'dark' ? '#e6edf3' : '#24292f'
          }}>
            {currentList}
          </ul>
        );
        currentList = [];
      }
    };

    while (i < lines.length) {
      const line = lines[i];

      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          const codeId = `code-${Date.now()}-${Math.random()}`;
          elements.push(
            <Card 
              key={codeId}
              style={{ 
                margin: '20px 0',
                backgroundColor: theme === 'dark' ? '#0d1117' : '#f6f8fa',
                border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`
              }}
              bodyStyle={{ padding: '0' }}
              title={
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: '12px',
                  color: theme === 'dark' ? '#8b949e' : '#656d76'
                }}>
                  <span>{codeLanguage || 'Code'}</span>
                  <Button
                    type="text"
                    size="small"
                    icon={copiedStates[codeId] ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={() => copyToClipboard(codeContent, codeId)}
                    style={{ 
                      color: copiedStates[codeId] ? '#28a745' : theme === 'dark' ? '#8b949e' : '#656d76'
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
                borderRadius: '0 0 8px 8px',
                fontSize: '14px',
                lineHeight: '1.6',
                overflow: 'auto',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                border: 'none'
              }}>
                <code 
                  dangerouslySetInnerHTML={{ 
                    __html: getSyntaxHighlighting(codeLanguage, codeContent) 
                  }}
                />
              </pre>
            </Card>
          );
          inCodeBlock = false;
          codeContent = '';
          codeLanguage = '';
        } else {
          // Start code block
          flushList();
          inCodeBlock = true;
          codeLanguage = line.substring(3).trim();
        }
        i++;
        continue;
      }

      if (inCodeBlock) {
        codeContent += (codeContent ? '\n' : '') + line;
        i++;
        continue;
      }

      // Check for tables
      if (line.includes('|') && lines[i + 1]?.includes('|')) {
        flushList();
        const tableResult = parseTable(lines, i);
        if (tableResult.element) {
          elements.push(tableResult.element);
          i = tableResult.endIndex;
          continue;
        }
      }

      // Check for charts
      const chartElement = renderChart(line);
      if (chartElement) {
        flushList();
        elements.push(chartElement);
        i++;
        continue;
      }

      // Handle headers (lines starting and ending with **)
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        flushList();
        const headerText = line.slice(2, -2);
        elements.push(
          <Title 
            key={`header-${i}`} 
            level={3} 
            style={{ 
              color: theme === 'dark' ? '#e6edf3' : '#24292f',
              fontSize: '22px',
              fontWeight: 700,
              marginTop: '32px',
              marginBottom: '16px',
              borderBottom: `2px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
              paddingBottom: '12px'
            }}
          >
            {headerText}
          </Title>
        );
        i++;
        continue;
      }

      // Handle special content blocks
      if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <Alert
            key={`quote-${i}`}
            message={parseInlineFormatting(line.slice(2))}
            type="info"
            showIcon
            style={{ 
              margin: '16px 0',
              backgroundColor: theme === 'dark' ? '#1c2128' : '#f6f8fa',
              border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`
            }}
          />
        );
        i++;
        continue;
      }

      // Handle list items
      if (line.trim().startsWith('*   ') || line.trim().startsWith('* ')) {
        const listText = line.trim().startsWith('*   ') ? line.trim().slice(4) : line.trim().slice(2);
        currentList.push(
          <li key={`li-${i}`} style={{ 
            marginBottom: '8px', 
            lineHeight: '1.7'
          }}>
            {parseInlineFormatting(listText)}
          </li>
        );
        i++;
        continue;
      }

      // Handle regular paragraphs
      if (line.trim()) {
        flushList();
        elements.push(
          <Paragraph 
            key={`p-${i}`} 
            style={{
              color: theme === 'dark' ? '#e6edf3' : '#24292f',
              fontSize: '16px',
              lineHeight: '1.7',
              marginBottom: '16px'
            }}
          >
            {parseInlineFormatting(line)}
          </Paragraph>
        );
      } else {
        flushList();
      }

      i++;
    }

    // Flush any remaining list
    flushList();

    return elements;
  };

  // Enhanced inline formatting parser
  const parseInlineFormatting = (text) => {
    if (!text) return text;

    const elements = [];
    let remaining = text;
    let keyCounter = 0;

    // Process LaTeX math expressions first
    const mathRegex = /\$\$(.+?)\$\$|\$(.+?)\$/g;
    let lastIndex = 0;
    let match;

    while ((match = mathRegex.exec(text)) !== null) {
      // Add text before math
      if (match.index > lastIndex) {
        elements.push(remaining.substring(lastIndex, match.index));
      }
      
      // Add math expression
      const mathContent = match[1] || match[2];
      const isBlock = !!match[1];
      
      elements.push(
        <span 
          key={`math-${keyCounter++}`}
          style={{
            backgroundColor: theme === 'dark' ? '#1c2128' : '#f6f8fa',
            color: theme === 'dark' ? '#e6edf3' : '#24292f',
            padding: isBlock ? '12px' : '4px 6px',
            borderRadius: '4px',
            border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`,
            fontFamily: 'Computer Modern, serif',
            fontSize: isBlock ? '18px' : '16px',
            display: isBlock ? 'block' : 'inline',
            textAlign: isBlock ? 'center' : 'inherit',
            margin: isBlock ? '16px 0' : '0 2px'
          }}
          title="Mathematical Expression"
        >
          {mathContent}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }

    // If no math found, process normally
    if (elements.length === 0) {
      return processTextFormatting(text);
    }

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(processTextFormatting(text.substring(lastIndex)));
    }

    return elements;
  };

  // Process bold, italic, and code formatting
  const processTextFormatting = (text) => {
    if (!text) return text;

    let result = text;
    const elements = [];
    let keyCounter = 0;

    // Process bold text
    result = result.replace(/\*\*(.+?)\*\*/g, (match, p1) => {
      const key = `bold-${keyCounter++}`;
      elements.push(
        <strong 
          key={key}
          style={{ 
            fontWeight: 700,
            color: theme === 'dark' ? '#e6edf3' : '#24292f'
          }}
        >
          {p1}
        </strong>
      );
      return `__ELEMENT_${key}__`;
    });

    // Process italic text
    result = result.replace(/\*(.+?)\*/g, (match, p1) => {
      const key = `italic-${keyCounter++}`;
      elements.push(
        <em 
          key={key}
          style={{ 
            fontStyle: 'italic',
            color: theme === 'dark' ? '#e6edf3' : '#656d76'
          }}
        >
          {p1}
        </em>
      );
      return `__ELEMENT_${key}__`;
    });

    // Process inline code
    result = result.replace(/`(.+?)`/g, (match, p1) => {
      const key = `code-${keyCounter++}`;
      elements.push(
        <code 
          key={key}
          style={{
            backgroundColor: theme === 'dark' ? '#1c2128' : '#f6f8fa',
            color: theme === 'dark' ? '#f0f6fc' : '#24292f',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '85%',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            border: `1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'}`
          }}
        >
          {p1}
        </code>
      );
      return `__ELEMENT_${key}__`;
    });

    // Reconstruct with elements
    const parts = result.split(/(__ELEMENT_[^_]+__)/);
    return parts.map(part => {
      const elementMatch = part.match(/__ELEMENT_(.+)__/);
      if (elementMatch) {
        return elements.find(el => el.key === elementMatch[1]) || part;
      }
      return part;
    });
  };

  return (
    <div style={{
      background: 'transparent',
      color: theme === 'dark' ? '#e6edf3' : '#24292f',
      fontSize: '16px',
      lineHeight: '1.7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
    }}>
      {renderContent(content)}
    </div>
  );
};

export default MarkdownRenderer; 