import Label from '../atoms/Label';
import Input from '../atoms/Input';

interface URLInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  id?: string;
  type?: 'text' | 'url';
}

export default function URLInput({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  required = false,
  id,
  type = 'url'
}: URLInputProps) {
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        id={id}
        error={error}
      />
    </div>
  );
}
