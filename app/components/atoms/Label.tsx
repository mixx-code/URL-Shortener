interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
  required?: boolean;
}

export default function Label({
  children,
  htmlFor,
  className = '',
  required = false
}: LabelProps) {
  const baseClasses = 'block text-sm font-medium text-gray-700 mb-1';
  const classes = `${baseClasses} ${className}`;

  return (
    <label htmlFor={htmlFor} className={classes}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
