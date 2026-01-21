interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  shadow = true
}: CardProps) {
  const baseClasses = 'bg-white rounded-lg';
  const shadowClasses = shadow ? 'shadow' : '';
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const classes = `${baseClasses} ${shadowClasses} ${paddingClasses[padding]} ${className}`;

  return (
    <div className={classes}>
      {children}
    </div>
  );
}
