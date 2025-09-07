import React from 'react';
import './SimpleChart.css';

// Lightweight Line Chart Component
export const SimpleLineChart = ({ data, height = 200, color = '#667eea' }) => {
  if (!data || data.length === 0) {
    return <div className="chart-no-data">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="simple-chart" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Fill area under line */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill="url(#lineGradient)"
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          strokeLinecap="round"
        />
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((item.value - minValue) / range) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="0.8"
              fill={color}
              className="chart-point"
            />
          );
        })}
      </svg>
      
      {/* X-axis labels */}
      <div className="chart-labels">
        {data.map((item, index) => (
          <span key={index} className="chart-label">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// Lightweight Bar Chart Component
export const SimpleBarChart = ({ data, height = 200, color = '#4facfe' }) => {
  if (!data || data.length === 0) {
    return <div className="chart-no-data">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="simple-bar-chart" style={{ height }}>
      <div className="bars-container">
        {data.map((item, index) => (
          <div key={index} className="bar-wrapper">
            <div 
              className="bar"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                background: `linear-gradient(135deg, ${color}, ${color}99)`
              }}
              title={`${item.label}: ${item.value}`}
            >
              <span className="bar-value">{item.value}</span>
            </div>
            <span className="bar-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Stats Card with Mini Chart
export const StatsCard = ({ title, value, change, chartData, color = '#667eea' }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="stats-card">
      <div className="stats-header">
        <h3 className="stats-title">{title}</h3>
        <div className={`stats-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{change}%
        </div>
      </div>
      <div className="stats-value">${value.toLocaleString()}</div>
      {chartData && (
        <div className="stats-mini-chart">
          <SimpleLineChart data={chartData} height={40} color={color} />
        </div>
      )}
    </div>
  );
}; 