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

const colorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
  green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
  red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
  purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700',
};

const textColors = {
  blue: 'text-blue-700 dark:text-blue-300',
  green: 'text-green-700 dark:text-green-300',
  red: 'text-red-700 dark:text-red-300',
  yellow: 'text-yellow-700 dark:text-yellow-300',
  purple: 'text-purple-700 dark:text-purple-300',
  indigo: 'text-indigo-700 dark:text-indigo-300',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  color,
  subtext,
  trend,
}) => {
  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className={`text-4xl font-bold ${textColors[color]} mb-2`}>
        {value}
      </div>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </div>
      {subtext && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          {subtext}
        </div>
      )}
      {trend && (
        <div className={`text-xs font-medium ${textColors[color]}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
  );
};
