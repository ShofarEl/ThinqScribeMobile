import React from 'react';

// Professional Revenue Chart (replaces Line chart)
export const RevenueChart = ({ data = [] }) => {
  const sampleData = data.length > 0 ? data : [
    { month: 'Jan', revenue: 15000 },
    { month: 'Feb', revenue: 18000 },
    { month: 'Mar', revenue: 22000 },
    { month: 'Apr', revenue: 19000 },
    { month: 'May', revenue: 26000 },
    { month: 'Jun', revenue: 31000 }
  ];

  const maxRevenue = Math.max(...sampleData.map(d => d.revenue));

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '20px',
      color: 'white',
      height: '300px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
        Monthly Revenue Trend
      </h3>
      <div style={{ 
        display: 'flex', 
        alignItems: 'end', 
        justifyContent: 'space-between',
        height: '200px',
        gap: '8px',
        marginBottom: '16px'
      }}>
        {sampleData.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            flex: 1
          }}>
            <div style={{
              height: `${(item.revenue / maxRevenue) * 180}px`,
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '4px 4px 0 0',
              width: '100%',
              maxWidth: '40px',
              position: 'relative',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.4)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(0)';
            }}
            title={`${item.month}: $${item.revenue.toLocaleString()}`}
            >
              <div style={{
                position: 'absolute',
                top: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '10px',
                fontWeight: '600',
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                ${Math.round(item.revenue / 1000)}k
              </div>
            </div>
            <span style={{ 
              fontSize: '12px', 
              marginTop: '8px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              {item.month}
            </span>
          </div>
        ))}
      </div>
      <div style={{ 
        fontSize: '14px', 
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center'
      }}>
        Total Revenue: ${sampleData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
      </div>
    </div>
  );
};

// Professional User Growth Chart (replaces Column chart)
export const UserGrowthChart = ({ data = [] }) => {
  const sampleData = data.length > 0 ? data : [
    { month: 'Jan', students: 45, writers: 12 },
    { month: 'Feb', students: 67, writers: 18 },
    { month: 'Mar', students: 89, writers: 25 },
    { month: 'Apr', students: 112, writers: 34 },
    { month: 'May', students: 134, writers: 41 },
    { month: 'Jun', students: 156, writers: 48 }
  ];

  const maxValue = Math.max(...sampleData.flatMap(d => [d.students, d.writers]));

  return (
    <div style={{ 
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      height: '300px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
        User Growth Analytics
      </h3>
      <div style={{ 
        display: 'flex', 
        alignItems: 'end', 
        justifyContent: 'space-between',
        height: '180px',
        gap: '16px',
        marginBottom: '16px'
      }}>
        {sampleData.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '4px',
            flex: 1
          }}>
            {/* Students Bar */}
            <div style={{
              height: `${(item.students / maxValue) * 140}px`,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '4px 4px 0 0',
              width: '20px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 172, 254, 0.3)'
            }}
            title={`Students: ${item.students}`}
            />
            
            {/* Writers Bar */}
            <div style={{
              height: `${(item.writers / maxValue) * 140}px`,
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              borderRadius: '4px 4px 0 0',
              width: '20px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(67, 233, 123, 0.3)'
            }}
            title={`Writers: ${item.writers}`}
            />
            
            <span style={{ 
              fontSize: '12px', 
              marginTop: '8px',
              fontWeight: '500',
              color: '#64748b'
            }}>
              {item.month}
            </span>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        gap: '20px',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '2px'
          }} />
          Students
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            borderRadius: '2px'
          }} />
          Writers
        </div>
      </div>
    </div>
  );
};

// Mini Stats Chart for cards
export const MiniStatsChart = ({ data = [], color = '#667eea' }) => {
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (value / Math.max(...data)) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ height: '40px', width: '100%', marginTop: '8px' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}; 