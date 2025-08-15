'use client';

interface StatsCardProps {
  icon: string;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatsCard({ icon, title, value, trend, className = '' }: StatsCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 lg:p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl ${className}`}>
      <div className="flex items-center">
        <div className="p-2 lg:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <span className="text-xl lg:text-2xl">{icon}</span>
        </div>
        <div className="ml-3 lg:ml-4 flex-1">
          <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              <span className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last week</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
