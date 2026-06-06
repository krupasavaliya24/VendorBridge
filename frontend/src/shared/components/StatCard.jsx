import React from 'react';
import './StatCard.css';

export default function StatCard({
  icon,
  label,
  value,
  trend,
  trendValue,
  trendLabel,
  colorScheme = 'accent',
  id,
}) {
  const trendDir = trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'neutral';

  return (
    <div className="stat-card" id={id}>
      <div className={`stat-card-icon ${colorScheme}`}>
        {icon}
      </div>
      <div className="stat-card-content">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        {(trendValue !== undefined || trendLabel) && (
          <div className={`stat-card-trend ${trendDir}`}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trendValue && <span>{trendValue}</span>}
            {trendLabel && <span>{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
