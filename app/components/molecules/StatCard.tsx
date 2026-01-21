import Card from '../atoms/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  variant?: 'blue' | 'green' | 'purple' | 'gray';
  className?: string;
}

export default function StatCard({
  title,
  value,
  variant = 'blue',
  className = ''
}: StatCardProps) {
  const variantClasses = {
    blue: 'bg-blue-50 text-blue-900',
    green: 'bg-green-50 text-green-900',
    purple: 'bg-purple-50 text-purple-900',
    gray: 'bg-gray-50 text-gray-900'
  };

  const titleColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  };

  return (
    <div className={`${variantClasses[variant]} p-4 rounded-lg ${className}`}>
      <p className={`text-sm font-medium ${titleColorClasses[variant]}`}>
        {title}
      </p>
      <p className={`text-2xl font-bold ${variantClasses[variant]}`}>
        {value}
      </p>
    </div>
  );
}
