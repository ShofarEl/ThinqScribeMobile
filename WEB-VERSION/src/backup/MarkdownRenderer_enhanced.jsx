import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Typography, Progress, Statistic, Row, Col, Tag, Tooltip } from 'antd';
import { 
  DownloadOutlined, 
  EyeOutlined, 
  BarChartOutlined, 
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
  CopyOutlined 
} from '@ant-design/icons';

const { Text, Title } = Typography;

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

  // Simple markdown to React converter
  const parseMarkdown = (text) => {
    if (!text) return text;
    
    // Handle mathematical expressions
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Handle headers
    text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Handle code blocks
    text = text.replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```/g, '').trim();
      return `<pre><code>${code}</code></pre>`;
    });
    
    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle line breaks
    text = text.replace(/\n\n/g, '</p><p>');
    text = text.replace(/\n/g, '<br/>');
    
    // Handle bullet points
    text = text.replace(/^\*\s+(.+)$/gim, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    return text;
  };

  const renderContentWithCharts = () => {
    let content = processedContent || '';
    
    // Replace charts
    detectedCharts.forEach((item, index) => {
      const placeholder = `[CHART_${index}]`;
      if (content.includes(placeholder)) {
        const beforeChart = content.split(placeholder)[0];
        const afterChart = content.split(placeholder)[1];
        
        content = beforeChart + `<!-- CHART_${index} -->` + afterChart;
      }
    });

    // Split content into sections
    const sections = content.split(/<!-- CHART_\d+ -->/);
    const result = [];

    sections.forEach((section, index) => {
      if (section.trim()) {
        // Render markdown section
        const parsedHtml = parseMarkdown(section);
        result.push(
          <div 
            key={`section-${index}`}
            dangerouslySetInnerHTML={{ __html: parsedHtml }}
            style={{
              color: theme === 'dark' ? '#ffffff' : '#1f2937',
              lineHeight: '1.7',
              fontSize: '15px'
            }}
          />
        );
      }

      // Add chart if it exists for this position
      const chartIndex = index;
      if (detectedCharts[chartIndex]) {
        const chart = detectedCharts[chartIndex];
        if (chart.type === 'chart') {
          result.push(
            <div key={`chart-${chartIndex}`} style={{ margin: '20px 0' }}>
              <BarChart data={chart.data} title="Data Visualization" />
              <div style={{ marginTop: '16px' }}>
                <LineChart data={chart.data} title="Trend Analysis" />
              </div>
              <div style={{ marginTop: '16px' }}>
                <PieChart data={chart.data} title="Distribution" />
              </div>
              <EnhancedTable 
                headers={chart.headers} 
                rows={chart.rows} 
                title="Source Data"
              />
            </div>
          );
        } else if (chart.type === 'table') {
          result.push(
            <EnhancedTable 
              key={`table-${chartIndex}`}
              headers={chart.headers} 
              rows={chart.rows} 
              title="Data Table"
            />
          );
        }
      }
    });

    return result;
  };

  return (
    <div style={{ 
      background: 'transparent',
      color: theme === 'dark' ? '#ffffff' : '#1f2937',
      fontSize: '15px',
      lineHeight: '1.7'
    }}>
      <style>{`
        h1, h2, h3, h4, h5, h6 {
          color: ${theme === 'dark' ? '#ffffff' : '#1f2937'};
          margin-top: 24px;
          margin-bottom: 12px;
          font-weight: 600;
        }
        h1 { font-size: 28px; margin-top: 32px; }
        h2 { font-size: 24px; margin-top: 28px; }
        h3 { font-size: 20px; margin-top: 24px; }
        
        strong {
          font-weight: 600;
          color: ${theme === 'dark' ? '#ffffff' : '#1f2937'};
        }
        
        em {
          font-style: italic;
          color: ${theme === 'dark' ? '#e5e7eb' : '#374151'};
        }
        
        p {
          margin-bottom: 16px;
          line-height: 1.7;
        }
        
        ul {
          padding-left: 20px;
          margin-bottom: 16px;
        }
        
        li {
          margin-bottom: 8px;
          line-height: 1.6;
        }
        
        code {
          background-color: ${theme === 'dark' ? '#374151' : '#f1f5f9'};
          color: ${theme === 'dark' ? '#e5e7eb' : '#1e293b'};
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
        
        pre {
          background-color: ${theme === 'dark' ? '#0f172a' : '#ffffff'};
          color: ${theme === 'dark' ? '#e2e8f0' : '#1e293b'};
          padding: 16px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
          overflow: auto;
          margin: 16px 0;
          border: 1px solid ${theme === 'dark' ? '#374151' : '#e2e8f0'};
        }
        
        pre code {
          background: none;
          padding: 0;
          color: inherit;
        }
        
        blockquote {
          border-left: 4px solid #667eea;
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
          background-color: ${theme === 'dark' ? '#374151' : '#f8fafc'};
          padding: 16px;
          border-radius: 8px;
        }
      `}</style>
      {renderContentWithCharts()}
    </div>
  );
};

export default MarkdownRenderer; 