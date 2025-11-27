import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  subtext?: string;
  trend?: {
    value: number;
    label: string;
  };
}

const colorTokens = {
  blue: { bg: 'var(--kd-primary)', textColor: 'var(--kd-primary)' },
  green: { bg: 'var(--kd-success)', textColor: 'var(--kd-success)' },
  red: { bg: 'var(--kd-danger)', textColor: 'var(--kd-danger)' },
  yellow: { bg: 'var(--kd-warning)', textColor: 'var(--kd-warning)' },
  purple: { bg: 'var(--kd-primary)', textColor: 'var(--kd-primary)' },
  indigo: { bg: 'var(--kd-info)', textColor: 'var(--kd-info)' },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  color,
  subtext,
  trend,
}) => {
  const colors = colorTokens[color];
  
  return (
    <div 
      className="rounded-lg p-6"
      style={{ 
        backgroundColor: 'var(--kd-surface)', 
        boxShadow: 'var(--kd-shadow-md)',
        border: `2px solid ${colors.bg}`
      }}
    >
      <div className="text-4xl font-bold mb-2" style={{ color: colors.textColor }}>
        {value}
      </div>
      <div className="text-sm font-medium mb-1" style={{ color: 'var(--kd-text-primary)' }}>
        {label}
      </div>
      {subtext && (
        <div className="text-xs mb-2" style={{ color: 'var(--kd-text-secondary)' }}>
          {subtext}
        </div>
      )}
      {trend && (
        <div className="text-xs font-medium" style={{ color: colors.textColor }}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
  );
};
