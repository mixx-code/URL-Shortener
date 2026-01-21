interface ProgressBarProps {
  value: number;
  max: number;
  variant?: 'blue' | 'green' | 'red' | 'purple';
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export default function ProgressBar({
  value,
  max,
  variant = 'blue',
  className = '',
  showLabel = true,
  label
}: ProgressBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  const variantClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && label && (
        <span className="text-sm text-gray-600 min-w-0 flex-1 truncate">
          {label}
        </span>
      )}
      <div className="bg-gray-200 rounded-full h-2 flex-1">
        <div
          className={`${variantClasses[variant]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="text-sm font-medium text-gray-900 min-w-0 text-right">
        {value}
      </span>
    </div>
  );
}
